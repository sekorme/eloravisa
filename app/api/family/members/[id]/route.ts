import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/requireUser";
import { FamilyError, removeMember } from "@/lib/familyServer";

/** Removes a family member and their stored profile. */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await removeMember(user.uid, (await params).id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof FamilyError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Removing family member failed:", error);
    return NextResponse.json({ error: "Couldn't remove the member" }, { status: 500 });
  }
}
