// components/visa/Disclaimer.tsx
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function Disclaimer() {
    return (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
            <AlertCircle size={16} className="text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 italic">
                <strong>Educational Guidance Only:</strong> This platform is designed to teach you how to apply for visas yourself. 
                Visa decisions are made exclusively by official embassies and consulates. We do not guarantee visa approval 
                and are not responsible for final outcomes.
            </p>
        </div>
    );
}
