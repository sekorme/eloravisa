import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { db } from "@/firebase/admin";
import { notifyUser } from "@/lib/notifyServer";
import { runAppointmentReminders, runExpiryWatch } from "@/lib/appointmentReminders";

/**
 * Reminds seat holders before a paid live session: once the day before and
 * once about an hour before. Also sends embassy appointment reminders and,
 * once a day at 08:00 UTC, document expiry warnings (lib/appointmentReminders). Run hourly by an Upstash QStash schedule (Vercel
 * Hobby only allows daily crons), verified by QStash's request signature.
 * `Authorization: Bearer $CRON_SECRET` also works, for manual runs.
 *
 * Each reminder is claimed on the meeting doc in a transaction before sending,
 * so overlapping or retried runs never send it twice.
 */

const HOUR = 60 * 60 * 1000;
// The hourly run lands somewhere in this window before the start.
const SOON_WINDOW_MS = 75 * 60 * 1000;
const DAY_WINDOW_MS = 24 * HOUR;
// Too close to the start for a "tomorrow" email; the hour-before one covers it.
const DAY_REMINDER_MIN_LEAD_MS = 3 * HOUR;

type Kind = "day" | "soon";
const FLAG: Record<Kind, string> = { day: "reminderDaySentAt", soon: "reminderSoonSentAt" };

async function isAuthorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") === `Bearer ${secret}`) return true;

  const signature = req.headers.get("upstash-signature");
  const current = process.env.QSTASH_CURRENT_SIGNING_KEY;
  const next = process.env.QSTASH_NEXT_SIGNING_KEY;
  if (!signature || !current || !next) return false;
  try {
    return await new Receiver({ currentSigningKey: current, nextSigningKey: next }).verify({
      signature,
      body: await req.text(),
    });
  } catch {
    return false;
  }
}

// QStash schedules POST; GET is kept for manual runs with CRON_SECRET.
export async function POST(req: NextRequest) {
  return GET(req);
}

export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();
  const snap = await db.collection("meetings").where("isPaid", "==", true).get();
  const sent: { meetingId: string; kind: Kind; recipients: number }[] = [];

  for (const doc of snap.docs) {
    const m = doc.data();
    if (m.status !== "scheduled") continue;
    const lead = m.scheduledAt.toMillis() - now;
    if (lead <= 0 || lead > DAY_WINDOW_MS) continue;

    let kind: Kind | null = null;
    if (lead <= SOON_WINDOW_MS && !m[FLAG.soon]) kind = "soon";
    else if (lead > DAY_REMINDER_MIN_LEAD_MS && !m[FLAG.day]) kind = "day";
    if (!kind) continue;

    const claimed = await db.runTransaction(async (tx) => {
      const fresh = await tx.get(doc.ref);
      if (fresh.get(FLAG[kind])) return false;
      tx.update(doc.ref, { [FLAG[kind]]: now });
      return true;
    });
    if (!claimed) continue;

    const attendees = await doc.ref.collection("attendees").select().get();
    const ids = attendees.docs.map((a) => a.id);
    const when = m.scheduledAt.toDate().toLocaleString("en-GB", {
      weekday: "long", hour: "numeric", minute: "2-digit", timeZone: "Africa/Accra",
    });
    const title = kind === "soon" ? `Starting in about an hour: ${m.title}` : `Tomorrow: ${m.title}`;
    const body =
      kind === "soon"
        ? `"${m.title}" starts at ${when} (GMT). The room opens 15 minutes before; use the button below to join.`
        : `A reminder that "${m.title}" with ${m.hostName ?? "the Elora team"} is on ${when} (GMT). We'll send the join link again an hour before.`;

    for (let i = 0; i < ids.length; i += 10) {
      await Promise.allSettled(
        ids.slice(i, i + 10).map((uid) =>
          notifyUser(uid, {
            title,
            body,
            type: `paid_meeting_reminder_${kind}`,
            // The room isn't open a day ahead, so that one goes to the list.
            path: kind === "soon" ? `/live/${doc.id}` : "/dashboard/live-sessions",
            ctaLabel: kind === "soon" ? "Join the session" : "Session details",
          })
        )
      );
    }
    sent.push({ meetingId: doc.id, kind, recipients: ids.length });
  }

  // Independent jobs: one failing must not stop the others.
  const appointments = await runAppointmentReminders(now).catch((err) => {
    console.error("Appointment reminders failed:", err);
    return [];
  });
  const runExpiry = new Date(now).getUTCHours() === 8 || req.nextUrl.searchParams.get("task") === "expiry";
  const expiry = runExpiry
    ? await runExpiryWatch(now).catch((err) => {
        console.error("Expiry watch failed:", err);
        return { usersWarned: 0, failed: true };
      })
    : null;

  return NextResponse.json({ ok: true, sent, appointments, expiry });
}
