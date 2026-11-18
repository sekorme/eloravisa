"use client"

import { useCallback, useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Check, Copy, EllipsisVertical, Menu, MoreHorizontal, PlusSquare, Share, X } from "lucide-react"
import { trackEvent } from "@/lib/analytics"

/**
 * "Install the app" popup for visitors who haven't added Elora Visa to their
 * device yet. Mounted once in the root layout.
 *
 * Browsers differ a lot here, so the popup picks one of several paths:
 * - native: Chrome, Edge, Samsung Internet and other Chromium browsers (Android
 *   and desktop) fire `beforeinstallprompt`, and the Install button opens the
 *   browser's own install dialog.
 * - ios: iPhone and iPad never let a page trigger an install. The button
 *   reveals the Share → Add to Home Screen steps instead (Safari, and since
 *   iOS 16.4 Chrome, Edge and Firefox too).
 * - android: Android browsers without the event (Firefox, or Chrome before
 *   it decides to fire it) get the menu steps.
 * - in-app: Instagram, Facebook, TikTok etc. open links in their own browser,
 *   which can't install anything, so we offer to open the page in the real
 *   browser.
 * - mac-safari: Safari 17+ on macOS can "Add to Dock".
 * Desktop Firefox can't install sites at all, so it never sees the popup.
 *
 * It's never shown when the site is already running as an installed app, after
 * the browser reports an install, or for 14 days after "Not now".
 */

type Mode = "native" | "ios" | "ios-safari-only" | "android" | "in-app" | "mac-safari"

type InstallEvent = Event & {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

type InstallWindow = Window & {
    __ehInstall?: InstallEvent | null
}

type Device = {
    ios: boolean
    android: boolean
    inApp: string | null
    iosOld: boolean
    iosBrowser: "safari" | "chrome" | "firefox" | "edge" | "other"
    androidBrowser: "chrome" | "samsung" | "firefox" | "other"
    macSafari: boolean
}

const DISMISSED_KEY = "eloravisa-install-dismissed-at"
const INSTALLED_KEY = "eloravisa-installed"
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000
/** Time on the site before the popup appears, so it never greets a visitor before the page does. */
const SHOW_DELAY_MS = 6000
/** Flows where an interruption would cost more than it gains. */
const HIDDEN_ON = ["/login", "/signup", "/onboarding", "/live"]

/** Runs inline in <head> (app/layout.tsx) so the event isn't missed before hydration. */
export const CAPTURE_INSTALL_EVENT_SCRIPT =
    "window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__ehInstall=e;});"

const IN_APP_BROWSERS: [RegExp, string][] = [
    [/Instagram/i, "Instagram"],
    [/FBAN|FBAV|FB_IAB|FBIOS/i, "Facebook"],
    [/musical_ly|TikTok|BytedanceWebview/i, "TikTok"],
    [/Snapchat/i, "Snapchat"],
    [/LinkedInApp/i, "LinkedIn"],
    [/Twitter/i, "X"],
    [/Pinterest/i, "Pinterest"],
    [/Line\//i, "LINE"],
    [/Telegram/i, "Telegram"],
    [/GSA\//i, "Google app"],
]

function readDevice(): Device {
    const ua = navigator.userAgent
    const ios = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1)
    const android = /Android/i.test(ua)

    let inApp = IN_APP_BROWSERS.find(([re]) => re.test(ua))?.[1] ?? null
    // Android WebViews mark themselves with "; wv)".
    if (!inApp && android && /; wv\)/.test(ua)) inApp = "this app"

    const v = ua.match(/OS (\d+)_(\d+)/)
    const iosOld = ios && !!v && (Number(v[1]) < 16 || (Number(v[1]) === 16 && Number(v[2]) < 4))

    const iosBrowser = /CriOS/.test(ua) ? "chrome" : /FxiOS/.test(ua) ? "firefox" : /EdgiOS/.test(ua) ? "edge" : /Safari/.test(ua) ? "safari" : "other"
    const androidBrowser = /SamsungBrowser/.test(ua) ? "samsung" : /Firefox/.test(ua) ? "firefox" : /Chrome/.test(ua) && !/OPR|EdgA/.test(ua) ? "chrome" : "other"

    const safariVersion = ua.match(/Version\/(\d+)/)
    const macSafari = !ios && /Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR|Firefox/.test(ua) && !!safariVersion && Number(safariVersion[1]) >= 17

    return { ios, android, inApp, iosOld, iosBrowser, androidBrowser, macSafari }
}

/** The install path when the browser hasn't (or can't) offer a native prompt. */
function manualMode(d: Device): Mode | null {
    if (d.inApp) return "in-app"
    if (d.ios) return d.iosOld && d.iosBrowser !== "safari" ? "ios-safari-only" : "ios"
    if (d.android) return "android"
    if (d.macSafari) return "mac-safari"
    return null
}

function isStandalone() {
    return (
        window.matchMedia?.("(display-mode: standalone)").matches ||
        window.matchMedia?.("(display-mode: fullscreen)").matches ||
        window.matchMedia?.("(display-mode: minimal-ui)").matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true
    )
}

function store(key: string, value: string | null) {
    try {
        if (value === null) localStorage.removeItem(key)
        else localStorage.setItem(key, value)
    } catch {
        // Private mode or blocked storage: the popup just may show again.
    }
}

function read(key: string): string | null {
    try {
        return localStorage.getItem(key)
    } catch {
        return null
    }
}

export function InstallAppPrompt() {
    const pathname = usePathname()
    const reduced = useReducedMotion()
    const [device, setDevice] = useState<Device | null>(null)
    const [nativeEvent, setNativeEvent] = useState<InstallEvent | null>(null)
    // `device` is only set once the popup is due (eligible and the delay has
    // passed), so it doubles as the "ready to show" flag.
    const [installed, setInstalled] = useState(false)
    const [open, setOpen] = useState(true)
    const [showSteps, setShowSteps] = useState(false)
    const [copied, setCopied] = useState(false)

    // Everything that needs `window` happens after mount, so server and client
    // render the same (nothing) and hydration can't mismatch.
    useEffect(() => {
        // The worker makes the site installable in Chromium and gives an
        // offline page. Registering it again is a no-op.
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" }).catch(() => {})
        }

        if (isStandalone()) {
            store(INSTALLED_KEY, "1")
            return
        }
        // Installed earlier, but now browsing in a normal tab: don't nag.
        if (read(INSTALLED_KEY) === "1") return
        const dismissedAt = Number(read(DISMISSED_KEY) ?? 0)
        if (dismissedAt && Date.now() - dismissedAt < SNOOZE_MS) return

        const w = window as InstallWindow
        const onPrompt = (e: Event) => {
            e.preventDefault()
            w.__ehInstall = e as InstallEvent
            setNativeEvent(e as InstallEvent)
        }
        const onInstalled = () => {
            store(INSTALLED_KEY, "1")
            w.__ehInstall = null
            setInstalled(true)
            trackEvent("app_installed")
        }
        window.addEventListener("beforeinstallprompt", onPrompt)
        window.addEventListener("appinstalled", onInstalled)

        // Android Chrome can tell us the app is already on this device.
        const nav = navigator as Navigator & { getInstalledRelatedApps?: () => Promise<unknown[]> }
        nav.getInstalledRelatedApps?.()
            .then((apps) => {
                if (apps.length > 0) {
                    store(INSTALLED_KEY, "1")
                    setInstalled(true)
                }
            })
            .catch(() => {})

        // Device details and any install event caught early are read when
        // the popup is due, not on mount.
        const timer = window.setTimeout(() => {
            setDevice(readDevice())
            if (w.__ehInstall) setNativeEvent(w.__ehInstall)
        }, SHOW_DELAY_MS)
        return () => {
            window.removeEventListener("beforeinstallprompt", onPrompt)
            window.removeEventListener("appinstalled", onInstalled)
            window.clearTimeout(timer)
        }
    }, [])

    const mode: Mode | null = !device ? null : nativeEvent ? "native" : manualMode(device)
    const hiddenHere = HIDDEN_ON.some((p) => pathname === p || pathname?.startsWith(`${p}/`))
    const visible = !installed && open && !!mode && !hiddenHere

    useEffect(() => {
        if (visible && mode) trackEvent("app_install_prompt_shown", { label: mode })
        // Once per mode per visit is enough; route changes don't re-report.
    }, [visible, mode])

    const dismiss = useCallback(() => {
        store(DISMISSED_KEY, String(Date.now()))
        setOpen(false)
    }, [])

    useEffect(() => {
        if (!visible) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") dismiss()
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [visible, dismiss])

    const install = async () => {
        trackEvent("app_install_click", { label: mode ?? undefined })
        if (mode === "native" && nativeEvent) {
            try {
                await nativeEvent.prompt()
                const { outcome } = await nativeEvent.userChoice
                // The event can only be used once either way.
                ;(window as InstallWindow).__ehInstall = null
                setNativeEvent(null)
                if (outcome === "accepted") setOpen(false)
                else dismiss()
            } catch {
                setShowSteps(true)
            }
            return
        }
        setShowSteps(true)
    }

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 2500)
        } catch {
            // Clipboard blocked in some in-app browsers; the steps still apply.
        }
    }

    /** Opens this page in the phone's real browser, where installing works. */
    const openInBrowser = () => {
        const { host, pathname: path, search } = window.location
        if (device?.ios) {
            // iOS 17+ understands this scheme; older versions ignore it and the steps still apply.
            window.location.href = `x-safari-https://${host}${path}${search}`
        } else {
            window.location.href = `intent://${host}${path}${search}#Intent;scheme=https;package=com.android.chrome;end`
        }
    }

    const browserName = device?.ios ? "Safari" : "Chrome"

    return (
        <AnimatePresence>
            {visible && mode && (
                <motion.div
                    key="install-app"
                    role="dialog"
                    aria-modal="false"
                    aria-labelledby="install-app-title"
                    aria-describedby="install-app-desc"
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? { opacity: 0 } : { opacity: 0, y: 24 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[450] mx-auto max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0A2720] text-white shadow-[0_20px_50px_-12px_rgb(0_0_0/0.55)] sm:inset-x-auto sm:left-5 sm:bottom-5 sm:w-[23rem]"
                >
                    {/* Gold hairline, the brand's accent. */}
                    <div aria-hidden className="h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

                    <div className="p-4">
                        <div className="flex items-start gap-3">
                            {/* eslint-disable-next-line @next/next/no-img-element -- tiny static icon, no optimisation needed */}
                            <img src="/192.png" alt="" width={48} height={48} className="size-12 shrink-0 rounded-xl bg-white shadow-sm" />
                            <div className="min-w-0 flex-1">
                                <h2 id="install-app-title" className="text-base font-semibold leading-snug">
                                    Get the Elora Visa app
                                </h2>
                                <p id="install-app-desc" className="mt-0.5 text-sm leading-snug text-[#BFE2D1]">
                                    {mode === "in-app"
                                        ? `Open in ${browserName} to install it. It's free, with no app store needed.`
                                        : mode === "mac-safari"
                                          ? "Add it to your Dock and open it like any other app."
                                          : "Free, no app store needed. Opens full screen from your home screen."}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={dismiss}
                                aria-label="Close"
                                className="-mr-1.5 -mt-1.5 grid size-10 shrink-0 place-items-center rounded-full text-[#BFE2D1] transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
                            >
                                <X className="size-5" aria-hidden />
                            </button>
                        </div>

                        {showSteps && <Steps mode={mode} device={device} />}

                        <div className="mt-4 flex gap-2">
                            {mode === "in-app" ? (
                                <>
                                    <PrimaryButton onClick={openInBrowser}>Open in {browserName}</PrimaryButton>
                                    <SecondaryButton onClick={copyLink}>
                                        {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                                        {copied ? "Copied" : "Copy link"}
                                    </SecondaryButton>
                                </>
                            ) : mode === "ios-safari-only" ? (
                                <>
                                    <PrimaryButton onClick={openInBrowser}>Open in Safari</PrimaryButton>
                                    <SecondaryButton onClick={copyLink}>
                                        {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                                        {copied ? "Copied" : "Copy link"}
                                    </SecondaryButton>
                                </>
                            ) : showSteps ? (
                                <SecondaryButton onClick={dismiss} wide>
                                    Done
                                </SecondaryButton>
                            ) : (
                                <>
                                    <PrimaryButton onClick={install}>{mode === "mac-safari" ? "Show me how" : "Install app"}</PrimaryButton>
                                    <SecondaryButton onClick={dismiss}>Not now</SecondaryButton>
                                </>
                            )}
                        </div>
                        {(mode === "in-app" || mode === "ios-safari-only") && (
                            <p className="mt-3 text-xs leading-relaxed text-[#BFE2D1]">
                                {mode === "in-app" ? (
                                    <>
                                        If nothing opens, tap{" "}
                                        {device?.ios ? <MoreHorizontal className="inline size-3.5 align-[-2px]" aria-label="the menu" /> : <EllipsisVertical className="inline size-3.5 align-[-2px]" aria-label="the menu" />}{" "}
                                        in {device?.inApp === "this app" ? "the app" : device?.inApp} and choose <strong className="text-white">Open in browser</strong>, or paste the link into {browserName}.
                                    </>
                                ) : (
                                    <>On this version of iOS, only Safari can add apps to the Home Screen.</>
                                )}
                            </p>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

function Steps({ mode, device }: { mode: Mode; device: Device | null }) {
    const steps: React.ReactNode[] =
        mode === "ios"
            ? device?.iosBrowser === "chrome" || device?.iosBrowser === "edge"
                ? [
                      <>Tap <Share className="inline size-4 align-[-3px]" aria-label="Share" /> <strong>Share</strong> in the address bar</>,
                      <>Choose <strong>Add to Home Screen</strong> <PlusSquare className="inline size-4 align-[-3px]" aria-hidden /></>,
                      <>Tap <strong>Add</strong></>,
                  ]
                : device?.iosBrowser === "firefox"
                  ? [
                        <>Tap <Menu className="inline size-4 align-[-3px]" aria-label="Menu" /> the menu, then <strong>Share</strong></>,
                        <>Choose <strong>Add to Home Screen</strong> <PlusSquare className="inline size-4 align-[-3px]" aria-hidden /></>,
                        <>Tap <strong>Add</strong></>,
                    ]
                  : [
                        <>Tap <Share className="inline size-4 align-[-3px]" aria-label="Share" /> <strong>Share</strong>. If you don&apos;t see it, tap <MoreHorizontal className="inline size-4 align-[-3px]" aria-label="More" /> first</>,
                        <>Scroll down and choose <strong>Add to Home Screen</strong> <PlusSquare className="inline size-4 align-[-3px]" aria-hidden /></>,
                        <>Tap <strong>Add</strong>, then open Elora Visa from your Home Screen</>,
                    ]
            : mode === "android"
              ? device?.androidBrowser === "samsung"
                  ? [
                        <>Tap <Menu className="inline size-4 align-[-3px]" aria-label="Menu" /> the menu at the bottom</>,
                        <>Choose <strong>Add page to</strong>, then <strong>Home screen</strong></>,
                        <>Tap <strong>Add</strong></>,
                    ]
                  : [
                        <>Tap <EllipsisVertical className="inline size-4 align-[-3px]" aria-label="Menu" /> the menu{device?.androidBrowser === "firefox" ? "" : " at the top right"}</>,
                        <>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong></>,
                        <>Tap <strong>Install</strong></>,
                    ]
              : mode === "mac-safari"
                ? [
                      <>In the menu bar, open <strong>File</strong></>,
                      <>Choose <strong>Add to Dock</strong></>,
                      <>Click <strong>Add</strong></>,
                  ]
                : // Native prompt failed to open: fall back to the browser menu.
                  [
                      <>Open your browser&apos;s menu</>,
                      <>Choose <strong>Install Elora Visa</strong> or <strong>Add to Home screen</strong></>,
                  ]

    return (
        <ol className="mt-4 space-y-2.5 rounded-xl bg-white/[0.06] p-3.5 text-sm leading-snug">
            {steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                    <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-full bg-[#D4AF37] text-xs font-bold text-[#0A2720]">
                        {i + 1}
                    </span>
                    <span className="pt-0.5 [&_strong]:font-semibold [&_strong]:text-white">{step}</span>
                </li>
            ))}
        </ol>
    )
}

function PrimaryButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#D4AF37] px-4 text-sm font-semibold text-[#0A2720] transition-colors hover:bg-[#E4CE85] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]"
        >
            {children}
        </button>
    )
}

function SecondaryButton({ onClick, children, wide = false }: { onClick: () => void; children: React.ReactNode; wide?: boolean }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/20 px-4 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37] ${wide ? "flex-1" : ""}`}
        >
            {children}
        </button>
    )
}
