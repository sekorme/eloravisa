'use client';

import { useEffect } from 'react';
import { onMessage, Unsubscribe } from 'firebase/messaging';
import { getFirebaseMessaging } from '@/lib/firebase';
import { getPushState, registerPushToken } from '@/lib/pushClient';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

/**
 * Keeps this device registered for push once the user has allowed it, and
 * shows pushes that arrive while the app is open as a toast. Never asks for
 * permission itself: phones only allow that from a tap (see EnablePushPrompt
 * and the notification settings), and lib/pushClient.ts explains why.
 */
export function useFCMToken(userId: string | null) {
    const router = useRouter();

    useEffect(() => {
        if (!userId || getPushState() !== 'granted') return;

        let unsubscribe: Unsubscribe | null = null;
        let cancelled = false;

        (async () => {
            try {
                // Refresh the token each visit: browsers rotate them.
                await registerPushToken(userId);
                const messaging = await getFirebaseMessaging();
                if (!messaging || cancelled) return;

                // Foreground messages: the OS doesn't show them while the app is open.
                unsubscribe = onMessage(messaging, (payload) => {
                    const title = payload.notification?.title ?? payload.data?.title;
                    const body = payload.notification?.body ?? payload.data?.body;
                    const link = payload.fcmOptions?.link || payload.data?.link;
                    toast.info(`${title ?? 'Notification'}${body ? `: ${body}` : ''}`, {
                        action: link ? { label: 'Open', onClick: () => router.push(new URL(link, window.location.origin).pathname) } : undefined,
                    });
                });
            } catch (err) {
                console.error('Push registration failed:', err);
            }
        })();

        return () => {
            cancelled = true;
            unsubscribe?.();
        };
    }, [userId, router]);
}
