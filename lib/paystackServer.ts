import "server-only";

import { db } from "@/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import { SUBSCRIPTION_PLANS, PlanId } from "@/lib/billing/plans";
import { getUsdToGhsRate } from "@/lib/exchangeRate";

/**
 * Server-side Paystack integration shared by:
 *  - /api/paystack-initialize (creates the charge + a payment intent)
 *  - /api/paystack-success    (browser callback after inline checkout)
 *  - /api/paystack-webhook    (Paystack's server-to-server call)
 *
 * Integrity model: every charge is initialized SERVER-SIDE with a
 * server-computed amount, recorded as payment_intents/{reference}. Fulfilment
 * refuses any reference without a matching intent and re-checks the paid
 * amount against it — so a charge created client-side with the public key and
 * forged metadata can never be redeemed. Fulfilment is idempotent: the
 * payment record lives at payments/{reference}, created inside the same
 * transaction that credits the user.
 */

export function getPaystackSecretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    // Deliberately NOT falling back to the old NEXT_PUBLIC_-prefixed name:
    // that prefix inlines the value into the client bundle if anything on the
    // client ever references it. Set PAYSTACK_SECRET_KEY in the environment.
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }
  return key;
}

export interface VerifiedPaystackTransaction {
  reference: string;
  amount: number; // major units (Paystack reports minor units; converted here)
  currency: string;
  paidAt: string | null;
  customerEmail: string | null;
}

/** Confirm a transaction reference directly with Paystack. */
export async function verifyPaystackTransaction(
  reference: string
): Promise<VerifiedPaystackTransaction | null> {
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${getPaystackSecretKey()}` } }
  );
  const body = await res.json();

  if (!body.status || body.data?.status !== "success") {
    return null;
  }

  const data = body.data;
  return {
    reference: data.reference,
    amount: data.amount / 100,
    currency: data.currency,
    paidAt: data.paid_at ?? null,
    customerEmail: data.customer?.email ?? null,
  };
}

/** Accepts either a plan key ("PRO") or a stored plan id ("pro"). */
export function resolvePaidPlan(
  input: string | null | undefined
): { key: PlanId; plan: (typeof SUBSCRIPTION_PLANS)[PlanId] } | null {
  if (!input) return null;
  if (input in SUBSCRIPTION_PLANS) {
    const key = input as PlanId;
    if (SUBSCRIPTION_PLANS[key].price <= 0) return null;
    return { key, plan: SUBSCRIPTION_PLANS[key] };
  }
  const entry = Object.entries(SUBSCRIPTION_PLANS).find(([, p]) => p.id === input);
  if (!entry || entry[1].price <= 0) return null;
  return { key: entry[0] as PlanId, plan: entry[1] };
}

export interface InitializedTransaction {
  accessCode: string;
  reference: string;
  amount: number; // major units, GHS
  currency: string;
  promoApplied: boolean;
}

/**
 * Create a Paystack charge with a server-computed amount and record the
 * matching payment intent. Only references created here can ever be fulfilled.
 */
export async function initializePaystackTransaction(params: {
  uid: string;
  email: string;
  planKey: PlanId;
  promoCode: string | null;
}): Promise<InitializedTransaction> {
  const { uid, email, planKey, promoCode } = params;
  const plan = SUBSCRIPTION_PLANS[planKey];

  // Validate the promo code up front so the intent stores the resolved
  // influencer, not a raw string to re-trust later.
  let influencerId: string | null = null;
  if (promoCode) {
    const snap = await db
      .collection("influencers")
      .where("promoCode", "==", promoCode)
      .limit(1)
      .get();
    if (!snap.empty) influencerId = snap.docs[0].id;
  }

  const rate = await getUsdToGhsRate();
  const amountMinor = Math.round(plan.price * rate * 100);
  const amount = amountMinor / 100;

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getPaystackSecretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amountMinor,
      currency: "GHS",
      metadata: { uid, planId: plan.id, promoCode: influencerId ? promoCode : null },
    }),
  });
  const body = await res.json();
  if (!body.status || !body.data?.access_code || !body.data?.reference) {
    console.error("Paystack initialize failed:", body.message ?? res.status);
    throw new Error("Failed to initialize payment");
  }

  const reference: string = body.data.reference;
  await db.collection("payment_intents").doc(reference).create({
    uid,
    email,
    planKey,
    planId: plan.id,
    promoCode: influencerId ? promoCode : null,
    influencerId,
    amount,
    currency: "GHS",
    priceUSD: plan.price,
    rate,
    status: "initialized",
    createdAt: Date.now(),
  });

  return {
    accessCode: body.data.access_code,
    reference,
    amount,
    currency: "GHS",
    promoApplied: Boolean(influencerId),
  };
}

export type FulfilmentErrorCode =
  | "NO_INTENT" // reference was never initialized by our server
  | "WRONG_USER" // callback caller isn't the user who initialized it
  | "AMOUNT_MISMATCH" // paid amount/currency doesn't match the intent
  | "USER_NOT_FOUND";

export class PaymentFulfilmentError extends Error {
  constructor(
    public readonly code: FulfilmentErrorCode,
    message: string
  ) {
    super(message);
    this.name = "PaymentFulfilmentError";
  }
}

export interface FulfilmentResult {
  alreadyProcessed: boolean;
  tokens: number | null;
  uid: string;
}

/**
 * Credit a verified payment to the user recorded on its intent, exactly once
 * per reference. All reads and writes (intent, user tokens/plan, influencer
 * commission, payment record) happen in one Firestore transaction.
 */
export async function fulfilPaystackPayment(params: {
  verified: VerifiedPaystackTransaction;
  source: "callback" | "webhook";
  /** When set (callback path), the intent must belong to this uid. */
  expectedUid?: string;
}): Promise<FulfilmentResult> {
  const { verified, source, expectedUid } = params;

  const paymentRef = db.collection("payments").doc(verified.reference);
  const intentRef = db.collection("payment_intents").doc(verified.reference);

  return db.runTransaction(async (txn) => {
    const [paymentSnap, intentSnap] = await Promise.all([
      txn.get(paymentRef),
      txn.get(intentRef),
    ]);

    const intent = intentSnap.data();
    if (!intentSnap.exists || !intent) {
      throw new PaymentFulfilmentError(
        "NO_INTENT",
        `No payment intent for ${verified.reference} — refusing to fulfil`
      );
    }
    if (expectedUid && intent.uid !== expectedUid) {
      throw new PaymentFulfilmentError(
        "WRONG_USER",
        `Intent ${verified.reference} belongs to another account`
      );
    }
    if (paymentSnap.exists) {
      return { alreadyProcessed: true, tokens: null, uid: intent.uid };
    }
    if (
      verified.currency !== intent.currency ||
      verified.amount + 0.01 < intent.amount
    ) {
      throw new PaymentFulfilmentError(
        "AMOUNT_MISMATCH",
        `Paid ${verified.amount} ${verified.currency}, intent expects ${intent.amount} ${intent.currency} (${verified.reference})`
      );
    }

    const plan = SUBSCRIPTION_PLANS[intent.planKey as PlanId];
    if (!plan) {
      throw new PaymentFulfilmentError(
        "NO_INTENT",
        `Intent ${verified.reference} names unknown plan ${intent.planKey}`
      );
    }

    const userRef = db.collection("users").doc(intent.uid);
    const userSnap = await txn.get(userRef);
    if (!userSnap.exists) {
      throw new PaymentFulfilmentError(
        "USER_NOT_FOUND",
        `User ${intent.uid} not found for payment ${verified.reference}`
      );
    }
    const userData = userSnap.data() || {};

    const influencerId: string | null = intent.influencerId ?? null;
    let tokensToAdd = plan.tokens;
    let commissionAmount = 0;
    if (influencerId) {
      tokensToAdd += Math.floor(plan.tokens * 0.3);
      commissionAmount = plan.price * 0.1;
    }

    const now = Date.now();
    const newTokens = (userData.tokens || 0) + tokensToAdd;

    if (intent.planKey === "TOPUP_50") {
      // One-time top-up: tokens only, plan and expiry untouched.
      txn.update(userRef, {
        tokens: newTokens,
        lastPaymentReference: verified.reference,
        updatedAt: now,
      });
    } else {
      txn.update(userRef, {
        tokens: newTokens,
        planId: plan.id,
        subscriptionExpiresAt: now + 30 * 24 * 60 * 60 * 1000,
        lastPaymentReference: verified.reference,
        updatedAt: now,
      });
    }

    if (influencerId) {
      txn.update(db.collection("influencers").doc(influencerId), {
        totalCommission: FieldValue.increment(commissionAmount),
        referralCount: FieldValue.increment(1),
        updatedAt: now,
      });
    }

    txn.update(intentRef, { status: "fulfilled", fulfilledAt: now });

    // create() fails if the doc exists — the hard idempotency guarantee.
    txn.create(paymentRef, {
      userId: intent.uid,
      email: userData.email ?? verified.customerEmail ?? intent.email ?? null,
      reference: verified.reference,
      amount: verified.amount,
      currency: verified.currency,
      planId: plan.id,
      status: "success",
      influencerId,
      promoCode: intent.promoCode ?? null,
      commissionAmount,
      source,
      paidAt: verified.paidAt,
      createdAt: now,
    });

    return { alreadyProcessed: false, tokens: newTokens, uid: intent.uid };
  });
}
