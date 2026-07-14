// components/visa/Disclaimer.tsx
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function Disclaimer() {
    return (
        <div className="flex items-start gap-4 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 shadow-inner">
            <div className="p-2 rounded-xl bg-slate-200/50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 shrink-0">
                <AlertCircle size={18} />
            </div>
            <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Legal Notice</p>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400 font-medium italic">
                    <strong className="text-slate-700 dark:text-slate-300 not-italic">Educational Guidance Only:</strong> This platform is designed to teach you how to apply for visas yourself. 
                    Visa decisions are made exclusively by official embassies and consulates. We do not guarantee visa approval 
                    and are not responsible for final outcomes.
                </p>
            </div>
        </div>
    );
}
