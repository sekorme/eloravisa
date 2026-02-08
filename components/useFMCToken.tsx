'use client';

import { useEffect } from 'react';
import { getToken, onMessage, Unsubscribe } from 'firebase/messaging';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/client';
import { getFirebaseMessaging } from '@/lib/firebase';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export function useFCMToken(userId: string | null) {
    const router = useRouter();

    useEffect(() => {
        if (!userId) return;               // wait for auth

        let unsubscribe: Unsubscribe | null = null;

        (async () => {
            try {
                // 1️⃣  Ask permission
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    console.log('🔕 Notification permission denied');
                    return;
                }

                // 2️⃣  Get Messaging instance
                const messaging = await getFirebaseMessaging();
                if (!messaging) return;

                // 3️⃣  Retrieve token
                const token = await getToken(messaging, {
                    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID!,
                });

                if (token) {
                    console.log('✅ FCM Token:', token);
                    await updateDoc(doc(db, 'users', userId), { fcmToken: token });
                } else {
                    console.warn('⚠️ No registration token available');
                }

                // 4️⃣  Foreground notifications → toast
                unsubscribe = onMessage(messaging, (payload) => {
                    console.log('📩 Foreground message:', payload);

                    // Extract title/body/link
                    const { title, body } = payload.notification || {};
                    const link = payload.fcmOptions?.link || payload.data?.link;

                    toast.info(`${title ?? 'Notification'}: ${body ?? ''}`, {
                        action: link
                            ? {
                                label: 'Open',
                                onClick: () => router.push(link),
                            }
                            : undefined,
                    });
                });
            } catch (err) {
                console.error('❌ Error getting FCM token:', err);
            }
        })();

        // 5️⃣  Cleanup listener on unmount
        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [userId, router]);
}
