"use client";

import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { getRequiredDocuments } from "@/utils/documentConfig";
import { doc, onSnapshot, collection } from "firebase/firestore";
import { auth, db } from "@/firebase/client";
import { onAuthStateChanged } from "firebase/auth";

export default function ApplicationProgress() {
    const [reviewedCount, setReviewedCount] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [visaType, setVisaType] = useState<string | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // onAuthStateChanged ignores the callback's return value — clean up by hand.
        let unsubData: (() => void) | undefined;
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            unsubData?.();
            unsubData = undefined;
            if (user) {
                // Listen to user document for visaType
                const userDocRef = doc(db, "users", user.uid)
                const unsubUser = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        setVisaType(docSnap.data().onboarding?.visaType)
                    }
                })

                const reviewsCollRef = collection(db, "users", user.uid, "reviews");
                const unsubscribeReviews = onSnapshot(reviewsCollRef, (snapshot) => {
                    let count = 0;
                    let scoreSum = 0;
                    
                    // Get required docs based on current visa type
                    const requiredDocs = getRequiredDocuments(visaType).map(d => d.key);

                    snapshot.forEach((doc) => {
                        if (requiredDocs.includes(doc.id)) {
                            count++;
                            scoreSum += doc.data().score || 0;
                        }
                    });
                    setReviewedCount(count);
                    setTotalScore(scoreSum);
                    setLoading(false);
                });

                unsubData = () => {
                    unsubUser();
                    unsubscribeReviews();
                };
            } else {
                setReviewedCount(0);
                setTotalScore(0);
                setLoading(false);
            }
        });

        return () => {
            unsubData?.();
            unsubscribeAuth();
        };
    }, [visaType]);

    const checklistData = getRequiredDocuments(visaType);
    const totalDocs = checklistData.length;
    const maxScore = totalDocs * 100;
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    if (loading) {
        return (
            <div className="h-[132px] animate-pulse rounded-[1.5rem] border border-lp-line bg-lp-card-2"></div>
        );
    }

    return (
        <div className="rounded-[1.5rem] border border-lp-line bg-lp-card text-lp-fg lp-shadow p-6">
            <div className="mb-5 flex items-end justify-between gap-4">
                <div className="space-y-1">
                    <h3 className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">Overall Progress</h3>
                    <p className="text-sm text-lp-muted">
                        <span className="font-semibold text-lp-fg">{reviewedCount}</span> out of {totalDocs} documents reviewed.
                    </p>
                </div>
                <span className="font-display text-4xl font-semibold tracking-[-0.05em]">
                    {percentage}<span className="text-xl text-lp-muted">%</span>
                </span>
            </div>
            <Progress value={percentage} className="h-2 bg-lp-sky [&_[data-slot=progress-indicator]]:bg-lp-azure [&_[data-slot=progress-indicator]]:rounded-full" />
        </div>
    );
}
