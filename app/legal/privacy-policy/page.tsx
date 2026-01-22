"use client"

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ShieldCheck, Lock, Eye, Server, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".header-animate", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out"
      });

      gsap.from(".policy-section", {
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
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
          <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          We value your trust and are committed to protecting your personal information.
        </p>
        <p className="text-sm text-slate-500">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-8">
        <section className="policy-section space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            1. Introduction
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Welcome to Elora Visa ("we," "our," or "us"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our AI-powered visa assistance services. By using our service, you agree to the collection and use of information in accordance with this policy.
          </p>
        </section>

        <section className="policy-section">
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Eye className="w-5 h-5 text-blue-500" />
                2. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 dark:text-slate-300">
                We collect information that you provide directly to us:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-300">
                <li><strong>Personal Data:</strong> Name, email address, phone number, and country of residence.</li>
                <li><strong>Application Data:</strong> Visa type, destination country, and uploaded documents (e.g., passport copies, bank statements) for analysis.</li>
                <li><strong>Usage Data:</strong> Information about how you use our website, such as access times, pages viewed, and IP address.</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <section className="policy-section space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            3. How We Use Your Information
          </h2>
          <p className="text-slate-600 dark:text-slate-300">We use the collected data for various purposes:</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold mb-2">Service Delivery</h3>
              <p className="text-sm text-slate-500">To provide and maintain our Service, including AI analysis and mock interviews.</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold mb-2">Communication</h3>
              <p className="text-sm text-slate-500">To contact you with newsletters, marketing or promotional materials.</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold mb-2">Improvement</h3>
              <p className="text-sm text-slate-500">To provide analysis or valuable information so that we can improve the Service.</p>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold mb-2">Security</h3>
              <p className="text-sm text-slate-500">To monitor the usage of the Service and detect, prevent and address technical issues.</p>
            </div>
          </div>
        </section>

        <section className="policy-section">
          <Card className="border-l-4 border-l-green-500 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Lock className="w-5 h-5 text-green-500" />
                4. Data Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="policy-section">
          <Card className="border-l-4 border-l-purple-500 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Server className="w-5 h-5 text-purple-500" />
                5. AI Processing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Our services utilize Artificial Intelligence (AI) to analyze your documents and simulate interviews. Data processed by our AI models is used solely for the purpose of providing you with feedback. We do not use your personal data to train our public AI models without your explicit consent.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="policy-section space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            6. Contact Us
          </h2>
          <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-900 rounded-lg w-fit">
            <Mail className="w-5 h-5 text-slate-500" />
            <p className="text-slate-600 dark:text-slate-300">
              If you have any questions about this Privacy Policy, please contact us: 
              <a href="mailto:support@eloravisa.com" className="text-blue-600 hover:underline ml-1">support@eloravisa.com</a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
