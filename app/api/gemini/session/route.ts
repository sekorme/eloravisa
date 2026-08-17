import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/firebase/admin";
import { TOKEN_COSTS } from "@/lib/subscriptions";
import { checkRateLimit } from "@/lib/ratelimit";
import { deductTokensAdmin, refundTokensAdmin } from "@/lib/tokensAdmin";

// Every purpose the client can request maps to a fixed model + policy here.
// The client only ever sends `purpose` — never a model or a charge flag —
// so none of the security-relevant decisions (what gets charged, what plan
// is required) can be influenced by the caller.
const PURPOSES = {
    consular_interview: {
        model: "gemini-3.1-flash-live-preview",
        chargeUpfront: TOKEN_COSTS.MOCK_INTERVIEW,
        requiredPlan: null as string[] | null,
    },
    interview_dash: {
        // This flow deducts tokens itself when the session ends, so the
        // mint step just needs to confirm the caller is logged in.
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        chargeUpfront: 0,
        requiredPlan: null as string[] | null,
    },
    assistant_voice: {
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
        chargeUpfront: 0,
        requiredPlan: ["pro", "full"] as string[] | null,
    },
} as const;

type Purpose = keyof typeof PURPOSES;

export async function POST(req: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const authHeader = req.headers.get("authorization") || "";
    const match = authHeader.match(/^Bearer (.+)$/);
    if (!match) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let uid: string;
    try {
        const decoded = await auth.verifyIdToken(match[1]);
        uid = decoded.uid;
    } catch {
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const rateLimit = await checkRateLimit("geminiSession", uid);
    if (!rateLimit.success) {
        return NextResponse.json({ error: "Too many session requests. Please slow down." }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const purpose = body?.purpose as Purpose | undefined;
    const policy = purpose ? PURPOSES[purpose] : undefined;
    if (!policy) {
        return NextResponse.json({ error: "Invalid purpose" }, { status: 400 });
    }

    if (policy.requiredPlan) {
        const userSnap = await db.collection("users").doc(uid).get();
        const planId = userSnap.data()?.planId;
        if (!planId || !policy.requiredPlan.includes(planId)) {
            return NextResponse.json(
                { error: "Upgrade to Pro to use the AI Assistant" },
                { status: 403 },
            );
        }
    }

    if (policy.chargeUpfront > 0) {
        try {
            await deductTokensAdmin(uid, policy.chargeUpfront);
        } catch (err: any) {
            return NextResponse.json(
                { error: err?.message || "Unable to deduct tokens" },
                { status: 402 },
            );
        }
    }

    try {
        const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: "v1alpha" } });
        const authToken = await ai.authTokens.create({
            config: {
                uses: 1,
                expireTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
                newSessionExpireTime: new Date(Date.now() + 2 * 60 * 1000).toISOString(),
                // Deliberately NOT setting liveConnectConstraints here: locking
                // the token to a model breaks gemini-3.1-flash-live-preview
                // specifically — confirmed by direct testing, the same token
                // config connects fine unlocked but closes with 1011 "Internal
                // error encountered" as soon as a model constraint is added.
                // Google's docs say model-locking should work, so this looks
                // like a bug in this preview model's handling of it rather
                // than a documented limitation — worth revisiting later.
                // The token is still single-use, ~2min-to-connect, tied to an
                // authenticated + rate-limited + already-charged request, so
                // an unlocked token's residual risk (connecting to a different
                // Live model within that one use) is minor.
            },
        });

        if (!authToken.name) throw new Error("No token returned");

        return NextResponse.json({ token: authToken.name });
    } catch (err) {
        if (policy.chargeUpfront > 0) {
            await refundTokensAdmin(uid, policy.chargeUpfront).catch(() => {});
        }
        console.error("Ephemeral Gemini token mint error:", err);
        return NextResponse.json({ error: "Failed to start session" }, { status: 500 });
    }
}
