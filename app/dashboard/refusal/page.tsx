"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { onAuthStateChanged } from "firebase/auth"
import { doc, onSnapshot, updateDoc } from "firebase/firestore"
import { getDownloadURL, ref, uploadBytes } from "firebase/storage"
import { ArrowRight, Coins, FileWarning, HeartHandshake, Loader2, Scale, Upload } from "lucide-react"
import { toast } from "sonner"
import { auth, db, storage } from "@/firebase/client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { analyzeRefusalLetter, type RefusalAnalysis, type RefusalCategory } from "@/action/refusal"
import { TOKEN_COSTS } from "@/lib/billing/plans"

const CATEGORY_LABEL: Record<RefusalCategory, string> = {
  ties: "Ties to home",
  funds: "Funds",
  purpose: "Purpose of travel",
  documents: "Documents",
  travel_history: "Travel history",
  credibility: "Credibility",
  eligibility: "Eligibility",
  other: "Other",
}

interface Saved {
  analysis: RefusalAnalysis
  analysedAt: number
  done?: Record<string, boolean>
}

export default function RefusalPage() {
  const [saved, setSaved] = useState<Saved | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [working, setWorking] = useState<"upload" | "analyse" | null>(null)

  useEffect(() => {
    let unsubDoc: (() => void) | undefined
    const unsub = onAuthStateChanged(auth, (user) => {
      unsubDoc?.()
      if (!user) return
      unsubDoc = onSnapshot(doc(db, "users", user.uid), (snap) => {
        setSaved((snap.get("refusalRecovery") as Saved) ?? null)
        setLoaded(true)
      })
    })
    return () => {
      unsub()
      unsubDoc?.()
    }
  }, [])

  const analyse = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = auth.currentUser
    if (!user || !file) return
    if (file.size > 20 * 1024 * 1024) return toast.error("The file is too large (20MB max).")
    if (!/^(application\/pdf|image\/)/.test(file.type)) return toast.error("Upload a PDF or a photo of the letter.")
    try {
      setWorking("upload")
      const fileRef = ref(storage, `users/${user.uid}/documents/refusalLetter_${Date.now()}_${file.name.replace(/[^\w.-]/g, "_")}`)
      await uploadBytes(fileRef, file, { contentType: file.type })
      const url = await getDownloadURL(fileRef)
      setWorking("analyse")
      const res = await analyzeRefusalLetter(await user.getIdToken(), url, file.type)
      if (res.success) {
        toast.success("Your recovery plan is ready")
        setFile(null)
      } else {
        toast.error(res.error)
      }
    } catch (err) {
      console.error(err)
      toast.error("Upload failed. Please try again.")
    } finally {
      setWorking(null)
    }
  }

  const toggleStep = async (i: number, value: boolean) => {
    const user = auth.currentUser
    if (!user) return
    await updateDoc(doc(db, "users", user.uid), { [`refusalRecovery.done.${i}`]: value }).catch(() => toast.error("Couldn't save that"))
  }

  const a = saved?.analysis

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-6 text-lp-fg md:px-8 md:py-10">
      <div className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-lp-line bg-lp-card px-3.5 py-1.5 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">
          <HeartHandshake className="h-3.5 w-3.5 text-lp-azure" /> Refusal recovery
        </span>
        <h1 className="font-display text-4xl font-semibold tracking-[-0.045em] md:text-5xl">A refusal isn&apos;t the end.</h1>
        <p className="max-w-2xl text-lp-muted">
          Upload your refusal letter. We&apos;ll explain each reason in plain language, show you exactly what to fix, and build a plan to reapply stronger.
        </p>
      </div>

      <form onSubmit={analyse} className="flex flex-col gap-3 rounded-[1.5rem] border border-lp-line bg-lp-card p-6 lp-shadow sm:flex-row sm:items-center">
        <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-lp-line p-4 hover:bg-lp-sky">
          <Upload className="h-5 w-5 text-lp-azure" />
          <span className="text-sm">{file ? file.name : saved ? "Upload a different refusal letter (PDF or photo)" : "Choose your refusal letter (PDF or photo)"}</span>
          <input type="file" accept="application/pdf,image/*" className="sr-only" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <Button type="submit" className="rounded-full" disabled={!file || working !== null}>
          {working ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> {working === "upload" ? "Uploading…" : "Reading your letter…"}</> : <><Coins className="mr-1.5 h-4 w-4" /> Analyse ({TOKEN_COSTS.REFUSAL_ANALYSIS} tokens)</>}
        </Button>
      </form>

      {!loaded ? null : !a ? (
        <p className="text-sm text-lp-muted">Your letter stays private to your account. It&apos;s stored with your other documents and only used for this analysis.</p>
      ) : (
        <div className="space-y-6">
          <div className="rounded-[1.5rem] border border-lp-line bg-lp-card p-6 lp-shadow">
            <p className="text-xs text-lp-muted">
              {[a.country, a.refusalDate && `refused ${new Date(a.refusalDate).toLocaleDateString()}`, a.legalBasis && `under ${a.legalBasis}`].filter(Boolean).join(" · ")}
            </p>
            <p className="mt-2">{a.summary}</p>
          </div>

          <div className="space-y-4">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.03em]">Why you were refused</h2>
            {a.reasons.map((r, i) => (
              <div key={i} className="space-y-3 rounded-[1.5rem] border border-lp-line bg-lp-card p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-2">
                    <FileWarning className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                    <p className="font-medium">{r.plain}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-lp-sky px-2.5 py-0.5 text-xs text-lp-azure">{CATEGORY_LABEL[r.category] ?? r.category}</span>
                </div>
                {r.quote && <blockquote className="border-l-2 border-lp-line pl-3 text-sm italic text-lp-muted">&ldquo;{r.quote}&rdquo;</blockquote>}
                <div>
                  <p className="text-sm font-medium">What to fix</p>
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-sm">{r.whatToFix.map((w) => <li key={w}>{w}</li>)}</ul>
                </div>
                {r.documentKeys.length > 0 && (
                  <Link href="/dashboard/application" className="inline-flex items-center gap-1 text-sm font-medium text-lp-azure">
                    Update these documents <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-3 rounded-[1.5rem] border border-lp-line bg-lp-card p-6 lg:col-span-2">
              <h2 className="font-display text-xl font-semibold">Your plan to reapply</h2>
              <ol className="space-y-2">
                {a.plan.map((p, i) => (
                  <li key={i}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2 hover:bg-lp-sky">
                      <Checkbox checked={!!saved?.done?.[i]} onCheckedChange={(v) => toggleStep(i, v === true)} className="mt-1" />
                      <span className={saved?.done?.[i] ? "text-lp-muted line-through" : ""}>
                        <span className="block font-medium">{p.step} <span className="text-xs font-normal text-lp-muted">· {p.when}</span></span>
                        <span className="block text-sm text-lp-muted">{p.detail}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ol>
            </div>
            <div className="space-y-4">
              <div className="rounded-[1.5rem] border border-lp-line bg-lp-card p-6">
                <p className="text-sm font-medium">When to reapply</p>
                <p className="mt-1 text-sm text-lp-muted">{a.reapplyAdvice}</p>
              </div>
              {a.canAppeal && (
                <div className="rounded-[1.5rem] border border-amber-500/40 bg-amber-500/10 p-6">
                  <p className="flex items-center gap-1.5 text-sm font-medium"><Scale className="h-4 w-4" /> You may be able to appeal</p>
                  <p className="mt-1 text-sm">{a.appealNote}</p>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <Button asChild variant="outline" className="rounded-full"><Link href="/dashboard/finances">Check your funds</Link></Button>
                <Button asChild variant="outline" className="rounded-full"><Link href="/dashboard/ai-mock-interview">Practise the interview</Link></Button>
              </div>
            </div>
          </div>
          <p className="text-xs text-lp-muted">This is guidance to help you prepare, not legal advice. For appeals, consider a licensed immigration adviser.</p>
        </div>
      )}
    </div>
  )
}
