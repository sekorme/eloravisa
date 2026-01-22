'use client'
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Message, MessageRole, ChatMode } from '../types';
import { useLiveSession } from '../hooks/useLiveSession';
import { X, Mic, Send, Keyboard, AudioWaveform, User, Bot, AlertCircle, Loader2 } from 'lucide-react';
import {config} from "@/lib/config";

interface ChatInterfaceProps {
    onClose: () => void;
    key:string
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onClose, key }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: MessageRole.MODEL,
            text: 'Hello! I am Elora, your Visa Assistant. How can I help you today?',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<ChatMode>(ChatMode.TEXT);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [chatSession, setChatSession] = useState<Chat | null>(null);

    // Initialize Chat Session for Text Mode
    useEffect(() => {
        try {
            const geminiKey = config.geminiKey
            const ai = new GoogleGenAI({ apiKey: key!|| geminiKey });
            const newChat = ai.chats.create({
                model: 'gemini-3-flash-preview',
                config: {
                    systemInstruction: "You are Elora, a professional, warm, and helpful AI assistant for Elora Visa. You help users with visa applications, requirements, and status checks. Keep responses concise and easy to read. Use formatting like bullet points where appropriate.",
                }
            });
            setChatSession(newChat);
        } catch (e) {
            console.error("Failed to initialize chat", e);
        }
    }, []);

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, mode]);

    // Handle Text Submission
    const handleSend = async () => {
        if (!input.trim() || !chatSession) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: MessageRole.USER,
            text: input,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const result = await chatSession.sendMessageStream({ message: userMsg.text });

            let fullResponse = '';
            const botMsgId = (Date.now() + 1).toString();

            // Add placeholder message
            setMessages(prev => [...prev, {
                id: botMsgId,
                role: MessageRole.MODEL,
                text: '',
                timestamp: new Date()
            }]);

            for await (const chunk of result) {
                const text = chunk.text;
                if (text) {
                    fullResponse += text;
                    setMessages(prev => prev.map(msg =>
                        msg.id === botMsgId ? { ...msg, text: fullResponse } : msg
                    ));
                }
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
            connect({key});
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
        <div className="flex flex-col h-full w-full bg-white text-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 font-sans">

            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-indigo-600 text-white shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center border-2 border-indigo-400">
                        <Bot size={24} className="text-white" />
                    </div>
                    <div>
                        <h2 className="font-semibold text-lg leading-tight">Elora</h2>
                        <div className="flex items-center gap-1.5 opacity-90 text-xs">
                            <span className={`w-2 h-2 rounded-full ${mode === ChatMode.VOICE && isConnected ? 'bg-green-400 animate-pulse' : 'bg-indigo-300'}`}></span>
                            {mode === ChatMode.VOICE ? 'Voice Active' : 'Visa Assistant'}
                        </div>
                    </div>
                </div>
                <button onClick={closeChat} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden relative bg-slate-50">

                {/* TEXT MODE */}
                <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${mode === ChatMode.TEXT ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 max-w-[85%] ${msg.role === MessageRole.USER ? 'ml-auto flex-row-reverse' : ''}`}
                            >
                                {msg.role !== MessageRole.SYSTEM && (
                                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === MessageRole.USER ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-600'}`}>
                                        {msg.role === MessageRole.USER ? <User size={16} /> : <Bot size={16} />}
                                    </div>
                                )}

                                <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${msg.role === MessageRole.USER ? 'bg-indigo-600 text-white rounded-br-none' :
                                    msg.role === MessageRole.SYSTEM ? 'bg-red-50 text-red-600 border border-red-100 w-full text-center' :
                                        'bg-white text-slate-800 border border-slate-100 rounded-bl-none'}`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-3 max-w-[85%]">
                                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex-shrink-0 flex items-center justify-center">
                                    <Bot size={16} />
                                </div>
                                <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-slate-100 shadow-sm">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                        <div className="flex gap-2 items-end">
                            <button
                                onClick={toggleMode}
                                className="p-3 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                                title="Switch to Voice Mode"
                            >
                                <Mic size={20} />
                            </button>
                            <div className="flex-1 relative">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-[48px] max-h-[120px]"
                    rows={1}
                />
                            </div>
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-indigo-200"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* VOICE MODE */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 transition-opacity duration-300 ${mode === ChatMode.VOICE ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>

                    {liveError && (
                        <div className="absolute top-4 left-4 right-4 bg-red-500/20 text-red-100 border border-red-500/50 p-3 rounded-lg flex items-center justify-center gap-2 text-sm backdrop-blur-sm">
                            <AlertCircle size={16} />
                            {liveError}
                        </div>
                    )}

                    <div className="relative">
                        {/* Visualizer Circle */}
                        <div className="relative w-48 h-48 flex items-center justify-center">
                            {/* Pulse Rings */}
                            <div
                                className="absolute inset-0 rounded-full bg-indigo-500/30 blur-xl transition-transform duration-100"
                                style={{ transform: `scale(${1 + Math.min(volume * 2, 0.5)})` }}
                            />
                            <div
                                className="absolute inset-0 rounded-full border border-indigo-400/50 transition-transform duration-75"
                                style={{ transform: `scale(${1 + volume})` }}
                            />

                            {/* Core Circle */}
                            <div className="w-32 h-32 rounded-full bg-indigo-600 shadow-lg shadow-indigo-500/50 flex items-center justify-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-purple-500 opacity-80" />
                                {isSpeaking ? (
                                    <AudioWaveform className="text-white relative z-10 w-12 h-12 animate-pulse" />
                                ) : (
                                    <Mic className="text-white relative z-10 w-12 h-12" />
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 text-center space-y-2">
                        <h3 className="text-2xl font-medium text-white">
                            {isConnected ? (isSpeaking ? "Elora is speaking..." : "Listening...") : "Connecting..."}
                        </h3>
                        <p className="text-indigo-200 text-sm">
                            {isConnected ? "Go ahead, I'm listening." : "Establishing secure connection..."}
                        </p>
                    </div>

                    <div className="absolute bottom-8 flex items-center gap-4">
                        <button
                            onClick={toggleMode}
                            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all border border-white/10"
                        >
                            <Keyboard size={18} />
                            <span>Switch to Text</span>
                        </button>
                        <button
                            onClick={() => { disconnect(); onClose(); }}
                            className="w-12 h-12 flex items-center justify-center bg-red-500/80 hover:bg-red-500 text-white rounded-full transition-colors backdrop-blur-md"
                            title="End Chat"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};