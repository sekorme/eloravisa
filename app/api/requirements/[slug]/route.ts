import { NextRequest, NextResponse } from "next/server";
import { getPublishedRequirement } from "@/lib/countryRequirementsServer";

/** A published country requirements guide (public data, same as /visa-requirements). */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const entry = await getPublishedRequirement((await params).slug);
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(entry, { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } });
}
