import { db } from "@/firebase/admin";

// Admin-SDK (server-side) equivalent of lib/subscriptions.ts's deductTokens,
// for routes that authenticate via a Bearer ID token instead of the client
// Firestore SDK. Both use a transaction so concurrent requests can't both
// pass the balance check and double-spend.
export async function deductTokensAdmin(uid: string, amount: number) {
    const userRef = db.collection("users").doc(uid);
    await db.runTransaction(async (tx) => {
        const snap = await tx.get(userRef);
        if (!snap.exists) throw new Error("User not found");
        const current = snap.data()?.tokens || 0;
        if (current < amount) throw new Error("Insufficient tokens");
        tx.update(userRef, { tokens: current - amount, updatedAt: Date.now() });
    });
}

export async function refundTokensAdmin(uid: string, amount: number) {
    const userRef = db.collection("users").doc(uid);
    await db.runTransaction(async (tx) => {
        const snap = await tx.get(userRef);
        if (!snap.exists) return;
        const current = snap.data()?.tokens || 0;
        tx.update(userRef, { tokens: current + amount, updatedAt: Date.now() });
    });
}
