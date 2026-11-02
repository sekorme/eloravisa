import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/requireUser";
import { getMeetingForCheckout } from "@/lib/meetings";
import { initializeMeetingTransaction } from "@/lib/paystackServer";
import { checkRateLimit } from "@/lib/ratelimit";

/**
 * Starts checkout for a seat in a paid session. Same model as
 * /api/paystack-initialize: the server prices it and records the payment
 * intent; the seat is granted only when /api/paystack-success or the webhook
 * fulfils that intent.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!user.email) return NextResponse.json({ error: "Account has no email" }, { status: 400 });

  const rl = await checkRateLimit("paymentInit", user.uid);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many attempts, try again shortly" }, { status: 429 });
  }

  try {
    const { id } = await params;
    const result = await getMeetingForCheckout(user.uid, id);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 409 });

    const initialized = await initializeMeetingTransaction({
      uid: user.uid,
      email: user.email,
      meetingId: id,
      meetingTitle: result.meeting.title,
      priceUsd: result.meeting.priceUsd,
    });
    return NextResponse.json({ success: true, ...initialized });
  } catch (error) {
    console.error("Error starting session checkout:", error);
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
  }
}
