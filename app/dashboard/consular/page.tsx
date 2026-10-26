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
import { saveInterviewSession } from "@/action/interviewSessions";
import { auth } from "@/firebase/client";
import { toast } from "sonner";

export default function App() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const transcriptEndRef = useRef<HTMLDivElement>(null);
    const [isCameraVisible, setIsCameraVisible] = useState(true);
    const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
    const { status, transcripts, error, connect, disconnect, setTranscripts, setError, destination, visaType, getSessionRecord } = useLiveAPI();
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

    // After hangup: score the full session server-side and save it to
    // interview history (action/interviewSessions.ts). Uses the hook's
    // append-only session record, not the on-screen captions, which expire.
    const saveSessionResults = async () => {
        const record = getSessionRecord();
        if (!auth.currentUser || record.turns.length === 0) return;

        const toastId = toast.loading("Scoring your interview...");
        try {
            const idToken = await auth.currentUser.getIdToken();
            const result = await saveInterviewSession(idToken, {
                mode: "consular",
                transcript: record.turns.map(({ role, text, timestamp }) => ({ role, text, timestamp })),
                destination: selectedCountry?.name || destination || "",
                visaType: visaType || "",
                consulate: selectedCountry?.consulateName || "",
                startedAt: record.startedAt ?? undefined,
                endedAt: record.endedAt ?? undefined,
                endedBy: record.endedBy,
            });

            if (!result.success) {
                toast.error(result.error, { id: toastId });
            } else if (result.scoringStatus === "scored") {
                const decision = result.feedback?.decision;
                toast.success(
                    decision === "approved" ? "Visa approved! Interview scored and saved to your history."
                        : decision === "refused" ? "Visa refused this time. See your history for why and how to improve."
                        : "Interview scored and saved to your history!",
                    { id: toastId },
                );
            } else {
                toast.success("Interview saved to your history. You can score it from there.", { id: toastId });
            }
        } catch (err) {
            console.warn("Failed to save interview session:", err);
            toast.error("Couldn't save this interview to your history.", { id: toastId });
        }
    };

    const handleStop = () => {
        disconnect();
    };

    // Save on the connected → disconnected transition rather than in
    // handleStop, so sessions that end server-side (network drop, session
    // token expiry) are scored and saved too, not just manual hangups.
    const prevStatusRef = useRef(status);
    useEffect(() => {
        const prev = prevStatusRef.current;
        prevStatusRef.current = status;
        if (prev === "connected" && status === "disconnected") {
            saveSessionResults();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [status]);

    useEffect(() => {
        if (transcriptEndRef.current) {
            transcriptEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [transcripts]);

    return (
        <div className="flex min-h-screen flex-col bg-lp-page py-4 text-lp-fg">
            <SystemErrorModal error={error} onClose={() => setError(null)} />

            <header className="mx-auto mb-4 flex h-auto w-full max-w-[1600px] shrink-0 flex-col items-center justify-between gap-4 px-4 sm:flex-row md:px-8">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lp-navy text-[#8FCDAF]">
                        <Globe className="h-5 w-5 animate-[spin_10s_linear_infinite]" />
                    </div>
                    <div>
                        <h1 className="font-display text-lg font-semibold tracking-[-0.04em] md:text-2xl">Consular AI</h1>
                        <p className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-azure">Next-Gen Visa Preparation</p>
                    </div>
                </div>

                {(!isSecure && !error) && (
                    <div className="mx-4 max-w-xl flex-1 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-800 animate-in fade-in zoom-in duration-300 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-200">
                        <p className="mb-1 font-display text-[10px] font-semibold uppercase tracking-[0.16em]">Security Warning</p>
                        <p>You are using an insecure connection. Camera and microphone access will likely be blocked by your browser.</p>
                    </div>
                )}


                <div className="flex shrink-0 items-center gap-2 self-end sm:gap-4 sm:self-center">
                    {status === 'connected' ? (
                        <span className="flex items-center gap-2 rounded-full bg-lp-navy px-3.5 py-1.5 font-display text-[10px] font-medium uppercase tracking-[0.16em] text-white sm:text-[11px]">
                <span className="h-2 w-2 rounded-full bg-[#8FCDAF] animate-pulse" />
                <span className="hidden xs:inline">Live Session Active</span>
                <span className="xs:hidden">Live</span>
              </span>
                    ) : status === 'connecting' ? (
                        <span className="flex items-center gap-2 rounded-full border border-lp-line bg-lp-card px-3.5 py-1.5 font-display text-[10px] font-medium uppercase tracking-[0.16em] text-lp-fg sm:text-[11px]">
                <Loader2 className="h-4 w-4 animate-spin text-lp-azure" />
                <span className="hidden xs:inline">Connecting...</span>
                <span className="xs:hidden">Wait...</span>
              </span>
                    ) : (
                        <span className="flex items-center gap-2 rounded-full border border-lp-line bg-lp-card px-3.5 py-1.5 font-display text-[10px] font-medium uppercase tracking-[0.16em] text-lp-muted sm:text-[11px]">
                <span className="h-2 w-2 rounded-full bg-lp-fg/25" />
                <span className="hidden xs:inline">Ready to Practice</span>
                <span className="xs:hidden">Ready</span>
              </span>
                    )}
                </div>
            </header>

            <main className="mx-auto grid min-h-0 w-full max-w-[1600px] flex-1 grid-cols-1 gap-6 px-4 pb-4 md:px-8 lg:h-[calc(100vh-120px)] lg:grid-cols-[2fr_1fr] xl:grid-cols-[2.5fr_1fr]">

                {/* Left Col - Video and Controls */}
                <section className="flex h-full min-h-0 flex-col gap-4 md:gap-6">
                    <div className={`relative flex min-h-[300px] flex-1 flex-col items-center justify-center overflow-hidden rounded-[2rem] bg-lp-navy text-white transition-all duration-700 lp-shadow ${status === 'connected' ? 'ring-2 ring-[#5DBF95]/60' : ''}`}>
                        <div className="lp-grid-dots pointer-events-none absolute inset-0 opacity-[0.12]" aria-hidden="true" />
                        <video
                            ref={videoRef}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 grayscale-[0.2] ${status !== 'disconnected' && isCameraVisible ? 'opacity-100' : 'opacity-0'}`}
                            muted
                            playsInline
                        />
                        {status !== 'disconnected' && isCameraVisible && (
                            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-lp-navy/80 via-transparent to-transparent"></div>
                        )}

                        {status === 'disconnected' && (
                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-white/60">
                                <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-[#8FCDAF]">
                                    <CameraOff className="h-7 w-7" />
                                </span>
                                <p className="font-display text-sm font-medium uppercase tracking-[0.18em] text-white/80">Camera is off</p>
                                <p className="mt-2 text-xs text-white/50">Click Start Interview to begin</p>
                            </div>
                        )}

                        {status !== 'disconnected' && !isCameraVisible && (
                            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-white/60">
                                <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-[#8FCDAF]">
                                    <EyeOff className="h-7 w-7" />
                                </span>
                                <p className="text-center font-display text-sm font-medium uppercase tracking-[0.18em] text-white/80">Camera feed hidden</p>
                                <p className="mt-2 max-w-[220px] text-center font-display text-[10px] uppercase tracking-[0.14em] text-[#8FCDAF]">Emotion analysis active in background</p>
                            </div>
                        )}

                        {/* Visualizer overlay (faux) */}
                        {status === 'connected' && (
                            <div className="pointer-events-none absolute left-6 right-6 top-6 flex items-start justify-between">
                                <div className="flex flex-col gap-2">
                                    <div className="whitespace-nowrap rounded-full border border-white/15 bg-lp-navy/70 px-3 py-1 font-display text-[9px] font-medium uppercase tracking-[0.14em] text-[#8FCDAF] backdrop-blur sm:text-[10px]">Emotion Tracking: Active</div>
                                    <div className="flex items-center gap-2 rounded-full border border-white/15 bg-lp-navy/70 px-3 py-1 font-display text-[9px] font-medium uppercase tracking-[0.14em] text-white/80 backdrop-blur sm:text-[10px]">
                                        <Mic className="h-3 w-3 text-red-400 animate-pulse" /> Recording
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsCameraVisible(!isCameraVisible)}
                                    className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-lp-navy/70 text-white/80 backdrop-blur transition-colors hover:bg-lp-navy hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FCDAF]"
                                    title={isCameraVisible ? "Hide Self View" : "Show Self View"}
                                    aria-label={isCameraVisible ? "Hide Self View" : "Show Self View"}
                                >
                                    {isCameraVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                </button>
                            </div>
                        )}

                        {/* Live Overlay for disappearing preview removed per request */}
                    </div>

                    <div className="flex shrink-0 items-center justify-center gap-4 py-2 sm:py-3">
                        {status === 'disconnected' ? (
                            <button
                                onClick={handleStart}
                                className="group flex h-14 items-center gap-3 rounded-full bg-lp-navy pl-2 pr-8 text-sm font-semibold text-white transition-[background-color,box-shadow,transform] hover:bg-lp-navy-2 hover:shadow-[0_16px_40px_-12px_rgba(8,32,26,0.55)] motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure focus-visible:ring-offset-2 focus-visible:ring-offset-lp-page sm:h-16 sm:text-base"
                            >
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#8FCDAF] sm:h-12 sm:w-12">
                                    <PhoneCall className="h-4 w-4 sm:h-5 sm:w-5" />
                                </span>
                                Start Interview
                            </button>
                        ) : (
                            <button
                                onClick={handleStop}
                                className="group flex h-14 items-center gap-3 rounded-full bg-red-600 pl-2 pr-8 text-sm font-semibold text-white transition-[background-color,transform] hover:bg-red-700 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-lp-page sm:h-16 sm:text-base"
                            >
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 sm:h-12 sm:w-12">
                                    <Phone className="h-4 w-4 rotate-[135deg] sm:h-5 sm:w-5" />
                                </span>
                                Terminate Session
                            </button>
                        )}
                    </div>
                </section>

                {/* Right Col - Info and Status */}
                <section className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto pr-1 lg:overflow-hidden">

                    <div className="hidden shrink-0 p-6 lg:block rounded-[1.5rem] border border-lp-line bg-lp-card text-lp-fg lp-shadow">
                        <div className="mb-5 flex items-center justify-between">
                            <h3 className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">Destination</h3>
                        </div>

                        {selectedCountry && (
                            <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-lp-line bg-lp-card-2 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-lp-sky">
                                        <Globe className="h-4 w-4 text-lp-azure" />
                                    </div>
                                    <div>
                                        <p className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">Target Country</p>
                                        <p className="font-display text-sm font-semibold">{selectedCountry.name}</p>
                                    </div>
                                </div>
                                <div className="h-px w-full bg-lp-line"></div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">Consulate</span>
                                    <span className="text-right text-xs font-semibold text-lp-azure">{selectedCountry.consulateName}</span>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <span className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">Interview Policy</span>
                                    <span className={`font-display text-[10px] font-semibold uppercase tracking-[0.14em] ${selectedCountry.requiresInterview ? 'text-amber-700 dark:text-amber-300' : 'text-lp-azure'}`}>
                                        {selectedCountry.requiresInterview ? 'In-Person Required' : 'No Interview Needed'}
                                    </span>
                                </div>
                            </div>
                        )}

                        <h3 className="mb-4 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">Instructions</h3>
                        <ol className="space-y-2.5 text-sm text-lp-fg/85">
                            {[
                                "Answer questions naturally, just like a real visa interview.",
                                "The AI evaluates both your verbal answers and facial expressions.",
                                "Ensure your face is well-lit and clearly visible in the camera.",
                            ].map((tip, i) => (
                                <li key={tip} className="flex items-start gap-3 rounded-xl border border-lp-line bg-lp-card-2 p-3">
                                    <span className="mt-0.5 font-display text-[10px] font-semibold text-lp-azure">0{i + 1}</span>
                                    <span className="leading-snug">{tip}</span>
                                </li>
                            ))}
                        </ol>
                    </div>

                    <div className="hidden min-h-[120px] shrink-0 flex-1 flex-col justify-center p-6 lg:flex lg:min-h-[150px] rounded-[1.5rem] border border-lp-line bg-lp-card text-lp-fg lp-shadow">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">Live Intelligence</h3>
                            <Sparkles className="h-3.5 w-3.5 text-lp-azure" />
                        </div>
                        <div className="flex flex-1 items-center justify-center p-4">
                            {status === 'disconnected' ? (
                                <div className="space-y-1.5 text-center">
                                    <p className="text-sm text-lp-muted">
                                        Agent is ready to analyze your performance.
                                    </p>
                                    <p className="font-display text-[10px] uppercase tracking-[0.14em] text-lp-muted/60">facial cues • tone • content quality</p>
                                </div>
                            ) : (
                                <div className="flex w-full flex-col items-center gap-5 text-center">
                                    <div className="flex h-8 w-full items-end justify-around gap-1">
                                        {[...Array(12)].map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-1 rounded-full bg-lp-azure/50 animate-pulse"
                                                style={{
                                                    height: `${20 + Math.random() * 80}%`,
                                                    animationDelay: `${i * 100}ms`
                                                }}
                                            ></div>
                                        ))}
                                    </div>
                                    <div>
                                        <p className="mb-1 font-display text-sm font-semibold uppercase tracking-[0.12em] text-lp-azure">Analyzing Responses</p>
                                        <p className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">Multimodal Processing Active</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Transcript Block */}
                    <div className="flex min-h-[300px] flex-1 flex-col overflow-hidden p-6 lg:min-h-0 rounded-[1.5rem] border border-lp-line bg-lp-card text-lp-fg lp-shadow">
                        <div className="mb-4 flex shrink-0 items-center justify-between">
                            <h3 className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">Session Log</h3>
                            <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full bg-lp-azure animate-pulse"></div>
                                <span className="font-display text-[10px] uppercase tracking-[0.14em] text-lp-azure">Live Recording</span>
                            </div>
                        </div>

                        <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto pr-2">
                            {transcripts.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center text-lp-muted">
                                    <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-lp-sky text-lp-azure">
                                        <BotMessageSquare className="h-5 w-5" />
                                    </span>
                                    <p className="max-w-[220px] text-center text-xs">Transcript will appear here once the interview starts.</p>
                                </div>
                            ) : (
                                transcripts.map((t) => (
                                    <div key={t.id} className={`flex flex-col gap-1 ${t.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-500`}>
                                        <div className="flex items-center gap-1.5 font-display text-[10px] font-medium uppercase tracking-[0.16em] text-lp-muted">
                                            {t.role === 'user' ? (
                                                <><span>You</span> <User className="h-3 w-3" /></>
                                            ) : (
                                                <><BotMessageSquare className="h-3 w-3 text-lp-azure" /> <span className="text-lp-azure">Officer</span></>
                                            )}
                                        </div>
                                        <div className={`max-w-[95%] rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all duration-300 sm:max-w-[92%] ${
                                            t.role === 'user'
                                                ? 'rounded-tr-md bg-lp-navy text-white'
                                                : 'rounded-tl-md border border-lp-line bg-lp-card-2 text-lp-fg'
                                        }`}>
                                            {t.text}
                                            {!t.isFinal && (
                                                <span className="ml-2 inline-flex items-center gap-1">
                                                    <span className="h-1 w-1 rounded-full bg-current opacity-70 animate-[bounce_1s_infinite_0ms]"></span>
                                                    <span className="h-1 w-1 rounded-full bg-current opacity-70 animate-[bounce_1s_infinite_200ms]"></span>
                                                    <span className="h-1 w-1 rounded-full bg-current opacity-70 animate-[bounce_1s_infinite_400ms]"></span>
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
