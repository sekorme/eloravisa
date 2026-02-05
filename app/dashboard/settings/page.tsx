"use client"

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from "gsap";
import ProfileForm from "@/components/dashboard/ProfileForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Bell, Shield, Lock, AlertTriangle, LogOut } from "lucide-react";
import { auth, db } from "@/firebase/client";
import { sendPasswordResetEmail, deleteUser, signOut } from "firebase/auth";
import { doc, deleteDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const SettingsPage = () => {
    const pageRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    // Controlled settings
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [marketingEmails, setMarketingEmails] = useState(false);

    // Danger zone confirmation
    const [confirmText, setConfirmText] = useState("");

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".settings-section", {
                opacity: 0,
                y: 24,
                duration: 0.6,
                stagger: 0.12,
                ease: "power3.out",
            });

            // small entrance for cards
            gsap.from(".settings-card", {
                opacity: 0,
                y: 8,
                duration: 0.6,
                stagger: 0.08,
                ease: "power3.out",
                delay: 0.08,
            });
        }, pageRef);

        return () => ctx.revert();
    }, []);

    const handleUpdatePassword = async () => {
        const user = auth.currentUser;
        if (user && user.email) {
            try {
                await sendPasswordResetEmail(auth, user.email);
                toast.success("Password reset email sent. Please check your inbox.");
            } catch (error: unknown) {
                console.error("Error sending password reset email:", error);
                toast.error("Failed to send password reset email. Please try again.");
            }
        } else {
            toast.error("No user logged in or email not found.");
        }
    };

    const handleDeleteAccount = async () => {
        const user = auth.currentUser;
        if (!user) return;

        setIsDeleting(true);
        try {
            // 1. Delete user data from Firestore
            await deleteDoc(doc(db, "users", user.uid));

            // 2. Delete user from Firebase Auth
            await deleteUser(user);

            toast.success("Account deleted successfully.");
            router.push("/");
        } catch (error: unknown) {
            console.error("Error deleting account:", error);
            const code = (error as { code?: string })?.code;
            if (code === 'auth/requires-recent-login') {
                toast.error("Please log out and log in again to delete your account.");
            } else {
                toast.error("Failed to delete account. Please try again.");
            }
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            toast.success("Signed out");
            router.push("/");
        } catch (err) {
            console.error(err);
            toast.error("Failed to sign out. Try again.");
        }
    };

    return (
        <div ref={pageRef} className="p-4 md:p-8 w-full max-w-5xl mx-auto">
            <div className="settings-section mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Settings</h1>
                        <p className="text-sm text-muted-foreground mt-1">Manage your account preferences and application settings.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={handleSignOut} className="flex items-center gap-2">
                            <LogOut className="w-4 h-4" /> Sign out
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="settings-section settings-card">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Bell className="w-5 h-5 text-primary" /> Notifications
                            </CardTitle>
                            <CardDescription>Configure how you receive alerts and updates.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Email Notifications</Label>
                                    <p className="text-sm text-muted-foreground">Receive emails about your application status.</p>
                                </div>
                                <Switch checked={emailNotifications} onCheckedChange={(v: boolean) => setEmailNotifications(v)} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Marketing Emails</Label>
                                    <p className="text-sm text-muted-foreground">Receive emails about new features and offers.</p>
                                </div>
                                <Switch checked={marketingEmails} onCheckedChange={(v: boolean) => setMarketingEmails(v)} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="settings-section settings-card">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Shield className="w-5 h-5 text-foreground" /> Security
                            </CardTitle>
                            <CardDescription>Manage your password and account security.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Two-Factor Authentication</Label>
                                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                                </div>
                                <Button variant="outline" disabled className="whitespace-nowrap">Enable 2FA (Soon)</Button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Change Password</Label>
                                    <p className="text-sm text-muted-foreground">Update your password regularly to keep your account safe.</p>
                                </div>
                                <Button variant="ghost" onClick={handleUpdatePassword}>Send Reset</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="settings-section settings-card md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Lock className="w-5 h-5" /> Privacy & Account
                            </CardTitle>
                            <CardDescription>Account-related preferences and profile settings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ProfileForm />
                        </CardContent>
                    </Card>
                </div>

                <div className="settings-section settings-card md:col-span-2">
                    <Card className="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                                <AlertTriangle className="w-5 h-5" /> Danger Zone
                            </CardTitle>
                            <CardDescription className="text-red-600/80 dark:text-red-400/80">Irreversible actions for your account.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <Label className="text-base text-red-600 dark:text-red-400">Delete Account</Label>
                                    <p className="text-sm text-red-600/70 dark:text-red-400/70 mt-1">Permanently delete your account and all data. This action cannot be undone.</p>
                                    <p className="text-sm text-muted-foreground mt-2">To confirm, type <span className="font-mono">DELETE</span> below.</p>
                                    <input
                                        value={confirmText}
                                        onChange={(e) => setConfirmText(e.target.value)}
                                        className="mt-2 w-full rounded-md border px-3 py-2 text-sm bg-transparent border-red-300 dark:border-red-800"
                                        placeholder="Type DELETE to confirm"
                                    />
                                </div>
                                <div className="w-44 flex-shrink-0 flex flex-col items-end">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" disabled={isDeleting || confirmText !== 'DELETE'} className="w-full">
                                                {isDeleting ? "Deleting..." : "Delete Account"}
                                            </Button>
                                        </AlertDialogTrigger>

                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">Continue</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
