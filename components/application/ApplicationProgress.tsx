"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
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
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
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

                return () => {
                    unsubUser();
                    unsubscribeReviews();
                }
            } else {
                setReviewedCount(0);
                setTotalScore(0);
                setLoading(false);
            }
        });

        return () => unsubscribeAuth();
    }, [visaType]);

    const checklistData = getRequiredDocuments(visaType);
    const totalDocs = checklistData.length;
    const maxScore = totalDocs * 100;
    const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    const getProgressColor = () => {
        if (percentage >= 80) return "[&_[data-slot=progress-indicator]]:bg-green-500";
        if (percentage >= 40) return "[&_[data-slot=progress-indicator]]:bg-yellow-500";
        return "[&_[data-slot=progress-indicator]]:bg-blue-600";
    };

    const getTextColor = () => {
        if (percentage >= 80) return "text-green-500";
        if (percentage >= 40) return "text-yellow-500";
        return "text-blue-600";
    };

    if (loading) {
        return (
            <Card className="p-6 space-y-4 bg-white dark:bg-card border-slate-200 dark:border-border shadow-sm animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
            </Card>
        );
    }

    return (
        <Card className="p-6 space-y-4 bg-white dark:bg-card border-slate-200 dark:border-border shadow-sm">
            <div className="flex justify-between items-end mb-1">
                <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Overall Progress</h3>
                    <p className="text-xs text-slate-500 dark:text-muted-foreground">
                        {reviewedCount} out of {totalDocs} documents reviewed.
                    </p>
                </div>
                <span className={`text-2xl font-bold ${getTextColor()}`}>{percentage}%</span>
            </div>
            <Progress value={percentage} className={`h-2 bg-slate-100 dark:bg-slate-800 ${getProgressColor()}`} />
        </Card>
    );
}
