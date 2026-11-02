import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/requireUser";
import { listReplaysForUser, MeetingAccessError } from "@/lib/meetings";

/** Recordings of a session the caller bought a seat in. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    return NextResponse.json({ recordings: await listReplaysForUser(user.uid, id) });
  } catch (error) {
    if (error instanceof MeetingAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error listing replays:", error);
    return NextResponse.json({ error: "Couldn't load the replay" }, { status: 500 });
  }
}
