import { db } from "@/firebase/admin";

export type PublicStats = {
    registeredApplicants?: number;
    documentReviews?: number;
    mockInterviews?: number;
};

async function safeCount(query: FirebaseFirestore.Query): Promise<number | undefined> {
    try {
        const snap = await query.count().get();
        return snap.data().count;
    } catch {
        // Collection-group index missing, permissions issue, etc. Omit the
        // metric instead of showing a guessed or zeroed number.
        return undefined;
    }
}

// Aggregate counts only — no document contents are read, no PII exposed.
// Any metric that can't be safely counted is simply left out of the result.
export async function getPublicStats(): Promise<PublicStats> {
    const [registeredApplicants, documentReviews, mockInterviews] = await Promise.all([
        safeCount(db.collection("users")),
        safeCount(db.collectionGroup("reviews")),
        safeCount(db.collectionGroup("interview_sessions")),
    ]);

    return { registeredApplicants, documentReviews, mockInterviews };
}
