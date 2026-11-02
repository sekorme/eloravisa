import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { getRequestUser } from "@/lib/requireUser";
import { askQuestion, listQuestionsForUser, MeetingAccessError, toggleUpvote } from "@/lib/meetings";

function errorResponse(error: unknown, fallback: string) {
  if (error instanceof MeetingAccessError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(fallback, error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}

/** Q&A for a session: seat holders only. The host answers from eloraadmin. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    return NextResponse.json({ questions: await listQuestionsForUser(user.uid, id) });
  } catch (error) {
    return errorResponse(error, "Couldn't load questions");
  }
}

/** Body: { text } to ask, or { questionId, upvote } to vote. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    if (typeof body.questionId === "string") {
      await toggleUpvote(user.uid, id, body.questionId, body.upvote !== false);
    } else {
      const profile = await db.collection("users").doc(user.uid).get();
      const name = profile.get("fullName") || user.name || "Attendee";
      await askQuestion(user.uid, name, id, String(body.text ?? ""));
    }
    return NextResponse.json({ questions: await listQuestionsForUser(user.uid, id) });
  } catch (error) {
    return errorResponse(error, "Couldn't send that");
  }
}
