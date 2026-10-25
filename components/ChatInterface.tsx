'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Message, MessageRole, ChatMode } from '../types';
import { useLiveSession } from '../hooks/useLiveSession';
import { X, Mic, Send, Keyboard, AudioWaveform, User, Bot, AlertCircle, Loader2 } from 'lucide-react';
import { auth } from '@/firebase/client';

interface ChatInterfaceProps {
    onClose: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: MessageRole.MODEL,
            text: 'Hello! I am Elora, your Visa Assistant. How can I help you today? You can type your question or press on the microphone to ask me anything.',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<ChatMode>(ChatMode.TEXT);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, mode]);

    // Handle Text Submission
    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: MessageRole.USER,
            text: input,
            timestamp: new Date()
        };
        const historyBeforeSend = messages;
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            if (!auth.currentUser) throw new Error("You must be logged in.");
            const idToken = await auth.currentUser.getIdToken();

            const res = await fetch('/api/gemini/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${idToken}` },
                body: JSON.stringify({
                    message: userMsg.text,
                    history: historyBeforeSend
                        .filter(m => m.role !== MessageRole.SYSTEM)
                        .map(m => ({ role: m.role === MessageRole.USER ? 'user' : 'model', text: m.text })),
                }),
            });

            if (!res.ok || !res.body) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Failed to get a response');
            }

            let fullResponse = '';
            const botMsgId = (Date.now() + 1).toString();

            // Add placeholder message
            setMessages(prev => [...prev, {
                id: botMsgId,
                role: MessageRole.MODEL,
                text: '',
                timestamp: new Date()
            }]);

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                fullResponse += decoder.decode(value, { stream: true });
                setMessages(prev => prev.map(msg =>
                    msg.id === botMsgId ? { ...msg, text: fullResponse } : msg
                ));
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: MessageRole.SYSTEM,
                text: 'Sorry, I encountered an error. Please try again.',
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Voice Mode Integration
    const handleVoiceTranscript = (text: string, isUser: boolean) => {
        if (!text.trim()) return;

        setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            // If the last message is from the same role and recent, append to it to reduce clutter
            // Note: In a real app, you might want more sophisticated logic for turn-taking
            const isRoleMatch = lastMsg && lastMsg.role === (isUser ? MessageRole.USER : MessageRole.MODEL);
            const isRecent = lastMsg && (new Date().getTime() - lastMsg.timestamp.getTime() < 3000);

            if (isRoleMatch && isRecent) {
                return prev.map((msg, idx) => idx === prev.length - 1 ? {...msg, text: msg.text + text} : msg);
            }

            return [...prev, {
                id: Date.now().toString(),
                role: isUser ? MessageRole.USER : MessageRole.MODEL,
                text: text,
                timestamp: new Date()
            }];
        });
    };

    const { connect, disconnect, isConnected, isSpeaking, volume, error: liveError } = useLiveSession({
        onTranscript: handleVoiceTranscript
    });

    const toggleMode = () => {
        if (mode === ChatMode.TEXT) {
            setMode(ChatMode.VOICE);
            connect();
        } else {
            setMode(ChatMode.TEXT);
            disconnect();
        }
    };

    const closeChat = () => {
        if (mode === ChatMode.VOICE) disconnect();
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex h-full w-full flex-col overflow-hidden rounded-[1.75rem] border border-lp-line bg-lp-card font-sans text-lp-fg lp-shadow">

            {/* Header */}
            <div className="relative flex shrink-0 items-center justify-between overflow-hidden bg-lp-navy p-4 text-white">
                <div className="lp-grid-dots pointer-events-none absolute inset-0 opacity-[0.15]" aria-hidden="true" />
                <div className="relative flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#8FCDAF] ring-1 ring-white/15">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h2 className="font-display text-lg font-semibold leading-tight tracking-[-0.03em]">Elora</h2>
                        <div className="flex items-center gap-1.5 font-display text-[10px] font-medium uppercase tracking-[0.16em] text-white/65">
                            <span className={`h-1.5 w-1.5 rounded-full ${mode === ChatMode.VOICE && isConnected ? 'bg-[#8FCDAF] animate-pulse' : 'bg-white/40'}`}></span>
                            {mode === ChatMode.VOICE ? 'Voice Active' : 'Visa Assistant'}
                        </div>
                    </div>
                </div>
                <button onClick={closeChat} aria-label="Close chat" className="relative flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FCDAF]">
                    <X size={18} />
                </button>
            </div>

            {/* Main Content Area */}
            <div className="relative flex-1 overflow-hidden bg-lp-card-2">

                {/* TEXT MODE */}
                <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${mode === ChatMode.TEXT ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                    <div className="scrollbar-hide flex-1 space-y-4 overflow-y-auto p-4">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex max-w-[85%] gap-2.5 ${msg.role === MessageRole.USER ? 'ml-auto flex-row-reverse' : ''}`}
                            >
                                {msg.role !== MessageRole.SYSTEM && (
                                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${msg.role === MessageRole.USER ? 'bg-lp-sky text-lp-azure' : 'bg-lp-navy text-[#8FCDAF]'}`}>
                                        {msg.role === MessageRole.USER ? <User size={15} /> : <Bot size={15} />}
                                    </div>
                                )}

                                <div className={`rounded-2xl p-3 text-sm leading-relaxed
                    ${msg.role === MessageRole.USER ? 'rounded-br-md bg-lp-navy text-white' :
                                    msg.role === MessageRole.SYSTEM ? 'w-full border border-red-200 bg-red-50 text-center text-red-700 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300' :
                                        'rounded-bl-md border border-lp-line bg-lp-card text-lp-fg'}`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex max-w-[85%] gap-2.5">
                                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-lp-navy text-[#8FCDAF]">
                                    <Bot size={15} />
                                </div>
                                <div className="rounded-2xl rounded-bl-md border border-lp-line bg-lp-card p-4">
                                    <div className="flex gap-1">
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-lp-azure/60" style={{animationDelay: '0ms'}}></span>
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-lp-azure/60" style={{animationDelay: '150ms'}}></span>
                                        <span className="h-2 w-2 animate-bounce rounded-full bg-lp-azure/60" style={{animationDelay: '300ms'}}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="shrink-0 border-t border-lp-line bg-lp-card p-3">
                        <div className="flex items-end gap-2">
                            <button
                                onClick={toggleMode}
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lp-sky text-lp-azure transition-colors hover:bg-lp-azure hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure"
                                title="Switch to Voice Mode"
                                aria-label="Switch to Voice Mode"
                            >
                                <Mic size={19} />
                            </button>
                            <div className="relative flex-1">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    aria-label="Message Elora"
                    className="h-[48px] max-h-[120px] w-full resize-none rounded-3xl border border-lp-line bg-lp-card-2 px-4 py-3 text-lp-fg placeholder:text-lp-muted/70 focus:border-lp-azure focus:outline-none focus:ring-2 focus:ring-lp-azure/20"
                    rows={1}
                />
                            </div>
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                aria-label="Send message"
                                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-lp-navy text-white transition-colors hover:bg-lp-navy-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* VOICE MODE */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-lp-navy transition-opacity duration-300 ${mode === ChatMode.VOICE ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                    <div className="lp-grid-dots pointer-events-none absolute inset-0 opacity-[0.12]" aria-hidden="true" />
                    <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[#5DBF95]/20 blur-3xl" aria-hidden="true" />

                    {liveError && (
                        <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-center gap-2 rounded-xl border border-red-400/40 bg-red-500/15 p-3 text-sm text-red-100 backdrop-blur-sm">
                            <AlertCircle size={16} />
                            {liveError}
                        </div>
                    )}

                    <div className="relative">
                        {/* Visualizer Circle */}
                        <div className="relative flex h-48 w-48 items-center justify-center">
                            {/* Pulse Rings */}
                            <div
                                className="absolute inset-0 rounded-full bg-[#5DBF95]/25 blur-xl transition-transform duration-100"
                                style={{ transform: `scale(${1 + Math.min(volume * 2, 0.5)})` }}
                            />
                            <div
                                className="absolute inset-0 rounded-full border border-[#8FCDAF]/40 transition-transform duration-75"
                                style={{ transform: `scale(${1 + volume})` }}
                            />

                            {/* Core Circle */}
                            <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-lp-azure ring-1 ring-white/20">
                                <div className="absolute inset-0 bg-gradient-to-tr from-lp-azure-2 to-[#5DBF95] opacity-80" />
                                {isSpeaking ? (
                                    <AudioWaveform className="relative z-10 h-12 w-12 animate-pulse text-white" />
                                ) : (
                                    <Mic className="relative z-10 h-12 w-12 text-white" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="relative mt-8 space-y-2 text-center">
                        <h3 className="font-display text-2xl font-semibold tracking-[-0.03em] text-white">
                            {isConnected ? (isSpeaking ? "Elora is speaking..." : "Listening...") : "Connecting..."}
                        </h3>
                        <p className="text-sm text-white/60">
                            {isConnected ? "Go ahead, I'm listening." : "Establishing secure connection..."}
                        </p>
                    </div>

                    <div className="absolute bottom-8 flex items-center gap-3">
                        <button
                            onClick={toggleMode}
                            className="flex h-12 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8FCDAF]"
                        >
                            <Keyboard size={17} />
                            <span>Switch to Text</span>
                        </button>
                        <button
                            onClick={() => { disconnect(); onClose(); }}
                            className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/85 text-white backdrop-blur-md transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
                            title="End Chat"
                            aria-label="End Chat"
                        >
                            <X size={22} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};