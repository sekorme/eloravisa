"use client"

import React, { useEffect, useRef } from "react";
import { Metadata } from "next";
import { gsap } from "gsap";
import { Cookie, Info, Settings, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Cookie Policy | Elora Visa",
  description: "Learn about how Elora Visa uses cookies to improve your user experience and provide personalized services.",
};

export default function CookiePolicy() {
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
        <div className="inline-flex items-center justify-center p-3 bg-orange-100 dark:bg-orange-900/30 rounded-full mb-4">
          <Cookie className="w-8 h-8 text-orange-600 dark:text-orange-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
          Cookie Policy
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Understanding how and why we use cookies to improve your experience.
        </p>
        <p className="text-sm text-slate-500">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="space-y-8">
        <section className="policy-section space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            1. What Are Cookies?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site.
          </p>
        </section>

        <section className="policy-section">
          <Card className="border-l-4 border-l-blue-500 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Info className="w-5 h-5 text-blue-500" />
                2. How We Use Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 dark:text-slate-300">We use cookies for the following purposes:</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <h3 className="font-semibold">Essential</h3>
                  </div>
                  <p className="text-sm text-slate-500">Necessary for the website to function properly, such as managing your login session.</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="w-4 h-4 text-blue-500" />
                    <h3 className="font-semibold">Functionality</h3>
                  </div>
                  <p className="text-sm text-slate-500">Allow the website to remember choices you make (like language or region) for a personalized experience.</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="w-4 h-4 text-purple-500" />
                    <h3 className="font-semibold">Analytics</h3>
                  </div>
                  <p className="text-sm text-slate-500">Help us understand how visitors interact with our website by collecting and reporting information anonymously.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="policy-section">
          <Card className="border-l-4 border-l-orange-500 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Settings className="w-5 h-5 text-orange-500" />
                3. Managing Cookies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience, since it will no longer be personalized to you. It may also stop you from saving customized settings like login information.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="policy-section space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            4. Changes to This Policy
          </h2>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            We may update our Cookie Policy from time to time. We encourage you to periodically review this page for the latest information on our privacy practices.
          </p>
        </section>
      </div>
    </div>
  );
}
