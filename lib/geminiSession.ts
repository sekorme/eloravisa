import { auth } from "@/firebase/client";

export type GeminiSessionPurpose = "consular_interview" | "interview_dash" | "assistant_voice";

// Exchanges the current user's Firebase ID token for a short-lived Gemini
// Live API ephemeral token, minted server-side so the real API key never
// reaches the browser. See app/api/gemini/session/route.ts.
export async function mintGeminiSessionToken(purpose: GeminiSessionPurpose): Promise<string> {
    return (await mintGeminiSession(purpose)).token;
}

// Same as mintGeminiSessionToken, plus the server-built system instruction
// for purposes that have one (assistant_voice: Elora with the user's profile).
export async function mintGeminiSession(
    purpose: GeminiSessionPurpose,
): Promise<{ token: string; systemInstruction?: string }> {
    if (!auth.currentUser) {
        throw new Error("You must be logged in to start a session.");
    }

    const idToken = await auth.currentUser.getIdToken();
    const res = await fetch("/api/gemini/session", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
        body: JSON.stringify({ purpose }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.token) {
        throw new Error(data.error || "Failed to start session");
    }

    return {
        token: data.token as string,
        systemInstruction: typeof data.systemInstruction === "string" ? data.systemInstruction : undefined,
    };
}
