"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { gsap } from "gsap";
import countries from "world-countries";
import confetti from "canvas-confetti";
import { CheckCircle2, Loader2 } from "lucide-react";
import { ClientOnly } from "@/components/ClientOnly";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/firebase/client";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

const steps = 7;

// Sorted list of countries for the dropdowns
const countryList = countries
    .map(c => ({
        name: c.name.common,
        code: c.cca2,
        nationality: c.demonyms?.eng?.m || c.name.common
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

export default function OnboardingForm() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [isFinished, setIsFinished] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // Form state
    const [formData, setFormData] = useState({
        residence: "",
        nationality: "",
        ageRange: "",
        education: "",
        destination: "",
        visaType: "",
        appStatus: "",
        refused: "",
        refusalCountry: "",
        refusalYear: "",
        overstayed: "",
        sponsor: "",
        funds: "",
        confidence: "",
        concerns: [] as string[],
        guidance: "",
        notifications: "",
        legal1: false,
        legal2: false,
        legal3: false,
    });

    // Load initial data from Firestore
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        // Pre-fill fields if they exist in the user profile
                        setFormData(prev => ({
                            ...prev,
                            residence: data.country || prev.residence, // Use signup country as default residence
                        }));
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                // Redirect to login if not authenticated? 
                // For now, we'll let them stay but they won't be able to save.
                // Ideally: router.push('/');
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (isFinished) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                zIndex: 100,
            });
            saveData();
        }

        if (containerRef.current) {
            gsap.fromTo(
                containerRef.current,
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
            );
        }
    }, [step, isFinished]);

    const saveData = async () => {
        setIsSaving(true);
        try {
            const user = auth.currentUser;
            if (!user) {
                console.error("No authenticated user found");
                return;
            }

            const finalData = {
                onboarding: formData,
                completedOnboarding: true,
                updatedAt: new Date().toISOString(),
            };

            // Update the existing user document
            await updateDoc(doc(db, "users", user.uid), finalData);
            
        } catch (error) {
            console.error("Error saving onboarding data:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const next = () => {
        if (step === steps) {
            setIsFinished(true);
        } else {
            setStep((s) => Math.min(s + 1, steps));
        }
    };
    const back = () => setStep((s) => Math.max(s - 1, 1));

    const updateForm = (key: string, value: any) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    if (isFinished) {
        return (
            <ClientOnly>
                <main className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950 py-12">
                    <Card ref={containerRef} className="w-full max-w-md p-8 space-y-6 shadow-xl border-t-4 border-t-emerald-500">
                        <div className="text-center space-y-4">
                            <div className="flex justify-center">
                                <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome aboard!</h1>
                            <p className="text-slate-600 dark:text-slate-400">
                                We've personalized your roadmap for your <strong>{formData.destination} {formData.visaType} Visa</strong>.
                            </p>
                        </div>

                        <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl space-y-2">
                            <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-500">Your Goal</h3>
                            <p className="text-lg font-medium">
                                {formData.destination} — {formData.visaType}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Current Status: {formData.appStatus}
                            </p>
                        </div>

                        <Button 
                            className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white transition-all"
                            onClick={() => router.push('/dashboard')}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving Profile...
                                </>
                            ) : (
                                "Go to My Dashboard"
                            )}
                        </Button>
                    </Card>
                </main>
            </ClientOnly>
        );
    }

    return (
        <ClientOnly>
            <main className="min-h-screen flex items-center justify-center px-4 bg-slate-50 dark:bg-slate-950 py-12">
                <Card className="w-full max-w-md p-6 space-y-6 shadow-lg border-none">
                    {/* Progress */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-end">
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Step {step} of {steps}</span>
                            <span className="text-xs text-slate-400">{Math.round((step / steps) * 100)}% Complete</span>
                        </div>
                        <Progress value={(step / steps) * 100} className="h-1.5" />
                    </div>

                    {/* Content */}
                    <div ref={containerRef} className="min-h-[350px]">
                        {step === 1 && <StepOne data={formData} update={updateForm} />}
                        {step === 2 && <StepTwo data={formData} update={updateForm} />}
                        {step === 3 && <StepThree data={formData} update={updateForm} />}
                        {step === 4 && <StepFour data={formData} update={updateForm} />}
                        {step === 5 && <StepFive data={formData} update={updateForm} />}
                        {step === 6 && <StepSix data={formData} update={updateForm} />}
                        {step === 7 && <StepSeven data={formData} update={updateForm} />}
                    </div>

                    {/* Navigation */}
                    <div className="flex flex-col gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between gap-4">
                            <Button 
                                variant="ghost" 
                                onClick={back} 
                                disabled={step === 1}
                                className="flex-1 h-11"
                            >
                                Back
                            </Button>
                            <Button 
                                onClick={next}
                                className="flex-[2] h-11 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {step === steps ? "Finish" : "Continue"}
                            </Button>
                        </div>
                        <button className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors mx-auto">
                            Save and continue later
                        </button>
                    </div>
                </Card>
            </main>
        </ClientOnly>
    );
}

/* ------------------ STEPS ------------------ */

function StepOne({ data, update }: any) {
    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Let’s start with you</h2>
                <p className="text-slate-500 text-sm">Help us understand your background.</p>
            </div>
            
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Country of residence</Label>
                    <Select value={data.residence} onValueChange={(v) => update("residence", v)}>
                        <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                        <SelectContent>
                            {countryList.map(c => (
                                <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Nationality</Label>
                    <Select value={data.nationality} onValueChange={(v) => update("nationality", v)}>
                        <SelectTrigger><SelectValue placeholder="Select nationality" /></SelectTrigger>
                        <SelectContent>
                            {countryList.map(c => (
                                <SelectItem key={c.code + "-nat"} value={c.name}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-3">
                    <Label>Age range</Label>
                    <RadioGroup value={data.ageRange} onValueChange={(v) => update("ageRange", v)} className="grid grid-cols-2 gap-3">
                        {["18–24", "25–34", "35–44", "45+"].map((age) => (
                            <Label key={age} className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                                <RadioGroupItem value={age} /> {age}
                            </Label>
                        ))}
                    </RadioGroup>
                </div>

                <div className="space-y-2">
                    <Label>Highest level of education</Label>
                    <Select value={data.education} onValueChange={(v) => update("education", v)}>
                        <SelectTrigger><SelectValue placeholder="Select education" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="shs">High School</SelectItem>
                            <SelectItem value="diploma">Diploma</SelectItem>
                            <SelectItem value="degree">Bachelor’s Degree</SelectItem>
                            <SelectItem value="masters">Master’s</SelectItem>
                            <SelectItem value="phd">PhD</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}

function StepTwo({ data, update }: any) {
    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your visa goal</h2>
                <p className="text-slate-500 text-sm">Where are you headed?</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Destination country</Label>
                    <Select value={data.destination} onValueChange={(v) => update("destination", v)}>
                        <SelectTrigger><SelectValue placeholder="Select Destination" /></SelectTrigger>
                        <SelectContent>
                            {countryList.map(c => (
                                <SelectItem key={c.code + "-nat"} value={c.name}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Visa type</Label>
                    <Select value={data.visaType} onValueChange={(v) => update("visaType", v)}>
                        <SelectTrigger><SelectValue placeholder="Select visa type" /></SelectTrigger>
                        <SelectContent>
                            {["Study", "Visit", "Work", "Family"].map((v) => (
                                <SelectItem key={v} value={v}>{v}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Application status</Label>
                    <Select value={data.appStatus} onValueChange={(v) => update("appStatus", v)}>
                        <SelectTrigger><SelectValue placeholder="Current status" /></SelectTrigger>
                        <SelectContent>
                            {["Not started", "In progress", "Appointment booked", "Previously refused"].map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}

function StepThree({ data, update }: any) {
    const refusalRef = useRef(null);

    useEffect(() => {
        if (data.refused === "yes") {
            gsap.fromTo(refusalRef.current, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.3 });
        }
    }, [data.refused]);

    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Visa history</h2>
                <p className="text-slate-500 text-sm">This helps us gauge your risk profile.</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-3">
                    <Label className="text-base">Have you ever been refused a visa?</Label>
                    <RadioGroup value={data.refused} onValueChange={(v) => update("refused", v)} className="flex gap-4">
                        <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer flex-1 hover:bg-slate-50 dark:hover:bg-slate-900 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                            <RadioGroupItem value="yes" /> Yes
                        </Label>
                        <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer flex-1 hover:bg-slate-50 dark:hover:bg-slate-900 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                            <RadioGroupItem value="no" /> No
                        </Label>
                    </RadioGroup>
                </div>

                {data.refused === "yes" && (
                    <div ref={refusalRef} className="space-y-4 pt-2">
                        <div className="space-y-2">
                            <Label>Which country?</Label>
                            <Input 
                                placeholder="e.g. USA"
                                style={{ fontSize: "16px" }}
                                value={data.refusalCountry} 
                                onChange={(e) => update("refusalCountry", e.target.value)} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>What year? (Optional)</Label>
                            <Input 
                                type="number" 
                                placeholder="2023"
                                style={{ fontSize: "16px" }}
                                value={data.refusalYear} 
                                onChange={(e) => update("refusalYear", e.target.value)} 
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    <Label className="text-base">Have you ever overstayed a visa?</Label>
                    <RadioGroup value={data.overstayed} onValueChange={(v) => update("overstayed", v)} className="flex gap-4">
                        <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer flex-1 hover:bg-slate-50 dark:hover:bg-slate-900 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                            <RadioGroupItem value="yes" /> Yes
                        </Label>
                        <Label className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer flex-1 hover:bg-slate-50 dark:hover:bg-slate-900 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                            <RadioGroupItem value="no" /> No
                        </Label>
                    </RadioGroup>
                </div>
            </div>
        </div>
    );
}

function StepFour({ data, update }: any) {
    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Financial picture</h2>
                <p className="text-slate-500 text-sm">Visas often require proof of funds.</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Who is sponsoring your trip?</Label>
                    <Select value={data.sponsor} onValueChange={(v) => update("sponsor", v)}>
                        <SelectTrigger><SelectValue placeholder="Select sponsor" /></SelectTrigger>
                        <SelectContent>
                            {["Self", "Parent", "Relative", "Scholarship"].map((s) => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Do you have the required funds?</Label>
                    <Select value={data.funds} onValueChange={(v) => update("funds", v)}>
                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="yes">Yes, I have them ready</SelectItem>
                            <SelectItem value="partial">Partially</SelectItem>
                            <SelectItem value="no">Not yet</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}

function StepFive({ data, update }: any) {
    const concerns = [
        { id: "sop", label: "Statement of Purpose" },
        { id: "bank", label: "Bank Statement" },
        { id: "interview", label: "Mock Interview" },
        { id: "refusal", label: "Refusal Risk" },
        { id: "docs", label: "Missing Documents" },
        { id: "timeline", label: "Processing Time" }
    ];

    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Experience & Concerns</h2>
                <p className="text-slate-500 text-sm">We're here to ease your mind.</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-3">
                    <Label>Confidence level</Label>
                    <RadioGroup value={data.confidence} onValueChange={(v) => update("confidence", v)} className="space-y-2">
                        {[
                            "Very confident",
                            "Somewhat confident",
                            "A bit unsure",
                            "Completely new"
                        ].map((c) => (
                            <Label key={c} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                                <RadioGroupItem value={c} /> {c}
                            </Label>
                        ))}
                    </RadioGroup>
                </div>

                <div className="space-y-3">
                    <Label>What are your biggest concerns?</Label>
                    <div className="grid grid-cols-2 gap-2">
                        {concerns.map((c) => (
                            <div 
                                key={c.id} 
                                onClick={() => {
                                    const nextConcerns = data.concerns.includes(c.id)
                                        ? data.concerns.filter((id: string) => id !== c.id)
                                        : [...data.concerns, c.id];
                                    update("concerns", nextConcerns);
                                }}
                                className={`p-2 text-xs border rounded-md cursor-pointer text-center transition-all ${
                                    data.concerns.includes(c.id) 
                                        ? "bg-blue-600 border-blue-600 text-white" 
                                        : "hover:border-blue-300"
                                }`}
                            >
                                {c.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StepSix({ data, update }: any) {
    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Support Preferences</h2>
                <p className="text-slate-500 text-sm">How do you prefer to be guided?</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Preferred guidance style</Label>
                    <Select value={data.guidance} onValueChange={(v) => update("guidance", v)}>
                        <SelectTrigger><SelectValue placeholder="Select style" /></SelectTrigger>
                        <SelectContent>
                            {["Checklist", "AI-only", "Telegram", "Combination"].map((g) => (
                                <SelectItem key={g} value={g}>{g}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Notifications</Label>
                    <Select value={data.notifications} onValueChange={(v) => update("notifications", v)}>
                        <SelectTrigger><SelectValue placeholder="How should we reach you?" /></SelectTrigger>
                        <SelectContent>
                            {["Email", "WhatsApp", "Telegram", "None"].map((n) => (
                                <SelectItem key={n} value={n}>{n}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}

function StepSeven({ data, update }: any) {
    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Legal Confirmation</h2>
                <p className="text-slate-500 text-sm">A few final agreements.</p>
            </div>

            <div className="space-y-4 bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-start gap-3">
                    <Checkbox 
                        id="legal1" 
                        checked={data.legal1} 
                        onCheckedChange={(v) => update("legal1", !!v)} 
                        className="mt-1" 
                    />
                    <Label htmlFor="legal1" className="text-sm font-normal leading-tight cursor-pointer">
                        I understand this platform provides guidance, not visa guarantees.
                    </Label>
                </div>
                
                <div className="flex items-start gap-3">
                    <Checkbox 
                        id="legal2" 
                        checked={data.legal2} 
                        onCheckedChange={(v) => update("legal2", !!v)} 
                        className="mt-1" 
                    />
                    <Label htmlFor="legal2" className="text-sm font-normal leading-tight cursor-pointer">
                        I am responsible for submitting my own application.
                    </Label>
                </div>

                <div className="flex items-start gap-3">
                    <Checkbox 
                        id="legal3" 
                        checked={data.legal3} 
                        onCheckedChange={(v) => update("legal3", !!v)} 
                        className="mt-1" 
                    />
                    <Label htmlFor="legal3" className="text-sm font-normal leading-tight cursor-pointer">
                        AI feedback is for educational purposes only.
                    </Label>
                </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-800 dark:text-blue-300 text-xs leading-relaxed">
                Note: This platform teaches you how to apply for visas by yourself. We do not provide legal advice or act as agents.
            </div>
        </div>
    );
}