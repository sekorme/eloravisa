"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { deleteField, doc, getDoc, updateDoc } from "firebase/firestore"
import { gsap } from "gsap"
import confetti from "canvas-confetti"
import countries from "world-countries"
import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { auth, db } from "@/firebase/client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CountryPicker } from "@/components/onboarding/CountryPicker"
import {
  APP_STATUSES,
  CONCERNS,
  EMPTY_ANSWERS,
  FUNDS_STATUS,
  ONBOARDING_STEPS,
  SPONSORS,
  VISA_TYPES,
  startingSteps,
  stepError,
  type OnboardingAnswers,
  type StartStep,
} from "@/lib/onboarding"

const COUNTRY_NAMES = countries.map((c) => c.name.common).sort((a, b) => a.localeCompare(b))
const isCountry = (name: string) => COUNTRY_NAMES.includes(name)
const POPULAR_HOME = ["Ghana", "Nigeria", "Kenya", "South Africa", "Cameroon", "Côte d'Ivoire"]
const POPULAR_DESTINATIONS = ["United Kingdom", "United States", "Canada", "Germany", "Australia", "Ireland", "Netherlands", "France"]

const STEP_TITLES = [
  { title: "Let's start with you", subtitle: "So we can match the right embassy rules." },
  { title: "Your visa goal", subtitle: "This sets your document checklist and funds target." },
  { title: "History and money", subtitle: "Honest answers help us spot risks before an officer does." },
  { title: "Last step", subtitle: "Tell us what worries you, and confirm a few things." },
]

type Update = <K extends keyof OnboardingAnswers>(key: K, value: OnboardingAnswers[K]) => void

/** One-tap choice buttons (a radio group). */
function Choice<T extends string>({ label, value, options, onChange, columns = 2 }: {
  label: string
  value: string
  options: readonly { value: T; label: string }[]
  onChange: (v: T) => void
  columns?: 1 | 2
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-medium">{label}</legend>
      <div className={cn("grid gap-2", columns === 2 ? "grid-cols-2" : "grid-cols-1")} role="radiogroup">
        {options.map((o) => {
          const selected = value === o.value
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(o.value)}
              className={cn(
                "min-h-11 rounded-xl border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure/40",
                selected ? "border-lp-azure bg-lp-sky font-medium text-lp-fg" : "border-lp-line bg-lp-card hover:border-lp-azure/50",
              )}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

const asOptions = (list: readonly string[]) => list.map((v) => ({ value: v, label: v }))
const YES_NO = [{ value: "no", label: "No" }, { value: "yes", label: "Yes" }] as const

export default function OnboardingForm() {
  const router = useRouter()
  const [uid, setUid] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<OnboardingAnswers>(EMPTY_ANSWERS)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [finished, setFinished] = useState<StartStep[] | null>(null)
  const stepRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const leavingRef = useRef(false)

  const update: Update = (key, value) => {
    setAnswers((a) => ({ ...a, [key]: value }))
    setError(null)
  }

  // Resume where the user left off.
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        if (!leavingRef.current) router.replace("/login")
        return
      }
      setUid(user.uid)
      try {
        const data = (await getDoc(doc(db, "users", user.uid))).data() ?? {}
        const saved = data.onboarding ?? {}
        setAnswers({
          ...EMPTY_ANSWERS,
          ...Object.fromEntries(Object.entries(saved).filter(([k]) => k in EMPTY_ANSWERS)),
          residence: saved.residence || (isCountry(data.country) ? data.country : ""),
          nationality: saved.nationality || (isCountry(data.country) ? data.country : ""),
          concerns: Array.isArray(saved.concerns) ? saved.concerns : [],
        })
        const resumeAt = Number(data.onboardingStep)
        if (resumeAt >= 1 && resumeAt <= ONBOARDING_STEPS) setStep(resumeAt)
      } catch {
        // Start blank; saving will surface any real problem.
      } finally {
        setLoading(false)
      }
    })
    return () => unsub()
  }, [router])

  useEffect(() => {
    if (!stepRef.current) return
    gsap.fromTo(stepRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" })
    headingRef.current?.focus()
  }, [step, finished, loading])

  /** Writes the answers so far. Returns false (and shows why) if it fails. */
  const persist = async (extra: Record<string, unknown>) => {
    if (!uid) return false
    setSaving(true)
    try {
      const fields: Record<string, unknown> = { updatedAt: new Date().toISOString(), ...extra }
      // Field paths, so answers from older versions of this form are kept.
      for (const [k, v] of Object.entries(answers)) fields[`onboarding.${k}`] = typeof v === "string" ? v.trim() : v
      await updateDoc(doc(db, "users", uid), fields)
      return true
    } catch {
      setError("We couldn't save your answers. Check your connection and try again.")
      return false
    } finally {
      setSaving(false)
    }
  }

  const next = async () => {
    const problem = stepError(step, answers, isCountry)
    if (problem) return setError(problem)
    if (step < ONBOARDING_STEPS) {
      if (await persist({ onboardingStep: step + 1 })) setStep(step + 1)
      return
    }
    const ok = await persist({
      completedOnboarding: true,
      onboardingCompletedAt: new Date().toISOString(),
      termsAcceptedAt: new Date().toISOString(),
      onboardingStep: deleteField(),
    })
    if (!ok) return
    const data = uid ? (await getDoc(doc(db, "users", uid)).catch(() => null))?.data() : null
    setFinished(startingSteps(data ?? { onboarding: answers }))
    confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, zIndex: 100, disableForReducedMotion: true })
  }

  const back = () => {
    setError(null)
    setStep((s) => Math.max(1, s - 1))
  }

  const saveForLater = async () => {
    if (await persist({ onboardingStep: step })) {
      leavingRef.current = true
      // Signed-in users on "/" are sent back here, so leaving means signing out.
      toast.success("Saved. Sign in any time to pick up where you left off.")
      await signOut(auth).catch(() => {})
      router.push("/")
    }
  }

  const shell = (children: React.ReactNode) => (
    <main className="flex min-h-screen items-center justify-center bg-lp-page px-4 py-12 text-lp-fg">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[420px] bg-gradient-to-b from-lp-sky via-lp-sky/30 to-transparent" aria-hidden="true" />
      <div className="relative w-full max-w-lg rounded-[1.5rem] border border-lp-line bg-lp-card p-6 shadow-[0_1px_2px_rgba(8,32,26,0.04),0_8px_24px_-16px_rgba(8,32,26,0.18)] md:p-8">
        {children}
      </div>
    </main>
  )

  const progress = useMemo(() => Math.round(((step - 1) / ONBOARDING_STEPS) * 100), [step])

  if (loading) return shell(<div className="flex h-64 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-lp-azure" /></div>)

  if (finished) {
    return shell(
      <div ref={stepRef} className="space-y-6">
        <div className="space-y-2 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-lp-azure" />
          <h1 ref={headingRef} tabIndex={-1} className="font-display text-3xl font-semibold tracking-[-0.04em] outline-none">You&apos;re all set</h1>
          <p className="text-lp-muted">
            Your {answers.destination} {answers.visaType.toLowerCase()} visa plan is ready. Start here:
          </p>
        </div>
        <ol className="space-y-2">
          {finished.map((s, i) => (
            <li key={s.key}>
              <Link href={s.href} className="group flex gap-3 rounded-xl border border-lp-line p-4 transition-colors hover:border-lp-azure/60 hover:bg-lp-sky/50">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-lp-sky font-display text-sm font-semibold text-lp-azure">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{s.title}</span>
                  <span className="block text-sm text-lp-muted">{s.why}</span>
                </span>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-lp-muted transition-transform group-hover:translate-x-1" />
              </Link>
            </li>
          ))}
        </ol>
        <Button className="h-11 w-full rounded-full" onClick={() => router.push("/dashboard")}>Go to my dashboard</Button>
        <p className="text-center text-xs text-lp-muted">You can change your destination and visa type any time in your profile.</p>
      </div>,
    )
  }

  const { title, subtitle } = STEP_TITLES[step - 1]

  return shell(
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-end justify-between text-xs">
          <span className="font-display font-medium uppercase tracking-[0.16em] text-lp-azure">Step {step} of {ONBOARDING_STEPS}</span>
          <span className="text-lp-muted">About {Math.max(1, ONBOARDING_STEPS - step + 1)} min left</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-lp-sky" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Onboarding progress">
          <div className="h-full rounded-full bg-lp-azure transition-[width] duration-500" style={{ width: `${Math.max(progress, 4)}%` }} />
        </div>
      </div>

      <div ref={stepRef} className="space-y-5">
        <div className="space-y-1">
          <h1 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-semibold tracking-[-0.04em] outline-none">{title}</h1>
          <p className="text-sm text-lp-muted">{subtitle}</p>
        </div>

        {step === 1 && (
          <>
            <CountryPicker id="ob-residence" label="Country you live in" value={answers.residence} onChange={(v) => update("residence", v)} options={COUNTRY_NAMES} popular={POPULAR_HOME} />
            <CountryPicker id="ob-nationality" label="Nationality (as on your passport)" value={answers.nationality} onChange={(v) => update("nationality", v)} options={COUNTRY_NAMES} popular={POPULAR_HOME} />
          </>
        )}

        {step === 2 && (
          <>
            <CountryPicker id="ob-destination" label="Where do you want to go?" value={answers.destination} onChange={(v) => update("destination", v)} options={COUNTRY_NAMES} popular={POPULAR_DESTINATIONS} />
            <Choice label="Visa type" value={answers.visaType} options={asOptions(VISA_TYPES)} onChange={(v) => update("visaType", v)} />
            <Choice label="Where are you with your application?" value={answers.appStatus} options={asOptions(APP_STATUSES)} onChange={(v) => update("appStatus", v)} />
          </>
        )}

        {step === 3 && (
          <>
            <Choice label="Have you ever been refused a visa?" value={answers.refused} options={YES_NO} onChange={(v) => update("refused", v)} />
            {answers.refused === "yes" && (
              <div className="grid grid-cols-[1fr_7rem] gap-3">
                <CountryPicker id="ob-refusal-country" label="Which country?" value={answers.refusalCountry} onChange={(v) => update("refusalCountry", v)} options={COUNTRY_NAMES} popular={POPULAR_DESTINATIONS} />
                <div className="space-y-2">
                  <label htmlFor="ob-refusal-year" className="text-sm font-medium">Year</label>
                  <input
                    id="ob-refusal-year"
                    inputMode="numeric"
                    maxLength={4}
                    placeholder="2025"
                    value={answers.refusalYear}
                    onChange={(e) => update("refusalYear", e.target.value.replace(/\D/g, ""))}
                    className="h-11 w-full rounded-xl border border-lp-line bg-lp-card px-3 text-base outline-none focus:border-lp-azure focus:ring-2 focus:ring-lp-azure/20"
                  />
                </div>
              </div>
            )}
            <Choice label="Have you ever stayed longer than a visa allowed?" value={answers.overstayed} options={YES_NO} onChange={(v) => update("overstayed", v)} />
            <Choice label="Who is paying for the trip?" value={answers.sponsor} options={asOptions(SPONSORS)} onChange={(v) => update("sponsor", v)} />
            <Choice label="Is the money for the trip ready?" value={answers.funds} options={FUNDS_STATUS} onChange={(v) => update("funds", v)} columns={1} />
          </>
        )}

        {step === 4 && (
          <>
            <fieldset className="space-y-2">
              <legend className="mb-2 text-sm font-medium">What worries you most? <span className="font-normal text-lp-muted">(optional, pick any)</span></legend>
              <div className="grid grid-cols-2 gap-2">
                {CONCERNS.map((c) => {
                  const on = answers.concerns.includes(c.id)
                  return (
                    <button
                      key={c.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => update("concerns", on ? answers.concerns.filter((x) => x !== c.id) : [...answers.concerns, c.id])}
                      className={cn(
                        "min-h-11 rounded-xl border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure/40",
                        on ? "border-lp-azure bg-lp-azure font-medium text-white" : "border-lp-line bg-lp-card hover:border-lp-azure/50",
                      )}
                    >
                      {c.label}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            <div className="space-y-3 rounded-xl border border-lp-line bg-lp-card-2 p-4">
              {([
                ["legal1", "I understand Elora gives guidance, not a guaranteed visa."],
                ["legal2", "I'm responsible for my own application and the documents I submit."],
                ["legal3", "AI feedback is for learning and preparation only."],
              ] as const).map(([key, text]) => (
                <div key={key} className="flex items-start gap-3">
                  <Checkbox id={`ob-${key}`} checked={answers[key]} onCheckedChange={(v) => update(key, !!v)} className="mt-0.5" />
                  <label htmlFor={`ob-${key}`} className="cursor-pointer text-sm leading-snug">{text}</label>
                </div>
              ))}
              <p className="pt-1 text-xs text-lp-muted">
                Elora teaches you to apply on your own. We don&apos;t give legal advice or act as your agent. See our{" "}
                <Link href="/legal/privacy-policy" className="underline">privacy policy</Link>.
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-800 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </p>
      )}

      <div className="space-y-3 border-t border-lp-line pt-5">
        <div className="flex gap-3">
          <Button variant="ghost" onClick={back} disabled={step === 1 || saving} className="h-11 flex-1 rounded-full">Back</Button>
          <Button onClick={next} disabled={saving} className="h-11 flex-[2] rounded-full">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : step === ONBOARDING_STEPS ? "Finish" : "Continue"}
          </Button>
        </div>
        <button type="button" onClick={saveForLater} disabled={saving} className="mx-auto block text-xs text-lp-muted underline-offset-4 hover:text-lp-fg hover:underline">
          Save and finish later
        </button>
      </div>
    </div>,
  )
}
