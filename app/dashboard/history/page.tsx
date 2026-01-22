"use client"

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { 
  FileText, 
  Mic, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  ArrowUpRight,
  Calendar,
  Activity,
  AlertCircle
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { auth, db } from "@/firebase/client";
import { doc, onSnapshot, collection, query, orderBy, limit } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { format } from "date-fns";

export default function HistoryPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [loadingState, setLoadingState] = useState({ user: true, reviews: true, interviews: true });
  const [metrics, setMetrics] = useState({
    docsReviewed: 0,
    totalDocs: 7, // Based on required list
    interviewAttempts: 0,
    readinessScore: 0,
    docScoreAvg: 0
  });
  const [timeline, setTimeline] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  const isLoading = Object.values(loadingState).some(v => v);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 1. Listen to User Doc (for uploads & onboarding)
        const userDocRef = doc(db, "users", user.uid);
        const unsubUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Add onboarding to timeline
            const newTimeline:any[] = [];
            if (data.createdAt) {
              newTimeline.push({
                id: 'onboarding',
                title: "Profile Created",
                date: data.createdAt,
                description: "Initial setup and goal setting completed.",
                icon: CheckCircle,
                status: "completed"
              });
            }

            // Add uploads to timeline
            if (data.documents) {
              Object.entries(data.documents).forEach(([key, url]) => {
                // Handle both old string URLs and new object structure
                // @ts-ignore
                const timestamp = url.uploadedAt || data.updatedAt || new Date().toISOString(); 
                
                newTimeline.push({
                  id: `upload-${key}`,
                  title: `${key.replace(/([A-Z])/g, ' $1').trim()} Uploaded`,
                  date: timestamp,
                  description: "Document uploaded successfully.",
                  icon: FileText,
                  status: "completed"
                });
              });
            }
            
            setTimeline(prev => {
                // Merge and sort
                const combined = [...prev.filter(i => !i.id.startsWith('upload-') && i.id !== 'onboarding'), ...newTimeline];
                return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
            });
          }
          setLoadingState(prev => ({ ...prev, user: false }));
        });

        // 2. Listen to Reviews (for scores & timeline)
        const reviewsRef = collection(db, "users", user.uid, "reviews");
        const unsubReviews = onSnapshot(reviewsRef, (snapshot) => {
          const reviewEvents: any[] = [];
          const scores: any[] = [];
          let docScoreSum = 0;
          let docCount = 0;

          snapshot.forEach((doc) => {
            const data = doc.data();
            docCount++;
            docScoreSum += data.score || 0;

            reviewEvents.push({
              id: `review-${doc.id}`,
              title: `${doc.id.replace(/([A-Z])/g, ' $1').trim()} Reviewed`,
              date: data.createdAt,
              description: `AI Score: ${data.score}/100. ${data.summary?.substring(0, 50)}...`,
              icon: FileText,
              status: data.score >= 80 ? "completed" : "warning"
            });

            scores.push({
                date: data.createdAt,
                score: data.score,
                type: 'doc'
            });
          });

          setMetrics(prev => ({
            ...prev,
            docsReviewed: docCount,
            docScoreAvg: docCount > 0 ? docScoreSum / docCount : 0,
            // Recalculate readiness with new doc score
            readinessScore: Math.round(
                (docCount > 0 ? docScoreSum / docCount : 0) * (prev.interviewAttempts > 0 ? 0.6 : 1) + 
                (prev.interviewAttempts > 0 ? ((prev as any).interviewScoreAvg || 0) * 0.4 : 0)
            )
          }));

          setTimeline(prev => {
             const combined = [...prev.filter(i => !i.id.startsWith('review-')), ...reviewEvents];
             return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
          });
          
          setLoadingState(prev => ({ ...prev, reviews: false }));
        });

        // 3. Listen to Interview Sessions
        const interviewsRef = collection(db, "users", user.uid, "interview_sessions");
        const unsubInterviews = onSnapshot(interviewsRef, (snapshot) => {
            const interviewEvents: any[] = [];
            let interviewCount = 0;
            let interviewScoreSum = 0;

            snapshot.forEach((doc) => {
                const data = doc.data();
                interviewCount++;
                const score = data.feedback?.overallScore || 0;
                interviewScoreSum += score;

                interviewEvents.push({
                    id: `interview-${doc.id}`,
                    title: "Mock Interview Completed",
                    date: data.date,
                    description: `Score: ${score}%. ${data.feedback?.summary?.substring(0, 50) || "Session completed."}...`,
                    icon: Mic,
                    status: score >= 70 ? "completed" : "warning"
                });
            });

            const interviewAvg = interviewCount > 0 ? interviewScoreSum / interviewCount : 0;

            setMetrics(prev => ({
                ...prev,
                interviewAttempts: interviewCount,
                interviewScoreAvg: interviewAvg,
                // Recalculate readiness
                readinessScore: Math.round(
                    (prev.docScoreAvg || 0) * (interviewCount > 0 ? 0.6 : 1) + 
                    (interviewCount > 0 ? interviewAvg * 0.4 : 0)
                )
            }));

            setTimeline(prev => {
                const combined = [...prev.filter(i => !i.id.startsWith('interview-')), ...interviewEvents];
                return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);
            });
            
            setLoadingState(prev => ({ ...prev, interviews: false }));
        });

        return () => {
          unsubUser();
          unsubReviews();
          unsubInterviews();
        };
      } else {
        setLoadingState({ user: false, reviews: false, interviews: false });
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!isLoading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(".page-header", { y: -20, opacity: 0, duration: 0.5, ease: "power2.out" });
        gsap.from(".metric-card", { y: 20, opacity: 0, stagger: 0.1, duration: 0.5, delay: 0.2, ease: "power2.out" });
        gsap.from(".chart-bar", { scaleY: 0, transformOrigin: "bottom", stagger: 0.05, duration: 0.6, delay: 0.5, ease: "back.out(1.2)" });
        gsap.from(".timeline-item", { x: -20, opacity: 0, stagger: 0.1, duration: 0.5, delay: 0.6, ease: "power2.out" });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading]);

  if (isLoading) {
      return <div className="p-6 max-w-7xl mx-auto space-y-8 animate-pulse">
          <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl" />
          <div className="grid gap-4 md:grid-cols-3">
              {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 dark:bg-gray-800 rounded-xl" />)}
          </div>
      </div>
  }

  return (
    <div ref={containerRef} className="p-2 w-full space-y-8">
      
      {/* Header */}
      <div className="page-header flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Progress & History</h1>
        <p className="text-muted-foreground">
          Track your growth, review past activities, and see how close you are to your goal.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="metric-card overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documents Reviewed</CardTitle>
              <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                <FileText className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.docsReviewed} <span className="text-sm text-muted-foreground font-normal">/ {metrics.totalDocs}</span></div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                {metrics.docsReviewed > 0 ? "Keep going!" : "Start uploading"}
              </p>
            </CardContent>
        </Card>

        <Card className="metric-card overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Interview Attempts</CardTitle>
              <div className="p-2 rounded-full bg-purple-500/10 text-purple-500">
                <Mic className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.interviewAttempts} <span className="text-sm text-muted-foreground font-normal">Sessions</span></div>
              <p className="text-xs text-muted-foreground mt-1">
                  {metrics.interviewAttempts > 0 ? "Practice makes perfect" : "Try a mock interview"}
              </p>
            </CardContent>
        </Card>

        <Card className="metric-card overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Readiness Score</CardTitle>
              <div className="p-2 rounded-full bg-green-500/10 text-green-500">
                <TrendingUp className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.readinessScore}% <span className="text-sm text-muted-foreground font-normal">/ 100%</span></div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                {metrics.readinessScore > 0 ? <ArrowUpRight className="h-3 w-3 text-green-500" /> : null}
                Combined AI analysis
              </p>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        
        {/* Score Improvement Chart */}
        <Card className="metric-card col-span-4">
          <CardHeader>
            <CardTitle>Readiness Score Improvement</CardTitle>
            <CardDescription>Your estimated visa approval probability based on document quality.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] w-full flex items-end justify-between gap-2 px-4 pt-4">
              {/* Placeholder chart data logic - ideally we'd track history of scores */}
              {/* For now, we just show a simple visual based on current score */}
              {[40, 55, 60, 65, 70, 75, metrics.readinessScore].map((score, index) => (
                <div key={index} className="flex flex-col items-center gap-2 w-full group">
                  <div className="relative w-full flex justify-center">
                    <div 
                      className="chart-bar w-full max-w-[40px] bg-primary/20 hover:bg-primary rounded-t-md transition-colors duration-300 relative group-hover:shadow-lg"
                      style={{ height: `${Math.max(score * 2, 4)}px` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border">
                        {score}%
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium truncate w-full text-center">
                      {index === 6 ? 'Now' : `Day ${index + 1}`}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Timeline */}
        <Card className="metric-card col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your latest actions and milestones.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:ml-[1.2rem] before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-muted-foreground/20 before:to-transparent">
              {timeline.map((item) => (
                <div key={item.id} className="timeline-item relative flex gap-4 pb-2">
                  <div className={`absolute left-0 mt-1 h-2.5 w-2.5 rounded-full border ring-4 ring-background ${
                    item.status === 'completed' ? 'bg-green-500 border-green-500' : 
                    item.status === 'warning' ? 'bg-yellow-500 border-yellow-500' : 'bg-muted-foreground'
                  } md:left-[0.6rem]`} />
                  
                  <div className="ml-6 md:ml-8 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium leading-none">{item.title}</span>
                      <span className="text-xs text-muted-foreground">
                          {item.date ? format(new Date(item.date), 'MMM d, h:mm a') : ''}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
              {timeline.length === 0 && (
                  <div className="ml-8 text-sm text-muted-foreground">No activity yet.</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
