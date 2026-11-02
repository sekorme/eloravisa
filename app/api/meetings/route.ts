import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/requireUser";
import { listPaidMeetingsForUser } from "@/lib/meetings";

/** Upcoming paid live sessions, with whether the caller already has a seat. */
export async function GET(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    return NextResponse.json({ meetings: await listPaidMeetingsForUser(user.uid) });
  } catch (error) {
    console.error("Error listing paid sessions:", error);
    return NextResponse.json({ error: "Failed to load sessions" }, { status: 500 });
  }
}
