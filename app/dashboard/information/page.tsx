"use client"

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { 
  Book,
  Plane, 
  CreditCard, 
  Home, 
  FileText, 
  History, 
  PenTool, 
  MessageCircle,
  CircleDollarSign,
  FolderCheck, 
  Clock, 
  ShieldCheck, 
  Scale, 
  Lightbulb,
  Loader2
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { getCurrentUserDetails } from "@/action/user";
import { getVisaInformation } from "@/action/ai";
import { auth, db } from "@/firebase/client";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const iconMap: Record<string, any> = {
  Book, Plane, CreditCard, Home, FileText, History, PenTool, MessageCircle,
  CircleDollarSign, FolderCheck, Clock, ShieldCheck, Scale, Lightbulb
};

const defaultSections = [
  {
    title: "1. Valid Passport (Non-Negotiable)",
    icon: "Book",
    content: [
      "Must be valid at least 6 months beyond your intended travel date",
      "At least 1–2 blank pages",
      "No damage, missing pages, or inconsistent bio data"
    ],
    note: "Why it matters: A weak passport validity can lead to automatic refusal."
  },
];

export default function InformationPage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [infoData, setInfoData] = useState<any>({ sections: [], mentorAdvice: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfo = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        // 1. Fetch current user details first
        const userData = await getCurrentUserDetails();
        if (!userData) {
            setLoading(false);
            return;
        }

        // 2. Check cache
        const infoDocRef = doc(db, "users", user.uid, "cache", "visaInformation");
        const infoDoc = await getDoc(infoDocRef);
        let shouldUseCache = false;

        if (infoDoc.exists()) {
          const cachedData = infoDoc.data();
          const metadata = cachedData.metadata;

          // Check if profile matches cache metadata
          if (metadata &&
              metadata.destination === userData.onboarding?.destination &&
              metadata.visaType === userData.onboarding?.visaType &&
              metadata.residence === userData.onboarding?.residence &&
              metadata.country === userData.country) {

              setInfoData(cachedData);
              shouldUseCache = true;
          }
        }

        // 3. Regenerate if cache is stale or missing
        if (!shouldUseCache) {
            const response = await getVisaInformation(userData);
            if (response.success) {
              const newData = {
                  ...response.data,
                  metadata: {
                      destination: userData.onboarding?.destination,
                      visaType: userData.onboarding?.visaType,
                      residence: userData.onboarding?.residence,
                      country: userData.country,
                      updatedAt: new Date().toISOString()
                  }
              };
              setInfoData(newData);
              // Cache it with metadata
              await setDoc(infoDocRef, newData);
            }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching visa info:", error);
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) fetchInfo();
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && containerRef.current) {
      const ctx = gsap.context(() => {
        gsap.from(".info-card", { 
          y: 20, 
          opacity: 0, 
          stagger: 0.08, 
          duration: 0.45, 
          ease: "power2.out" 
        });
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-muted-foreground">Generating your personalized visa guide...</p>
      </div>
    );
  }

  const sections = infoData.sections?.length > 0 ? infoData.sections : defaultSections;
  const advice = infoData.mentorAdvice || "A strong visa application is about a believable story, supported by evidence, with clear intent to return.";

  return (
    <div ref={containerRef} className="p-2 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Visa Application Checklist & Best Practices</h1>
        <p className="text-muted-foreground max-w-3xl">
          Below are general visa application requirements and best practices that consular officers worldwide look for. 
          These do not guarantee approval but they significantly improve your chances when done correctly.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section: any, index: number) => {
          const IconComponent = iconMap[section.icon] || FileText;
          return (
            <Card key={index} className="info-card h-full flex flex-col border-l-4 border-l-primary/20 hover:border-l-primary transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="p-2 rounded-full bg-primary/10 text-primary">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-base">{section.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-1 text-sm">
                {section.description && (
                  <p className="mb-3 text-muted-foreground">{section.description}</p>
                )}
                
                {section.content && (
                  <ul className="list-disc pl-5 space-y-1 mb-3 text-muted-foreground">
                    {section.content.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
                
                {section.note && (
                  <div className="mt-auto pt-2 border-t text-xs text-muted-foreground italic">
                    {section.note}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="info-card mt-8 bg-primary/5 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <CardTitle>Final Mentor Advice</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium">
            {advice}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
