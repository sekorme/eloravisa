"use client"

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { AlertTriangle, ArrowLeftRight, ArrowRight, CheckCircle2, FileText, FolderOpen, Info, ListChecks } from "lucide-react"
import { READINESS_DEMO, PREVIEW_LABEL } from "@/lib/landing/content"
import { trackEvent } from "@/lib/analytics"
import { cn } from "@/lib/utils"
import { Display, Eyebrow } from "./ui"
import styles from "./JourneySections.module.css"

const { before, after } = READINESS_DEMO

type View = "before" | "after"

function BeforePanel({ comparison = false }: { comparison?: boolean }) {
  return (
    <div className={cn("h-full bg-lp-card-2", comparison && "grid grid-cols-2", styles.comparisonPanel)}>
      <div className="flex flex-col p-5 md:p-7">
        <div className="mb-5 flex items-center gap-2 text-lp-muted"><FileText className="h-4 w-4" aria-hidden="true" /><h3 className="text-sm font-semibold">{before.label}</h3></div>
        <ul className="space-y-2">
          {before.files.map((file) => <li key={file.name} className="rounded-xl border border-dashed border-lp-muted/35 bg-lp-card/65 px-3 py-2.5"><p className="break-words font-mono text-xs text-lp-fg">{file.name}</p>{file.issue && <p className="mt-1.5 flex items-start gap-1.5 text-[11px] leading-relaxed text-amber-800 dark:text-amber-300"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />{file.issue}</p>}</li>)}
        </ul>
        <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3"><p className="flex items-start gap-2 text-xs leading-relaxed text-rose-700 dark:text-rose-300"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span>Missing: {before.missing}</span></p></div>
        <p className="mt-auto pt-5 text-[10px] font-medium uppercase tracking-[0.12em] text-lp-muted">{before.status}</p>
      </div>
      {comparison && <div className="flex items-center justify-center border-l border-dashed border-lp-line" aria-hidden="true"><div className="relative flex h-36 w-28 -rotate-6 items-center justify-center rounded-2xl border border-lp-muted/15 bg-lp-card/60 shadow-sm"><FileText className="h-10 w-10 text-lp-muted/25" strokeWidth={1} /><div className="absolute inset-0 translate-x-3 translate-y-2 rotate-12 rounded-2xl border border-lp-muted/15" /></div></div>}
    </div>
  )
}

function AfterPanel({ comparison = false }: { comparison?: boolean }) {
  return (
    <div className={cn("h-full bg-lp-card", comparison && "grid grid-cols-2", styles.comparisonPanel)}>
      {comparison && <div className="flex items-center justify-center border-r border-lp-line bg-[radial-gradient(ellipse_at_center,rgba(37,99,235,0.06),transparent_70%)]" aria-hidden="true"><div className="flex h-32 w-32 items-center justify-center rounded-full border border-lp-azure/10"><div className="flex h-24 w-24 items-center justify-center rounded-full border border-lp-azure/20 bg-lp-azure/5"><FolderOpen className="h-10 w-10 text-lp-azure/60" strokeWidth={1} /></div></div></div>}
      <div className="flex flex-col p-5 md:p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2"><h3 className="flex items-center gap-2 text-sm font-semibold text-lp-fg"><FolderOpen className="h-4 w-4 text-lp-azure" aria-hidden="true" />{after.label}</h3><span className="rounded-full bg-lp-azure/8 px-2.5 py-1 text-[10px] font-semibold text-lp-azure">{after.readiness}</span></div>
        <ul className="space-y-2">
          {after.groups.map((group) => <li key={group.name} className="flex items-center justify-between gap-2 rounded-xl border border-lp-line bg-lp-card-2/45 px-3 py-2.5"><span className="flex items-center gap-2 text-xs font-medium text-lp-fg">{group.complete ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" /> : <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-700 dark:text-amber-300" aria-hidden="true" />}{group.name}</span><span className="shrink-0 text-[11px] text-lp-muted">{group.count}<span className="sr-only"> items {group.complete ? "complete" : "incomplete"}</span></span></li>)}
        </ul>
        <div className="mt-4 rounded-xl border border-lp-azure/15 bg-lp-azure/5 p-3"><p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-lp-azure"><ListChecks className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />Recommended next actions</p><ul className="space-y-2">{after.actions.map((action) => <li key={action} className="flex items-start gap-2 text-[11px] leading-relaxed text-lp-muted"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-lp-azure" aria-hidden="true" />{action}</li>)}</ul></div>
        <p className="mt-auto pt-4 text-[10px] text-lp-muted">Preparation score · illustrative sample</p>
      </div>
    </div>
  )
}

export function DocumentReadinessDemo() {
  const [position, setPosition] = useState(50)
  const [tab, setTab] = useState<View>("after")
  const frameRef = useRef<HTMLDivElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  function trackInteraction(label: string) {
    trackEvent("tool_card_interaction", { label, location: "document-readiness" })
  }

  function moveDivider(event: PointerEvent<HTMLDivElement>) {
    const rect = frameRef.current?.getBoundingClientRect()
    if (!rect) return
    setPosition(Math.round(Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100))))
  }

  function selectTab(value: View, focus = false) {
    setTab(value)
    if (focus) tabRefs.current[value === "before" ? 0 : 1]?.focus()
    trackInteraction(`comparison-${value}`)
  }

  function handleTabKeys(event: KeyboardEvent<HTMLButtonElement>) {
    if (["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) {
      event.preventDefault()
      selectTab(event.key === "Home" ? "before" : event.key === "End" ? "after" : tab === "before" ? "after" : "before", true)
    }
  }

  return (
    <section id="document-readiness" aria-labelledby="readiness-heading" className="relative scroll-mt-24 bg-lp-page py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="mx-auto mb-9 max-w-3xl text-center md:mb-12">
          <Eyebrow>See the difference</Eyebrow>
          <Display size="lg" className="mt-5 text-lp-fg"><span id="readiness-heading">{READINESS_DEMO.headline}</span></Display>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-lp-muted">Turn scattered files into a clear picture of what you have, what needs a review, and what to do next.</p>
        </div>
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><span className="rounded-full border border-lp-line bg-lp-card px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.13em] text-lp-muted">{PREVIEW_LABEL} · Illustrative documents</span><span className="hidden items-center gap-2 text-xs text-lp-muted md:inline-flex"><ArrowLeftRight className="h-3.5 w-3.5" aria-hidden="true" />Drag to compare</span></div>
          <div className="md:hidden">
            <div role="tablist" aria-label="Compare document organization" className="mb-4 flex rounded-full border border-lp-line bg-lp-card p-1">
              {(["before", "after"] as const).map((view, index) => <button key={view} ref={(element) => { tabRefs.current[index] = element }} id={`readiness-tab-${view}`} type="button" role="tab" aria-controls={`readiness-panel-${view}`} aria-selected={tab === view} tabIndex={tab === view ? 0 : -1} onClick={() => selectTab(view)} onKeyDown={handleTabKeys} className={cn("min-h-11 flex-1 rounded-full px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lp-azure", tab === view ? "bg-lp-navy text-white" : "text-lp-muted")}>{view === "before" ? "Before" : "After Elora"}</button>)}
            </div>
            {(["before", "after"] as const).map((view) => <div key={view} id={`readiness-panel-${view}`} role="tabpanel" aria-labelledby={`readiness-tab-${view}`} hidden={tab !== view} tabIndex={0} className={`${styles.mobileDocumentPanel} overflow-hidden rounded-3xl border border-lp-line bg-lp-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lp-azure`}>{view === "before" ? <BeforePanel /> : <AfterPanel />}</div>)}
          </div>

          <div className="hidden md:block">
            <div ref={frameRef} className={`${styles.comparisonFrame} select-none overflow-hidden rounded-[1.75rem] border border-lp-line shadow-[0_20px_70px_-40px_rgba(11,36,71,0.25)]`}>
              <div aria-hidden="true"><BeforePanel comparison /></div>
              <div aria-hidden="true" className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${position}%)` }}><AfterPanel comparison /></div>
              <div
                aria-hidden="true"
                className={`${styles.divider} absolute inset-y-0 z-10 w-11 -translate-x-1/2`}
                style={{ left: `${position}%` }}
                onPointerDown={(event) => { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); moveDivider(event) }}
                onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) moveDivider(event) }}
                onPointerUp={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); trackInteraction("comparison-divider") }}
              ><span className="absolute bottom-0 left-1/2 top-0 w-0.5 -translate-x-1/2 bg-lp-azure/55" /><span className="absolute left-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border-4 border-lp-card bg-lp-azure text-white shadow-lg"><ArrowLeftRight className="h-4 w-4" /></span></div>
            </div>
            <div className="sr-only"><BeforePanel /><AfterPanel /></div>
            <div className="mx-auto mt-4 max-w-lg px-1">
              <label htmlFor="readiness-comparison" className="flex justify-between gap-4 text-xs font-medium text-lp-muted"><span>Before Elora</span><span className="sr-only">Comparison divider position</span><span>After Elora</span></label>
              <input id="readiness-comparison" type="range" min={0} max={100} step={1} value={position} onChange={(event) => setPosition(Number(event.target.value))} onPointerUp={() => trackInteraction("comparison-range")} aria-valuetext={`${position}% before Elora, ${100 - position}% after Elora`} aria-describedby="readiness-slider-help" className={styles.comparisonRange} />
              <p id="readiness-slider-help" className="text-center text-[11px] text-lp-muted">Drag the divider or use this slider with the arrow keys.</p>
            </div>
          </div>
          <p className="mx-auto mt-6 flex max-w-2xl items-start justify-center gap-2 text-center text-xs leading-relaxed text-lp-muted"><Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /><span>{READINESS_DEMO.disclaimer}</span></p>
          <div className="mt-6 flex justify-center"><a href="/signup" onClick={() => trackEvent("section_cta_click", { label: "organize-documents", location: "document-readiness" })} className="group inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-lp-azure focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lp-azure">Organize my documents<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" /></a></div>
        </div>
      </div>
    </section>
  )
}
