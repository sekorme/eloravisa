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
} as const;

export const TOKEN_COSTS = {
  DOCUMENT_REVIEW: 5,
  MOCK_INTERVIEW: 10,
  DOCUMENT_DRAFT: 5,
  INFORMATION_GENERATION: 5,
} as const;

export type PlanId = keyof typeof SUBSCRIPTION_PLANS;

export interface UserSubscription {
  planId: string;
  tokens: number;
  expiresAt: number; // timestamp
  lastUpdated: number;
}

import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/firebase/client";

export async function deductTokens(userId: string, amount: number) {
  const userRef = doc(db, "users", userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    throw new Error("User not found");
  }

  const userData = userDoc.data();
  const currentTokens = userData.tokens || 0;

  if (currentTokens < amount) {
    throw new Error("Insufficient tokens");
  }

  await updateDoc(userRef, {
    tokens: increment(-amount),
    updatedAt: Date.now(),
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
