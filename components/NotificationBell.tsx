"use client";

import { Bell } from "lucide-react";
import { useEffect, useState, Fragment } from "react";
import { db } from "@/firebase/client";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
} from "firebase/firestore";
import { Dialog, Transition } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
    id: string;
    title: string;
    body: string;
    createdAt?: { toDate: () => Date } | Date | null;
    read?: boolean;
    url?: string;
}

export function NotificationBell({ userId }: { userId: any }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [activeNotification, setActiveNotification] = useState<Notification | null>(null);

    /* ───────────────────────────────────────── Fetch notifications */
    useEffect(() => {
        if (!userId) return;

        const q = query(
            collection(db, `users/${userId}/notifications`),
            orderBy("createdAt", "desc")
        );

        const unsub = onSnapshot(q, (snap) => {
            const list = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Notification[];
            setNotifications(list);
        });

        return () => unsub();
    }, [userId]);

    /* ───────────────────────────────────────── Helpers */
    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAsRead = async (id: string) => {
        await updateDoc(doc(db, `users/${userId}/notifications`, id), { read: true });
    };

    const deleteNotification = async (id: string) => {
        await deleteDoc(doc(db, `users/${userId}/notifications`, id));
        closeModal();
    };

    const openModal = (n: Notification) => {
        setDropdownOpen(false);
        setActiveNotification(n);
        setModalOpen(true);
        if (!n.read) markAsRead(n.id);
    };

    const closeModal = () => {
        setModalOpen(false);
        setActiveNotification(null);
    };

    /* ───────────────────────────────────────── UI */
    return (
        <div className="relative">
            {/* Bell */}
            <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
                aria-expanded={dropdownOpen}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-lp-line bg-lp-card text-lp-fg transition-colors hover:border-lp-fg/30 hover:bg-lp-card-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lp-azure"
            >
                <Bell className="h-[1.1rem] w-[1.1rem]" />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-lp-azure px-1 text-[10px] font-semibold text-white ring-2 ring-lp-page">
            {unreadCount}
          </span>
                )}
            </button>

            {/* Dropdown w/ framer-motion spring */}
            <AnimatePresence>
                {dropdownOpen && (
                    <motion.div
                        key="dropdown"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }}
                        exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
                        className="fixed sm:absolute right-4 sm:right-0 top-16 sm:top-auto sm:mt-3 w-[92vw] sm:w-80 max-w-sm max-h-[70vh] overflow-y-auto rounded-2xl border border-lp-line bg-lp-card p-2 text-lp-fg shadow-xl z-50 lp-shadow"
                    >
                        <h3 className="px-2 pb-2 pt-1.5 font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">Notifications</h3>

                        {notifications.length === 0 && (
                            <p className="px-2 pb-3 text-sm text-lp-muted">No notifications</p>
                        )}

                        {notifications.map((n) => (
                            <div
                                key={n.id}
                                className={`p-3 mb-1 rounded-xl transition-colors flex justify-between items-start ${
                                    n.read ? "hover:bg-lp-card-2" : "bg-lp-sky"
                                }`}
                            >
                                <div className="flex-1 mr-2">
                                    <div className="font-medium text-lp-fg line-clamp-1">{n.title}</div>
                                    <div className="text-sm text-lp-muted line-clamp-2">{n.body.split(" ").slice(0, 5).join(" ")} ...</div>
                                    <div className="mt-1 text-xs text-lp-muted/70">
                                        {n.createdAt &&
                                            (typeof n.createdAt === "object" && "toDate" in n.createdAt
                                                ? n.createdAt.toDate().toLocaleString()
                                                : (n.createdAt as Date).toLocaleString())}
                                    </div>
                                </div>
                                <button
                                    onClick={() => openModal(n)}
                                    className="shrink-0 rounded-full bg-lp-card px-3 py-1 text-xs font-semibold text-lp-azure ring-1 ring-lp-line transition-colors hover:bg-lp-azure hover:text-white"
                                >
                                    Read
                                </button>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal */}
            <Transition appear show={modalOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeModal}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
                        leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/25" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
                            >
                                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-lp-card p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-lp-fg"
                                    >
                                        {activeNotification?.title}
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-lp-muted whitespace-pre-line">
                                            {activeNotification?.body}
                                        </p>
                                    </div>

                                    <div className="mt-4 flex justify-end gap-2">
                                        <button
                                            type="button"
                                            className="rounded-md border border-red-300 dark:border-red-700 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 focus:outline-none"
                                            onClick={() => activeNotification && deleteNotification(activeNotification.id)}
                                        >
                                            Delete
                                        </button>
                                        <button
                                            type="button"
                                            className="rounded-md border border-lp-line px-4 py-2 text-sm font-medium text-lp-fg  hover:bg-lp-card-2  focus:outline-none"
                                            onClick={closeModal}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
}
