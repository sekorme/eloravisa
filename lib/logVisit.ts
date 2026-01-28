'use client';

import { db } from '@/firebase/client';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export async function logVisit(country: string) {
    try {
        await addDoc(collection(db, 'visits'), {
            country,
            timestamp: serverTimestamp(),
        });
    } catch (err) {
        console.error('Visit logging failed:', err);
    }
}
