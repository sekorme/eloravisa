import { initializeApp, getApps } from "firebase/app";
import type { FirebaseApp } from "firebase/app";
import { getMessaging, isSupported, type Messaging, onMessage as firebaseOnMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

let app: FirebaseApp;
if (!getApps().length) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

// ✅ Export a function to get the Messaging instance safely
export async function getFirebaseMessaging(): Promise<Messaging | null> {
    if (typeof window === "undefined") return null;

    const supported = await isSupported();
    if (!supported) {
        console.warn("🚫 Firebase messaging is not supported on this browser.");
        return null;
    }

    return getMessaging(app);
}

export { app, firebaseOnMessage };
