import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/requireUser";
import { listPaidMeetingsForUser, listPastSessionsForUser } from "@/lib/meetings";

/**
 * Upcoming paid live sessions, with whether the caller already has a seat,
 * plus the past ones they bought (for replays).
 */
export async function GET(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [meetings, past] = await Promise.all([listPaidMeetingsForUser(user.uid), listPastSessionsForUser(user.uid)]);
    return NextResponse.json({ meetings, past });
  } catch (error) {
    console.error("Error listing paid sessions:", error);
    return NextResponse.json({ error: "Failed to load sessions" }, { status: 500 });
  }
}
