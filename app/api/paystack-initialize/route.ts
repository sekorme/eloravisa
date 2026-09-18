import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/firebase/admin";
import { initializePaystackTransaction, resolvePaidPlan } from "@/lib/paystackServer";
import { checkRateLimit } from "@/lib/ratelimit";

/**
 * Starts a checkout. The client says WHICH plan it wants; the server decides
 * what it costs (USD list price × server-side USD→GHS rate), creates the
 * Paystack transaction, records the payment intent, and hands back the
 * access_code for Paystack's inline popup to resume.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!idToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = await auth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!decoded.email) {
      return NextResponse.json({ error: "Account has no email" }, { status: 400 });
    }

    const rl = await checkRateLimit("paymentInit", decoded.uid);
    if (!rl.success) {
      return NextResponse.json({ error: "Too many attempts, try again shortly" }, { status: 429 });
    }

    const body = await req.json();
    const resolved = resolvePaidPlan(typeof body?.planId === "string" ? body.planId : null);
    if (!resolved) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    // Promo codes are generated uppercase (lib/influencerAuth.ts) and the
    // influencer lookup is case-sensitive — normalize here rather than
    // trusting the client to.
    const promoCode =
      typeof body?.promoCode === "string" && body.promoCode.trim()
        ? body.promoCode.trim().toUpperCase()
        : null;

    const initialized = await initializePaystackTransaction({
      uid: decoded.uid,
      email: decoded.email,
      planKey: resolved.key,
      promoCode,
    });

    return NextResponse.json({ success: true, ...initialized });
  } catch (error) {
    console.error("Error initializing payment:", error);
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
  }
}
