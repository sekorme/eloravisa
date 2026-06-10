"use client"

import React, { useEffect, useRef } from "react";
import { Metadata } from "next";
import { gsap } from "gsap";
import { FileText, Scale, Shield, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Terms of Service | Elora Visa",
  description: "Read the Terms of Service for Elora Visa to understand the rules and guidelines for using our AI-powered visa application assistance.",
};

export default function TermsOfService() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".header-animate", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });

      gsap.from(".terms-section", {
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        delay: 0.3,
        ease: "power2.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="space-y-12">
      <div className="header-animate text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
          <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
          Terms of Service
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Please read these terms carefully before using our services.
        </p>
        <p className="text-sm text-slate-500">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-8">
        <section className="terms-section space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            1. Agreement to Terms
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            By accessing or using Elora Visa, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section className="terms-section">
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Scale className="w-5 h-5 text-blue-500" />
                2. Description of Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Elora Visa provides AI-powered tools to assist users with their visa applications, including document analysis and mock interviews. We are an educational and preparatory tool, not a law firm or a government agency.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="terms-section">
          <Card className="border-l-4 border-l-red-500 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <AlertCircle className="w-5 h-5 text-red-500" />
                3. No Guarantee of Visa Approval
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>Important:</strong> Elora Visa does not guarantee that your visa application will be approved. The decision to grant or deny a visa rests solely with the relevant government authorities (embassies/consulates). Our services are designed to improve your preparation, but we cannot influence the outcome.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="terms-section space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            4. User Responsibilities
          </h2>
          <p className="text-slate-600 dark:text-slate-300">You are responsible for:</p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
            <li>Providing accurate and truthful information.</li>
            <li>Ensuring that your use of the service complies with all applicable laws and regulations.</li>
            <li>Maintaining the confidentiality of your account credentials.</li>
          </ul>
        </section>

        <section className="terms-section">
          <Card className="border-l-4 border-l-purple-500 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Shield className="w-5 h-5 text-purple-500" />
                5. Intellectual Property
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                The content, features, and functionality of Elora Visa, including but not limited to text, graphics, logos, and software, are the exclusive property of Elora Visa and are protected by copyright, trademark, and other intellectual property laws.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="terms-section space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            6. Limitation of Liability
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            In no event shall Elora Visa, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
          </p>
        </section>

        <section className="terms-section space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            7. Changes to Terms
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days' notice prior to any new terms taking effect.
          </p>
        </section>
      </div>
    </div>
  );
}
