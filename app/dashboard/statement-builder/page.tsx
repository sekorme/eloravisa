"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { onAuthStateChanged } from "firebase/auth"
import { deleteField, doc, onSnapshot, updateDoc } from "firebase/firestore"
import { AlertTriangle, CheckCircle2, Landmark, Loader2, ShieldAlert, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { auth, db } from "@/firebase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getStatementContext, type StatementContext } from "@/action/statementPlan"
import {
  buildStatementPlan,
  LUMP_SOURCES,
  planSteps,
  requiredFunds,
  type StatementPlanInput,
} from "@/lib/statementPlan"
import { GUIDE_GROUPS, guidesFor, type GuideGroup } from "@/lib/documentGuide"
import { fundedByFrom } from "@/lib/onboarding"

/** Saved at users/{uid}.statementPlan. */
interface SavedPlan {
  input: StatementPlanInput
  createdAt: number
  /** Balance the user logged for each plan month. */
  checkins?: Record<string, number>
  /** Documents the user has got. */
  docs?: Record<string, boolean>
}

const DEFAULT_INPUT: StatementPlanInput = {
  currency: "GHS",
  balance: 0,
  monthlyIncome: 0,
  incomeType: "salary",
  monthlyExpenses: 0,
  months: 6,
  fundedBy: "self",
  sponsorAmount: 0,
  lumpSum: 0,
  lumpSource: "none",
  lumpMonth: 1,
  stayMonths: 12,
  extraCosts: 0,
  target: 0,
}

const money = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount)
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString()}`
  }
}

const monthLabel = (ymd: string) => new Date(ymd + "T00:00:00Z").toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" })

const selectClass = "h-9 w-full rounded-md border border-lp-line bg-transparent px-2 text-sm"
const card = "rounded-[1.5rem] border border-lp-line bg-lp-card p-6 lp-shadow"

function NumberField({ id, label, value, onChange, hint }: { id: string; label: string; value: number; onChange: (n: number) => void; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="number" min={0} inputMode="decimal" value={Number.isFinite(value) ? value : 0} onChange={(e) => onChange(Number(e.target.value))} />
      {hint && <p className="text-xs text-lp-muted">{hint}</p>}
    </div>
  )
}

export default function StatementBuilderPage() {
  const [uid, setUid] = useState<string | null>(null)
  const [ctx, setCtx] = useState<StatementContext | null>(null)
  const [saved, setSaved] = useState<SavedPlan | null>(null)
  const [input, setInput] = useState<StatementPlanInput>(DEFAULT_INPUT)
  const [loaded, setLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const set = <K extends keyof StatementPlanInput>(k: K, v: StatementPlanInput[K]) => setInput((p) => ({ ...p, [k]: v }))

  useEffect(() => {
    let unsubDoc: (() => void) | undefined
    const unsub = onAuthStateChanged(auth, async (user) => {
      unsubDoc?.()
      if (!user) return
      setUid(user.uid)
      unsubDoc = onSnapshot(doc(db, "users", user.uid), (snap) => {
        const plan = (snap.get("statementPlan") ?? null) as SavedPlan | null
        setSaved(plan)
        setLoaded((was) => {
          if (!was && plan?.input) setInput({ ...DEFAULT_INPUT, ...plan.input })
          // New plan: start from who the user said is paying during onboarding.
          if (!was && !plan?.input) {
            const fundedBy = fundedByFrom(snap.get("onboarding.sponsor"))
            if (fundedBy) setInput((p) => ({ ...p, fundedBy }))
          }
          return true
        })
      })
      getStatementContext(await user.getIdToken()).then(setCtx).catch(() => {})
    })
    return () => {
      unsub()
      unsubDoc?.()
    }
  }, [])

  // The embassy figure in the account's currency, when we can convert it.
  const suggested = useMemo(() => {
    const req = requiredFunds(ctx?.funds ?? null, input)
    if (!req) return null
    if (req.currency === input.currency) return { ...req, inAccount: req.amount }
    if (req.currency === "USD" && input.currency === "GHS" && ctx?.usdToGhs) return { ...req, inAccount: Math.round(req.amount * ctx.usdToGhs) }
    return { ...req, inAccount: null }
  }, [ctx, input])

  // Prefill the target once, from the embassy figure, if the user has none yet.
  useEffect(() => {
    if (loaded && !saved?.input && input.target === 0 && suggested?.inAccount) set("target", suggested.inAccount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, suggested?.inAccount])

  const startedAt = saved?.createdAt ? new Date(saved.createdAt) : new Date()
  const plan = useMemo(() => buildStatementPlan(input, startedAt), [input, saved?.createdAt]) // eslint-disable-line react-hooks/exhaustive-deps
  const steps = useMemo(() => planSteps(input, plan), [input, plan])
  const guides = useMemo(
    () => guidesFor({ visaType: ctx?.visaType ?? "", fundedBy: input.fundedBy, incomeType: input.incomeType, hasLumpSum: input.lumpSource !== "none" && input.lumpSum > 0 }),
    [ctx?.visaType, input.fundedBy, input.incomeType, input.lumpSource, input.lumpSum],
  )
  const isGhanaian = /ghana/i.test(ctx?.nationality ?? "Ghana")
  const cur = input.currency
  const maxBar = Math.max(plan.accountTarget, ...plan.months.map((m) => m.balance), ...Object.values(saved?.checkins ?? {}), 1)

  const save = async () => {
    if (!uid) return
    if (input.target <= 0) return toast.error("Enter the amount you need to show.")
    setSaving(true)
    try {
      // Restarting the timeline only when the plan is new keeps check-ins aligned with their months.
      await updateDoc(doc(db, "users", uid), {
        "statementPlan.input": input,
        "statementPlan.createdAt": saved?.createdAt ?? Date.now(),
      })
      toast.success("Plan saved")
    } catch {
      toast.error("Couldn't save your plan. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const restart = async () => {
    if (!uid) return
    await updateDoc(doc(db, "users", uid), { "statementPlan.createdAt": Date.now(), "statementPlan.checkins": {} }).catch(() => toast.error("Couldn't restart the plan."))
  }

  const logBalance = async (month: number, value: string) => {
    if (!uid || !saved) return
    const n = Number(value)
    const path = `statementPlan.checkins.${month}`
    await updateDoc(doc(db, "users", uid), { [path]: value === "" || !Number.isFinite(n) ? deleteField() : n }).catch(() => toast.error("Couldn't save that balance."))
  }

  const toggleDoc = async (key: string, have: boolean) => {
    if (!uid) return
    if (!saved) return toast.error("Save your plan first so we can track your documents.")
    await updateDoc(doc(db, "users", uid), { [`statementPlan.docs.${key}`]: have }).catch(() => toast.error("Couldn't update that document."))
  }

  const verdictStyle =
    plan.verdict === "on_track" ? "border-emerald-500/40 bg-emerald-500/10" : plan.verdict === "stretch" ? "border-amber-500/40 bg-amber-500/10" : "border-red-500/40 bg-red-500/10"
  const docsDone = guides.filter((g) => saved?.docs?.[g.key]).length

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 text-lp-fg md:px-8 md:py-10">
      <div className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-lp-line bg-lp-card px-3.5 py-1.5 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">
          <Landmark className="h-3.5 w-3.5 text-lp-azure" /> Statement builder
        </span>
        <h1 className="font-display text-4xl font-semibold tracking-[-0.045em] md:text-5xl">Build a stronger bank statement</h1>
        <p className="max-w-2xl text-lp-muted">
          Tell us where your money stands today. We&apos;ll plan the next 3 to 6 months so your statement shows steady, genuine saving
          {ctx?.destination ? ` for your ${ctx.destination} ${ctx.visaType?.toLowerCase() ?? ""} visa` : ""}, and list the papers that back it up.
        </p>
      </div>

      <div className="flex gap-3 rounded-xl border border-lp-line bg-lp-card-2 p-4 text-sm">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-lp-azure" />
        <p>
          Only real money counts. Borrowing money to sit in your account until the visa is issued, or editing a statement, is treated as fraud:
          banks are often contacted to verify, and it can mean a refusal and a ban. A slower, honest plan is always safer.
        </p>
      </div>

      {/* 1. Questions */}
      <section className={`${card} space-y-6`}>
        <h2 className="font-display text-xl font-semibold">1. Where you are now</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="sb-cur">Account currency</Label>
            <select id="sb-cur" className={selectClass} value={cur} onChange={(e) => set("currency", e.target.value)}>
              {["GHS", "NGN", "USD", "GBP", "EUR", "CAD", "KES", "ZAR"].map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <NumberField id="sb-bal" label="Balance today" value={input.balance} onChange={(n) => set("balance", n)} />
          <div className="space-y-1.5">
            <Label htmlFor="sb-funded">Who&apos;s paying for the trip</Label>
            <select id="sb-funded" className={selectClass} value={input.fundedBy} onChange={(e) => set("fundedBy", e.target.value as StatementPlanInput["fundedBy"])}>
              <option value="self">Me</option>
              <option value="sponsor">A sponsor (plan for their account)</option>
              <option value="both">Me and a sponsor</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sb-inctype">Main income</Label>
            <select id="sb-inctype" className={selectClass} value={input.incomeType} onChange={(e) => set("incomeType", e.target.value as StatementPlanInput["incomeType"])}>
              <option value="salary">Salary</option>
              <option value="business">My own business</option>
              <option value="irregular">Irregular (freelance, trading, gigs)</option>
              <option value="none">No regular income</option>
            </select>
          </div>
          <NumberField id="sb-inc" label="Money coming in each month" value={input.monthlyIncome} onChange={(n) => set("monthlyIncome", n)} />
          <NumberField id="sb-exp" label="Money going out each month" value={input.monthlyExpenses} onChange={(n) => set("monthlyExpenses", n)} hint="Rent, food, transport, family support." />
          {input.fundedBy === "both" && (
            <NumberField id="sb-sponsor" label="Amount your sponsor will show" value={input.sponsorAmount} onChange={(n) => set("sponsorAmount", n)} />
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="sb-lumpsrc">Expecting a one-off amount?</Label>
            <select id="sb-lumpsrc" className={selectClass} value={input.lumpSource} onChange={(e) => set("lumpSource", e.target.value as StatementPlanInput["lumpSource"])}>
              {LUMP_SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          {input.lumpSource !== "none" && (
            <>
              <NumberField id="sb-lump" label="How much" value={input.lumpSum} onChange={(n) => set("lumpSum", n)} />
              <div className="space-y-1.5">
                <Label htmlFor="sb-lumpm">Arrives in plan month</Label>
                <select id="sb-lumpm" className={selectClass} value={input.lumpMonth} onChange={(e) => set("lumpMonth", Number(e.target.value))}>
                  {Array.from({ length: input.months }, (_, i) => <option key={i + 1} value={i + 1}>Month {i + 1}</option>)}
                </select>
              </div>
            </>
          )}
        </div>

        <h2 className="font-display text-xl font-semibold">2. What you need to show</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="sb-months">Months to build</Label>
            <select id="sb-months" className={selectClass} value={input.months} onChange={(e) => set("months", Number(e.target.value))}>
              {[3, 4, 5, 6].map((m) => <option key={m} value={m}>{m} months</option>)}
            </select>
          </div>
          <NumberField id="sb-stay" label="Length of stay (months)" value={input.stayMonths} onChange={(n) => set("stayMonths", n)} />
          <NumberField id="sb-fees" label={`Fees still to pay${suggested ? ` (${suggested.currency})` : ""}`} value={input.extraCosts} onChange={(n) => set("extraCosts", n)} hint="e.g. tuition balance" />
          <NumberField id="sb-target" label={`Target to show (${cur})`} value={input.target} onChange={(n) => set("target", n)} />
        </div>
        <p className="text-xs text-lp-muted">
          {suggested
            ? <>The embassy guide asks for about {money(suggested.amount, suggested.currency)} ({suggested.basis}){suggested.inAccount !== null && suggested.currency !== cur ? `, about ${money(suggested.inAccount, cur)} at today's rate` : ""}.{" "}
                {suggested.inAccount !== null
                  ? <button type="button" className="font-medium text-lp-azure underline" onClick={() => set("target", suggested.inAccount!)}>Use this figure</button>
                  : `Convert it to ${cur} at today's bank rate and enter it above.`}{" "}
                Showing 10-20% more than the minimum gives a safety margin for exchange-rate moves.</>
            : "We don't have an official figure for your destination yet. Check the embassy's website for the amount and enter it above."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button onClick={save} className="rounded-full" disabled={saving || !uid}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : saved ? "Update plan" : "Save my plan"}
          </Button>
          {saved && <Button variant="outline" className="rounded-full" onClick={restart}>Restart from this month</Button>}
        </div>
      </section>

      {/* 2. The plan */}
      {input.target > 0 && (
        <section className="grid gap-6 lg:grid-cols-3">
          <div className={`rounded-[1.5rem] border p-6 ${verdictStyle}`}>
            <p className="flex items-center gap-2 text-sm font-medium">
              {plan.verdict === "on_track" ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
              {plan.verdict === "on_track" ? "On track" : plan.verdict === "stretch" ? "Nearly there" : "Not enough yet"}
            </p>
            <p className="mt-1 font-display text-2xl font-semibold">{money(plan.endBalance, cur)}</p>
            <p className="mt-1 text-sm">expected in {plan.months.length} months, against {money(plan.accountTarget, cur)} needed{input.fundedBy === "both" ? " from your account" : ""}.</p>
            {plan.shortfall > 0 && <p className="mt-2 text-sm font-medium">Short by {money(plan.shortfall, cur)}.</p>}
            <dl className="mt-4 space-y-1 text-sm">
              <div className="flex justify-between"><dt className="text-lp-muted">You save now</dt><dd>{money(Math.max(0, plan.monthlySaving), cur)}/mo</dd></div>
              <div className="flex justify-between"><dt className="text-lp-muted">Needed</dt><dd>{money(plan.neededPerMonth, cur)}/mo</dd></div>
            </dl>
          </div>

          <div className={`${card} lg:col-span-2`}>
            <h2 className="mb-1 flex items-center gap-2 font-display text-xl font-semibold"><TrendingUp className="h-5 w-5 text-lp-azure" /> Month by month</h2>
            <p className="mb-4 text-xs text-lp-muted">
              Planned balance at the start of each month; the line marks your target.{saved ? " Log what your account actually shows to track progress." : " Save your plan to log your real balance each month."}
            </p>
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-lp-muted">
                <tr><th className="pb-2 font-normal">Month</th><th className="pb-2 font-normal">Planned balance</th><th className="w-36 pb-2 font-normal">Actual</th></tr>
              </thead>
              <tbody>
                {plan.months.map((m) => {
                  const actual = saved?.checkins?.[String(m.month)]
                  const hasActual = typeof actual === "number"
                  return (
                    <tr key={m.month} className="border-t border-lp-line">
                      <td className="py-2 pr-3 align-middle whitespace-nowrap">{monthLabel(m.date)}</td>
                      <td className="py-2 pr-3 align-middle">
                        <div className="relative h-6" title={`${money(m.balance, cur)}${m.lump ? ` incl. ${money(m.lump, cur)} one-off` : ""}`}>
                          <div className="absolute inset-y-1 left-0 rounded-r-[4px] bg-lp-azure/70" style={{ width: `${(m.balance / maxBar) * 100}%` }} />
                          <div className="absolute inset-y-0 w-0.5 bg-lp-fg/60" style={{ left: `${(plan.accountTarget / maxBar) * 100}%` }} aria-hidden="true" />
                          <span className="relative pl-2 text-xs font-medium leading-6">{money(m.balance, cur)}{m.lump ? " (one-off)" : ""}</span>
                        </div>
                      </td>
                      <td className="py-2 align-middle">
                        <div className="flex items-center gap-1.5">
                          <Input
                            aria-label={`Actual balance ${monthLabel(m.date)}`}
                            type="number"
                            min={0}
                            className="h-8"
                            disabled={!saved}
                            defaultValue={hasActual ? actual : ""}
                            key={`${saved?.createdAt}-${m.month}-${actual ?? ""}`}
                            onBlur={(e) => e.target.value !== String(actual ?? "") && logBalance(m.month, e.target.value)}
                          />
                          {hasActual && (actual >= m.balance
                            ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-label="On track" />
                            : <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" aria-label="Behind plan" />)}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {input.target > 0 && (plan.warnings.length > 0 || plan.options.length > 0) && (
        <section className="grid gap-6 lg:grid-cols-2">
          {plan.warnings.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-display text-xl font-semibold">What an officer might question</h2>
              {plan.warnings.map((w) => (
                <div key={w} className="flex gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><p>{w}</p>
                </div>
              ))}
            </div>
          )}
          {plan.options.length > 0 && (
            <div className={card}>
              <h2 className="mb-2 font-display text-xl font-semibold">Ways to close the gap</h2>
              <ul className="list-disc space-y-1.5 pl-5 text-sm">{plan.options.map((o) => <li key={o}>{o}</li>)}</ul>
            </div>
          )}
        </section>
      )}

      {/* 3. Habits */}
      <section className="space-y-3">
        <h2 className="font-display text-xl font-semibold">How to build it</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.when} className={card}>
              <p className="mb-2 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">{s.when}</p>
              <ul className="list-disc space-y-1.5 pl-5 text-sm">{s.items.map((i) => <li key={i}>{i}</li>)}</ul>
            </div>
          ))}
        </div>
        <p className="text-sm text-lp-muted">
          When your statement is ready, upload it on <Link href="/dashboard/application" className="font-medium text-lp-azure underline">My Application</Link> and run the{" "}
          <Link href="/dashboard/finances" className="font-medium text-lp-azure underline">Funds Check</Link>.
        </p>
      </section>

      {/* 4. Documents */}
      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold">Documents that back it up</h2>
            <p className="text-sm text-lp-muted">
              Picked for your {ctx?.visaType ? `${ctx.visaType.toLowerCase()} visa, ` : ""}income and who&apos;s paying. Fees and waiting times change, so confirm them at the office.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-lp-line bg-lp-card px-3 py-1 text-xs text-lp-muted">{docsDone}/{guides.length} ready</span>
        </div>
        {(Object.keys(GUIDE_GROUPS) as GuideGroup[]).map((group) => {
          const items = guides.filter((g) => g.group === group)
          if (items.length === 0) return null
          return (
            <div key={group} className="space-y-3">
              <h3 className="font-display text-[11px] font-medium uppercase tracking-[0.18em] text-lp-muted">{GUIDE_GROUPS[group]}</h3>
              {items.map((g) => {
                const have = !!saved?.docs?.[g.key]
                return (
                  <details key={g.key} className={`group rounded-xl border border-lp-line bg-lp-card p-4 ${have ? "opacity-75" : ""}`}>
                    <summary className="flex cursor-pointer list-none items-center gap-3">
                      <input
                        type="checkbox"
                        checked={have}
                        onChange={(e) => toggleDoc(g.key, e.target.checked)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`I have my ${g.title.toLowerCase()}`}
                        className="h-4 w-4 accent-[var(--lp-azure,#2563eb)]"
                      />
                      <span className={`font-medium ${have ? "line-through" : ""}`}>{g.title}</span>
                      <span className="ml-auto text-xs text-lp-muted group-open:hidden">How to get it</span>
                    </summary>
                    <div className="mt-3 space-y-2 pl-7 text-sm">
                      <p className="text-lp-muted">{g.why}</p>
                      <ol className="list-decimal space-y-1 pl-5">{g.steps.map((s) => <li key={s}>{s}</li>)}</ol>
                      {g.ghana && isGhanaian && <p><span className="font-medium">In Ghana:</span> {g.ghana}</p>}
                      {g.tips?.map((t) => <p key={t} className="text-xs text-lp-muted">Tip: {t}</p>)}
                      {g.key === "sponsorLetter" && <Link href="/dashboard/draft" className="inline-block text-sm font-medium text-lp-azure underline">Open AI Document Draft</Link>}
                    </div>
                  </details>
                )
              })}
            </div>
          )
        })}
      </section>

      <p className="text-xs text-lp-muted">This is guidance, not financial or legal advice. Embassies decide case by case; always check the official requirements for your visa.</p>
    </div>
  )
}
