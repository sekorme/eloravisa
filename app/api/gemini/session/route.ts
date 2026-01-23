import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST() {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: "Missing GEMINI_API_KEY" },
            { status: 500 }
        );
    }

    // const ai = new GoogleGenAI({ apiKey });

    // Create ephemeral Live session (safe for client)
    // Note: createSession is not currently available in the SDK types or has changed.
    // For now, we are using direct API key connection in the client hook (use-visa-voice-assistant).
    /*
    const session = await ai.live.createSession({
        model: "gemini-2.5-flash-native-audio-preview-12-2025",
    });
    */

    return NextResponse.json({ message: "Session creation not implemented" });
}
