'use client';


import { useFCMToken } from '@/components/useFMCToken';

export default function FCMInitializer({userid}:any) {
    useFCMToken(userid); // Register FCM token logic
    return null;   // No UI to render
}
