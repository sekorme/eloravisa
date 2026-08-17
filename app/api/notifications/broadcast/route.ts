import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { getAuth } from "firebase-admin/auth";
import { requireAdmin } from "@/lib/requireAdmin";

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

// How many user docs one invocation reads/sends per call. At 50k+ users a
// single unbounded collection scan risks hitting the serverless function's
// time/memory limits, so the caller pages through with `cursor` /
// `nextCursor` until the response comes back with `done: true`.
const PAGE_SIZE = 2000;

// Allow enough headroom for a full page's worth of FCM multicast round-trips
// and BulkWriter flushes. Actual ceiling is still capped by the hosting
// plan (e.g. Vercel Hobby caps at 60s regardless of this value).
export const maxDuration = 300;

// ── POST /api/notifications/broadcast ────────────────────────────────────────
export async function POST(req: NextRequest) {
    try {
        const db = getDb();
        const messaging = getMsg();

        /* 0️⃣  require an authenticated admin ------------------------------------ */
        const adminCheck = await requireAdmin(req, getAuth());
        if (adminCheck.error) {
            return NextResponse.json({ success: false, error: adminCheck.error }, { status: adminCheck.status });
        }

        /* 1️⃣  validate input ---------------------------------------------------- */
        const { title, body, cursor } = await req.json();

        if (!title || !body) {
            return NextResponse.json(
                { success: false, error: "Title and body are required." },
                { status: 400 },
            );
        }

        /* 2️⃣  collect unique tokens & map → userId, one page at a time --------- */
        let pageQuery = db
            .collection("users")
            .select("fcmToken")
            .orderBy(admin.firestore.FieldPath.documentId())
            .limit(PAGE_SIZE);

        if (typeof cursor === "string" && cursor) {
            pageQuery = pageQuery.startAfter(cursor);
        }

        const snap = await pageQuery.get();
        const tokenToUid: Record<string, string> = {};

        snap.forEach((d) => {
            const token = d.get("fcmToken");

            if (token) tokenToUid[token] = d.id; // dedupe automatically
        });

        const tokens = Object.keys(tokenToUid);
        const lastDoc = snap.docs[snap.docs.length - 1];
        const nextCursor = snap.size === PAGE_SIZE && lastDoc ? lastDoc.id : null;

        if (!tokens.length) {
            return NextResponse.json({
                success: true,
                successCount: 0,
                failureCount: 0,
                nextCursor,
                done: nextCursor === null,
            });
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

        /* 5️⃣  done for this page ------------------------------------------------ */
        return NextResponse.json({
            success: true,
            successCount,
            failureCount,
            nextCursor,
            done: nextCursor === null,
        });
    } catch (err: any) {
        console.error("🔥 Broadcast error:", err);

        return NextResponse.json(
            { success: false, error: err?.message ?? "Unexpected server error." },
            { status: 500 },
        );
    }
}
