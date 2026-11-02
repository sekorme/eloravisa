import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/requireUser";
import { recordOutcome, type OutcomeStatus } from "@/lib/visaOutcomes";
import { checkRateLimit } from "@/lib/ratelimit";

/** "How did it go?": body { status, testimonial?, shareTestimonial?, questions? }. */
export async function POST(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await checkRateLimit("transactionalEmail", user.uid)).success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const body = await req.json().catch(() => ({}));
  const status = body.status as OutcomeStatus;
  if (!["approved", "refused", "waiting"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  try {
    await recordOutcome(user.uid, status, {
      testimonial: typeof body.testimonial === "string" ? body.testimonial : undefined,
      shareTestimonial: body.shareTestimonial === true,
      questions: Array.isArray(body.questions) ? body.questions : undefined,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Recording outcome failed:", error);
    return NextResponse.json({ error: "Couldn't save that" }, { status: 500 });
  }
}
