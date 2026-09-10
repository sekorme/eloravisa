"use client"

import type { ComponentType } from "react"
import Link from "next/link"
import { AlertCircle, Check, CheckCheck, FileText, ListChecks, Mic, PenLine, ShieldCheck, Sparkles } from "lucide-react"
import { PREPARATION_TOOLS, type ToolId } from "@/lib/landing/tool-content"
import { AIToolCard } from "./AIToolCard"
import { Display, Eyebrow } from "./ui"
import styles from "./ToolShowcase.module.css"

const ICONS = { "document-review": FileText, "mock-interview": Mic, "sop-assistant": PenLine, "smart-checklist": ListChecks }
const WAVE_HEIGHTS = [12, 22, 34, 20, 44, 30, 54, 40, 24, 46, 62, 34, 50, 26, 40, 56, 34, 20, 42, 28, 16, 28, 12]

function DocumentPreview() {
  return (
    <div className={styles.documentPreview}>
      <div className={styles.paper}>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700"><FileText className="h-4 w-4 text-emerald-700" aria-hidden="true" /> Financial statement</div>
        <span className={styles.paperLabel}>SAMPLE DOCUMENT</span>
        <div className={styles.paperLines} aria-hidden="true"><i /><i /><i /><i /><i /></div>
        <div className={styles.scan} aria-hidden="true" />
        <span className={styles.detected}><CheckCheck className="h-3.5 w-3.5" aria-hidden="true" /> Key sections identified</span>
      </div>
      <div className={styles.reviewNotes}>
        <span className={styles.previewOverline}><Sparkles className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" /> Sample recommendations</span>
        <div className={styles.reviewNote}><Check className="h-4 w-4 shrink-0 text-emerald-700" aria-hidden="true" /><div><strong>Names are consistent</strong><span>Across the sample documents</span></div></div>
        <div className={styles.reviewNote}><AlertCircle className="h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" /><div><strong>Check the statement period</strong><span>Include the required date range</span></div></div>
        <Link href="/legal/privacy-policy" className="mt-2 inline-flex min-h-11 items-center gap-1.5 text-xs text-slate-600 underline decoration-slate-300 underline-offset-4 focus-visible:outline-2 focus-visible:outline-emerald-700"><ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> How your data is handled</Link>
      </div>
    </div>
  )
}

function InterviewPreview() {
  return (
    <div className={styles.interviewPreview}>
      <div className="flex w-full items-center justify-between gap-2 text-[11px] text-slate-300"><span>VOICE PRACTICE · SAMPLE</span><span className="flex items-center gap-1.5 text-emerald-200"><i className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Ready to practise</span></div>
      <div className={styles.miniOrb} aria-hidden="true"><Mic className="h-6 w-6 text-white" /></div>
      <div className={styles.miniWave} aria-hidden="true">{WAVE_HEIGHTS.map((height, index) => <i key={index} style={{ height, animationDelay: `${index * -0.08}s` }} />)}</div>
      <p className="text-center text-sm font-medium text-white">A calm space to find your words.</p>
      <span className="text-[11px] text-slate-400">Simulated waveform · no audio</span>
    </div>
  )
}

function SOPPreview() {
  return (
    <div className={styles.sopPreview}>
      <div className="flex flex-wrap gap-1.5 text-[11px] font-medium text-emerald-800">{["Your background", "Study plans", "Career goals"].map(label => <span key={label} className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1">{label}</span>)}</div>
      <div className={styles.sopPaper}>
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3"><span className="text-xs font-semibold text-slate-700">Statement of purpose</span><PenLine className="h-3.5 w-3.5 text-emerald-700" aria-hidden="true" /></div>
        <p className="mt-3 font-serif text-[15px] leading-7 text-slate-600">My interest in this course grew from <mark className={styles.sopHighlight}>my experience and long-term goals.</mark></p>
        <p className="mt-3 flex items-start gap-2 rounded-lg bg-emerald-50 p-2 text-[11px] leading-5 text-emerald-900"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /> Add a specific example in your own words.</p>
      </div>
    </div>
  )
}

function ChecklistPreview() {
  return (
    <div className={styles.checklistPreview}>
      <div className={styles.checklistRing}>
        <svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="50" fill="none" stroke="#dbeafe" strokeWidth="6" /><circle className={styles.progressArc} cx="60" cy="60" r="50" fill="none" stroke="#2563eb" strokeWidth="6" strokeLinecap="round" strokeDasharray="314.16" strokeDashoffset="78.54" transform="rotate(-90 60 60)" /></svg>
        <div><strong>3 of 4</strong><span>sample items ready</span></div>
      </div>
      <ul className="min-w-0 flex-1 space-y-3 text-xs text-slate-600">
        {["Identity documents", "Academic records", "Travel plans", "Financial evidence"].map((label, index) => <li key={label} className="flex items-center gap-2.5"><span className={index < 3 ? styles.checked : styles.missing}>{index < 3 ? <Check className="h-3 w-3" aria-hidden="true" /> : <AlertCircle className="h-3 w-3" aria-hidden="true" />}</span><span>{label}{index === 3 && <span className="mt-0.5 block text-[10px] font-medium text-amber-800">One item needs attention</span>}</span></li>)}
      </ul>
    </div>
  )
}

const PREVIEWS: Record<ToolId, ComponentType> = { "document-review": DocumentPreview, "mock-interview": InterviewPreview, "sop-assistant": SOPPreview, "smart-checklist": ChecklistPreview }

export function AIToolsBento() {
  return (
    <section id="ai-tools" className="relative scroll-mt-24 bg-lp-page px-4 py-20 md:px-6 md:py-28" aria-labelledby="tools-heading">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-3xl"><Eyebrow><Sparkles className="h-3 w-3 text-lp-azure" aria-hidden="true" /> Your preparation toolkit</Eyebrow><Display as="h2" size="lg" className="mt-5 text-lp-fg"><span id="tools-heading">Everything you need to prepare <span className="text-lp-azure">in one place.</span></span></Display></div>
          <p className="max-w-xs text-sm leading-7 text-lp-muted">Useful tools for the details that matter. Built around your plans, at your pace.</p>
        </div>
        <div className={styles.bento}>
          {PREPARATION_TOOLS.map((tool, index) => { const Preview = PREVIEWS[tool.id]; return <AIToolCard key={tool.id} id={tool.id} icon={ICONS[tool.id]} title={tool.title} eyebrow={tool.eyebrow} description={tool.description} cta={tool.cta} href={tool.href} dark={tool.id === "mock-interview"} className={index === 0 || index === 3 ? styles.wideCard : undefined} demo={<Preview />} /> })}
        </div>
        <p className="mt-6 text-center text-xs leading-6 text-lp-muted">All interfaces use sample content. Actual feedback depends on your information and the tools available on your plan.</p>
      </div>
    </section>
  )
}
