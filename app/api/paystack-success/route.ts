import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/firebase/admin";
import {
  verifyPaystackTransaction,
  fulfilPaystackPayment,
  PaymentFulfilmentError,
} from "@/lib/paystackServer";

/**
 * Browser callback after Paystack's inline checkout succeeds.
 *
 * The caller must be signed in and must be the user who initialized the
 * charge (checked against payment_intents/{reference}); what gets credited is
 * determined entirely by the intent, never the request body. Fulfilment is
 * idempotent per reference, so a retry — or the webhook landing first — is a
 * harmless no-op. /api/paystack-webhook is the safety net when this callback
 * never fires.
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

    const { reference } = await req.json();
    if (!reference || typeof reference !== "string") {
      return NextResponse.json({ error: "Missing payment reference" }, { status: 400 });
    }

    const verified = await verifyPaystackTransaction(reference);
    if (!verified) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    const result = await fulfilPaystackPayment({
      verified,
      source: "callback",
      expectedUid: decoded.uid,
    });

    return NextResponse.json({
      success: true,
      alreadyProcessed: result.alreadyProcessed,
      tokens: result.tokens,
    });
  } catch (error: unknown) {
    if (error instanceof PaymentFulfilmentError) {
      console.error(`paystack-success: ${error.code}: ${error.message}`);
      const status =
        error.code === "WRONG_USER" ? 403 : error.code === "NO_INTENT" ? 404 : 400;
      return NextResponse.json({ error: "Payment could not be applied" }, { status });
    }
    console.error("Error processing payment:", error);
    return NextResponse.json({ error: "Failed to process payment" }, { status: 500 });
  }
}
