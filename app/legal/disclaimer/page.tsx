"use client"

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { AlertTriangle, ShieldAlert, FileWarning, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function Disclaimer() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".header-animate", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });

      gsap.from(".section-card", {
        y: 40,
        opacity: 0,
        duration: 0.6,
        stagger: 0.15,
        delay: 0.3,
        ease: "power2.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="space-y-12">
      <div className="header-animate text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full mb-4">
          <ShieldAlert className="w-8 h-8 text-amber-600 dark:text-amber-500" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
          Disclaimer
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Please read this disclaimer carefully before using Elora Visa.
        </p>
        <p className="text-sm text-slate-500">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="section-card border-l-4 border-l-blue-500 shadow-md">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <FileWarning className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Not Legal Advice</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              The information provided by Elora Visa ("we," "us," or "our") on our website and through our services is for 
              <strong> general informational and educational purposes only</strong>. All information is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Elora Visa is not a law firm and does not provide legal advice. Our AI-powered tools are designed to assist with preparation but should not be considered a substitute for professional legal counsel or official government guidance.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="section-card border-l-4 border-l-red-500 shadow-md">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Guarantee of Results</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              We do not guarantee that using our services will result in the approval of your visa application. 
              <strong> Visa issuance is at the sole discretion of the respective embassy or consulate.</strong> 
              Past performance or examples shown on the site do not guarantee future results.
            </p>
          </CardContent>
        </Card>

        <Card className="section-card border-l-4 border-l-purple-500 shadow-md">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-3">
              <ExternalLink className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">External Links</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Our website may contain links to other websites or content belonging to or originating from third parties. 
              Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us. 
              We do not warrant, endorse, guarantee, or assume responsibility for the accuracy or reliability of any information offered by third-party websites linked through the site.
            </p>
          </CardContent>
        </Card>

        <Card className="section-card border-l-4 border-l-slate-500 shadow-md">
          <CardContent className="p-6 space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Use at Your Own Risk</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Your use of the site and our services and your reliance on any information is solely at your own risk.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
