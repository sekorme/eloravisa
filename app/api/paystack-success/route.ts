import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { SUBSCRIPTION_PLANS, PlanId } from "@/lib/subscriptions";

export async function POST(req: NextRequest) {
  try {
    const { email, reference, planId, promoCode } = await req.json();

    if (!email || !reference || !planId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify payment with Paystack API
    const paystackRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY}`,
      },
    });

    const paymentData = await paystackRes.json();

    if (!paymentData.status || paymentData.data.status !== "success") {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    // Get user from Firestore
    const usersRef = db.collection("users");
    const querySnapshot = await usersRef.where("email", "==", email).get();

    if (querySnapshot.empty) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    const userId = userDoc.id;

    const selectedPlan = SUBSCRIPTION_PLANS[planId as PlanId];
    if (!selectedPlan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    // Server-side promo code validation: if provided, check influencers collection
    let influencerId: string | null = null
    if (promoCode) {
      try {
        const inflRef = db.collection('influencers')
        const inflSnap = await inflRef.where('promoCode', '==', promoCode).limit(1).get()
        if (!inflSnap.empty) {
          influencerId = inflSnap.docs[0].id
        } else {
          // promo code not found - we won't reject the payment but record that promo was invalid
          console.warn(`Promo code ${promoCode} not found during server validation`)
        }
      } catch (err) {
        console.error('Error checking promo code on server:', err)
      }
    }

    const now = Date.now();
    // Calculate new tokens
    const currentTokens = userData.tokens || 0;
    let tokensToAdd = selectedPlan.tokens;
    let commissionAmount = 0;

    if (influencerId) {
      const bonusTokens = Math.floor(selectedPlan.tokens * 0.3);
      tokensToAdd += bonusTokens;
      commissionAmount = selectedPlan.price * 0.1;

      // Update influencer's commission and referral count
      const influencerRef = db.collection("influencers").doc(influencerId);
      const influencerDoc = await influencerRef.get();
      const influencerData = influencerDoc.data() || {};

      await influencerRef.update({
        totalCommission: (influencerData.totalCommission || 0) + commissionAmount,
        referralCount: (influencerData.referralCount || 0) + 1,
        updatedAt: now,
      });
    }

    const newTokens = currentTokens + tokensToAdd;

    // Update user document based on plan type
    if (planId === 'TOPUP_50') {
        // One-time top-up: Only add tokens, do NOT change plan or expiration
        await userDoc.ref.update({
            tokens: newTokens,
            lastPaymentReference: reference,
            updatedAt: now,
        });
    } else {
        // Subscription plan: Update plan and expiration
        const oneMonth = 30 * 24 * 60 * 60 * 1000;
        const expiresAt = now + oneMonth;

        await userDoc.ref.update({
            tokens: newTokens,
            planId: selectedPlan.id,
            subscriptionExpiresAt: expiresAt,
            lastPaymentReference: reference,
            updatedAt: now,
        });
    }

    // Save payment record, include influencerId if present
    await db.collection("payments").add({
      userId,
      email,
      reference,
      amount: paymentData.data.amount / 100,
      currency: paymentData.data.currency,
      planId: selectedPlan.id,
      status: "success",
      influencerId: influencerId || null,
      promoCode: promoCode || null,
      commissionAmount: commissionAmount,
      createdAt: now,
    });

    return NextResponse.json({ success: true, tokens: newTokens });
  } catch (error: unknown) {
    console.error("Error processing payment:", error);
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
