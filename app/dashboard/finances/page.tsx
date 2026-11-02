"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { onAuthStateChanged } from "firebase/auth"
import { doc, onSnapshot } from "firebase/firestore"
import { AlertTriangle, CheckCircle2, Coins, Loader2, Wallet } from "lucide-react"
import { toast } from "sonner"
import { auth, db } from "@/firebase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { analyzeFinances, type FinanceInput, type FinancialAnalysis } from "@/action/finance"
import { TOKEN_COSTS } from "@/lib/billing/plans"

const money = (amount: number | null | undefined, currency: string) => {
  if (amount === null || amount === undefined) return "—"
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount)
  } catch {
    return `${currency} ${Math.round(amount).toLocaleString()}`
  }
}

const SEVERITY = {
  high: "border-red-500/40 bg-red-500/10 text-red-800 dark:text-red-300",
  medium: "border-amber-500/40 bg-amber-500/10 text-amber-900 dark:text-amber-200",
  low: "border-lp-line bg-lp-card-2",
}

export default function FinancesPage() {
  const [analysis, setAnalysis] = useState<(FinancialAnalysis & { input?: FinanceInput }) | null>(null)
  const [hasStatement, setHasStatement] = useState<boolean | null>(null)
  const [input, setInput] = useState<FinanceInput>({ stayMonths: 12, extraCosts: 0, fundedBy: "self" })
  const [running, setRunning] = useState(false)

  useEffect(() => {
    let unsubDoc: (() => void) | undefined
    const unsub = onAuthStateChanged(auth, (user) => {
      unsubDoc?.()
      if (!user) return
      unsubDoc = onSnapshot(doc(db, "users", user.uid), (snap) => {
        const saved = snap.get("financialAnalysis") ?? null
        setAnalysis(saved)
        if (saved?.input) setInput(saved.input)
        setHasStatement(!!snap.get("documents.financialStatement"))
      })
    })
    return () => {
      unsub()
      unsubDoc?.()
    }
  }, [])

  const run = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = auth.currentUser
    if (!user) return
    setRunning(true)
    try {
      const res = await analyzeFinances(await user.getIdToken(), input)
      if (res.success) toast.success("Funds check complete")
      else toast.error(res.error)
    } catch {
      toast.error("The funds check failed. Please try again.")
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 text-lp-fg md:px-8 md:py-10">
      <div className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-lp-line bg-lp-card px-3.5 py-1.5 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">
          <Wallet className="h-3.5 w-3.5 text-lp-azure" /> Funds check
        </span>
        <h1 className="font-display text-4xl font-semibold tracking-[-0.045em] md:text-5xl">Will your bank statement pass?</h1>
        <p className="max-w-2xl text-lp-muted">
          We read your financial statement like a visa officer would: sudden deposits, low balances, irregular income, and whether you have enough for your stay.
        </p>
      </div>

      {hasStatement === false ? (
        <div className="rounded-[1.5rem] border border-lp-line bg-lp-card p-6">
          <p className="font-medium">Upload your financial statement first.</p>
          <Link href="/dashboard/application" className="mt-2 inline-block text-sm font-medium text-lp-azure underline">Go to My Application</Link>
        </div>
      ) : (
        <form onSubmit={run} className="grid gap-4 rounded-[1.5rem] border border-lp-line bg-lp-card p-6 lp-shadow sm:grid-cols-4 sm:items-end">
          <div className="space-y-1.5">
            <Label htmlFor="fc-months">Length of stay (months)</Label>
            <Input id="fc-months" type="number" min={1} max={120} value={input.stayMonths} onChange={(e) => setInput({ ...input, stayMonths: Number(e.target.value) })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fc-extra">Fees still to pay (e.g. tuition)</Label>
            <Input id="fc-extra" type="number" min={0} value={input.extraCosts} onChange={(e) => setInput({ ...input, extraCosts: Number(e.target.value) })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="fc-funded">Who&apos;s paying</Label>
            <select id="fc-funded" className="h-9 w-full rounded-md border border-lp-line bg-transparent px-2 text-sm" value={input.fundedBy} onChange={(e) => setInput({ ...input, fundedBy: e.target.value as FinanceInput["fundedBy"] })}>
              <option value="self">Me</option>
              <option value="sponsor">A sponsor</option>
              <option value="both">Both</option>
            </select>
          </div>
          <Button type="submit" className="rounded-full" disabled={running || hasStatement === null}>
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Coins className="mr-1.5 h-4 w-4" /> Check ({TOKEN_COSTS.FINANCIAL_ANALYSIS} tokens)</>}
          </Button>
        </form>
      )}

      {analysis && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-[1.5rem] border border-lp-line bg-lp-card p-6 lp-shadow">
              <p className="text-sm">{analysis.summary}</p>
              <dl className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
                {([
                  ["Closing balance", money(analysis.closingBalance, analysis.currency)],
                  ["Average balance", money(analysis.averageBalance, analysis.currency)],
                  ["Lowest balance", money(analysis.lowestBalance, analysis.currency)],
                  ["Monthly income", money(analysis.monthlyIncome, analysis.currency)],
                ] as const).map(([k, v]) => (
                  <div key={k}><dt className="text-lp-muted">{k}</dt><dd className="font-display text-lg font-semibold">{v}</dd></div>
                ))}
              </dl>
              <p className="mt-3 text-xs text-lp-muted">
                {analysis.periodStart && analysis.periodEnd ? `Statement covers ${analysis.periodStart} to ${analysis.periodEnd} (about ${analysis.monthsCovered} months).` : "Statement period not found."}
                {analysis.accountHolder && ` Account holder: ${analysis.accountHolder}.`}
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="font-display text-xl font-semibold">What an officer might question</h2>
              {analysis.flags.length === 0 ? (
                <p className="flex items-center gap-2 text-sm text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Nothing unusual found.</p>
              ) : analysis.flags.map((f, i) => (
                <div key={i} className={`flex gap-3 rounded-xl border p-4 text-sm ${SEVERITY[f.severity]}`}>
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p>{f.detail}</p>
                    {(f.date || f.amount) && <p className="mt-1 text-xs opacity-80">{[f.date, f.amount !== undefined && money(f.amount, analysis.currency)].filter(Boolean).join(" · ")}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className={`rounded-[1.5rem] border p-6 ${analysis.coverage === "covered" ? "border-emerald-500/40 bg-emerald-500/10" : analysis.coverage === "short" ? "border-red-500/40 bg-red-500/10" : "border-lp-line bg-lp-card"}`}>
              <p className="text-sm font-medium">Enough for your stay?</p>
              {analysis.required ? (
                <>
                  <p className="mt-1 font-display text-2xl font-semibold">
                    {analysis.coverage === "covered" ? "Yes" : analysis.coverage === "short" ? `Short by ${money(analysis.shortfall, analysis.required.currency)}` : "Can't tell"}
                  </p>
                  <p className="mt-2 text-xs text-lp-muted">Needed: about {money(analysis.required.amount, analysis.required.currency)} ({analysis.required.basis}).</p>
                  {analysis.coverage === "unknown" && <p className="mt-1 text-xs text-lp-muted">Your statement is in {analysis.currency}, which we can&apos;t convert automatically. Compare the figures yourself.</p>}
                </>
              ) : (
                <p className="mt-1 text-sm text-lp-muted">We don&apos;t have an official funds figure for your destination yet, so we can&apos;t compare. The flags still apply.</p>
              )}
            </div>
            {analysis.advice.length > 0 && (
              <div className="rounded-[1.5rem] border border-lp-line bg-lp-card p-6">
                <p className="mb-2 text-sm font-medium">What to do</p>
                <ul className="list-disc space-y-1.5 pl-5 text-sm">{analysis.advice.map((a) => <li key={a}>{a}</li>)}</ul>
              </div>
            )}
            <p className="text-xs text-lp-muted">Checked {new Date(analysis.analysedAt).toLocaleString()}. This is guidance, not a guarantee; embassies decide case by case.</p>
          </div>
        </div>
      )}
    </div>
  )
}
