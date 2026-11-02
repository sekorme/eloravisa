import "server-only";

import { db } from "@/firebase/admin";
import { slugFor, type CountryRequirement } from "@/lib/countryRequirements";

const COLLECTION = "country_requirements";

function toRequirement(id: string, d: FirebaseFirestore.DocumentData): CountryRequirement {
  const list = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
  const updated = d.updatedAt?.toDate?.() as Date | undefined;
  return {
    slug: id,
    country: d.country ?? "",
    visaType: d.visaType ?? "",
    summary: d.summary ?? "",
    fees: list(d.fees),
    processingTime: d.processingTime ?? "",
    validity: d.validity ?? "",
    documents: list(d.documents),
    funds: d.funds && typeof d.funds.amount === "number" ? d.funds : null,
    embassies: list(d.embassies),
    tips: list(d.tips),
    officialUrl: d.officialUrl ?? "",
    published: d.published === true,
    updatedAt: updated ? updated.toISOString() : null,
  };
}

/** Published entries, by country then visa type. */
export async function listPublishedRequirements(): Promise<CountryRequirement[]> {
  const snap = await db.collection(COLLECTION).where("published", "==", true).get();
  return snap.docs
    .map((d) => toRequirement(d.id, d.data()))
    .sort((a, b) => a.country.localeCompare(b.country) || a.visaType.localeCompare(b.visaType));
}

/** A published entry, or null (drafts are never served). */
export async function getPublishedRequirement(slug: string): Promise<CountryRequirement | null> {
  const doc = await db.collection(COLLECTION).doc(slug).get();
  if (!doc.exists || doc.get("published") !== true) return null;
  return toRequirement(doc.id, doc.data()!);
}

/** The entry matching a user's onboarding destination and visa type. */
export async function getRequirementFor(destination?: string | null, visaType?: string | null) {
  if (!destination || !visaType) return null;
  return getPublishedRequirement(slugFor(destination, visaType));
}
