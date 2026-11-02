import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { db } from "@/firebase/admin";
import { loadReadiness } from "@/lib/appointmentReminders";

/**
 * Visa outcomes users report after their appointment ("How did it go?") or
 * by uploading a refusal letter.
 *
 * users/{uid}.visaOutcome          latest outcome, drives the dashboard card
 * visa_outcomes/{uid}_{appt}       one record per appointment, with a snapshot
 *                                  of destination, plan and readiness at the
 *                                  time: eloraadmin's approval statistics
 * interview_questions/{id}         questions the user says they were asked,
 *                                  pending admin approval (the question bank)
 */

export type OutcomeStatus = "approved" | "refused" | "waiting";

export interface OutcomeExtras {
  testimonial?: string;
  shareTestimonial?: boolean;
  /** Questions the officer asked, one per entry. */
  questions?: string[];
}

const MAX_QUESTIONS = 15;

export async function recordOutcome(uid: string, status: OutcomeStatus, extras: OutcomeExtras = {}) {
  const userRef = db.collection("users").doc(uid);
  const user = (await userRef.get()).data();
  if (!user) throw new Error("User not found");
  const now = Date.now();
  const appointment = user.appointment && typeof user.appointment.atMs === "number" ? user.appointment : null;
  const readiness = await loadReadiness(uid, user, now).catch(() => null);
  const destination = user.onboarding?.destination ?? null;
  const visaType = user.onboarding?.visaType ?? null;
  const testimonial = typeof extras.testimonial === "string" ? extras.testimonial.trim().slice(0, 1000) : "";

  const outcomeRef = db.collection("visa_outcomes").doc(`${uid}_${appointment?.atMs ?? "none"}`);
  const record: Record<string, unknown> = {
    uid,
    status,
    destination,
    visaType,
    planId: user.planId ?? "free",
    readinessScore: readiness?.score ?? null,
    appointmentAt: appointment?.atMs ?? null,
    embassy: appointment?.embassy ?? null,
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (!(await outcomeRef.get()).exists) record.createdAt = FieldValue.serverTimestamp();
  if (testimonial) {
    record.testimonial = testimonial;
    record.shareTestimonial = extras.shareTestimonial === true;
    record.displayName = String(user.fullName ?? "").trim().split(/\s+/)[0] || "An applicant";
    // A new or edited testimonial needs approving again.
    record.testimonialApproved = false;
  }
  await outcomeRef.set(record, { merge: true });

  await userRef.update({
    visaOutcome: { status, appointmentAt: appointment?.atMs ?? null, updatedAt: now },
  });

  const questions = (extras.questions ?? [])
    .map((q) => (typeof q === "string" ? q.replace(/\s+/g, " ").trim() : ""))
    .filter((q) => q.length >= 8 && q.length <= 300)
    .slice(0, MAX_QUESTIONS);
  if (questions.length && destination) {
    const batch = db.batch();
    for (const question of questions) {
      batch.set(db.collection("interview_questions").doc(), {
        question,
        country: destination,
        visaType: visaType ?? null,
        embassy: appointment?.embassy ?? null,
        status: "pending",
        source: "applicant",
        submittedBy: uid,
        outcome: status,
        createdAt: FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();
  }
  return { readinessScore: readiness?.score ?? null };
}
