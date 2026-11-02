import "server-only";

import { db } from "@/firebase/admin";
import { notifyUser } from "@/lib/notifyServer";
import { getRequiredDocuments } from "@/utils/documentConfig";
import { computeReadiness, documentValidity, interviewScoresFrom, type ReviewFacts } from "@/lib/visaReadiness";

/**
 * Embassy appointment reminders and the document expiry watch. Both run from
 * the hourly reminders cron (app/api/cron/session-reminders).
 *
 * Every send is claimed on Firestore first (a flag on the appointment or the
 * review), so overlapping or retried runs never email twice.
 */

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

type Kind = "week" | "day" | "soon";
// Checked in this order; the first window the lead time falls in wins.
const WINDOWS: { kind: Kind; max: number; min: number }[] = [
  { kind: "soon", max: 4 * HOUR, min: 0 },
  { kind: "day", max: 26 * HOUR, min: 4 * HOUR },
  { kind: "week", max: 7 * DAY, min: 2 * DAY },
];

async function loadReadiness(uid: string, user: FirebaseFirestore.DocumentData, now: number) {
  const ref = db.collection("users").doc(uid);
  const [reviews, sessions] = await Promise.all([ref.collection("reviews").get(), ref.collection("interview_sessions").get()]);
  return computeReadiness({
    requiredDocuments: getRequiredDocuments(user.onboarding?.visaType),
    uploadedKeys: Object.keys(user.documents ?? {}),
    reviews: reviews.docs.map((d) => ({ id: d.id, ...d.data() }) as ReviewFacts),
    interviewScores: interviewScoresFrom(sessions.docs.map((d) => d.data())),
    appointmentAt: user.appointment?.atMs ?? null,
    now,
  });
}

export async function runAppointmentReminders(now: number) {
  const snap = await db
    .collection("users")
    .where("appointment.atMs", ">", now)
    .where("appointment.atMs", "<=", now + 7 * DAY)
    .get();
  const sent: { uid: string; kind: Kind }[] = [];

  for (const doc of snap.docs) {
    const user = doc.data();
    const appt = user.appointment;
    const lead = appt.atMs - now;
    const window = WINDOWS.find((w) => lead <= w.max && lead > w.min);
    if (!window || appt.remindersSent?.[window.kind]) continue;

    const claimed = await db.runTransaction(async (tx) => {
      const fresh = (await tx.get(doc.ref)).get("appointment");
      // Skip if the user moved or removed the appointment meanwhile.
      if (!fresh || fresh.atMs !== appt.atMs || fresh.remindersSent?.[window.kind]) return false;
      tx.update(doc.ref, { [`appointment.remindersSent.${window.kind}`]: now });
      return true;
    });
    if (!claimed) continue;

    const readiness = await loadReadiness(doc.id, user, now);
    const when = new Date(appt.atMs).toLocaleString("en-GB", {
      weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit", timeZone: "Africa/Accra",
    });
    const lead_ = window.kind === "soon" ? "in a few hours" : window.kind === "day" ? "tomorrow" : "in a week";
    const problems = readiness.validity.filter((v) => v.status === "expired" || v.status === "expires_before_appointment");
    const lines = [
      `Your visa appointment at ${appt.embassy}, ${appt.city} is ${lead_}: ${when} (GMT).`,
      `Your readiness score is ${readiness.score}/100.`,
      ...problems.map((p) => `Warning: your ${p.title}. ${p.message}`),
    ];
    const steps = readiness.nextSteps.slice(0, 3).map((s) => `- ${s.label}`);
    if (window.kind !== "soon" && steps.length) lines.push(`Before then:\n${steps.join("\n")}`);
    if (window.kind === "soon") lines.push("Bring your originals and copies, arrive 30 minutes early, and good luck. Your checklist is on the appointment page.");

    await notifyUser(doc.id, {
      title: window.kind === "soon" ? `Today: your visa appointment at ${appt.embassy}` : `Visa appointment ${lead_}: ${appt.embassy}`,
      body: lines.join("\n\n"),
      type: `appointment_reminder_${window.kind}`,
      path: "/dashboard/appointment",
      ctaLabel: window.kind === "soon" ? "Open your checklist" : "Get ready",
    }).catch((err) => console.error(`Appointment reminder to ${doc.id} failed:`, err));
    sent.push({ uid: doc.id, kind: window.kind });
  }
  return sent;
}

/**
 * Warns users about documents that have expired, will run out before their
 * appointment, or within 30 days. Dates come from the AI review. Once per
 * document per problem: re-reviewing a document clears the marker.
 */
export async function runExpiryWatch(now: number) {
  const reviews = await db.collectionGroup("reviews").get();
  const byUser = new Map<string, FirebaseFirestore.QueryDocumentSnapshot[]>();
  for (const r of reviews.docs) {
    const owner = r.ref.parent.parent;
    if (owner?.parent.id !== "users" || !(r.get("expiryDate") || r.get("issueDate"))) continue;
    (byUser.get(owner.id) ?? byUser.set(owner.id, []).get(owner.id)!).push(r);
  }

  let warned = 0;
  for (const [uid, docs] of byUser) {
    const user = (await db.collection("users").doc(uid).get()).data();
    if (!user) continue;
    const validity = documentValidity({
      requiredDocuments: getRequiredDocuments(user.onboarding?.visaType),
      reviews: docs.map((d) => ({ id: d.id, ...d.data() }) as ReviewFacts),
      appointmentAt: user.appointment?.atMs > now ? user.appointment.atMs : null,
      now,
    });
    const fresh = validity.filter((v) => {
      if (v.status === "ok") return false;
      const marker = docs.find((d) => d.id === v.key)?.get("expiryWarned");
      return marker !== `${v.status}:${v.validUntil}`;
    });
    if (fresh.length === 0) continue;

    const batch = db.batch();
    for (const v of fresh) {
      batch.update(db.collection("users").doc(uid).collection("reviews").doc(v.key), { expiryWarned: `${v.status}:${v.validUntil}` });
    }
    await batch.commit();

    await notifyUser(uid, {
      title: fresh.length === 1 ? `Check your ${fresh[0].title}` : `${fresh.length} documents need attention`,
      body: [
        "Some of your visa documents won't be valid when you need them:",
        ...fresh.map((v) => `- ${v.title}: ${v.message}`),
        "Expired or out-of-date documents are a common reason for refusals. Upload a new version and run the AI review again.",
      ].join("\n\n"),
      type: "document_expiry",
      path: "/dashboard/application",
      ctaLabel: "Update my documents",
    }).catch((err) => console.error(`Expiry warning to ${uid} failed:`, err));
    warned++;
  }
  return { usersWarned: warned };
}
