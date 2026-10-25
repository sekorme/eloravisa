// components/visa/Disclaimer.tsx
import { AlertCircle } from "lucide-react";

export default function Disclaimer() {
    return (
        <div className="flex items-start gap-4 rounded-[1.5rem] border border-lp-line bg-lp-card-2 p-5 text-lp-fg">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-lp-card text-lp-muted ring-1 ring-lp-line">
                <AlertCircle size={16} />
            </div>
            <div className="space-y-2">
                <p className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">Legal Notice</p>
                <p className="text-xs leading-relaxed text-lp-muted">
                    <strong className="font-semibold text-lp-fg">Educational Guidance Only:</strong> This platform is designed to teach you how to apply for visas yourself. 
                    Visa decisions are made exclusively by official embassies and consulates. We do not guarantee visa approval 
                    and are not responsible for final outcomes.
                </p>
            </div>
        </div>
    );
}
