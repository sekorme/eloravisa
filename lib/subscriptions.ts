/**
 * Subscription configuration.
 *
 * The plan/token *configuration* lives in `lib/billing/plans.ts` — pure data
 * with no side effects — and is re-exported here so that existing imports
 * (`import { SUBSCRIPTION_PLANS, TOKEN_COSTS, PlanId } from "@/lib/subscriptions"`)
 * continue to resolve unchanged.
 *
 * Token balances are only ever mutated server-side (lib/tokensAdmin.ts via
 * firebase-admin); firestore.rules pins `tokens` against client writes.
 */

export {
  SUBSCRIPTION_PLANS,
  TOKEN_COSTS,
  LIST_CURRENCY,
  SETTLEMENT_CURRENCY,
} from "./billing/plans";
export type { PlanId, UserSubscription } from "./billing/plans";
