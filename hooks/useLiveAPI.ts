"use client";

import {useState, useRef, useCallback, useEffect} from "react";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { Country } from "@/components/countries";
import {onAuthStateChanged, User} from "firebase/auth";
import {auth} from "@/firebase/client";
import {getCurrentUserDetails} from "@/action/user";
import {mintGeminiSessionToken} from "@/lib/geminiSession";

export interface TranscriptItem {
    id: string;
    role: 'user' | 'ai';
    text: string;
    isFinal: boolean;
    timestamp: number;
    expiresAt?: number;
}


export function useLiveAPI() {
    const [status, setStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected");
    const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [userData, setUserData] = useState<any | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [destination, setDestination] = useState<string>("");
    const [visaType, setVisaType] = useState<string>("");
    const [documents, setDocuments] = useState<any[]>([]);

    const audioCtxRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const streamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const videoIntervalRef = useRef<number | null>(null);
    const sessionRef = useRef<any>(null);
    const audioSourcesRef = useRef<AudioBufferSourceNode[]>([]);
    const transcriptTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // Set right before we close the session ourselves, so onclose can tell a
    // normal hangup (empty/synthetic close event, nothing to report) apart
    // from the server or network dropping the connection unexpectedly.
    const intentionalCloseRef = useRef(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            console.log("Auth state changed:", user?.uid);
            setCurrentUser(user);
            if (user) {
                const fetchUser = async () => {
                    const data = await getCurrentUserDetails()
                    if (data) {
                        setUserData(data)
                        setDestination(data.onboarding?.destination || "")
                        setVisaType(data.onboarding?.visaType || "")
                        
                        // Map documents object to array if needed
                        if (data.documents) {
                            const docsArray = Object.entries(data.documents).map(([key, value]) => ({
                                name: key,
                                ...(value as object)
                            }));
                            setDocuments(docsArray);
                        }
                    }
                }
                fetchUser()
            }
        });
        return () => unsubscribe();
    }, [])
    
    
    const connect = useCallback(async (videoElement: HTMLVideoElement, selectedCountry: Country) => {
        setStatus("connecting");
        setTranscripts([]);
        setError(null);
        try {
            if (!auth.currentUser) {
                throw new Error("You must be logged in to start a session.");
            }

            if (!selectedCountry.requiresInterview) {
                throw new Error(`The destination country ${selectedCountry.name} does not require an interview for your visa category.`);
            }

            // Mints a short-lived token server-side (which also deducts the
            // interview cost atomically) so the real Gemini API key never
            // reaches the browser.
            const ephemeralToken = await mintGeminiSessionToken("consular_interview");
            const genAI = new GoogleGenAI({ apiKey: ephemeralToken, httpOptions: { apiVersion: "v1alpha" } });

            // 1. Setup Audio Context
            audioCtxRef.current = new AudioContext({ sampleRate: 24000 });
            nextStartTimeRef.current = 0;

            // 2. Setup Media Devices (Audio & Video)
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                const isNotSecure = !window.isSecureContext;
                const advice = isNotSecure
                    ? "This is likely because the page is being served over an insecure connection (HTTP). Most browsers require HTTPS for camera and microphone access.\n\nFOR DEVELOPERS: You can bypass this in Chrome/Edge by visiting: chrome://flags/#unsafely-treat-insecure-origin-as-secure and adding your IP/origin."
                    : "Please check your browser permissions and ensure you have a microphone/camera connected.";
                throw new Error(`Media devices access is not available. ${advice}`);
            }

            let stream: MediaStream;
            try {
                // Try to get both audio and video
                stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            } catch (mediaErr: any) {
                console.warn("Failed to get both audio and video, trying audio only:", mediaErr);
                try {
                    // Fallback to audio only if video fails (e.g. no camera)
                    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                } catch (audioErr: any) {
                    throw new Error("Could not access microphone or camera. Please ensure permissions are granted.");
                }
            }
            streamRef.current = stream;

            // Bind video to video element (only if we have video tracks)
            if (stream.getVideoTracks().length > 0) {
                videoElement.srcObject = stream;
                videoElement.play();
            } else {
                console.log("No video track found, running in audio-only mode.");
            }

            let aiMessageId = Math.random().toString(36).substring(7);
            let userMessageId = Math.random().toString(36).substring(7);
            let currentAiText = "";
            let currentUserText = "";
            const agentmodels = ["Zephyr", "Charan", "Callirrhoe","Leda","Sadaltager"];
            const randomIndexModel = Math.floor(Math.random() * agentmodels.length);
            const selectedAgent = agentmodels[randomIndexModel];
            // 3. Connect to Gemini Live
            const session = await genAI.live.connect({
                model: "gemini-3.1-flash-live-preview",
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedAgent } },
                    },
                    systemInstruction: {
                        parts: [{
                            text: `You are a ${selectedCountry.consulateName} Non-Immigrant Visa Officer conducting a realistic visa interview simulation for travel to ${selectedCountry.name}.

USER CONTEXT:
* Destination: ${destination || selectedCountry.name}
* Visa Type: ${visaType || 'Non-Immigrant'}
* Documents provided: ${documents.length > 0 ? documents.map(d => `${d.name} (${d.status || 'uploaded'})`).join(", ") : "None specified"}

Your role is to behave like an actual consular officer during a B1/B2, F1, J1, or other non-immigrant visa interview for ${selectedCountry.name}.

DOCUMENT SCANNING & VERIFICATION:
* You MUST "scan" through the applicant's provided documents during the interview.
* Reference specific documents from the "Documents provided" list above in your questions.
* If a critical document is missing or if the documents seem inconsistent with the travel purpose, ask about it.
* Treat the documents as real digital files on your screen that you are reviewing in real-time.

INTERVIEW STYLE:
* Speak naturally, professionally, and confidently.
* Keep responses concise and direct.
* Ask only ONE interview question at a time.
* Maintain a brisk, realistic embassy interview pace.
* Do not over-explain or coach the applicant.
* Occasionally interrupt or ask follow-up questions when answers are unclear, inconsistent, suspicious, rehearsed, or incomplete.
* Use natural embassy-style questioning patterns.

VIDEO & BEHAVIOR ANALYSIS:
You will receive live video frames or facial input from the applicant during the interview.

Continuously analyze:
* Facial expressions
* Eye contact
* Nervousness
* Confidence level
* Hesitation
* Emotional consistency
* Stress indicators
* Overconfidence
* Suspicious or evasive behavior

Incorporate short, natural observations into your responses when relevant.

Examples:
* "You seem a little nervous. What university admitted you?"
* "You paused there. Who is funding your trip?"
* "You look confident. What do you plan to do after graduation?"
* "Your answer sounded rehearsed. Can you explain that again?"

INTERVIEW EVALUATION:
After each applicant response:
1. Analyze the quality, consistency, credibility, and intent of the answer.
2. Evaluate whether the applicant demonstrates strong non-immigrant intent.
3. Assess financial credibility, travel purpose, ties to home country, and likelihood of returning.
4. Detect possible fraud indicators, memorized responses, contradictions, or weak documentation logic.
5. Internally maintain a dynamic approval probability score throughout the interview.

DECISION LOGIC:
At the end of the interview:
* Decide whether to APPROVE or REJECT the visa.
* Provide a realistic embassy-style final decision for ${selectedCountry.name}.
* If rejected, briefly state the likely reason (e.g. weak ties, unclear purpose, insufficient funding, inconsistent answers, immigrant intent concerns).
* If approved, remain professional and concise.

OUTPUT STYLE:
* Stay fully in character as a ${selectedCountry.consulateName} officer.
* Never reveal hidden scoring systems or internal reasoning unless explicitly requested in "feedback mode."
* Keep the interaction immersive and realistic.
* Avoid long explanations.
* Keep questions embassy-authentic and pressure-balanced.

OPTIONAL FEEDBACK MODE:
If feedback mode is enabled after the interview:
* Provide detailed analysis of:
  * Confidence level
  * Credibility
  * Answer quality
  * Red flags
  * Strong points
  * Approval chances
  * Suggested improvements
  * Behavioral observations
`
                        }]
                    },
                    outputAudioTranscription: {},
                    inputAudioTranscription: {},
                },
                callbacks: {
                    onmessage: (message: LiveServerMessage) => {
                        if (message.serverContent?.modelTurn?.parts) {
                            const parts = message.serverContent.modelTurn.parts;
                            const audioPart = parts.find(p => p.inlineData?.mimeType?.startsWith('audio'));
                            if (audioPart?.inlineData?.data && audioCtxRef.current) {
                                playAudioChunk(audioCtxRef.current, audioPart.inlineData.data, nextStartTimeRef, audioSourcesRef);
                            }
                        }
                        if (message.serverContent?.interrupted) {
                            stopAllAudio();
                            nextStartTimeRef.current = audioCtxRef.current ? audioCtxRef.current.currentTime : 0;
                            // Mark current AI message as interrupted
                            setTranscripts(prev => {
                                const existingId = prev.findIndex(t => t.id === aiMessageId);
                                if (existingId >= 0) {
                                    const next = [...prev];
                                    const item = next[existingId];
                                    // Only add [interrupted] if it's not already there and there's text
                                    const text = item.text.endsWith("[interrupted]") ? item.text : (item.text ? item.text + " [interrupted]" : "...");
                                    next[existingId] = {
                                        ...item,
                                        text,
                                        isFinal: true,
                                        expiresAt: Date.now() + 5000
                                    };
                                    return next;
                                }
                                return prev;
                            });
                            aiMessageId = Math.random().toString(36).substring(7);
                            currentAiText = "";
                        }
                        if (message.serverContent?.turnComplete) {
                            setTranscripts(prev => {
                                const existingId = prev.findIndex(t => t.id === aiMessageId);
                                if (existingId >= 0) {
                                    const next = [...prev];
                                    next[existingId] = {
                                        ...next[existingId],
                                        isFinal: true,
                                        expiresAt: Date.now() + 5000
                                    };
                                    return next;
                                }
                                return prev;
                            });
                            aiMessageId = Math.random().toString(36).substring(7);
                            currentAiText = "";
                        }
                        if (message.serverContent?.inputTranscription) {
                            const tx = message.serverContent.inputTranscription;
                            if (tx.text) {
                                currentUserText = (currentUserText + " " + tx.text).trim();
                                setTranscripts(prev => {
                                    const existingId = prev.findIndex(t => t.id === userMessageId);
                                    if (existingId >= 0) {
                                        const next = [...prev];
                                        // Use accumulated text
                                        next[existingId] = {
                                            ...next[existingId],
                                            text: currentUserText,
                                            isFinal: !!tx.finished,
                                            expiresAt: tx.finished ? Date.now() + 5000 : undefined
                                        };
                                        return next;
                                    } else {
                                        return [...prev, {
                                            id: userMessageId,
                                            role: 'user',
                                            text: currentUserText,
                                            isFinal: !!tx.finished,
                                            timestamp: Date.now(),
                                            expiresAt: tx.finished ? Date.now() + 5000 : undefined
                                        }];
                                    }
                                });
                                if (tx.finished) {
                                    userMessageId = Math.random().toString(36).substring(7);
                                    currentUserText = "";
                                }
                            }
                        }
                        if (message.serverContent?.outputTranscription) {
                            const tx = message.serverContent.outputTranscription;
                            if (tx.text) {
                                // For output transcription, it might be incremental or partial.
                                // We accumulate it to get the full transcript for this turn.
                                currentAiText = (currentAiText + " " + tx.text).trim();
                                setTranscripts(prev => {
                                    const existingId = prev.findIndex(t => t.id === aiMessageId);
                                    if (existingId >= 0) {
                                        const next = [...prev];
                                        next[existingId] = {
                                            ...next[existingId],
                                            text: currentAiText,
                                            isFinal: !!tx.finished,
                                            expiresAt: tx.finished ? Date.now() + 5000 : undefined
                                        };
                                        return next;
                                    } else {
                                        return [...prev, {
                                            id: aiMessageId,
                                            role: 'ai',
                                            text: currentAiText,
                                            isFinal: !!tx.finished,
                                            timestamp: Date.now(),
                                            expiresAt: tx.finished ? Date.now() + 5000 : undefined
                                        }];
                                    }
                                });
                                if (tx.finished) {
                                    // We don't necessarily reset aiMessageId here because turnComplete will do it,
                                    // but if it's finished and turnComplete didn't fire yet, it's safer.
                                    // Actually, if we reset it here, then turnComplete might find nothing.
                                    // Let's keep it consistent with turnComplete.
                                }
                            }
                        }
                    },
                    onerror: (error) => {
                        console.error("Gemini Live Error:", error?.message || error);
                    },
                    onclose: (e) => {
                        const wasIntentional = intentionalCloseRef.current;
                        intentionalCloseRef.current = false;

                        // A close we triggered ourselves (hanging up) doesn't
                        // come with a real CloseEvent — nothing to report.
                        if (!wasIntentional) {
                            console.error("Gemini Live socket closed:", { code: e?.code, reason: e?.reason, wasClean: e?.wasClean });
                            if (!e || e.code !== 1000) {
                                setError(e?.reason || `Connection closed unexpectedly${e?.code ? ` (code ${e.code})` : ""}.`);
                            }
                        }
                        disconnect();
                    }
                }
            });

            sessionRef.current = session;
            setStatus("connected");

            // Audio setup
            const source = audioCtxRef.current.createMediaStreamSource(stream);
            const processor = audioCtxRef.current.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;
            source.connect(processor);
            processor.connect(audioCtxRef.current.destination);

            processor.onaudioprocess = (e) => {
                // sessionRef.current is cleared by disconnect() as soon as the
                // socket closes; the interval/processor callbacks can still be
                // mid-flight after that, so check the ref (not the closed-over
                // `session`) to avoid sending on an already-closed socket.
                if (sessionRef.current !== session) return;
                const inputData = e.inputBuffer.getChannelData(0);
                const base64 = pcmToBase64(inputData);
                try {
                    session.sendRealtimeInput({
                        audio: { data: base64, mimeType: "audio/pcm;rate=16000" },
                    });
                } catch (sendErr) {
                    console.warn("Failed to send audio chunk:", sendErr);
                }
            };

            // Video sending loop (2 times a second)
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            videoIntervalRef.current = window.setInterval(() => {
                if (sessionRef.current !== session) return;
                if (videoElement.readyState >= 2 && ctx) {
                    canvas.width = videoElement.videoWidth;
                    canvas.height = videoElement.videoHeight;
                    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
                    const dataUrl = canvas.toDataURL("image/jpeg", 0.5);
                    const base64 = dataUrl.split(",")[1];
                    try {
                        session.sendRealtimeInput({
                            video: { data: base64, mimeType: "image/jpeg" }
                        });
                    } catch (sendErr) {
                        console.warn("Failed to send video frame:", sendErr);
                    }
                }
            }, 500);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "An unknown error occurred");
            disconnect();
        }
    }, []);

    const stopAllAudio = useCallback(() => {
        audioSourcesRef.current.forEach(source => {
            try {
                source.stop();
                source.disconnect();
            } catch (e) {
                // Ignore if already stopped
            }
        });
        audioSourcesRef.current = [];
    }, []);

    const disconnect = useCallback(() => {
        setStatus("disconnected");
        stopAllAudio();
        if (sessionRef.current) {
            intentionalCloseRef.current = true;
            sessionRef.current.close();
            sessionRef.current = null;
        }
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (audioCtxRef.current) {
            audioCtxRef.current.close().catch(() => {});
            audioCtxRef.current = null;
        }
        if (videoIntervalRef.current) {
            window.clearInterval(videoIntervalRef.current);
            videoIntervalRef.current = null;
        }
    }, []);

    return {
        status,
        transcripts,
        error,
        connect,
        disconnect,
        setTranscripts,
        setError,
        userData,
        currentUser,
        destination,
        visaType,
        documents
    };
}

// Helpers
function pcmToBase64(pcmData: Float32Array): string {
    const buffer = new ArrayBuffer(pcmData.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < pcmData.length; i++) {
        let s = Math.max(-1, Math.min(1, pcmData[i]));
        s = s < 0 ? s * 0x8000 : s * 0x7FFF;
        view.setInt16(i * 2, s, true);
    }
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function playAudioChunk(
    audioCtx: AudioContext,
    base64Audio: string,
    nextStartTimeRef: React.MutableRefObject<number>,
    audioSourcesRef: React.MutableRefObject<AudioBufferSourceNode[]>
) {
    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
    }

    const audioBuffer = audioCtx.createBuffer(1, float32Array.length, 24000);
    audioBuffer.getChannelData(0).set(float32Array);

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);

    // Track the source so we can stop it if interrupted
    audioSourcesRef.current.push(source);
    source.onended = () => {
        audioSourcesRef.current = audioSourcesRef.current.filter(s => s !== source);
    };

    const currentTime = audioCtx.currentTime;
    if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime + 0.05;
    }

    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += audioBuffer.duration;
}
