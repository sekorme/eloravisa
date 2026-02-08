"use client";

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
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-neutral-800 transition"
            >
                🔔
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
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
                        className="fixed sm:absolute right-4 sm:right-0 top-14 sm:top-auto sm:mt-2 w-[92vw] sm:w-80 max-w-sm max-h-[70vh] overflow-y-auto bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 shadow-xl rounded-xl z-50 p-4"
                    >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-100 mb-2">Notifications</h3>

                        {notifications.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-neutral-400">No notifications</p>
                        )}

                        {notifications.map((n) => (
                            <div
                                key={n.id}
                                className={`p-3 mb-2 rounded-lg transition flex justify-between items-start ${
                                    n.read ? "bg-gray-50 dark:bg-neutral-800" : "bg-blue-50 dark:bg-blue-900"
                                }`}
                            >
                                <div className="flex-1 mr-2">
                                    <div className="font-medium text-gray-800 dark:text-neutral-100 line-clamp-1">{n.title}</div>
                                    <div className="text-sm text-gray-600 dark:text-neutral-300 line-clamp-2">{n.body.split(" ").slice(0, 5).join(" ")} ...</div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        {n.createdAt &&
                                            (typeof n.createdAt === "object" && "toDate" in n.createdAt
                                                ? n.createdAt.toDate().toLocaleString()
                                                : (n.createdAt as Date).toLocaleString())}
                                    </div>
                                </div>
                                <button
                                    onClick={() => openModal(n)}
                                    className="shrink-0 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
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
                                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 p-6 text-left align-middle shadow-xl transition-all">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900 dark:text-neutral-100"
                                    >
                                        {activeNotification?.title}
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-600 dark:text-neutral-300 whitespace-pre-line">
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
                                            className="rounded-md border border-gray-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800 focus:outline-none"
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
