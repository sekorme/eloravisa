"use client"

import React, { useState } from "react"
import Link from "next/link"
import { CheckCircle2, Clock, Loader2, PartyPopper, XCircle } from "lucide-react"
import { toast } from "sonner"
import { auth } from "@/firebase/client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { useReadiness } from "@/hooks/useReadiness"

type Status = "approved" | "refused" | "waiting"

/**
 * "How did it go?" after the embassy appointment. Records the outcome
 * (/api/outcome), and offers a testimonial on approval, the question bank
 * either way, and refusal recovery on a refusal. Needs DashboardDataProvider.
 */
export function OutcomeCard() {
  const { appointment, userData, now } = useReadiness()
  const [choice, setChoice] = useState<Status | null>(null)
  const [testimonial, setTestimonial] = useState("")
  const [share, setShare] = useState(true)
  const [questions, setQuestions] = useState("")
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState<Status | null>(null)

  const outcome = userData?.visaOutcome as { status: Status; appointmentAt: number | null } | undefined
  const answeredForThis = outcome && outcome.appointmentAt === appointment?.atMs
  // Ask once the appointment has passed; keep asking while it's "waiting".
  const show = appointment && appointment.atMs < now && (!answeredForThis || outcome?.status === "waiting")
  if (!show && !done) return null

  const submit = async (status: Status) => {
    const user = auth.currentUser
    if (!user) return
    setSending(true)
    try {
      const res = await fetch("/api/outcome", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await user.getIdToken()}` },
        body: JSON.stringify({
          status,
          testimonial: status === "approved" ? testimonial : undefined,
          shareTestimonial: share,
          questions: questions.split("\n"),
        }),
      })
      if (!res.ok) throw new Error()
      setDone(status)
    } catch {
      toast.error("Couldn't save that. Please try again.")
    } finally {
      setSending(false)
    }
  }

  const shell = (children: React.ReactNode) => (
    <div className="space-y-4 rounded-[1.5rem] border border-lp-azure/30 bg-lp-sky p-6 lp-shadow">{children}</div>
  )

  if (done === "approved") {
    return shell(
      <div className="flex gap-3">
        <PartyPopper className="h-6 w-6 shrink-0 text-lp-azure" />
        <div>
          <p className="font-display text-lg font-semibold">Congratulations, and thank you!</p>
          <p className="text-sm text-lp-muted">Safe travels. Your questions help the next applicant prepare.</p>
        </div>
      </div>,
    )
  }
  if (done === "refused") {
    return shell(
      <div className="space-y-3">
        <p className="font-display text-lg font-semibold">We&apos;re sorry. Let&apos;s get you ready to try again.</p>
        <p className="text-sm text-lp-muted">Upload your refusal letter and we&apos;ll explain each reason and build a plan to reapply stronger.</p>
        <Button asChild className="rounded-full"><Link href="/dashboard/refusal">Start refusal recovery</Link></Button>
      </div>,
    )
  }
  if (done === "waiting") {
    return shell(<p className="text-sm">Thanks. We&apos;ll ask again in a little while. Fingers crossed!</p>)
  }

  const questionsBox = (
    <div className="space-y-1.5">
      <label htmlFor="outcome-questions" className="text-sm font-medium">What were you asked? (optional, one question per line)</label>
      <Textarea id="outcome-questions" rows={3} placeholder={"Why did you choose this university?\nWho is paying for your studies?"} value={questions} onChange={(e) => setQuestions(e.target.value)} />
      <p className="text-xs text-lp-muted">Shared anonymously to make other applicants&apos; practice interviews more realistic.</p>
    </div>
  )

  return shell(
    <>
      <div>
        <p className="font-display text-lg font-semibold">How did your visa interview go?</p>
        <p className="text-sm text-lp-muted">{appointment?.embassy}, {new Date(appointment!.atMs).toLocaleDateString()}</p>
      </div>
      {!choice ? (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="rounded-full" onClick={() => setChoice("approved")}><CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-600" /> Approved</Button>
          <Button variant="outline" className="rounded-full" onClick={() => setChoice("refused")}><XCircle className="mr-1.5 h-4 w-4 text-red-600" /> Refused</Button>
          <Button variant="outline" className="rounded-full" disabled={sending} onClick={() => submit("waiting")}><Clock className="mr-1.5 h-4 w-4" /> Still waiting</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {choice === "approved" && (
            <div className="space-y-1.5">
              <label htmlFor="outcome-story" className="text-sm font-medium">Would you share a few words about your experience? (optional)</label>
              <Textarea id="outcome-story" rows={3} maxLength={1000} value={testimonial} onChange={(e) => setTestimonial(e.target.value)} />
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={share} onCheckedChange={(v) => setShare(v === true)} />
                Elora Visa may show this on its website with my first name
              </label>
            </div>
          )}
          {questionsBox}
          <div className="flex gap-2">
            <Button className="rounded-full" disabled={sending} onClick={() => submit(choice)}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
            </Button>
            <Button variant="ghost" className="rounded-full" disabled={sending} onClick={() => setChoice(null)}>Back</Button>
          </div>
        </div>
      )}
    </>,
  )
}
