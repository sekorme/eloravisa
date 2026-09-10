"use client"

import { useId, useState, useTransition } from "react"
import { AnimatePresence, motion } from "motion/react"
import { CheckCircle2, Loader2, Send } from "lucide-react"
import { subscribeToUpdates } from "@/action/emailLists"

type Status = { kind: "idle" } | { kind: "error"; message: string } | { kind: "success"; message: string }

/**
 * §21 Footer email subscription. Writes to `newsletter_subscribers` via a
 * server action — a real list, not a decorative input.
 */
export function FooterSubscribe() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>({ kind: "idle" })
  const [pending, startTransition] = useTransition()
  const inputId = useId()
  const msgId = `${inputId}-message`

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStatus({ kind: "idle" })
    startTransition(async () => {
      const result = await subscribeToUpdates(email)
      if (result.ok) {
        setStatus({ kind: "success", message: result.message })
        setEmail("")
      } else {
        setStatus({ kind: "error", message: result.message })
      }
    })
  }

  return (
    <div>
      <label htmlFor={inputId} className="mb-2.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-lp-muted">
        Get product updates
      </label>
      <form onSubmit={onSubmit} noValidate className="flex gap-2">
        <input
          id={inputId}
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-invalid={status.kind === "error"}
          aria-describedby={status.kind === "idle" ? undefined : msgId}
          className="h-11 min-w-0 flex-1 rounded-full border border-lp-line bg-lp-card px-4 text-sm text-lp-fg placeholder:text-lp-muted/60 focus:border-lp-azure focus:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure/40"
        />
        <button
          type="submit"
          disabled={pending}
          aria-label="Subscribe to product updates"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lp-navy text-white transition-colors hover:bg-lp-navy-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure focus-visible:ring-offset-2 disabled:opacity-70"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </form>

      <AnimatePresence>
        {status.kind !== "idle" && (
          <motion.p
            id={msgId}
            role={status.kind === "error" ? "alert" : "status"}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={
              status.kind === "error"
                ? "mt-2.5 text-xs font-medium text-rose-600 dark:text-rose-400"
                : "mt-2.5 flex items-start gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
            }
          >
            {status.kind === "success" && <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
            {status.message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
