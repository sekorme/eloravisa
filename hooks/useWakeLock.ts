import { useEffect } from "react";

/**
 * Keeps the screen awake while `active` is true, using the Screen Wake Lock
 * API. Browsers drop the lock whenever the tab is hidden, so it is
 * re-acquired when the page becomes visible again. No-op where unsupported
 * (older Safari/Firefox) or when the request is refused (e.g. low battery).
 */
export function useWakeLock(active = true) {
    useEffect(() => {
        if (!active || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;

        let sentinel: WakeLockSentinel | null = null;
        let cancelled = false;

        const acquire = async () => {
            if (document.visibilityState !== "visible" || (sentinel && !sentinel.released)) return;
            try {
                const lock = await navigator.wakeLock.request("screen");
                // Unmounted while the request was pending: don't keep it.
                if (cancelled) lock.release().catch(() => {});
                else sentinel = lock;
            } catch {
                // Refused or not allowed right now; the screen just sleeps normally.
            }
        };

        const onVisibility = () => {
            if (document.visibilityState === "visible") acquire();
        };

        acquire();
        document.addEventListener("visibilitychange", onVisibility);
        return () => {
            cancelled = true;
            document.removeEventListener("visibilitychange", onVisibility);
            sentinel?.release().catch(() => {});
            sentinel = null;
        };
    }, [active]);
}
