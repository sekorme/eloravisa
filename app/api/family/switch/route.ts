import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/requireUser";
import { FamilyError, switchMember } from "@/lib/familyServer";

/** Makes another applicant active: body { memberId } ("self" for the account holder). */
export async function POST(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { memberId } = await req.json().catch(() => ({}));
  if (typeof memberId !== "string" || !memberId) return NextResponse.json({ error: "memberId is required" }, { status: 400 });
  try {
    await switchMember(user.uid, memberId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof FamilyError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Switching family member failed:", error);
    return NextResponse.json({ error: "Couldn't switch applicant" }, { status: 500 });
  }
}
