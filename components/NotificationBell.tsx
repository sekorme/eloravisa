"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { markRead, internalPath, timeAgo, useNotifications, type AppNotification } from "@/lib/notificationsClient";

const PREVIEW_COUNT = 8;

/**
 * Header bell: a quick look at the latest notifications. Tapping one goes
 * straight to what it's about; the full history, filters and clean-up live
 * on /dashboard/notifications.
 */
export function NotificationBell({ userId }: { userId: string | null }) {
    const router = useRouter();
    const items = useNotifications(userId);
    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // Close on outside click or Escape.
    useEffect(() => {
        if (!open) return;
        const onDown = (e: MouseEvent) => { if (!panelRef.current?.contains(e.target as Node)) setOpen(false); };
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("mousedown", onDown);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onDown);
            document.removeEventListener("keydown", onKey);
        };
    }, [open]);

    const list = items ?? [];
    const unread = list.filter((n) => !n.read);

    const openNotification = (n: AppNotification) => {
        setOpen(false);
        if (userId && !n.read) markRead(userId, [n.id]).catch(() => {});
        const path = internalPath(n.url);
        if (path) router.push(path);
        else if (n.url) window.open(n.url, "_blank", "noopener");
        else router.push(`/dashboard/notifications#${n.id}`);
    };

    return (
        <div className="relative" ref={panelRef}>
            <button
                onClick={() => setOpen((o) => !o)}
                aria-label={unread.length > 0 ? `Notifications, ${unread.length} unread` : "Notifications"}
                aria-expanded={open}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-lp-line bg-lp-card text-lp-fg transition-colors hover:border-lp-fg/30 hover:bg-lp-card-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure"
            >
                <Bell className="h-[1.1rem] w-[1.1rem]" />
                {unread.length > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-lp-azure px-1 text-[10px] font-semibold text-white ring-2 ring-lp-page">
                        {unread.length > 99 ? "99+" : unread.length}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        key="panel"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                        exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
                        className="fixed right-4 top-16 z-50 flex max-h-[70vh] w-[92vw] max-w-sm flex-col rounded-2xl border border-lp-line bg-lp-card text-lp-fg shadow-xl lp-shadow sm:absolute sm:right-0 sm:top-auto sm:mt-3 sm:w-96"
                    >
                        <div className="flex items-center justify-between px-4 pb-2 pt-3">
                            <h3 className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">Notifications</h3>
                            {unread.length > 0 && userId && (
                                <button
                                    onClick={() => markRead(userId, unread.map((n) => n.id)).catch(() => {})}
                                    className="flex items-center gap-1 text-xs font-medium text-lp-azure hover:underline"
                                >
                                    <CheckCheck className="h-3.5 w-3.5" /> Mark all as read
                                </button>
                            )}
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto px-2">
                            {items === null ? (
                                <p className="px-2 py-4 text-sm text-lp-muted">Loading…</p>
                            ) : list.length === 0 ? (
                                <p className="px-2 py-6 text-center text-sm text-lp-muted">You&apos;re all caught up.</p>
                            ) : (
                                list.slice(0, PREVIEW_COUNT).map((n) => (
                                    <button
                                        key={n.id}
                                        onClick={() => openNotification(n)}
                                        className={`mb-1 flex w-full items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-lp-card-2 ${n.read ? "" : "bg-lp-sky"}`}
                                    >
                                        <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? "bg-transparent" : "bg-lp-azure"}`} aria-hidden="true" />
                                        <span className="min-w-0 flex-1">
                                            <span className={`block line-clamp-1 ${n.read ? "font-medium" : "font-semibold"}`}>{n.title}</span>
                                            <span className="block line-clamp-2 text-sm text-lp-muted">{n.body}</span>
                                            <span className="mt-1 block text-xs text-lp-muted/80">{timeAgo(n.createdAt)}</span>
                                        </span>
                                        {!n.read && <span className="sr-only">Unread</span>}
                                    </button>
                                ))
                            )}
                        </div>

                        <Link
                            href="/dashboard/notifications"
                            onClick={() => setOpen(false)}
                            className="border-t border-lp-line px-4 py-3 text-center text-sm font-medium text-lp-azure hover:bg-lp-card-2"
                        >
                            {list.length > PREVIEW_COUNT ? `See all ${list.length} notifications` : "See all notifications"}
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
