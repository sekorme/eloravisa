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
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const unsubDoc = onSnapshot(userDocRef, (doc) => {
                    if (doc.exists()) {
                        const data = doc.data();
                        // Pro and Full plans have access to chatbot
                        setHasAccess(data.planId === 'pro' || data.planId === 'full');
                    }
                    setLoading(false);
                });
                return () => unsubDoc();
            } else {
                setHasAccess(false);
                setLoading(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    if (loading) return null;

    return (
        <div className="relative w-full h-full bg-slate-50 dark:bg-neutral-800 overflow-hidden">
            {/* Background / Placeholder Content for the main site */}


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
                            <div className="w-full h-full bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-neutral-800 flex flex-col items-center justify-center p-8 text-center space-y-6">
                                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-full text-indigo-600">
                                    <Lock size={48} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Pro Feature</h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                                        The AI Assistant Elora is only available to Pro and Full Features members.
                                    </p>
                                </div>
                                <Link href="/dashboard/subscription" className="w-full">
                                    <button 
                                        className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-300 hover:bg-indigo-700 transition-all"
                                        onClick={() => setIsChatOpen(false)}
                                    >
                                        Upgrade to Pro
                                    </button>
                                </Link>
                                <button 
                                    onClick={() => setIsChatOpen(false)}
                                    className="text-sm font-bold text-slate-400 hover:text-slate-600"
                                >
                                    Maybe later
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="group flex items-center gap-3 px-5 py-4 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-300 hover:bg-indigo-700 hover:scale-105 transition-all duration-200"
                    >
                        <span className="font-medium pr-1">Ask Elora</span>
                        <div className="relative">
                            <MessageCircle size={24} />
                            {!hasAccess && <Lock size={12} className="absolute -top-1 -left-1 text-white bg-indigo-800 rounded-full p-0.5" />}
                            {hasAccess && <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-indigo-600 animate-pulse"></span>}
                        </div>
                    </button>
                )}
            </div>
        </div>
    );
}