'use client'
import React, { useState } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { MessageCircle } from 'lucide-react';

export default function HomePageContent({key}: {key: string}) {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <div className="relative w-full h-full bg-slate-50 overflow-hidden">
            {/* Background / Placeholder Content for the main site */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 h-full overflow-y-auto">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Elora Visa Services</h1>
                    <p className="text-xl text-slate-600 max-w-2xl mx-auto">
                        Simplifying your journey to new destinations. Fast, reliable, and secure visa processing.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { title: "Tourist Visa", desc: "Explore the world with ease. Quick processing for holiday destinations." },
                        { title: "Business Visa", desc: "For professionals traveling for meetings, conferences, and trade." },
                        { title: "Student Visa", desc: "Start your educational journey abroad with our guidance." }
                    ].map((item, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg mb-4 flex items-center justify-center text-indigo-600">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="font-semibold text-lg text-slate-900 mb-2">{item.title}</h3>
                            <p className="text-slate-600">{item.desc}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 text-center p-8 bg-indigo-50 rounded-2xl border border-indigo-100">
                    <h2 className="text-2xl font-bold text-indigo-900 mb-4">Need Help?</h2>
                    <p className="text-indigo-700 mb-6">Our AI assistant Elora is here to answer your questions 24/7.</p>
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                    >
                        Chat with Elora
                    </button>
                </div>
            </div>

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