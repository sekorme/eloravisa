import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createPcmBlob, decodeAudioData, base64ToBytes } from '../utils/audio';
import { mintGeminiSessionToken } from "@/lib/geminiSession";

interface UseLiveSessionProps {
    onTranscript?: (text: string, isUser: boolean) => void;

}

export const useLiveSession = ({ onTranscript }: UseLiveSessionProps ={}) => {
    const [isConnected, setIsConnected] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [volume, setVolume] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Audio Context and Processing Refs
    const audioContextRef = useRef<AudioContext | null>(null);
    const inputAudioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    // Session Refs
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const currentVolumeRef = useRef(0);

    // Initialize Audio Contexts
    const ensureAudioContexts = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        if (!inputAudioContextRef.current) {
            inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        }
    };

    const connect = async () => {
        setError(null);
        try {
            ensureAudioContexts();
            const ephemeralToken = await mintGeminiSessionToken("assistant_voice");
            const ai = new GoogleGenAI({ apiKey: ephemeralToken, httpOptions: { apiVersion: "v1alpha" } });

            // Request Microphone Access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const inputCtx = inputAudioContextRef.current!;

            // Setup Input Processing
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);

            sourceRef.current = source;
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);

                // Calculate volume for visualizer
                let sum = 0;
                for (let i = 0; i < inputData.length; i++) {
                    sum += inputData[i] * inputData[i];
                }
                const rms = Math.sqrt(sum / inputData.length);
                currentVolumeRef.current = rms;

                // Only send data if we are connected
                if (sessionPromiseRef.current) {
                    const pcmBlob = createPcmBlob(inputData);
                    sessionPromiseRef.current.then(session => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                }
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);

            // Start Session
            const sessionPromise = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-12-2025',
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
                    },
                    systemInstruction: "You are Elora, a professional, warm, and helpful AI assistant for Elora Visa. You help users with visa applications, requirements, and status checks. Keep responses concise and conversational.",
                    inputAudioTranscription: {},
                    outputAudioTranscription: {},
                },
                callbacks: {
                    onopen: () => {
                        console.log('Live session connected');
                        setIsConnected(true);
                    },
                    onmessage: async (msg: LiveServerMessage) => {
                        // Handle Audio Output
                        const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                        if (base64Audio && audioContextRef.current) {
                            const ctx = audioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);

                            const audioBuffer = await decodeAudioData(
                                base64ToBytes(base64Audio),
                                ctx,
                                24000,
                                1
                            );

                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(ctx.destination);

                            source.addEventListener('ended', () => {
                                activeSourcesRef.current.delete(source);
                                if (activeSourcesRef.current.size === 0) {
                                    setIsSpeaking(false);
                                }
                            });

                            source.start(nextStartTimeRef.current);
                            activeSourcesRef.current.add(source);
                            nextStartTimeRef.current += audioBuffer.duration;
                            setIsSpeaking(true);
                        }

                        // Handle Transcriptions
                        if (onTranscript) {
                            if (msg.serverContent?.outputTranscription?.text) {
                                onTranscript(msg.serverContent.outputTranscription.text, false);
                            }
                            if (msg.serverContent?.inputTranscription?.text) {
                                onTranscript(msg.serverContent.inputTranscription.text, true);
                            }
                        }

                        // Handle Interruption
                        if (msg.serverContent?.interrupted) {
                            activeSourcesRef.current.forEach(s => s.stop());
                            activeSourcesRef.current.clear();
                            nextStartTimeRef.current = 0;
                            setIsSpeaking(false);
                        }
                    },
                    onclose: () => {
                        console.log('Live session closed');
                        setIsConnected(false);
                        cleanup();
                    },
                    onerror: (err) => {
                        console.error('Live session error:', err);
                        setError("Connection error. Please try again.");
                        cleanup();
                    }
                }
            });

            sessionPromiseRef.current = sessionPromise;

        } catch (err: any) {
            console.error('Failed to connect:', err);
            setError(err.message || "Failed to access microphone or connect.");
            setIsConnected(false);
        }
    };

    const cleanup = useCallback(() => {
        if (processorRef.current && sourceRef.current) {
            sourceRef.current.disconnect();
            processorRef.current.disconnect();
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }

        activeSourcesRef.current.forEach(s => s.stop());
        activeSourcesRef.current.clear();

        // Close the session implicitly by dropping the promise reference and context
        // The library handles onclose, but we reset local state
        sessionPromiseRef.current = null;
        setIsConnected(false);
        setIsSpeaking(false);
        setVolume(0);
    }, []);

    const disconnect = () => {
        // If the SDK supported an explicit .close() on the session object we would call it.
        // However, we can simulate closing by stopping streams.
        // The real close happens if we trigger close on the session, but here we just cleanup client side
        // effectively ending the loop.
        cleanup();
    };

    // Animation Loop for Volume
    useEffect(() => {
        let animationFrame: number;
        const animate = () => {
            if (isConnected) {
                // Smooth decay/attack for visual volume
                setVolume(v => v * 0.9 + currentVolumeRef.current * 0.1);
            } else {
                setVolume(0);
            }
            animationFrame = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(animationFrame);
    }, [isConnected]);

    // Cleanup on unmount
    useEffect(() => {
        return () => cleanup();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        connect,
        disconnect,
        isConnected,
        isSpeaking,
        volume, // 0 to ~1
        error
    };
};