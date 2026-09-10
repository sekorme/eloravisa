"use client"

import { Shell, Heading, Eyebrow, Body, Caveat, Board } from "../components/Primitives"
import { Cta } from "../components/Cta"
import { Reveal } from "../components/Reveal"
import { Check, ArrowRight } from "../components/Icon"
import { PRICING } from "../data/content"
import { getPricingPlans, getTopUp, formatUsd, CURRENCY, TOKEN_SPEND } from "../adapters/pricing"
import { ROUTES } from "../adapters/routes"

/**
 * Scene 11 — pricing preview.
 *
 * ------------------------------------------------------------------------
 * WHERE THE NUMBERS COME FROM
 * ------------------------------------------------------------------------
 * Every price, token allowance and token cost on this page is read live from
 * `lib/billing/plans.ts` through the pricing adapter. Nothing is retyped. If
 * someone changes the Pro plan from $20 to $25, this section changes with it
 * and there is no stale marketing number to discover six months later.
 *
 * ------------------------------------------------------------------------
 * PROMINENCE WITHOUT MANIPULATION
 * ------------------------------------------------------------------------
 * The recommended plan is emphasised with elevation, a border and a label —
 * legitimate visual hierarchy. What it deliberately does not use: a fake
 * countdown, a struck-through "was" price that was never charged, a
 * "3 people are viewing this" counter, or a scarcity claim. The visitor is
 * making a considered purchase under stress; pressure tactics here would be
 * indefensible.
 *
 * Currency is stated plainly because it genuinely changes what you pay:
 * prices are listed in USD and Paystack settles in GHS at the day's rate.
 * Hiding that until checkout would be a nasty surprise.
 */
export function Pricing() {
    const plans = getPricingPlans()
    const topUp = getTopUp()

    return (
        <section id="pricing" className="eh-scene eh-pricing" aria-labelledby="eh-pricing-title">
            <Shell>
                <header className="eh-pricing-head">
                    <Eyebrow>{PRICING.eyebrow}</Eyebrow>
                    <div className="mt-4" id="eh-pricing-title">
                        <Heading
                            lines={["Start free. Upgrade", "when the work gets real."]}
                            accent="when the work gets real."
                            size="lg"
                        />
                    </div>
                    <Body className="mt-6">{PRICING.body}</Body>
                </header>

                <Reveal className="eh-plans" stagger={0.09}>
                    {plans.map((plan) => (
                        <article
                            key={plan.id}
                            className="eh-reveal eh-plan"
                            data-recommended={plan.recommended ? "true" : "false"}
                            aria-labelledby={`eh-plan-${plan.id}`}
                        >
                            {plan.recommended ? (
                                <span className="eh-plan-flag">Most chosen</span>
                            ) : null}

                            <h3 className="eh-plan-name" id={`eh-plan-${plan.id}`}>
                                {plan.name}
                            </h3>

                            <p className="eh-plan-price">
                                <span className="eh-plan-amount">{formatUsd(plan.priceUsd)}</span>
                                {plan.priceUsd > 0 ? (
                                    <span className="eh-plan-period">
                                        {CURRENCY.list} / month
                                    </span>
                                ) : (
                                    <span className="eh-plan-period">forever</span>
                                )}
                            </p>

                            <p className="eh-plan-audience">{plan.audience}</p>

                            <p className="eh-plan-tokens">
                                <b>{plan.tokens}</b> tokens
                                {plan.priceUsd > 0 ? " each month" : " to start"}
                            </p>

                            <ul className="eh-plan-features">
                                {plan.features.map((f) => (
                                    <li key={f}>
                                        <Check size={14} />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>

                            {plan.upgradeFrom ? (
                                <p className="eh-plan-upgrade">
                                    Steps up from the {plan.upgradeFrom}
                                </p>
                            ) : null}

                            <Cta
                                href={plan.priceUsd === 0 ? ROUTES.signUp : ROUTES.subscription}
                                variant={plan.recommended ? "primary" : "secondary"}
                                event="pricing_plan_selected"
                                eventLabel={plan.id}
                                eventValue={plan.priceUsd}
                                scene="pricing"
                                className="eh-plan-cta"
                            >
                                {plan.priceUsd === 0 ? "Start free" : `Choose ${plan.name}`}
                            </Cta>
                        </article>
                    ))}
                </Reveal>

                {/* --------------------------------------- what tokens buy */}
                <Reveal className="eh-tokens">
                    <div className="eh-reveal">
                        <Board>What one token buys</Board>
                        <ul className="eh-tokenspend">
                            {TOKEN_SPEND.map((t) => (
                                <li key={t.label}>
                                    <span>{t.label}</span>
                                    <b>
                                        {t.cost} token{t.cost === 1 ? "" : "s"}
                                    </b>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="eh-reveal eh-topup">
                        <Board>Need more mid-month?</Board>
                        <p>
                            The <b>{topUp.name}</b> adds {topUp.tokens} tokens for{" "}
                            {formatUsd(topUp.priceUsd)} as a one-off purchase — no
                            subscription change.
                        </p>
                    </div>
                </Reveal>

                <div className="eh-pricing-foot">
                    <Cta
                        href={ROUTES.pricing}
                        variant="primary"
                        event="pricing_plan_selected"
                        eventLabel="compare_all_plans"
                        scene="pricing"
                        magnetic
                        trailing={<ArrowRight />}
                        // Analytics only; the click itself is a plain navigation.
                        className="eh-pricing-cta"
                    >
                        {PRICING.cta}
                    </Cta>

                    <div className="eh-pricing-terms">
                        <Caveat>{CURRENCY.note}</Caveat>
                        <Caveat>{CURRENCY.terms}</Caveat>
                    </div>
                </div>
            </Shell>
        </section>
    )
}
