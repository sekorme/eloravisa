/**
 * Pricing adapter.
 *
 * Projects the live billing configuration (`lib/billing/plans.ts`) into the
 * shape the pricing scene renders. Prices are never retyped here — if someone
 * changes PRO from $20 to $25, this page changes with it.
 *
 * The *editorial* fields (audience, feature wording) are the only thing this
 * module adds, because they describe positioning rather than billing.
 */

import {
    SUBSCRIPTION_PLANS,
    TOKEN_COSTS,
    LIST_CURRENCY,
    SETTLEMENT_CURRENCY,
} from "@/lib/billing/plans"
import type { PricingPlan } from "../types"

/**
 * What one token actually buys, derived from the live token costs.
 *
 * Typed as `number` rather than left to infer literal types: the costs come
 * from configuration that can change, and a literal union would make the
 * pluralisation check at the call site provably dead code today, then silently
 * wrong the day someone sets a cost to 1.
 */
export const TOKEN_SPEND: readonly { label: string; cost: number }[] = [
    { label: "Document review", cost: TOKEN_COSTS.DOCUMENT_REVIEW },
    { label: "Mock interview", cost: TOKEN_COSTS.MOCK_INTERVIEW },
    { label: "SOP / letter draft", cost: TOKEN_COSTS.DOCUMENT_DRAFT },
    { label: "Readiness insight", cost: TOKEN_COSTS.INFORMATION_GENERATION },
    { label: "Consular session", cost: TOKEN_COSTS.CONSULAR_SESSION },
]

export const CURRENCY = {
    list: LIST_CURRENCY,
    settlement: SETTLEMENT_CURRENCY,
    /** Rendered verbatim under the price grid. Must stay factually true. */
    note: `Prices are listed in ${LIST_CURRENCY}. Checkout converts to ${SETTLEMENT_CURRENCY} and is processed by Paystack at the exchange rate applied on the day you pay.`,
    terms: "Monthly plans renew every 30 days and can be cancelled at any time from your dashboard. Tokens from a paid plan are added to your balance when the payment clears.",
} as const

/**
 * Returns the three subscription tiers in presentation order.
 *
 * TOPUP_50 is deliberately excluded — it is a one-off token purchase, not a
 * plan, and putting it in a plan comparison misrepresents what you're buying.
 * It is surfaced separately by the scene as a footnote.
 */
export function getPricingPlans(): PricingPlan[] {
    const { FREE, PRO, FULL } = SUBSCRIPTION_PLANS

    return [
        {
            id: FREE.id,
            name: FREE.name,
            priceUsd: FREE.price,
            tokens: FREE.tokens,
            audience: "Starting out, and finding out where your application actually stands.",
            features: [
                `${FREE.tokens} tokens to begin with`,
                "Personalised document checklist",
                "Application readiness scoring",
                "Destination preparation guidance",
            ],
            recommended: false,
        },
        {
            id: PRO.id,
            name: PRO.name,
            priceUsd: PRO.price,
            tokens: PRO.tokens,
            audience: "Actively preparing an application with a date in mind.",
            features: [
                `${PRO.tokens} tokens each month`,
                "AI document review and inconsistency checks",
                "Statement-of-purpose drafting",
                "Voice mock interviews with feedback",
                "AI assistant chat",
            ],
            recommended: true,
            upgradeFrom: FREE.name,
        },
        {
            id: FULL.id,
            name: FULL.name,
            priceUsd: FULL.price,
            tokens: FULL.tokens,
            audience: "Preparing a complex or high-stakes application end to end.",
            features: [
                `${FULL.tokens} tokens each month`,
                "Everything in the Pro Plan",
                "Consular preparation sessions",
                "Telegram assistant access",
                "Priority access to new tools",
            ],
            recommended: false,
            upgradeFrom: PRO.name,
        },
    ]
}

/** The one-off top-up, surfaced as a footnote rather than as a fourth column. */
export function getTopUp() {
    const t = SUBSCRIPTION_PLANS.TOPUP_50
    return { name: t.name, priceUsd: t.price, tokens: t.tokens }
}

export function formatUsd(amount: number): string {
    return amount === 0 ? "Free" : `$${amount}`
}
