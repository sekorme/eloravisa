import "server-only";

import { StreamClient } from "@stream-io/node-sdk";
import { FieldValue, type Timestamp } from "firebase-admin/firestore";
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
  /** What a seat costs right now (the early-bird price while it lasts). */
  priceUsd: number;
  /** The normal price; differs from priceUsd during early-bird. */
  listPriceUsd: number;
  earlyBirdEndsAt: string | null;
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
  earlyBirdPriceUsd?: number | null;
  earlyBirdEndsAt?: Timestamp | null;
  maxSeats?: number | null;
  seatsTaken?: number;
  callType?: string;
  callId: string;
}

function isOver(m: MeetingDoc, now: number) {
  return m.status === "ended" || m.status === "cancelled" || m.scheduledAt.toMillis() + ASSUMED_MAX_LENGTH_MS < now;
}

/** Early-bird price until its deadline, then the normal price. */
function currentPrice(m: MeetingDoc, now: number) {
  const listPrice = m.priceUsd ?? 0;
  const early = m.earlyBirdPriceUsd;
  const endsAt = m.earlyBirdEndsAt?.toMillis();
  const earlyActive = typeof early === "number" && early < listPrice && endsAt !== undefined && now < endsAt;
  return { price: earlyActive ? early : listPrice, listPrice, earlyBirdEndsAt: earlyActive ? endsAt : null };
}

function toView(id: string, m: MeetingDoc, purchased: boolean, now: number): PaidMeetingView {
  const startsAt = m.scheduledAt.toMillis();
  const seatsLeft = m.maxSeats ? Math.max(0, m.maxSeats - (m.seatsTaken ?? 0)) : null;
  const over = isOver(m, now);
  const pricing = currentPrice(m, now);
  return {
    id,
    title: m.title,
    description: m.description ?? "",
    hostName: m.hostName ?? "Elora team",
    scheduledAt: new Date(startsAt).toISOString(),
    priceUsd: pricing.price,
    listPriceUsd: pricing.listPrice,
    earlyBirdEndsAt: pricing.earlyBirdEndsAt === null ? null : new Date(pricing.earlyBirdEndsAt).toISOString(),
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

/** Seats never cost less than this, whatever discounts apply. */
const MIN_SEAT_PRICE_USD = 1;

/**
 * Checks a discount code (session_codes/{CODE}, managed in eloraadmin) for a
 * session. Usage limits are checked here and counted on fulfilment, so a few
 * simultaneous checkouts can overshoot maxUses slightly.
 */
async function resolveDiscountCode(rawCode: string, meetingId: string) {
  const code = rawCode.trim().toUpperCase();
  if (!/^[A-Z0-9_-]{3,24}$/.test(code)) return { error: "That code isn't valid" as const };
  const snap = await db.collection("session_codes").doc(code).get();
  const c = snap.data();
  if (!c || c.active === false) return { error: "That code isn't valid" as const };
  if (c.meetingId && c.meetingId !== meetingId) return { error: "That code is for a different session" as const };
  if (c.expiresAt && c.expiresAt.toMillis() < Date.now()) return { error: "That code has expired" as const };
  if (c.maxUses && (c.uses ?? 0) >= c.maxUses) return { error: "That code has been used up" as const };
  return { code, percentOff: Number(c.percentOff) || 0 };
}

export interface SeatQuote {
  meeting: PaidMeetingView;
  /** Final USD price after early-bird and any code. */
  priceUsd: number;
  discountCode: string | null;
  percentOff: number;
}

/** What checkout needs: the final price, or why it can't be bought. */
export async function getMeetingForCheckout(
  uid: string,
  meetingId: string,
  code?: string | null,
): Promise<SeatQuote | { error: string }> {
  const view = await getPaidMeetingForUser(uid, meetingId);
  if (!view) return { error: "Session not found" };
  if (view.purchased) return { error: "You already have a seat" };
  if (!view.purchasable) return { error: view.seatsLeft === 0 ? "This session is full" : "This session is no longer on sale" };

  if (!code?.trim()) return { meeting: view, priceUsd: view.priceUsd, discountCode: null, percentOff: 0 };
  const discount = await resolveDiscountCode(code, meetingId);
  if ("error" in discount) return { error: discount.error ?? "That code isn't valid" };
  const discounted = Math.round(view.priceUsd * (1 - discount.percentOff / 100) * 100) / 100;
  return {
    meeting: view,
    priceUsd: Math.max(MIN_SEAT_PRICE_USD, discounted),
    discountCode: discount.code,
    percentOff: discount.percentOff,
  };
}

/** Sessions this user bought that are over, for replays (last 30 days). */
const REPLAY_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export interface PastSessionView {
  id: string;
  title: string;
  hostName: string;
  scheduledAt: string;
  attended: boolean;
}

export async function listPastSessionsForUser(uid: string): Promise<PastSessionView[]> {
  const now = Date.now();
  const snap = await db.collection("meetings").where("isPaid", "==", true).get();
  const past = snap.docs.filter((d) => {
    const m = d.data() as MeetingDoc;
    return m.status !== "cancelled" && isOver(m, now) && m.scheduledAt.toMillis() > now - REPLAY_WINDOW_MS;
  });
  if (past.length === 0) return [];
  const attendeeDocs = await db.getAll(...past.map((d) => d.ref.collection("attendees").doc(uid)));
  const seat = new Map(attendeeDocs.filter((a) => a.exists).map((a) => [a.ref.parent.parent!.id, a]));
  return past
    .filter((d) => seat.has(d.id))
    .map((d) => {
      const m = d.data() as MeetingDoc;
      return {
        id: d.id,
        title: m.title,
        hostName: m.hostName ?? "Elora team",
        scheduledAt: m.scheduledAt.toDate().toISOString(),
        attended: !!seat.get(d.id)!.get("firstJoinedAt"),
      };
    })
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
}

/** Loads a paid session the caller holds a seat in, or throws. */
async function requireSeat(uid: string, meetingId: string) {
  const ref = db.collection("meetings").doc(meetingId);
  const [snap, attendee] = await Promise.all([ref.get(), ref.collection("attendees").doc(uid).get()]);
  const m = snap.data() as MeetingDoc | undefined;
  if (!snap.exists || !m?.isPaid) throw new MeetingAccessError(404, "Session not found");
  if (!attendee.exists) throw new MeetingAccessError(403, "You don't have a seat in this session");
  return { ref, m };
}

export interface ReplayRecording {
  url: string;
  startTime: string;
  endTime: string;
}

/** Stream recordings of a session, for buyers. URLs are signed and expire. */
export async function listReplaysForUser(uid: string, meetingId: string): Promise<ReplayRecording[]> {
  const { m } = await requireSeat(uid, meetingId);
  const { recordings } = await streamClient().video.call(m.callType ?? "paid_meeting", m.callId).listRecordings();
  return recordings
    .map((r) => ({ url: r.url, startTime: new Date(r.start_time).toISOString(), endTime: new Date(r.end_time).toISOString() }))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

// --- Q&A: buyers ask, the host answers from eloraadmin ---

const MAX_QUESTION_LENGTH = 500;
const MAX_QUESTIONS_PER_USER = 10;

export interface QuestionView {
  id: string;
  name: string;
  text: string;
  upvotes: number;
  upvotedByMe: boolean;
  mine: boolean;
  answered: boolean;
}

export async function listQuestionsForUser(uid: string, meetingId: string): Promise<QuestionView[]> {
  const { ref } = await requireSeat(uid, meetingId);
  const snap = await ref.collection("questions").get();
  return snap.docs
    .map((d) => {
      const q = d.data();
      const upvoters: string[] = Array.isArray(q.upvoters) ? q.upvoters : [];
      return {
        id: d.id,
        name: q.name ?? "Attendee",
        text: q.text ?? "",
        upvotes: upvoters.length,
        upvotedByMe: upvoters.includes(uid),
        mine: q.uid === uid,
        answered: !!q.answered,
        createdAt: q.createdAt?.toMillis?.() ?? 0,
      };
    })
    .sort((a, b) => Number(a.answered) - Number(b.answered) || b.upvotes - a.upvotes || a.createdAt - b.createdAt)
    .map((q): QuestionView => ({
      id: q.id, name: q.name, text: q.text, upvotes: q.upvotes, upvotedByMe: q.upvotedByMe, mine: q.mine, answered: q.answered,
    }));
}

export async function askQuestion(uid: string, name: string, meetingId: string, rawText: string) {
  const { ref, m } = await requireSeat(uid, meetingId);
  if (isOver(m, Date.now())) throw new MeetingAccessError(410, "This session has ended");
  const text = rawText?.trim().slice(0, MAX_QUESTION_LENGTH);
  if (!text) throw new MeetingAccessError(400, "Type a question first");
  const mine = await ref.collection("questions").where("uid", "==", uid).count().get();
  if (mine.data().count >= MAX_QUESTIONS_PER_USER) {
    throw new MeetingAccessError(429, `You can ask up to ${MAX_QUESTIONS_PER_USER} questions per session`);
  }
  await ref.collection("questions").add({
    uid,
    name,
    text,
    upvoters: [],
    answered: false,
    createdAt: FieldValue.serverTimestamp(),
  });
}

export async function toggleUpvote(uid: string, meetingId: string, questionId: string, upvote: boolean) {
  const { ref } = await requireSeat(uid, meetingId);
  await ref
    .collection("questions")
    .doc(questionId)
    .update({ upvoters: upvote ? FieldValue.arrayUnion(uid) : FieldValue.arrayRemove(uid) });
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
export async function createJoinCredentials(uid: string, displayName: string, meetingId: string, renewal = false) {
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

  // Attendance: shown to admins and used to follow up with no-shows. Token
  // renewals mid-call aren't new joins.
  if (!renewal) await ref.collection("attendees").doc(uid).update({
    firstJoinedAt: attendee.get("firstJoinedAt") ?? now,
    lastJoinedAt: now,
    joinCount: FieldValue.increment(1),
  });

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
