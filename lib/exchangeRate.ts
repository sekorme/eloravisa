import "server-only";

/**
 * Server-side USD→GHS rate for pricing Paystack charges.
 *
 * Cached in module scope (Fluid Compute reuses instances, so in practice this
 * refreshes a handful of times a day per region) — the free exchangerate-api
 * tier allows ~1,500 requests/month, which per-checkout calls would blow
 * through but a 12h cache never will. On upstream failure we serve the stale
 * cached rate; with no cache at all we throw rather than charge a wrong
 * amount — the old client-side fallback silently charged the USD number as
 * GHS (~12x undercharge).
 */

const TTL_MS = 12 * 60 * 60 * 1000;
let cached: { rate: number; fetchedAt: number } | null = null;

export async function getUsdToGhsRate(): Promise<number> {
  if (cached && Date.now() - cached.fetchedAt < TTL_MS) {
    return cached.rate;
  }

  const key = process.env.EXCHANGE_RATE_API_KEY;
  if (!key) {
    if (cached) return cached.rate;
    throw new Error("EXCHANGE_RATE_API_KEY is not configured");
  }

  try {
    const res = await fetch(`https://v6.exchangerate-api.com/v6/${key}/latest/USD`);
    const body = await res.json();
    const rate = body?.conversion_rates?.GHS;
    if (body?.result !== "success" || typeof rate !== "number" || rate <= 0) {
      throw new Error(`Unexpected exchange-rate response: ${body?.result ?? res.status}`);
    }
    cached = { rate, fetchedAt: Date.now() };
    return rate;
  } catch (err) {
    if (cached) {
      console.error("[exchangeRate] refresh failed, serving stale rate:", err);
      return cached.rate;
    }
    throw err;
  }
}
