import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/requireUser";
import { addMember, FamilyError } from "@/lib/familyServer";

/** Adds a family member (needs an active Family plan with a free place). */
export async function POST(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  try {
    const id = await addMember(user.uid, {
      name: String(body.name ?? ""),
      relationship: String(body.relationship ?? ""),
      destination: typeof body.destination === "string" ? body.destination : undefined,
      visaType: typeof body.visaType === "string" ? body.visaType : undefined,
      nationality: typeof body.nationality === "string" ? body.nationality : undefined,
    });
    return NextResponse.json({ id });
  } catch (error) {
    if (error instanceof FamilyError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Adding family member failed:", error);
    return NextResponse.json({ error: "Couldn't add the member" }, { status: 500 });
  }
}
