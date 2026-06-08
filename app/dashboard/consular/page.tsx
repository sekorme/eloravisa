"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useRef, useEffect } from "react";
import { Camera, CameraOff, Loader2, Mic, MicOff, PhoneCall, Phone, Eye, EyeOff, User, BotMessageSquare, Globe, Shuffle, AlertCircle, Sparkles } from "lucide-react";

import { getCountryByName, Country } from "@/components/countries";
import { SystemErrorModal } from "@/components/SystemErrorModal";
import {useLiveAPI} from "@/hooks/useLiveAPI";
import { toast } from "sonner";

export default function App() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const [isCameraVisible, setIsCameraVisible] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const { status, transcripts, error, connect, disconnect, setTranscripts, setError, destination } = useLiveAPI();
    const [fullHistory, setFullHistory] = useState<any[]>([]);
    const [isSecure, setIsSecure] = useState(true);

    // Update selectedCountry when destination changes
    useEffect(() => {
        if (destination) {
            const country = getCountryByName(destination);
            if (country) {
                setSelectedCountry(country);
            }
        }
    }, [destination]);

    // Sync full history
    useEffect(() => {
        if (transcripts.length > 0) {
            setFullHistory(prev => {
                const lastTranscript = transcripts[transcripts.length - 1];
                const existingIndex = prev.findIndex(t => t.id === lastTranscript.id);
                if (existingIndex >= 0) {
                    const next = [...prev];
                    next[existingIndex] = lastTranscript;
                    return next;
                }
                return [...prev, lastTranscript];
            });
        }
    }, [transcripts]);

    // Handle disappearing transcripts (expiresAt)
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setTranscripts(prev => {
                const filtered = prev.filter(t => !t.expiresAt || t.expiresAt > now);
                if (filtered.length !== prev.length) return filtered;
                return prev;
            });
        }, 500); // More frequent check for disappearing
        return () => clearInterval(interval);
    }, [setTranscripts]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsSecure(window.isSecureContext);
        }
    }, []);


    const handleStart = async () => {
        if (videoRef.current && selectedCountry) {
            try {
                setFullHistory([]);
                await connect(videoRef.current, selectedCountry);
            } catch (err: any) {
                if (err.message === "Insufficient tokens") {
                    toast.error("Insufficient tokens. Please top up to start a session.");
                } else {
                    toast.error(err.message || "Failed to start session");
                }
            }
        }
    };

    const handleRandomize = () => {
        // Randomizing is disabled when using real destination
        // if (status === 'disconnected') {
        //     setSelectedCountry(getRandomCountry());
        // }
    };

    const handleStop = () => {
        disconnect();
    };

    useEffect(() => {
        if (transcriptEndRef.current) {
            transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [transcripts]);

    return (
        <div className="min-h-screen bg-white dark:bg-[#050505] text-slate-900 dark:text-white flex flex-col font-sans py-4">
            <SystemErrorModal error={error} onClose={() => setError(null)} />

            <header className="px-4 md:px-8 h-auto mb-4 flex flex-col sm:flex-row items-center justify-between shrink-0 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 rounded-xl flex items-center justify-center font-bold text-xl shadow-[0_0_20px_rgba(6,182,212,0.5)] border border-white/20 dark:border-white/20">
                        <Globe className="w-5 h-5 text-white animate-[spin_10s_linear_infinite]" />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-white dark:to-white/60">CONSULAR AI</h1>
                        <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.2em] opacity-80">Next-Gen Visa Preparation</p>
                    </div>
                </div>

                {(!isSecure && !error) && (
                    <div className="flex-1 max-w-xl mx-4 px-4 py-2 bg-yellow-500/10 border border-yellow-500/50 rounded-lg text-yellow-400 text-xs animate-in fade-in zoom-in duration-300">
                        <p className="font-bold uppercase tracking-widest mb-1 text-[10px]">Security Warning</p>
                        <p>You are using an insecure connection. Camera and microphone access will likely be blocked by your browser.</p>
                    </div>
                )}


                <div className="flex items-center gap-2 sm:gap-4 shrink-0 self-end sm:self-center">
                    {status === 'connected' ? (
                        <span className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-mono text-slate-700 dark:text-white uppercase shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="hidden xs:inline">Live Session Active</span>
                <span className="xs:hidden">Live</span>
              </span>
                    ) : status === 'connecting' ? (
                        <span className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-mono text-slate-700 dark:text-white uppercase shadow-[0_0_10px_rgba(34,211,238,0.2)]">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span className="hidden xs:inline">Connecting...</span>
                <span className="xs:hidden">Wait...</span>
              </span>
                    ) : (
                        <span className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-mono text-slate-400 dark:text-white/50 uppercase">
                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-white/30" />
                <span className="hidden xs:inline">Ready to Practice</span>
                <span className="xs:hidden">Ready</span>
              </span>
                    )}
                </div>
            </header>

            <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 md:px-8 pb-4 grid grid-cols-1 lg:grid-cols-[2fr_1fr] xl:grid-cols-[2.5fr_1fr] gap-6 lg:h-[calc(100vh-120px)] min-h-0">

                {/* Left Col - Video and Controls */}
                <section className="flex flex-col gap-4 md:gap-6 h-full min-h-0">
                    <div className={`relative flex-1 min-h-[300px] glass-panel rounded-3xl overflow-hidden flex items-center justify-center flex-col transition-all duration-700 ${status === 'connected' ? 'ring-2 ring-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.2)]' : ''}`}>
                        <video
                            ref={videoRef}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 grayscale-[0.2] ${status !== 'disconnected' && isCameraVisible ? 'opacity-100' : 'opacity-0'}`}
                            muted
                            playsInline
                        />
                        {status !== 'disconnected' && isCameraVisible && (
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 dark:from-black/80 via-transparent to-transparent pointer-events-none"></div>
                        )}

                        {status === 'disconnected' && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-white/40 pointer-events-none">
                                <CameraOff className="w-12 h-12 mb-4 opacity-50" />
                                <p className="font-mono text-sm uppercase tracking-widest">Camera is off</p>
                                <p className="text-xs opacity-60 mt-2">Click Start Interview to begin</p>
                            </div>
                        )}

                        {status !== 'disconnected' && !isCameraVisible && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-white/40 pointer-events-none">
                                <EyeOff className="w-12 h-12 mb-4 opacity-50" />
                                <p className="font-mono text-sm uppercase tracking-widest text-center">Camera feed hidden</p>
                                <p className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 opacity-80 mt-2 uppercase text-center max-w-[200px]">Emotion analysis active in background</p>
                            </div>
                        )}

                        {/* Visualizer overlay (faux) */}
                        {status === 'connected' && (
                            <div className="absolute top-6 left-6 right-6 flex justify-between items-start pointer-events-none">
                                <div className="flex flex-col gap-2">
                                    <div className="px-2 py-1 bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[9px] sm:text-[10px] font-mono border border-cyan-400/30 rounded uppercase whitespace-nowrap">Emotion Tracking: Active</div>
                                    <div className="px-2 py-1 bg-slate-900/10 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 text-slate-600 dark:text-white/50 text-[9px] sm:text-[10px] font-mono rounded uppercase flex items-center gap-2">
                                        <Mic className="w-3 h-3 text-red-500 animate-pulse" /> Recording
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsCameraVisible(!isCameraVisible)}
                                    className="pointer-events-auto w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-white/20 border border-slate-200 dark:border-white/10 transition-colors"
                                    title={isCameraVisible ? "Hide Self View" : "Show Self View"}
                                >
                                    {isCameraVisible ? <Eye className="w-5 h-5 text-slate-600 dark:text-white/70" /> : <EyeOff className="w-5 h-5 text-slate-600 dark:text-white/70" />}
                                </button>
                            </div>
                        )}

                        {/* Live Overlay for disappearing preview removed per request */}
                    </div>

                    <div className="flex items-center justify-center gap-4 shrink-0 py-2 sm:py-4">
                        {status === 'disconnected' ? (
                            <button
                                onClick={handleStart}
                                className="group relative flex items-center gap-3 px-6 sm:px-10 py-4 sm:py-5 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-cyan-50 rounded-2xl font-black tracking-tighter text-xs sm:text-sm transition-all active:scale-95 shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                            >
                                <PhoneCall className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-600" />
                                START INTERVIEW
                                <div className="absolute inset-0 rounded-2xl bg-cyan-400 opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
                            </button>
                        ) : (
                            <button
                                onClick={handleStop}
                                className="group flex items-center gap-3 px-6 sm:px-10 py-4 sm:py-5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black tracking-tighter text-xs sm:text-sm transition-all active:scale-95 shadow-[0_20px_40px_rgba(220,38,38,0.2)]"
                            >
                                <Phone className="w-4 h-4 sm:w-5 sm:h-5 rotate-[135deg]" />
                                TERMINATE SESSION
                            </button>
                        )}
                    </div>
                </section>

                {/* Right Col - Info and Status */}
                <section className="flex flex-col gap-6 h-full min-h-0 overflow-y-auto lg:overflow-hidden pr-1">

                    <div className="glass-panel rounded-3xl p-6 shrink-0 hidden lg:block">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/60">Destination</h3>
                        </div>

                        {selectedCountry && (
                            <div className="flex flex-col gap-3 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 mb-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                        <Globe className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/40 font-bold">Target Country</p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedCountry.name}</p>
                                    </div>
                                </div>
                                <div className="h-px bg-slate-200 dark:bg-white/5 w-full"></div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/40 font-bold">Consulate</span>
                                    <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">{selectedCountry.consulateName}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/40">Interview Policy</span>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedCountry.requiresInterview ? 'text-amber-600 dark:text-yellow-500' : 'text-emerald-600 dark:text-green-500'}`}>
                                        {selectedCountry.requiresInterview ? 'In-Person Required' : 'No Interview Needed'}
                                    </span>
                                </div>
                            </div>
                        )}

                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/60 mb-6">Instructions</h3>
                        <ul className="text-xs text-slate-600 dark:text-white/70 space-y-4">
                            <li className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)] shrink-0"></div>
                                <span>Answer questions naturally, just like a real visa interview.</span>
                            </li>
                            <li className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)] shrink-0"></div>
                                <span>The AI evaluates both your verbal answers and facial expressions.</span>
                            </li>
                            <li className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/5">
                                <div className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.4)] shrink-0"></div>
                                <span>Ensure your face is well-lit and clearly visible in the camera.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="glass-panel rounded-3xl p-6 flex-1 flex flex-col justify-center min-h-[120px] lg:min-h-[150px] shrink-0 hidden lg:flex">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/60">Live Intelligence</h3>
                            <Sparkles className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
                        </div>
                        <div className="flex-1 flex items-center justify-center p-4">
                            {status === 'disconnected' ? (
                                <div className="text-center space-y-1">
                                    <p className="text-sm text-slate-400 dark:text-white/40 italic">
                                        Agent is ready to analyze your performance.
                                    </p>
                                    <p className="text-[10px] text-slate-300 dark:text-white/20 uppercase tracking-tighter">facial cues • tone • content quality</p>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-5 text-center w-full">
                                    <div className="w-full flex justify-around items-end h-8 gap-1">
                                        {[...Array(12)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-1 bg-cyan-500/40 rounded-full animate-pulse"
                                                style={{
                                                    height: `${20 + Math.random() * 80}%`,
                                                    animationDelay: `${i * 100}ms`
                                                }}
                                            ></div>
                                        ))}
                                    </div>
                                    <div>
                                        <p className="text-sm text-cyan-600 dark:text-cyan-300 font-bold uppercase tracking-wider mb-1">Analyzing Responses</p>
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-white/40 font-mono">Multimodal Processing Active</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Transcript Block */}
                    <div className="glass-panel rounded-3xl p-6 flex-1 flex flex-col min-h-[300px] lg:min-h-0 overflow-hidden">
                        <div className="flex items-center justify-between mb-4 shrink-0">
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/60">Session Log</h3>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse"></div>
                                <span className="text-[10px] font-mono text-cyan-600/70 dark:text-cyan-400/70 uppercase">Live Recording</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                            {transcripts.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-30">
                                    <BotMessageSquare className="w-8 h-8 mb-2 text-slate-400 dark:text-white" />
                                    <p className="text-center text-xs italic text-slate-500 dark:text-white">Transcript will appear here once the interview starts.</p>
                                </div>
                            ) : (
                                transcripts.map((t) => (
                                    <div key={t.id} className={`flex flex-col gap-1 ${t.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/40">
                                            {t.role === 'user' ? (
                                                <><span className="text-cyan-600/70 dark:text-cyan-400/70">You</span> <User className="w-3 h-3 text-cyan-600/70 dark:text-cyan-400/70" /></>
                                            ) : (
                                                <><BotMessageSquare className="w-3 h-3 text-purple-600/70 dark:text-purple-400/70" /> <span className="text-purple-600/70 dark:text-purple-400/70">Officer</span></>
                                            )}
                                        </div>
                                        <div className={`px-4 py-3 rounded-2xl max-w-[95%] sm:max-w-[92%] text-sm leading-relaxed transition-all duration-300 ${
                                            t.role === 'user'
                                                ? 'bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-400/10 text-cyan-900 dark:text-cyan-100 rounded-tr-none'
                                                : 'bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white/90 rounded-tl-none'
                                        }`}>
                                            {t.text}
                                            {!t.isFinal && (
                                                <span className="inline-flex items-center ml-2 gap-1">
                                                    <span className="w-1 h-1 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-[bounce_1s_infinite_0ms]"></span>
                                                    <span className="w-1 h-1 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-[bounce_1s_infinite_200ms]"></span>
                                                    <span className="w-1 h-1 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-[bounce_1s_infinite_400ms]"></span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={transcriptEndRef} />
                        </div>
                    </div>

                </section>
            </main>
        </div>
    );
}
