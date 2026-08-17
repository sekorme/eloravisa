export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Basic Plan',
    price: 0,
    tokens: 10,
    hasChatbot: false,
    hasTelegram: false,
    durationMonths: 1,
  },
  PRO: {
    id: 'pro',
    name: 'Pro Plan',
    price: 20,
    tokens: 100,
    hasChatbot: true,
    hasTelegram: false,
    durationMonths: 1,
  },
  FULL: {
    id: 'full',
    name: 'Full Features',
    price: 40,
    tokens: 200,
    hasChatbot: true,
    hasTelegram: true,
    durationMonths: 1,
  },
  TOPUP_50: {
    id: 'topup_50',
    name: 'Token Top-Up',
    price: 8,
    tokens: 50,
    hasChatbot: false,
    hasTelegram: false,
    durationMonths: 0, // One-time purchase
  },
} as const;

export const TOKEN_COSTS = {
  DOCUMENT_REVIEW: 5,
  MOCK_INTERVIEW: 10,
  DOCUMENT_DRAFT: 5,
  INFORMATION_GENERATION: 5,
  CONSULAR_SESSION: 10,
} as const;

export type PlanId = keyof typeof SUBSCRIPTION_PLANS;

export interface UserSubscription {
  planId: string;
  tokens: number;
  expiresAt: number; // timestamp
  lastUpdated: number;
}

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
