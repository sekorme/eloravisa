/**
 * Subscription helpers.
 *
 * The plan/token *configuration* lives in `lib/billing/plans.ts` — pure data
 * with no side effects — and is re-exported here so that existing imports
 * (`import { SUBSCRIPTION_PLANS, TOKEN_COSTS, PlanId } from "@/lib/subscriptions"`)
 * continue to resolve unchanged.
 *
 * This module additionally pulls in the Firebase *client* SDK for the token
 * mutation helpers below. Prefer importing from `@/lib/billing/plans` directly
 * when you only need configuration — server components and route handlers get a
 * meaningfully smaller graph that way.
 */

export {
  SUBSCRIPTION_PLANS,
  TOKEN_COSTS,
  LIST_CURRENCY,
  SETTLEMENT_CURRENCY,
} from "./billing/plans";
export type { PlanId, UserSubscription } from "./billing/plans";

import { doc, getDoc, runTransaction } from "firebase/firestore";
import { db } from "@/firebase/client";

export async function deductTokens(userId: string, amount: number) {
  const userRef = doc(db, "users", userId);

  await runTransaction(db, async (transaction) => {
    const userDoc = await transaction.get(userRef);

    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const currentTokens = userDoc.data().tokens || 0;

    if (currentTokens < amount) {
      throw new Error("Insufficient tokens");
    }

    transaction.update(userRef, {
      tokens: currentTokens - amount,
      updatedAt: Date.now(),
    });
  });

  return true;
}

export async function hasEnoughTokens(userId: string, amount: number) {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);

  if (!userDoc.exists()) return false;

  const userData = userDoc.data();
  return (userData.tokens || 0) >= amount;
}
