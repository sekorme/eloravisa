import "server-only";

import { StreamClient } from "@stream-io/node-sdk";
import type { Timestamp } from "firebase-admin/firestore";
import { db } from "@/firebase/admin";

/**
 * Paid live sessions ("meetings"), created by admins in eloraadmin.
 *
 * meetings/{id}                    written by eloraadmin (title, price, seats…)
 * meetings/{id}/attendees/{uid}    written here when a payment is fulfilled
 *
 * Access is enforced by Stream, not just by this code: paid meetings use the
 * `paid_meeting` call type, in which plain users and guests can't see or join
 * calls — only call members can. A buyer is added as a member when they join
 * (see createJoinCredentials), and gets a token scoped to that one call.
 *
 * All reads go through the Admin SDK; firestore.rules give clients no access
 * to `meetings`.
 */

/** Buyers can enter the room this long before the scheduled start. */
export const JOIN_OPENS_BEFORE_MS = 15 * 60 * 1000;
/** A meeting nobody ended is treated as over this long after it started. */
const ASSUMED_MAX_LENGTH_MS = 4 * 60 * 60 * 1000;

export interface PaidMeetingView {
  id: string;
  title: string;
  description: string;
  hostName: string;
  scheduledAt: string;
  priceUsd: number;
  maxSeats: number | null;
  seatsLeft: number | null;
  purchased: boolean;
  /** Purchased and inside the join window. */
  joinable: boolean;
  /** The host has started the session (eloraadmin marks it live). */
  live: boolean;
  /** Not purchased, still open for sale, and seats remain. */
  purchasable: boolean;
}

interface MeetingDoc {
  title: string;
  description?: string;
  hostName?: string;
  scheduledAt: Timestamp;
  status: "scheduled" | "live" | "ended" | "cancelled";
  isPaid?: boolean;
  priceUsd?: number;
  maxSeats?: number | null;
  seatsTaken?: number;
  callType?: string;
  callId: string;
}

function isOver(m: MeetingDoc, now: number) {
  return m.status === "ended" || m.status === "cancelled" || m.scheduledAt.toMillis() + ASSUMED_MAX_LENGTH_MS < now;
}

function toView(id: string, m: MeetingDoc, purchased: boolean, now: number): PaidMeetingView {
  const startsAt = m.scheduledAt.toMillis();
  const seatsLeft = m.maxSeats ? Math.max(0, m.maxSeats - (m.seatsTaken ?? 0)) : null;
  const over = isOver(m, now);
  return {
    id,
    title: m.title,
    description: m.description ?? "",
    hostName: m.hostName ?? "Elora team",
    scheduledAt: new Date(startsAt).toISOString(),
    priceUsd: m.priceUsd ?? 0,
    maxSeats: m.maxSeats ?? null,
    seatsLeft,
    purchased,
    // The host starting early (status "live") opens the room right away.
    joinable: purchased && !over && (m.status === "live" || now >= startsAt - JOIN_OPENS_BEFORE_MS),
    live: m.status === "live" && !over,
    purchasable: !purchased && !over && seatsLeft !== 0,
  };
}

/** Upcoming / in-progress paid meetings, with this user's purchase state. */
export async function listPaidMeetingsForUser(uid: string): Promise<PaidMeetingView[]> {
  const now = Date.now();
  const snap = await db.collection("meetings").where("isPaid", "==", true).get();
  const live = snap.docs.filter((d) => !isOver(d.data() as MeetingDoc, now));
  if (live.length === 0) return [];

  const attendeeDocs = await db.getAll(...live.map((d) => d.ref.collection("attendees").doc(uid)));
  const purchased = new Set(attendeeDocs.filter((a) => a.exists).map((a) => a.ref.parent.parent!.id));

  return live
    .map((d) => toView(d.id, d.data() as MeetingDoc, purchased.has(d.id), now))
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
}

export async function getPaidMeetingForUser(uid: string, meetingId: string): Promise<PaidMeetingView | null> {
  const ref = db.collection("meetings").doc(meetingId);
  const [snap, attendee] = await Promise.all([ref.get(), ref.collection("attendees").doc(uid).get()]);
  const m = snap.data() as MeetingDoc | undefined;
  if (!snap.exists || !m?.isPaid) return null;
  return toView(snap.id, m, attendee.exists, Date.now());
}

/** What checkout needs: price, or why it can't be bought. */
export async function getMeetingForCheckout(uid: string, meetingId: string) {
  const view = await getPaidMeetingForUser(uid, meetingId);
  if (!view) return { error: "Session not found" as const };
  if (view.purchased) return { error: "You already have a seat" as const };
  if (!view.purchasable) return { error: view.seatsLeft === 0 ? ("This session is full" as const) : ("This session is no longer on sale" as const) };
  return { meeting: view };
}

function streamClient() {
  const key = process.env.NEXT_PUBLIC_STREAM_API_KEY;
  const secret = process.env.STREAM_SECRET_KEY;
  if (!key || !secret) throw new Error("Stream is not configured");
  return new StreamClient(key, secret);
}

export class MeetingAccessError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

/**
 * Lets a buyer into the call: checks their seat and the join window, makes
 * them a call member (the only role the paid call type lets in) and returns a
 * Stream token that works for this call only.
 */
export async function createJoinCredentials(uid: string, displayName: string, meetingId: string) {
  const ref = db.collection("meetings").doc(meetingId);
  const [snap, attendee] = await Promise.all([ref.get(), ref.collection("attendees").doc(uid).get()]);
  const m = snap.data() as MeetingDoc | undefined;
  if (!snap.exists || !m?.isPaid) throw new MeetingAccessError(404, "Session not found");
  if (!attendee.exists) throw new MeetingAccessError(403, "Buy a seat to join this session");

  const now = Date.now();
  if (isOver(m, now)) throw new MeetingAccessError(410, "This session has ended");
  const opensAt = m.scheduledAt.toMillis() - JOIN_OPENS_BEFORE_MS;
  if (m.status !== "live" && now < opensAt) throw new MeetingAccessError(425, `The room opens at ${new Date(opensAt).toISOString()}`);

  const client = streamClient();
  const callType = m.callType ?? "paid_meeting";
  // Members must be existing Stream users.
  await client.upsertUsers([{ id: uid, name: displayName }]);
  // The role must be explicit: a member added without one gets call role
  // `user`, which the paid call type denies join-call (Stream error 17).
  // Upserting also repairs buyers who were added before this was set.
  await client.video
    .call(callType, m.callId)
    .updateCallMembers({ update_members: [{ user_id: uid, role: "call_member" }] });

  const token = client.generateCallToken({
    user_id: uid,
    call_cids: [`${callType}:${m.callId}`],
    // Long enough for the session; the SDK fetches a new one if it expires.
    validity_in_seconds: Math.round(ASSUMED_MAX_LENGTH_MS / 1000),
  });

  return {
    apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY!,
    token,
    callType,
    callId: m.callId,
    user: { id: uid, name: displayName },
  };
}
