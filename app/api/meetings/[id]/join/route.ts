import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { getRequestUser } from "@/lib/requireUser";
import { createJoinCredentials, MeetingAccessError } from "@/lib/meetings";

/** Stream credentials for a paid session the caller has a seat in. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const profile = await db.collection("users").doc(user.uid).get();
    const name = profile.get("fullName") || user.name || user.email?.split("@")[0] || "Guest";
    const { renewal } = await req.json().catch(() => ({ renewal: false }));
    return NextResponse.json(await createJoinCredentials(user.uid, name, id, renewal === true));
  } catch (error) {
    if (error instanceof MeetingAccessError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error creating session join credentials:", error);
    return NextResponse.json({ error: "Couldn't connect to the session" }, { status: 500 });
  }
}
