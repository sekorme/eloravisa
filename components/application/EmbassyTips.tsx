// components/visa/EmbassyTips.tsx
import { Lightbulb, Info } from "lucide-react";

export default function EmbassyTips({ country }: { country: string }) {
    const tips = [
        "Clearly explain source of funds with verified documentation",
        "Avoid generic SOP templates; personalize your motivation",
        "Ensure sponsor documents match bank statements perfectly"
    ];
    return (
        <div className="rounded-[1.5rem] border border-lp-line bg-lp-card text-lp-fg lp-shadow p-6 md:p-7">
            <div className="mb-6 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lp-sky text-lp-azure">
                    <Lightbulb size={20} />
                </div>
                <div>
                    <h3 className="font-display text-lg font-semibold tracking-[-0.03em]">
                        Embassy Insider
                    </h3>
                    <p className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-azure">
                        Target: {country}
                    </p>
                </div>
            </div>

            <ol className="mb-6 space-y-4">
                {tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-3">
                        <span className="mt-0.5 font-display text-[10px] font-semibold text-lp-muted/70">0{i + 1}</span>
                        <p className="text-sm leading-relaxed text-lp-fg/85">
                            {tip}
                        </p>
                    </li>
                ))}
            </ol>

            <div className="flex items-start gap-3 rounded-xl border border-lp-line bg-lp-card-2 p-4">
                <Info size={16} className="mt-0.5 shrink-0 text-lp-azure" />
                <p className="text-xs leading-relaxed text-lp-muted">
                    Based on common refusal patterns and successful applications. Not an official guarantee.
                </p>
            </div>
        </div>
    );
}
