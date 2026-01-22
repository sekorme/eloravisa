'use client'
import React, { useEffect, useRef } from 'react';
import { TranscriptEntry } from '@/types';

interface TranscriptProps {
    entries: TranscriptEntry[];
    currentInput: string;
    currentOutput: string;
}

const Transcript: React.FC<TranscriptProps> = ({ entries, currentInput, currentOutput }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [entries, currentInput, currentOutput]);

    return (
        <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
            style={{ scrollbarWidth: 'none' }}
        >
            {entries.map((entry) => (
                <div
                    key={entry.id}
                    className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-lg ${
                            entry.role === 'user'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700'
                        }`}
                    >
                        <p className="text-sm leading-relaxed">{entry.text}</p>
                    </div>
                </div>
            ))}

            {/* Active transcription streams */}
            {currentInput && (
                <div className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-blue-600/50 text-white/80 rounded-tr-none italic animate-pulse">
                        <p className="text-sm leading-relaxed">{currentInput}...</p>
                    </div>
                </div>
            )}

            {currentOutput && (
                <div className="flex justify-start">
                    <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-800/50 text-gray-100/80 rounded-tl-none border border-gray-700 italic animate-pulse">
                        <p className="text-sm leading-relaxed">{currentOutput}...</p>
                    </div>
                </div>
            )}

            {entries.length === 0 && !currentInput && !currentOutput && (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2 opacity-50">
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    <p className="font-outfit text-lg">Talk to Gemini to start</p>
                </div>
            )}
        </div>
    );
};

export default Transcript;
