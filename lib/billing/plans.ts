/**
 * Billing source of truth — pure data, zero side effects.
 *
 * Split out of `lib/subscriptions.ts` so that server components, route handlers
 * and the marketing homepage can read plan configuration without pulling in the
 * Firebase *client* SDK. `lib/subscriptions.ts` imports `@/firebase/client`,
 * which calls `initializeApp`/`getAuth`/`getStorage` at module scope; any module
 * that touches it inherits that side effect.
 *
 * `lib/subscriptions.ts` re-exports everything here, so every existing
 * `import { SUBSCRIPTION_PLANS } from "@/lib/subscriptions"` keeps working.
 *
 * PRICES ARE LIST PRICES IN USD. Checkout converts to GHS and charges through
 * Paystack (see `app/dashboard/subscription/page.tsx`). Any surface that shows a
 * price must therefore also say which currency it settles in.
 */

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
  /** Account holder + FAMILY_INCLUDED_MEMBERS others, sharing one token balance. */
  FAMILY: {
    id: 'family',
    name: 'Family Plan',
    price: 150,
    tokens: 400,
    hasChatbot: true,
    hasTelegram: true,
    durationMonths: 1,
  },
  /** One more family member for 30 days, on top of the Family plan. */
  FAMILY_SEAT: {
    id: 'family_seat',
    name: 'Extra Family Member',
    price: 30,
    tokens: 100,
    hasChatbot: false,
    hasTelegram: false,
    durationMonths: 0,
  },
} as const;

/** Family members included in the Family plan, besides the account holder. */
export const FAMILY_INCLUDED_MEMBERS = 3;
/** Each FAMILY_SEAT purchase lasts this long. */
export const FAMILY_SEAT_DAYS = 30;

/** Plans that unlock the AI assistant (chat and voice). */
export const PREMIUM_PLAN_IDS = ['pro', 'full', 'family'] as const;
export function hasPremiumAccess(planId: unknown): boolean {
  return typeof planId === 'string' && (PREMIUM_PLAN_IDS as readonly string[]).includes(planId);
}

export const TOKEN_COSTS = {
  DOCUMENT_REVIEW: 5,
  MOCK_INTERVIEW: 10,
  DOCUMENT_DRAFT: 5,
  INFORMATION_GENERATION: 5,
  CONSULAR_SESSION: 10,
  FINANCIAL_ANALYSIS: 10,
  REFUSAL_ANALYSIS: 10,
} as const;

/** Currency the list prices above are denominated in. */
export const LIST_CURRENCY = 'USD' as const;
/** Currency Paystack actually settles in at checkout. */
export const SETTLEMENT_CURRENCY = 'GHS' as const;

export type PlanId = keyof typeof SUBSCRIPTION_PLANS;

export interface UserSubscription {
  planId: string;
  tokens: number;
  expiresAt: number; // timestamp
  lastUpdated: number;
}
