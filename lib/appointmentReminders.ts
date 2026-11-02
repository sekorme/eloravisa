import "server-only";

import { db } from "@/firebase/admin";
import { notifyUser } from "@/lib/notifyServer";
import { getRequiredDocuments } from "@/utils/documentConfig";
import { computeReadiness, documentValidity, interviewScoresFrom, type ReviewFacts } from "@/lib/visaReadiness";
import { SELF, activeMemberOf, sessionBelongsTo } from "@/lib/family";

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

export async function loadReadiness(uid: string, user: FirebaseFirestore.DocumentData, now: number) {
  const ref = db.collection("users").doc(uid);
  const [reviews, sessions] = await Promise.all([ref.collection("reviews").get(), ref.collection("interview_sessions").get()]);
  return computeReadiness({
    requiredDocuments: getRequiredDocuments(user.onboarding?.visaType),
    uploadedKeys: Object.keys(user.documents ?? {}),
    reviews: reviews.docs.map((d) => ({ id: d.id, ...d.data() }) as ReviewFacts),
    interviewScores: interviewScoresFrom(sessions.docs.map((d) => d.data()).filter((s) => sessionBelongsTo(s, activeMemberOf(user)))),
    appointmentAt: user.appointment?.atMs ?? null,
    now,
  });
}

type Readiness = Awaited<ReturnType<typeof computeReadiness>>;

async function sendReminder(uid: string, appt: { atMs: number; embassy: string; city: string }, readiness: Readiness, kind: Kind, applicantName: string | null) {
  const when = new Date(appt.atMs).toLocaleString("en-GB", {
    weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit", timeZone: "Africa/Accra",
  });
  const lead = kind === "soon" ? "in a few hours" : kind === "day" ? "tomorrow" : "in a week";
  const whose = applicantName ? `${applicantName}'s` : "Your";
  const problems = readiness.validity.filter((v) => v.status === "expired" || v.status === "expires_before_appointment");
  const lines = [
    `${whose} visa appointment at ${appt.embassy}, ${appt.city} is ${lead}: ${when} (GMT).`,
    `${applicantName ? `${applicantName}'s` : "Your"} readiness score is ${readiness.score}/100.`,
    ...problems.map((p) => `Warning: ${p.title}. ${p.message}`),
  ];
  const steps = readiness.nextSteps.slice(0, 3).map((s) => `- ${s.label}`);
  if (kind !== "soon" && steps.length) lines.push(`Before then:\n${steps.join("\n")}`);
  if (kind === "soon") lines.push("Bring the originals and copies, arrive 30 minutes early, and good luck. The checklist is on the appointment page.");
  if (applicantName) lines.push(`Switch to ${applicantName} in your dashboard to see their checklist and documents.`);

  await notifyUser(uid, {
    title: kind === "soon"
      ? `Today: ${applicantName ? `${applicantName}'s` : "your"} visa appointment at ${appt.embassy}`
      : `${applicantName ? `${applicantName}'s v` : "V"}isa appointment ${lead}: ${appt.embassy}`,
    body: lines.join("\n\n"),
    type: `appointment_reminder_${kind}`,
    path: "/dashboard/appointment",
    ctaLabel: kind === "soon" ? "Open the checklist" : "Get ready",
  }).catch((err) => console.error(`Appointment reminder to ${uid} failed:`, err));
}

/**
 * Family accounts: reminders for applicants who aren't currently active,
 * whose appointments are stashed in familyMembers[id] (lib/family.ts).
 */
async function remindInactiveMembers(now: number, sent: { uid: string; kind: Kind | "outcome" }[]) {
  const families = await db.collection("users").where("familyMemberCount", ">", 0).get();
  for (const doc of families.docs) {
    const user = doc.data();
    for (const [memberId, stash] of Object.entries((user.familyMembers ?? {}) as Record<string, FirebaseFirestore.DocumentData>)) {
      const appt = stash?.appointment;
      if (!appt || typeof appt.atMs !== "number") continue;
      const lead = appt.atMs - now;
      const window = WINDOWS.find((w) => lead <= w.max && lead > w.min);
      if (!window || appt.remindersSent?.[window.kind]) continue;

      const claimed = await db.runTransaction(async (tx) => {
        const fresh = (await tx.get(doc.ref)).get(`familyMembers.${memberId}.appointment`);
        if (!fresh || fresh.atMs !== appt.atMs || fresh.remindersSent?.[window.kind]) return false;
        tx.update(doc.ref, { [`familyMembers.${memberId}.appointment.remindersSent.${window.kind}`]: now });
        return true;
      });
      if (!claimed) continue;

      const sessions = await doc.ref.collection("interview_sessions").get();
      const readiness = computeReadiness({
        requiredDocuments: getRequiredDocuments(stash.onboarding?.visaType),
        uploadedKeys: Object.keys(stash.documents ?? {}),
        reviews: Object.entries((stash.reviews ?? {}) as Record<string, ReviewFacts>).map(([id, r]) => ({ ...r, id })),
        interviewScores: interviewScoresFrom(sessions.docs.map((d) => d.data()).filter((x) => sessionBelongsTo(x, memberId))),
        appointmentAt: appt.atMs,
        now,
      });
      const name = memberId === SELF ? null : stash.fullName ?? (user.familyRoster ?? []).find((m: { id: string }) => m.id === memberId)?.name ?? "Your family member";
      await sendReminder(doc.id, appt, readiness, window.kind, name);
      sent.push({ uid: doc.id, kind: window.kind });
    }
  }
}

export async function runAppointmentReminders(now: number) {
  const snap = await db
    .collection("users")
    .where("appointment.atMs", ">", now)
    .where("appointment.atMs", "<=", now + 7 * DAY)
    .get();
  const sent: { uid: string; kind: Kind | "outcome" }[] = [];

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
    // Family accounts: name the applicant when it isn't the account holder.
    await sendReminder(doc.id, appt, readiness, window.kind, activeMemberOf(user) === SELF ? null : user.fullName ?? null);
    sent.push({ uid: doc.id, kind: window.kind });
  }

  await remindInactiveMembers(now, sent).catch((err) => console.error("Family member reminders failed:", err));

  // The day after: ask how it went (feeds outcome stats and the question bank).
  const past = await db
    .collection("users")
    .where("appointment.atMs", ">", now - 4 * DAY)
    .where("appointment.atMs", "<=", now - 20 * HOUR)
    .get();
  for (const doc of past.docs) {
    const user = doc.data();
    const appt = user.appointment;
    if (appt.remindersSent?.outcome || user.visaOutcome?.appointmentAt === appt.atMs) continue;
    const claimed = await db.runTransaction(async (tx) => {
      const fresh = (await tx.get(doc.ref)).get("appointment");
      if (!fresh || fresh.atMs !== appt.atMs || fresh.remindersSent?.outcome) return false;
      tx.update(doc.ref, { "appointment.remindersSent.outcome": now });
      return true;
    });
    if (!claimed) continue;
    await notifyUser(doc.id, {
      title: "How did your visa interview go?",
      body: `We hope your appointment at ${appt.embassy} went well. Tell us the result in one tap. If you share the questions you were asked, we'll add them to the practice interviews to help the next applicant.`,
      type: "appointment_reminder_outcome",
      path: "/dashboard",
      ctaLabel: "Tell us how it went",
    }).catch((err) => console.error(`Outcome ask to ${doc.id} failed:`, err));
    sent.push({ uid: doc.id, kind: "outcome" });
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
