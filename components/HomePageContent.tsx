'use client'
import React, { useState } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { MessageCircle } from 'lucide-react';

export default function HomePageContent({key}: {key: string}) {
    const [isChatOpen, setIsChatOpen] = useState(false);

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
                        <ChatInterface key={key} onClose={() => setIsChatOpen(false)} />
                    </div>
                ) : (
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="group flex items-center gap-3 px-5 py-4 bg-indigo-600 text-white rounded-full shadow-xl shadow-indigo-300 hover:bg-indigo-700 hover:scale-105 transition-all duration-200"
                    >
                        <span className="font-medium pr-1">Ask Elora</span>
                        <div className="relative">
                            <MessageCircle size={24} />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-indigo-600 animate-pulse"></span>
                        </div>
                    </button>
                )}
            </div>
        </div>
    );
}