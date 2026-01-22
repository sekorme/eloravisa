"use client"

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import ProfileForm from "@/components/dashboard/ProfileForm";

export default function ProfilePage() {
    const pageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".profile-section", {
                opacity: 0,
                y: 24,
                duration: 0.6,
                stagger: 0.15,
                ease: "power3.out",
            });
        }, pageRef);

        return () => ctx.revert();
    }, []);

    return (
        <main ref={pageRef} className="min-h-screen p-2 md:p-6 w-full">
            <div className="space-y-8 max-w-4xl mx-auto">
                <div className="profile-section">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
                        <p className="text-muted-foreground">
                            Manage your personal and application details.
                        </p>
                    </div>
                    <ProfileForm />
                </div>
            </div>
        </main>
    );
}
