import { NextRequest, NextResponse } from "next/server";
import { getRequestUser } from "@/lib/requireUser";
import { getMeetingForCheckout } from "@/lib/meetings";
import { checkRateLimit } from "@/lib/ratelimit";

/** Price of a seat with an optional discount code, before checkout. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limited like checkout so codes can't be guessed in bulk.
  const rl = await checkRateLimit("paymentInit", user.uid);
  if (!rl.success) return NextResponse.json({ error: "Too many attempts, try again shortly" }, { status: 429 });

  try {
    const { id } = await params;
    const code = req.nextUrl.searchParams.get("code");
    const result = await getMeetingForCheckout(user.uid, id, code);
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 409 });
    return NextResponse.json({ priceUsd: result.priceUsd, percentOff: result.percentOff, discountCode: result.discountCode });
  } catch (error) {
    console.error("Error quoting session seat:", error);
    return NextResponse.json({ error: "Couldn't check that code" }, { status: 500 });
  }
}
