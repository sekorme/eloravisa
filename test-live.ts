import { GoogleGenAI, Modality, LiveServerMessage } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
        headers: {
            'User-Agent': 'aistudio-build',
        },
    },
});

async function run() {
    const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        callbacks: {
            onmessage: (message: LiveServerMessage) => {
                console.log("SERVER MESSAGE:", JSON.stringify(message, null, 2));
            },
            onerror: (err) => console.error(err),
            onclose: () => console.log("CLOSED")
        },
        config: {
            responseModalities: [Modality.AUDIO],
            outputAudioTranscription: {},
            inputAudioTranscription: {},
        }
    });

    console.log("Connected");
    // wait 5 seconds and exit
    setTimeout(() => {
        session.close();
        process.exit(0);
    }, 5000);
}

run().catch(console.error);
