import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  getPaystackSecretKey,
  verifyPaystackTransaction,
  fulfilPaystackPayment,
  PaymentFulfilmentError,
} from "@/lib/paystackServer";

/**
 * Paystack webhook — the authoritative fulfilment path.
 *
 * Registered in the Paystack dashboard as <site>/api/paystack-webhook. Covers
 * payments where the browser callback never ran (closed tab, network drop).
 * Authenticated by the x-paystack-signature header: HMAC-SHA512 of the raw
 * body keyed with the secret key. Fulfilment is idempotent per reference, so
 * webhook retries and callback/webhook races are safe.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  const signature = req.headers.get("x-paystack-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }
  const expected = crypto
    .createHmac("sha512", getPaystackSecretKey())
    .update(rawBody)
    .digest("hex");
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // Only successful charges are fulfilled; acknowledge everything else so
  // Paystack does not keep retrying events we intentionally ignore.
  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const reference = event.data?.reference;
  if (!reference || typeof reference !== "string") {
    console.error("paystack-webhook: charge.success without reference", event.data?.id);
    return NextResponse.json({ received: true });
  }

  try {
    // Re-verify with Paystack's API rather than trusting the pushed payload —
    // signature proves origin, verification proves current state.
    const verified = await verifyPaystackTransaction(reference);
    if (!verified) {
      console.error(`paystack-webhook: ${reference} did not verify as success`);
      return NextResponse.json({ received: true });
    }

    const result = await fulfilPaystackPayment({ verified, source: "webhook" });

    return NextResponse.json({ received: true, alreadyProcessed: result.alreadyProcessed });
  } catch (error) {
    if (error instanceof PaymentFulfilmentError) {
      // Permanently unfulfillable: a charge our server never initialized
      // (NO_INTENT — e.g. forged client-side with the public key), an
      // underpaid one (AMOUNT_MISMATCH), or a missing user. Log loudly but
      // return 200 so Paystack stops retrying; the absent payments record is
      // the signal to reconcile manually.
      console.error(`paystack-webhook: refusing ${reference} — ${error.code}: ${error.message}`);
      return NextResponse.json({ received: true, refused: error.code });
    }
    console.error(`paystack-webhook: error fulfilling ${reference}:`, error);
    // 500 → Paystack retries; fulfilment is idempotent so retries are safe.
    return NextResponse.json({ error: "Fulfilment failed" }, { status: 500 });
  }
}
