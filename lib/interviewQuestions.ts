import "server-only";

import { db } from "@/firebase/admin";

/**
 * Approved questions from the interview question bank (interview_questions,
 * moderated in eloraadmin), for a destination. Questions for the same visa
 * type come first. Filters status in memory so no composite index is needed.
 */
export async function getApprovedQuestions(country: string | null | undefined, visaType: string | null | undefined, limit = 15): Promise<string[]> {
  if (!country) return [];
  const snap = await db.collection("interview_questions").where("country", "==", country).get();
  const approved = snap.docs.map((d) => d.data()).filter((q) => q.status === "approved" && typeof q.question === "string");
  const sameType = approved.filter((q) => q.visaType === visaType);
  const other = approved.filter((q) => q.visaType !== visaType);
  // Shuffle within each group so repeat interviews don't always open the same way.
  const shuffle = <T,>(a: T[]) => a.map((x) => [Math.random(), x] as const).sort((p, q) => p[0] - q[0]).map(([, x]) => x);
  return [...shuffle(sameType), ...shuffle(other)].slice(0, limit).map((q) => q.question as string);
}
