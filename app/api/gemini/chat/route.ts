import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";
import { auth, db } from "@/firebase/admin";
import { checkRateLimit } from "@/lib/ratelimit";

const SYSTEM_INSTRUCTION =
    "You are Elora, a professional, warm, and helpful AI assistant for Elora Visa. " +
    "You help users with visa applications, requirements, and status checks. " +
    "Keep responses concise and easy to read. Use formatting like bullet points where appropriate. " +
    "Avoid special formatting symbols such as asterisks or decorative characters.";

// Text-mode chat for the "Ask Elora" widget. Runs entirely server-side so the
// real Gemini API key never reaches the browser, and re-checks the Pro/Full
// plan gate (the client-side gate in HomePageContent is UX only).
export async function POST(req: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return Response.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 });
    }

    const authHeader = req.headers.get("authorization") || "";
    const match = authHeader.match(/^Bearer (.+)$/);
    if (!match) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    let uid: string;
    try {
        const decoded = await auth.verifyIdToken(match[1]);
        uid = decoded.uid;
    } catch {
        return Response.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const rateLimit = await checkRateLimit("aiGeneration", uid);
    if (!rateLimit.success) {
        return Response.json({ error: "Too many messages. Please slow down." }, { status: 429 });
    }

    const userSnap = await db.collection("users").doc(uid).get();
    const planId = userSnap.data()?.planId;
    if (planId !== "pro" && planId !== "full") {
        return Response.json({ error: "Upgrade to Pro to use the AI Assistant" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const message = body?.message as string | undefined;
    const history = Array.isArray(body?.history) ? body.history : [];

    if (!message || typeof message !== "string") {
        return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: { systemInstruction: SYSTEM_INSTRUCTION },
        history: history
            .filter((m: any) => (m?.role === "user" || m?.role === "model") && typeof m?.text === "string")
            .map((m: any) => ({ role: m.role, parts: [{ text: m.text }] })),
    });

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try {
                const result = await chat.sendMessageStream({ message });
                for await (const chunk of result) {
                    if (chunk.text) controller.enqueue(encoder.encode(chunk.text));
                }
            } catch (err) {
                console.error("Gemini chat stream error:", err);
                controller.enqueue(encoder.encode("\n[Sorry, I encountered an error. Please try again.]"));
            } finally {
                controller.close();
            }
        },
    });

    return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
