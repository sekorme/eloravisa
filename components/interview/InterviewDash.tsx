'use client'
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { TranscriptEntry, SessionStatus } from '@/types';
import { createBlob, decode, decodeAudioData } from '@/services/audioUtils';
import Visualizer from '@/components/Visualizer';
import Transcript from '@/components/Transcript';
import {getCurrentUserDetails} from "@/action/user";
import { generateInterviewFeedback } from "@/action/interview";
import {PhoneCall} from "lucide-react";
import { auth, db } from "@/firebase/client";
import { collection, addDoc } from "firebase/firestore";
import { toast } from "sonner";
import { onAuthStateChanged, type User } from "firebase/auth";
import {useRouter} from "next/navigation";
import { deductTokens, TOKEN_COSTS } from "@/lib/subscriptions";

const InterviewDash =({apiKeys}: {apiKeys: string | null}) => {
    const [status, setStatus] = useState<SessionStatus>(SessionStatus.IDLE);
    const [entries, setEntries] = useState<TranscriptEntry[]>([]);
    const [currentInputText, setCurrentInputText] = useState('');
    const [currentOutputText, setCurrentOutputText] = useState('');
    const [error, setError] = useState<string | null>(null);
    type UserData = {
        fullName?: string;
        country?: string;
        onboarding?: { destination?: string; visaType?: string };
    } | null;

    const [userData, setUserData] = useState<UserData>(null);
    const [destination, setDestination] = useState("")
    const [visaType, setVisaType] = useState("")
    const [micStream, setMicStream] = useState<MediaStream | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const router = useRouter();
    // Audio References
    const nextStartTimeRef = useRef(0);
    const audioContextRef = useRef<AudioContext | null>(null);
    const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    type LiveSession = {
        close?: () => void;
        sendRealtimeInput?: (arg: unknown) => void;
    } | null;

    const sessionRef = useRef<LiveSession>(null);

    // Refs for state access in callbacks
    const entriesRef = useRef<TranscriptEntry[]>([]);
    const currentInputRef = useRef('');
    const currentOutputRef = useRef('');

    useEffect(() => {
        entriesRef.current = entries;
    }, [entries]);

    useEffect(() => {
        currentInputRef.current = currentInputText;
    }, [currentInputText]);

    useEffect(() => {
        currentOutputRef.current = currentOutputText;
    }, [currentOutputText]);

    useEffect(() => {
        let wakeLock :any;
        const requestWakeLock = async() =>{
            try{
                wakeLock = await navigator.wakeLock.request("screen");
            }catch(err){
                console.error("Wake Lock Error:", err);
            }
        };
        requestWakeLock();

        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                requestWakeLock();
            }
        });
        return () => {

            wakeLock?.release();
        }
    }, [])

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
                    }
                }
                fetchUser()
            }
        });
        return () => unsubscribe();
    }, [])

    const saveSession = async (transcript: TranscriptEntry[], pendingInput: string, pendingOutput: string) => {
        console.log("saveSession called with:", { 
            user: currentUser?.uid, 
            transcriptLength: transcript.length,
            pendingInput,
            pendingOutput
        });
        
        if (!currentUser) {
            console.error("No user logged in during save");
            toast.error("Please sign in to save your session.");
            return;
        }

        // Combine confirmed entries with any pending text
        const finalTranscript = [...transcript];
        if (pendingInput) {
            finalTranscript.push({
                id: 'pending-user',
                role: 'user',
                text: pendingInput,
                timestamp: Date.now()
            });
        }
        if (pendingOutput) {
            finalTranscript.push({
                id: 'pending-model',
                role: 'model',
                text: pendingOutput,
                timestamp: Date.now()
            });
        }
        
        if (finalTranscript.length === 0) {
            console.warn("Empty transcript, skipping save.");
            toast.warning("No conversation to save.");
            return;
        }

        const toastId = toast.loading("Saving interview session...");

        try {
            // Generate AI Feedback
            console.log("Generating feedback...");
            const feedbackResponse = await generateInterviewFeedback(finalTranscript);
            const feedback = feedbackResponse.success ? feedbackResponse.data : null;
            console.log("Feedback generated:", feedback);

            await addDoc(collection(db, "users", currentUser.uid, "interview_sessions"), {
                date: new Date().toISOString(),
                transcript: finalTranscript,
                destination: destination,
                visaType: visaType,
                feedback: feedback,
                status: "completed"
            });
            
            console.log("Session saved to Firestore");
            toast.success("Interview session and feedback saved!", { id: toastId });
            router.push("/dashboard/ai-mock-interview");
        } catch (error) {
            console.error("Error saving session:", error);
            toast.error("Failed to save interview session.", { id: toastId });
        }
    };

    const stopSession = useCallback(() => {
        console.log("stopSession called");
        if (sessionRef.current) {
            sessionRef.current.close?.();
            sessionRef.current = null;
        }

        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        if (micStream) {
            micStream.getTracks().forEach(track => track.stop());
            setMicStream(null);
        }

        activeSourcesRef.current.forEach(source => source.stop());
        activeSourcesRef.current.clear();

        setStatus(SessionStatus.IDLE);
        nextStartTimeRef.current = 0;
        setCurrentInputText('');
        setCurrentOutputText('');
    }, [micStream]);

    // Wrapper to handle saving
    const handleStop = async () => {
        console.log("handleStop called. Entries:", entriesRef.current);
        
        // Stop the session immediately to release resources
        stopSession();

        if (currentUser) {
            try {
                await deductTokens(currentUser.uid, TOKEN_COSTS.MOCK_INTERVIEW);
            } catch (error) {
                console.error("Failed to deduct tokens:", error);
                toast.error("Failed to deduct tokens. Please check your balance.");
            }
        }

        // Save session
        await saveSession(entriesRef.current, currentInputRef.current, currentOutputRef.current);
        
        setEntries([]); // Clear entries after saving
    };

    const startSession = async () => {
        if (typeof window === 'undefined' || !navigator.mediaDevices) {
            setError("Microphone access is not supported in this environment.");
            return;
        }

        try {
            // Clear previous entries on new start
            setEntries([]);
            
            setStatus(SessionStatus.CONNECTING);
            setError(null);


            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            setMicStream(stream);

            const ai = new GoogleGenAI({ apiKey: apiKeys! });

            // Use a single AudioContext with default sample rate to avoid mismatch errors
            const win = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
            const AudioCtxClass = win.AudioContext || win.webkitAudioContext || AudioContext;
            const audioContext = new AudioCtxClass();
            audioContextRef.current = audioContext;
            const agentmodels = ["Zephyr", "Charan", "Callirrhoe","Leda","Sadaltager"];
            const randomIndexModel = Math.floor(Math.random() * agentmodels.length);
            const selectedAgent = agentmodels[randomIndexModel];

            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedAgent } },
                    },
                    systemInstruction: `You are ${selectedAgent}, a professional Visa Interview Assistant that helps users prepare for visa applications and interviews.

                INTRODUCTION RULES:
                - Begin with a greeting and introduction.
            - Each session MUST use a different greeting and introduction style.
            - Greet the user warmly and professionally.
            - Welcome the user by their FIRST name only (from ${userData?.fullName || "User"}).

            USER CONTEXT:
                - Name: ${userData?.fullName || "User"}
            - Country of residence: ${userData?.country || "their country"}
            - Destination country: ${destination}
            - Visa type: ${visaType}

            BEHAVIOR RULES:
                1. First, determine whether the destination country (${destination}) typically requires a visa interview for the specified visa type (${visaType}), based on real-world visa processes.
            2. If an interview is NOT required:
                - Clearly inform the user that no interview is required.
            - Advise them on the documentation process.
            - Walk them through the correct application steps specific to their destination.
            - Do NOT ask interview questions.
            3. If an interview IS required:
                - Ask the user ONE question only:
                “How many interview questions would you like me to generate?”
4. If the user’s response is unclear or ambiguous (e.g., “I don’t know”, “anything”, or no number provided), ask ONE clarification question.
            5. Do NOT ask multiple questions at the same time, ask questions one at a time wait for user to finish answering the question before you move to the next question.
            6. Maintain a calm, professional, and supportive tone throughout.

                `,
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        setStatus(SessionStatus.ACTIVE);

                        // Microphone streaming logic
                        const source = audioContext.createMediaStreamSource(stream);
                        const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

                        scriptProcessor.onaudioprocess = (e) => {
                            const inputData = e.inputBuffer.getChannelData(0);

                            // Downsample to 16000Hz if necessary
                            const targetRate = 16000;
                            const currentRate = audioContext.sampleRate;
                            let finalData = inputData;

                            if (currentRate !== targetRate) {
                                const ratio = currentRate / targetRate;
                                const newLength = Math.floor(inputData.length / ratio);
                                finalData = new Float32Array(newLength);
                                for (let i = 0; i < newLength; i++) {
                                    finalData[i] = inputData[Math.floor(i * ratio)];
                                }
                            }

                            const pcmBlob = createBlob(finalData);

                            sessionPromise.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            }).catch(err => {
                                console.error("Failed to send audio input:", err);
                            });
                        };

                        source.connect(scriptProcessor);
                        scriptProcessor.connect(audioContext.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        // Handle Transcription - update both state and refs immediately so we don't lose pending text
                        if (message.serverContent?.inputTranscription) {
                            const text = message.serverContent!.inputTranscription!.text;
                            setCurrentInputText(prev => prev + text);
                            currentInputRef.current = (currentInputRef.current || '') + text;
                        }

                        if (message.serverContent?.outputTranscription) {
                            const text = message.serverContent!.outputTranscription!.text;
                            setCurrentOutputText(prev => prev + text);
                            currentOutputRef.current = (currentOutputRef.current || '') + text;
                        }

                        // When server indicates a turn is complete, read the accumulated text from refs
                        if (message.serverContent?.turnComplete) {
                            const userText = currentInputRef.current || '';
                            const modelText = currentOutputRef.current || '';

                            if (userText || modelText) {
                                setEntries(prev => [
                                    ...prev,
                                    ...(userText ? [{ id: Math.random().toString(), role: 'user' as const, text: userText, timestamp: Date.now() }] : []),
                                    ...(modelText ? [{ id: Math.random().toString(), role: 'model' as const, text: modelText, timestamp: Date.now() }] : [])
                                ]);
                            }

                            // Clear both state and refs for next turn
                            setCurrentInputText('');
                            setCurrentOutputText('');
                            currentInputRef.current = '';
                            currentOutputRef.current = '';
                        }

                        // @ts-expect-error - shape from Gemini runtime may not be known to TS
                        const base64Audio  = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio && audioContextRef.current) {
                            const ctx = audioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);

                            try {
                                // decodeAudioData handles resampling automatically
                                const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                                const source = ctx.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(ctx.destination);

                                source.addEventListener('ended', () => {
                                    activeSourcesRef.current.delete(source);
                                });

                                source.start(nextStartTimeRef.current);
                                nextStartTimeRef.current += audioBuffer.duration;
                                activeSourcesRef.current.add(source);
                            } catch (err) {
                                console.error("Audio decoding error:", err);
                            }
                        }

                        // Handle Interruption
                        if (message.serverContent?.interrupted) {
                            activeSourcesRef.current.forEach(source => source.stop());
                            activeSourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e: unknown) => {
                        console.error("Gemini Live Error:", e);
                        setError("Connection encountered an error. Please retry.");
                        stopSession();
                    },
                    onclose: () => {
                        console.log("Gemini Live Session Closed");
                        stopSession();
                    }
                }
            });

            sessionRef.current = (await sessionPromise) as unknown as LiveSession;
        } catch (err: unknown) {
            console.error("Failed to start session:", err);
            const msg = err instanceof Error ? err.message : String(err);
            setError(msg || "Could not access microphone or connect to Gemini.");
            setStatus(SessionStatus.ERROR);
        }
    };

    const toggleSession = () => {
        console.log("toggleSession called. Status:", status);
        if (status === SessionStatus.ACTIVE) {
            handleStop();
        } else {
            startSession();
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8">
            <div className="w-full max-w-2xl  backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl h-[85vh]">

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between ">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl  flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6  dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="font-outfit text-xl font-bold tracking-tight ">Visa Interview</h1>
                            <div className="flex items-center space-x-2">
                                <span className={`w-2 h-2 rounded-full ${status === SessionStatus.ACTIVE ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></span>
                                <span className="text-xs font-medium text-gray-400 uppercase tracking-widest">{status}</span>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setEntries([])}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                        title="Clear history"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>

                {/* Status Messages */}
                {error && (
                    <div className="m-4 p-3 bg-red-900/30 border border-red-500/50 rounded-xl text-red-200 text-sm flex items-center space-x-2">
                        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <p>{error}</p>
                    </div>
                )}

                {/* Transcript Area */}
                <Transcript
                    entries={entries}
                    currentInput={currentInputText}
                    currentOutput={currentOutputText}
                />

                {/* Visualizer and Controls Footer */}
                <div className="p-8 bg-gray-900/60 border-t border-white/5 space-y-6">
                    <Visualizer isActive={status === SessionStatus.ACTIVE} stream={micStream} />

                    <div className="flex flex-col items-center space-y-4">
                        <button
                            onClick={toggleSession}
                            disabled={status === SessionStatus.CONNECTING}
                            className={`relative group flex items-center justify-center p-6 rounded-full transition-all duration-500 ${
                                status === SessionStatus.ACTIVE
                                    ? ' hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                                    : 'bg-blue-600 hover:bg-blue-700 shadow-[0_0_30px_rgba(37,99,235,0.4)]'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {status === SessionStatus.CONNECTING ? (
                                <div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : status === SessionStatus.ACTIVE ? (
                                <div className="flex items-center justify-center w-20 h-20 border-4 border-red-500 border-t-red-500 rounded-full animate-pulse">

                                <PhoneCall className="w-8 h-8 text-red-500 animate-pulse"/>
                                </div>
                            ) : (
                                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                    <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                                </svg>
                            )}

                            {/* Outer ring effect */}
                            <div className={`absolute -inset-2 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${status === SessionStatus.ACTIVE ? 'animate-pulse' : ''}`}></div>
                        </button>
                        <p className="text-sm font-medium text-gray-400">
                            {status === SessionStatus.ACTIVE ? "Tap to disconnect" : "Tap to start conversation"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Background blobs for depth */}
            <div className="fixed top-0 left-0 -z-10 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full"></div>
            </div>
        </div>
    );
};

export default InterviewDash;
