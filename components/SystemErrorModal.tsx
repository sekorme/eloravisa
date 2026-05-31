"use client";

import React from "react";
import { AlertCircle, X, ShieldAlert } from "lucide-react";

interface SystemErrorModalProps {
    error: string | null;
    onClose: () => void;
}

export const SystemErrorModal: React.FC<SystemErrorModalProps> = ({ error, onClose }) => {
    if (!error) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-red-500/30 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.15)] overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                {/* Header Glow */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />
                
                <div className="p-8 flex flex-col items-center text-center">
                    {/* Icon */}
                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    
                    <h2 className="text-xl font-bold text-white mb-2 tracking-tight">System Error</h2>
                    <p className="text-[10px] text-red-400 uppercase tracking-[0.2em] font-bold mb-6">Action Required</p>
                    
                    <div className="w-full bg-white/[0.03] border border-white/5 rounded-2xl p-5 mb-8">
                        <p className="text-sm text-white/80 leading-relaxed font-medium">
                            {error}
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="group relative w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all duration-300 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <span className="relative text-xs font-bold uppercase tracking-widest text-white/70 group-hover:text-white transition-colors">
                            Dismiss Notification
                        </span>
                    </button>
                </div>

                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-white/20 hover:text-white/60 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
