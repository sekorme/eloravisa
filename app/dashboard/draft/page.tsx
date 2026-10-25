"use client"

import React, { useEffect, useState, useRef } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase/client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {FileText, Download, Printer, Coins, Loader2, Sparkles, Wand2, Info, BookOpen, Send, Plane, ShieldCheck, Briefcase} from "lucide-react"
import { toast } from "sonner"
import { TOKEN_COSTS } from '@/lib/subscriptions'
import Link from 'next/link'

export default function DraftPage() {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [docType, setDocType] = useState<string>('Study SOP')
  const [extra, setExtra] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState<string>('')
  
  const printRef = useRef<HTMLDivElement>(null)

  const docTypes = [
    { value: "Study SOP", label: "Statement of Purpose (Study)", icon: BookOpen },
    { value: "Invitation Letter", label: "Invitation Letter", icon: Send },
    { value: "Travel Purpose", label: "Statement of Travel Purpose", icon: Plane },
    { value: "Sponsorship Letter", label: "Sponsorship Letter", icon: ShieldCheck },
    { value: "Cover Letter", label: "Visa Cover Letter", icon: Briefcase },
  ]

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser)
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid)
          const snap = await getDoc(docRef)
          if (snap.exists()) {
            setUserData(snap.data())
          }
        } catch (error) {
          console.error("Error fetching profile:", error)
          toast.error("Failed to load profile data")
        }
      }
    })
    return () => unsubscribe()
  }, [])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
        toast.error("Please sign in first")
        return
    }

    const currentTokens = userData?.tokens || 0;
    if (currentTokens < TOKEN_COSTS.DOCUMENT_DRAFT) {
      toast.error("Insufficient tokens", {
        description: `You need ${TOKEN_COSTS.DOCUMENT_DRAFT} tokens to generate a document.`,
        action: {
          label: "Buy Tokens",
          onClick: () => window.location.href = "/dashboard/subscription"
        }
      });
      return;
    }

    setLoading(true)
    setGenerated('')

    try {
      const idToken = await user.getIdToken()

      // Tokens are now deducted atomically server-side in /api/generate-letter,
      // so calling the route directly can't bypass payment.
      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          docType,
          extra
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate')
      }

      setGenerated(data.generated)
      toast.success("Document generated successfully!")
    } catch (err: any) {
      console.error(err)
      toast.error(err.message || "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    if (!printRef.current) return;

    const content = printRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=600,width=800');

    if (printWindow) {
        printWindow.document.write('<html><head><title>Print Document</title>');
        printWindow.document.write('<style>body { font-family: "Times New Roman", serif; padding: 40px; line-height: 1.6; white-space: pre-wrap; }</style>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(content);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-lp-page py-6 text-lp-fg">
        <div className="mx-auto w-full max-w-[1400px] space-y-6 px-4 md:px-8">
            <header className="flex shrink-0 flex-col items-center justify-between gap-4 sm:flex-row">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lp-navy text-[#8FCDAF]">
                        <Wand2 className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="font-display text-lg font-semibold tracking-[-0.04em] md:text-2xl">
                            Document Drafter
                        </h1>
                        <p className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-azure">
                            AI-Powered Professional Drafts
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full border border-lp-line bg-lp-card px-3.5 py-1.5 text-xs font-semibold">
                        <Coins className="mr-1.5 h-3.5 w-3.5 text-lp-azure" />
                        {TOKEN_COSTS.DOCUMENT_DRAFT} Tokens per draft
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-6 pb-12 lg:grid-cols-3">
                {/* Input Section */}
                <div className="h-fit overflow-hidden lg:col-span-1 rounded-[1.5rem] border border-lp-line bg-lp-card text-lp-fg lp-shadow">
                    <div className="border-b border-lp-line p-6">
                        <h3 className="font-display text-lg font-semibold tracking-[-0.03em]">Configuration</h3>
                        <p className="mt-1 text-xs text-lp-muted">Select document type and add details.</p>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleGenerate} className="space-y-6">
                            <div className="space-y-3">
                                <Label className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">Document Type</Label>
                                <Select value={docType} onValueChange={setDocType}>
                                    <SelectTrigger className="!h-11 w-full rounded-xl border-lp-line bg-lp-card">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-lp-line bg-lp-card">
                                        {docTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value} className="rounded-lg focus:bg-lp-sky">
                                                <div className="flex items-center gap-2">
                                                    <type.icon className="h-4 w-4 text-lp-azure" />
                                                    <span>{type.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="font-display text-[10px] font-medium uppercase tracking-[0.18em] text-lp-muted">Additional Details</Label>
                                    <div className="group relative">
                                        <Info className="h-3.5 w-3.5 cursor-help text-lp-muted" />
                                        <div className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 w-48 rounded-lg bg-lp-navy p-2 text-[10px] text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                                            The AI uses your profile (name, nationality, destination) automatically.
                                        </div>
                                    </div>
                                </div>
                                <Textarea
                                    value={extra}
                                    onChange={(e) => setExtra(e.target.value)}
                                    placeholder="E.g., University name, course details, host's relationship, travel dates..."
                                    className="min-h-[180px] resize-none rounded-xl border-lp-line bg-lp-card focus-visible:ring-lp-azure/40"
                                />
                                <p className="text-[11px] text-lp-muted">
                                    Pro tip: More details lead to better drafts.
                                </p>
                            </div>

                            <Button 
                                type="submit" 
                                className="h-12 w-full rounded-full bg-lp-navy font-semibold text-white transition-[background-color,transform] hover:bg-lp-navy-2 motion-safe:active:scale-[0.98]" 
                                disabled={loading || !user}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                                        <span>GENESISING...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4 text-[#8FCDAF]" /> 
                                        <span>GENERATE DRAFT</span>
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Preview Section */}
                <div className="flex min-h-[600px] flex-col overflow-hidden lg:col-span-2 rounded-[1.5rem] border border-lp-line bg-lp-card text-lp-fg lp-shadow">
                    <div className="flex shrink-0 flex-row items-center justify-between border-b border-lp-line p-6">
                        <div>
                            <h3 className="font-display text-lg font-semibold tracking-[-0.03em]">Document Preview</h3>
                            <p className="mt-1 text-xs text-lp-muted">Review and download your generated document.</p>
                        </div>
                        {generated && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handlePrint}
                                className="h-9 rounded-full border-lp-line bg-lp-card px-4 text-xs font-semibold hover:bg-lp-card-2"
                            >
                                <Printer className="mr-2 h-3.5 w-3.5" /> Print / PDF
                            </Button>
                        )}
                    </div>
                    <div className="relative flex-1 overflow-hidden bg-lp-card-2 p-0">
                        {generated ? (
                            <div className="custom-scrollbar m-4 h-[calc(100%-2rem)] overflow-y-auto whitespace-pre-wrap rounded-2xl border border-lp-line bg-lp-card p-8 font-serif text-base leading-relaxed text-lp-fg sm:m-6 sm:h-[calc(100%-3rem)] sm:p-12" ref={printRef}>
                                {generated}
                            </div>
                        ) : (
                            <div className="flex h-full flex-col items-center justify-center space-y-4 p-8 text-center text-lp-muted">
                                <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-lp-line bg-lp-card">
                                    <FileText className="h-9 w-9 text-lp-azure/60" />
                                </div>
                                <div className="max-w-[260px]">
                                    <p className="font-display text-sm font-semibold text-lp-fg">Ready to assist</p>
                                    <p className="mt-1 text-xs">Configure your document on the left and click generate to see the magic happen.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
