'use client';

import { useEffect } from "react";

export function RegisterSW() {
    useEffect(() => {
        if (typeof window === "undefined") return; // Ensure client-side
        if (!("serviceWorker" in navigator)) return;

        const registerServiceWorker = async () => {
            try {
                const registration = await navigator.serviceWorker.register(
                    "/firebase-messaging-sw.js",
                    { scope: "/" }
                );
                console.log("✅ Service Worker registered:", registration);
            } catch (error) {
                console.error("❌ Service Worker registration failed:", error);
            }
        };

        registerServiceWorker();
    }, []);

    return null;
}
