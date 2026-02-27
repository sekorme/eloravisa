import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

// ── Initialise Firebase Admin once ───────────────────────────────────────────
if (!admin.apps.length) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccountKey) {
        try {
            const serviceAccount = JSON.parse(serviceAccountKey);
            admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        } catch (error) {
            console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", error);
        }
    } else {
        console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is not defined");
    }
}

// Helper to get instances safely
const getDb = () => {
    if (!admin.apps.length) throw new Error("Firebase Admin not initialized");
    return getFirestore();
};

const getMsg = () => {
    if (!admin.apps.length) throw new Error("Firebase Admin not initialized");
    return getMessaging();
};

// helper: split an array in chunks of N
const chunk = <T>(arr: T[], size: number) =>
    Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
        arr.slice(i * size, i * size + size),
    );

// ── POST /api/notifications/broadcast ────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const db = getDb();
        const messaging = getMsg();

        /* 1️⃣  validate input ---------------------------------------------------- */
        const { title, body } = await req.json();

        if (!title || !body) {
            return NextResponse.json(
                { success: false, error: "Title and body are required." },
                { status: 400 },
            );
        }

        /* 2️⃣  collect unique tokens & map → userId ----------------------------- */
        const snap = await db.collection("users").select("fcmToken").get();
        const tokenToUid: Record<string, string> = {};

        snap.forEach((d) => {
            const token = d.get("fcmToken");

            if (token) tokenToUid[token] = d.id; // dedupe automatically
        });

        const tokens = Object.keys(tokenToUid);

        if (!tokens.length) {
            return NextResponse.json(
                { success: false, error: "No FCM tokens found." },
                { status: 404 },
            );
        }

        /* 3️⃣  send FCM in ≤500‑token chunks ------------------------------------ */
        let successCount = 0;
        let failureCount = 0;
        const invalidUids: Set<string> = new Set();

        for (const slice of chunk(tokens, 500)) {
            const res = await messaging.sendEachForMulticast({
                tokens: slice,
                data: {
                    title,
                    body,
                    icon: "/512.png",
                    link: "https://eloraadmin.com/dashboard",
                },
            });

            successCount += res.successCount;
            failureCount += res.failureCount;

            res.responses.forEach((r, idx) => {
                if (!r.success) invalidUids.add(tokenToUid[slice[idx]]);
            });
        }

        /* 4️⃣  write notifications + scrub bad tokens with BulkWriter ----------- */
        const bw = db.bulkWriter(); // auto‑splits into 500‑write batches
        const createdAt = FieldValue.serverTimestamp();
        const expiresAt = admin.firestore.Timestamp.fromDate(
            new Date(Date.now() + 3  * 60 * 1000) // 1 days in ms
        );

        // a) notification docs
        tokens.forEach((t) => {
            const uid = tokenToUid[t];
            const ref = db.doc(
                `users/${uid}/notifications/${db.collection("_").doc().id}`,
            );

            bw.set(ref, {
                title,
                body,
                icon: "/512.png",
                url: "https://eloravisa.com/admin",
                createdAt,
                expiresAt,
                read: false,
            });
        });

        // b) clear invalid tokens
        invalidUids.forEach((uid) => {
            bw.update(db.doc(`users/${uid}`), { fcmToken: "" });
        });

        await bw.close(); // flush all queued writes

        /* 5️⃣  done ------------------------------------------------------------- */
        return NextResponse.json({
            success: true,
            successCount,
            failureCount,
        });
    } catch (err: any) {
        console.error("🔥 Broadcast error:", err);

        return NextResponse.json(
            { success: false, error: err?.message ?? "Unexpected server error." },
            { status: 500 },
        );
    }
}
