"use client"

import { FormEvent, useState } from "react"
import { Send } from "lucide-react"

const SUPPORT_CATEGORIES = [
  "Account support",
  "Subscription and payments",
  "AI document review",
  "Mock interview",
  "Affiliate support",
  "Technical problem",
  "General enquiry",
]

export function ContactForm() {
  const [draftOpened, setDraftOpened] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    if (form.get("company")) return

    const name = String(form.get("name") ?? "")
    const email = String(form.get("email") ?? "")
    const category = String(form.get("category") ?? "General enquiry")
    const subject = String(form.get("subject") ?? "")
    const message = String(form.get("message") ?? "")
    const body = `Name: ${name}\nEmail: ${email}\nCategory: ${category}\n\n${message}`

    window.location.href = `mailto:info@eloravisa.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setDraftOpened(true)
  }

  const fieldClassName = "mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-4 text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-blue dark:focus-visible:ring-landing-cyan"

  return (
    <form onSubmit={handleSubmit} className="rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-8" aria-describedby="contact-form-note">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Full name
          <input name="name" autoComplete="name" required className={fieldClassName} />
        </label>
        <label className="text-sm font-semibold">
          Email address
          <input name="email" type="email" autoComplete="email" required className={fieldClassName} />
        </label>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Support category
          <select name="category" required className={fieldClassName} defaultValue="">
            <option value="" disabled>Select a category</option>
            {SUPPORT_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Subject
          <input name="subject" required className={fieldClassName} />
        </label>
      </div>
      <label className="mt-5 block text-sm font-semibold">
        Message
        <textarea name="message" required rows={7} className={`${fieldClassName} py-3`} />
      </label>
      <label className="sr-only" aria-hidden="true">
        Company
        <input name="company" tabIndex={-1} autoComplete="off" />
      </label>
      <p id="contact-form-note" className="mt-4 text-xs leading-relaxed text-muted-foreground">Do not include passport numbers, payment details, passwords or sensitive documents. Submitting opens a prepared message in your email application.</p>
      <button type="submit" className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-landing-cyan via-landing-blue to-landing-violet px-6 font-semibold text-white shadow-lg transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-blue focus-visible:ring-offset-2 sm:w-auto">
        Open email draft
        <Send className="h-4 w-4" aria-hidden="true" />
      </button>
      {draftOpened && <p className="mt-4 text-sm text-muted-foreground" role="status">Your email draft should now be open. Review it before sending.</p>}
    </form>
  )
}
