import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/requireUser";
import { getApprovedQuestions } from "@/lib/interviewQuestions";

/** Real questions reported at this destination's embassy, for the mock interview officer. */
export async function GET(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const country = req.nextUrl.searchParams.get("country");
  const visaType = req.nextUrl.searchParams.get("visaType");
  try {
    return NextResponse.json({ questions: await getApprovedQuestions(country, visaType) });
  } catch (error) {
    console.error("Loading question bank failed:", error);
    return NextResponse.json({ questions: [] });
  }
}
