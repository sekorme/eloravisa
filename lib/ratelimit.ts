import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const isRateLimitConfigured = Boolean(url && token);

if (!isRateLimitConfigured) {
    console.warn(
        "[ratelimit] UPSTASH_REDIS_REST_URL/TOKEN are not set — AI endpoints are running " +
        "without rate limiting. Set both env vars (see upstash.com) to enable it.",
    );
}

const redis = isRateLimitConfigured ? new Redis({ url: url!, token: token! }) : null;

// Generous enough for real usage, tight enough to stop a script from looping
// an AI endpoint or hammering the Live session mint route. Keyed per-user
// (Firebase uid) rather than per-IP, since every AI-touching route here
// already requires auth.
const LIMITERS = {
    aiGeneration: redis
        ? new Ratelimit({
              redis,
              limiter: Ratelimit.slidingWindow(20, "10 m"),
              prefix: "ratelimit:ai-generation",
          })
        : null,
    geminiSession: redis
        ? new Ratelimit({
              redis,
              limiter: Ratelimit.slidingWindow(10, "10 m"),
              prefix: "ratelimit:gemini-session",
          })
        : null,
} as const;

export type RateLimitBucket = keyof typeof LIMITERS;

interface RateLimitResult {
    success: boolean;
    limit?: number;
    remaining?: number;
    reset?: number;
}

// Fails open (allows the request) when Upstash isn't configured, so local
// dev and any deploy that hasn't set the env vars yet still work — this is
// a safety net on top of, not a replacement for, the per-feature token
// costs and plan checks already enforced server-side.
export async function checkRateLimit(bucket: RateLimitBucket, identifier: string): Promise<RateLimitResult> {
    const limiter = LIMITERS[bucket];
    if (!limiter) return { success: true };

    try {
        return await limiter.limit(identifier);
    } catch (err) {
        // A Redis hiccup shouldn't take an AI feature down entirely — log
        // and fail open, same as the "not configured" case above.
        console.error(`[ratelimit] Upstash call failed for bucket "${bucket}", failing open:`, err);
        return { success: true };
    }
}
