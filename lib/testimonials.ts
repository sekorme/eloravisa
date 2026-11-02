import "server-only";

import { db } from "@/firebase/admin";

export interface ApprovedTestimonial {
  id: string;
  displayName: string;
  destination: string | null;
  visaType: string | null;
  testimonial: string;
}

/**
 * Testimonials users chose to share after an approval and an admin then
 * approved (eloraadmin's Outcomes page). First name only.
 */
export async function getApprovedTestimonials(limit = 12): Promise<ApprovedTestimonial[]> {
  const snap = await db.collection("visa_outcomes").where("testimonialApproved", "==", true).get();
  return snap.docs
    .map((d) => d.data() as Record<string, unknown> & { updatedAt?: { toMillis(): number } })
    .filter((o) => o.shareTestimonial === true && o.status === "approved" && typeof o.testimonial === "string")
    .sort((a, b) => (b.updatedAt?.toMillis() ?? 0) - (a.updatedAt?.toMillis() ?? 0))
    .slice(0, limit)
    .map((o, i) => ({
      id: String(i),
      displayName: String(o.displayName ?? "An applicant"),
      destination: (o.destination as string) ?? null,
      visaType: (o.visaType as string) ?? null,
      testimonial: o.testimonial as string,
    }));
}
