import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { getRequestUser } from "@/lib/requireUser";
import { slugFor } from "@/lib/countryRequirements";

/**
 * Destination insights for the signed-in user's active trip: published items
 * for their destination + visa type. Written by eloraadmin's daily search
 * (eloraadmin lib/insightsServer.ts); immigration items there are
 * admin-approved before they're published.
 */

export interface InsightItem {
  id: string;
  kind: "immigration" | "work" | "study";
  title: string;
  summary: string;
  sourceUrl: string;
  sourceName: string;
  publishedOn: string | null;
  deadline: string | null;
  severity: "high" | "normal";
  createdAt: string | null;
}

const MAX_ITEMS = 12;

export async function GET(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const onboarding = (await db.collection("users").doc(user.uid).get()).get("onboarding");
  const country = typeof onboarding?.destination === "string" ? onboarding.destination.trim() : "";
  const visaType = typeof onboarding?.visaType === "string" ? onboarding.visaType.trim() : "";
  if (!country || !visaType) return NextResponse.json({ country: null, visaType: null, items: [] });

  // Equality filters only, so no composite index is needed; the group's live
  // item count is small, and expiry and ordering are applied here.
  const snap = await db.collection("insights")
    .where("groupSlug", "==", slugFor(country, visaType))
    .where("status", "==", "published")
    .get();

  const now = Date.now();
  const items: InsightItem[] = snap.docs
    .filter((d) => (d.get("expiresAt")?.toMillis?.() ?? 0) > now)
    .map((d) => ({
      id: d.id,
      kind: d.get("kind"),
      title: d.get("title"),
      summary: d.get("summary"),
      sourceUrl: d.get("sourceUrl"),
      sourceName: d.get("sourceName"),
      publishedOn: d.get("publishedOn") ?? null,
      deadline: d.get("deadline") ?? null,
      severity: d.get("severity") === "high" ? ("high" as const) : ("normal" as const),
      createdAt: d.get("createdAt")?.toDate?.().toISOString() ?? null,
    }))
    // Important immigration news first, then newest.
    .sort((a, b) =>
      Number(b.severity === "high") - Number(a.severity === "high") ||
      Number(b.kind === "immigration") - Number(a.kind === "immigration") ||
      (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, MAX_ITEMS);

  return NextResponse.json({ country, visaType, items });
}
