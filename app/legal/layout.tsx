import React from "react";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { Footer } from "@/components/landing/Footer";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <LandingNavbar />
      <main className="flex-1 container mx-auto px-4 py-24 max-w-4xl">
        {children}
      </main>
      <Footer />
    </div>
  );
}
