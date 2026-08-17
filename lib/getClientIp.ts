import { headers } from "next/headers";

// Best-effort caller IP for rate limiting Server Actions, which (unlike API
// routes) don't currently verify a Firebase ID token, so there's no uid to
// key a limiter on.
export async function getClientIp(): Promise<string> {
    const h = await headers();
    const forwardedFor = h.get("x-forwarded-for");
    return forwardedFor?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}
