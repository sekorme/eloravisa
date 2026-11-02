'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/client';
import { useFCMToken } from '@/components/useFMCToken';

/** Keeps push registered on every dashboard page (mounted in the dashboard layout). */
export default function FCMInitializer() {
    const [uid, setUid] = useState<string | null>(null);
    useEffect(() => onAuthStateChanged(auth, (user) => setUid(user?.uid ?? null)), []);
    useFCMToken(uid);
    return null;
}
