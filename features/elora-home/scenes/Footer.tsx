"use client"

import Link from "next/link"
import { useId, useState } from "react"
import { BrandLogo, Shell, Board } from "../components/Primitives"
import { ArrowRight, Check } from "../components/Icon"
import { FOOTER, BRAND } from "../data/content"
import { subscribeToUpdates } from "@/action/emailLists"

/**
 * The footer.
 *
 * Composed as the last movement of the page rather than a link dump: the
 * brand and the subscribe field lead, the columns sit as a quiet index, and the
 * legal disclaimer is given real weight at readable contrast.
 *
 * That disclaimer placement is deliberate. It is the single most important
 * sentence on the page from a duty-of-care standpoint — Elora does not issue
 * visas and cannot guarantee approval — so it is set at body contrast in the
 * main footer body, not shrunk to 10px grey beneath a copyright line.
 *
 * There is no country or language selector. The brief allows one "only if
 * functional", and this app has neither i18n routing nor per-country content,
 * so a selector would be a control that does nothing.
 */
export function Footer() {
    const [email, setEmail] = useState("")
    const [status, setStatus] = useState<"idle" | "submitting" | "error" | "success">("idle")
    const [message, setMessage] = useState("")
    const inputId = useId()
    const statusId = useId()

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (status === "submitting") return

        setStatus("submitting")
        try {
            const result = await subscribeToUpdates(email)
            if (result.ok) {
                setStatus("success")
                setMessage(result.message)
                setEmail("")
            } else {
                setStatus("error")
                setMessage(result.message)
            }
        } catch {
            setStatus("error")
            setMessage("We couldn't reach the server. Please try again shortly.")
        }
    }

    const year = new Date().getFullYear()

    return (
        <footer className="eh-footer eh-dark" aria-labelledby="eh-footer-title">
            <h2 id="eh-footer-title" className="eh-sr">
                Site footer
            </h2>

            <Shell>
                <div className="eh-footer-top">
                    <div className="eh-footer-brand">
                        <BrandLogo size={38} />
                        <p className="eh-footer-tagline">{FOOTER.tagline}</p>

                        <form className="eh-subscribe" onSubmit={onSubmit} noValidate>
                            <Board>{FOOTER.subscribe.title}</Board>
                            <p className="eh-subscribe-body">{FOOTER.subscribe.body}</p>

                            <div className="eh-subscribe-row">
                                <label htmlFor={inputId} className="eh-sr">
                                    Email address for product updates
                                </label>
                                <input
                                    id={inputId}
                                    type="email"
                                    name="email"
                                    inputMode="email"
                                    autoComplete="email"
                                    required
                                    placeholder={FOOTER.subscribe.placeholder}
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value)
                                        if (status !== "idle") setStatus("idle")
                                    }}
                                    aria-describedby={statusId}
                                    aria-invalid={status === "error"}
                                    disabled={status === "submitting"}
                                />
                                <button
                                    type="submit"
                                    className="eh-btn eh-btn-secondary"
                                    disabled={status === "submitting"}
                                >
                                    {status === "submitting" ? "…" : FOOTER.subscribe.cta}
                                    <ArrowRight size={15} />
                                </button>
                            </div>

                            <p
                                id={statusId}
                                className="eh-subscribe-status"
                                data-status={status}
                                role="status"
                                aria-live="polite"
                            >
                                {status === "submitting"
                                    ? "Subscribing…"
                                    : status === "success"
                                      ? message
                                      : status === "error"
                                        ? message
                                        : ""}
                            </p>

                            {status === "success" ? (
                                <p className="eh-subscribe-done" aria-hidden="true">
                                    <Check size={14} /> Subscribed
                                </p>
                            ) : null}
                        </form>
                    </div>

                    <nav className="eh-footer-cols" aria-label="Footer">
                        {FOOTER.columns.map((col) => (
                            <div key={col.heading}>
                                <h3>{col.heading}</h3>
                                <ul>
                                    {col.links.map((l) => (
                                        <li key={`${col.heading}-${l.label}`}>
                                            <Link href={l.href}>{l.label}</Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </nav>
                </div>

                <hr className="eh-rule eh-footer-rule" />

                {/* Legally load-bearing. Body contrast, not fine print. */}
                <p className="eh-footer-disclaimer">{FOOTER.disclaimer}</p>

                <div className="eh-footer-base">
                    <p>
                        © {year} {BRAND.name}. All rights reserved.
                    </p>
                    <p className="eh-footer-promise">{BRAND.promise}</p>
                </div>
            </Shell>
        </footer>
    )
}
