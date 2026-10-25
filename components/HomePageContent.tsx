'use client'
import React, { useState, useEffect } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { MessageCircle, Lock } from 'lucide-react';
import { auth, db } from '@/firebase/client';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';

export default function HomePageContent() {
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // onAuthStateChanged ignores the callback's return value — clean up by hand.
        let unsubDoc: (() => void) | undefined;
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            unsubDoc?.();
            unsubDoc = undefined;
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                unsubDoc = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) {
                        const data = doc.data();
                        // Pro and Full plans have access to chatbot
                        setHasAccess(data.planId === 'pro' || data.planId === 'full');
                    }
                    setLoading(false);
                });
            } else {
                setHasAccess(false);
                setLoading(false);
            }
        });
        return () => {
            unsubDoc?.();
            unsubscribeAuth();
        };
    }, []);

    if (loading) return null;

    return (
        <div className="relative w-full overflow-hidden">
            {/* Chat Widget Container */}
            <div
                className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ease-in-out flex flex-col items-end
         ${isChatOpen ? 'w-[400px] h-[600px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-32px)]' : 'w-auto h-auto'}`}
            >
                {isChatOpen ? (
                    <div className="w-full h-full animate-in slide-in-from-bottom-10 fade-in duration-300">
                        {hasAccess ? (
                            <ChatInterface onClose={() => setIsChatOpen(false)} />
                        ) : (
                            <div className="relative flex h-full w-full flex-col items-center justify-center space-y-6 overflow-hidden rounded-[1.75rem] border border-lp-line bg-lp-card p-8 text-center text-lp-fg lp-shadow">
                                <div className="lp-grid-dots pointer-events-none absolute inset-x-0 top-0 h-48 opacity-[0.25] [mask-image:linear-gradient(black,transparent)]" aria-hidden="true" />
                                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-lp-navy text-[#8FCDAF]">
                                    <Lock size={34} />
                                </div>
                                <div className="relative space-y-2">
                                    <span className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-azure">Elora AI Assistant</span>
                                    <h3 className="font-display text-2xl font-semibold tracking-[-0.04em]">Pro Feature</h3>
                                    <p className="text-lp-muted">
                                        The AI Assistant Elora is only available to Pro and Full Features members.
                                    </p>
                                </div>
                                <Link
                                    href="/dashboard/subscription"
                                    onClick={() => setIsChatOpen(false)}
                                    className="relative flex h-12 w-full items-center justify-center rounded-full bg-lp-navy font-semibold text-white transition-[background-color,transform] hover:bg-lp-navy-2 motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure focus-visible:ring-offset-2 focus-visible:ring-offset-lp-card"
                                >
                                    Upgrade to Pro
                                </Link>
                                <button 
                                    onClick={() => setIsChatOpen(false)}
                                    className="relative text-sm font-semibold text-lp-muted transition-colors hover:text-lp-fg"
                                >
                                    Maybe later
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="group flex h-14 items-center gap-3 rounded-full bg-lp-navy py-2 pl-5 pr-2 text-white shadow-[0_16px_40px_-12px_rgba(8,32,26,0.55)] ring-1 ring-white/10 transition-[background-color,transform] duration-200 hover:bg-lp-navy-2 motion-safe:hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure focus-visible:ring-offset-2 focus-visible:ring-offset-lp-page"
                    >
                        <span className="font-semibold">Ask Elora</span>
                        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#8FCDAF]">
                            <MessageCircle size={20} />
                            {!hasAccess && <Lock size={12} className="absolute -left-1 -top-1 rounded-full bg-lp-azure p-0.5 text-white" />}
                            {hasAccess && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-pulse rounded-full border-2 border-lp-navy bg-[#8FCDAF]"></span>}
                        </span>
                    </button>
                )}
            </div>
        </div>
    );
}
