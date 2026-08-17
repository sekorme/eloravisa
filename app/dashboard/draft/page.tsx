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
import { Badge } from "@/components/ui/badge"

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
    <div className="min-h-screen bg-white dark:bg-[#050505] text-slate-900 dark:text-white flex flex-col font-sans py-4">
        <div className=" w-full px-4 md:px-8 space-y-8">
            <header className="flex flex-col sm:flex-row items-center justify-between shrink-0 gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 via-blue-600 to-cyan-700 rounded-xl flex items-center justify-center font-bold text-xl shadow-[0_0_20px_rgba(147,51,234,0.5)] border border-white/20">
                        <Wand2 className="w-5 h-5 text-white animate-pulse" />
                    </div>
                    <div>
                        <h1 className="text-lg md:text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-white dark:to-white/60">
                            DOCUMENT DRAFTER
                        </h1>
                        <p className="text-[10px] text-purple-500 dark:text-purple-400 font-bold uppercase tracking-[0.2em] opacity-80">
                            AI-Powered Professional Drafts
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 px-3 py-1">
                        <Coins className="w-3 h-3 mr-1.5" />
                        {TOKEN_COSTS.DOCUMENT_DRAFT} Tokens per draft
                    </Badge>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                {/* Input Section */}
                <div className="lg:col-span-1 h-fit glass-panel rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10">
                    <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white/80">Configuration</h3>
                        <p className="text-xs text-slate-500 dark:text-white/40 mt-1">Select document type and add details.</p>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleGenerate} className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/40">Document Type</Label>
                                <Select value={docType} onValueChange={setDocType}>
                                    <SelectTrigger className="bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl h-11">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-[#0c0c0e] border-slate-200 dark:border-white/10 rounded-xl">
                                        {docTypes.map((type) => (
                                            <SelectItem key={type.value} value={type.value} className="focus:bg-purple-500/10">
                                                <div className="flex items-center gap-2">
                                                    <type.icon className="w-4 h-4 text-purple-500" />
                                                    <span>{type.label}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-white/40">Additional Details</Label>
                                    <div className="group relative">
                                        <Info className="w-3.5 h-3.5 text-slate-400 cursor-help" />
                                        <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-slate-900 text-white text-[10px] rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                                            The AI uses your profile (name, nationality, destination) automatically.
                                        </div>
                                    </div>
                                </div>
                                <Textarea
                                    value={extra}
                                    onChange={(e) => setExtra(e.target.value)}
                                    placeholder="E.g., University name, course details, host's relationship, travel dates..."
                                    className="min-h-[180px] bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl resize-none focus-visible:ring-purple-500/50"
                                />
                                <p className="text-[10px] text-slate-400 dark:text-white/30 italic">
                                    Pro tip: More details lead to better drafts.
                                </p>
                            </div>

                            <Button 
                                type="submit" 
                                className="w-full h-12 bg-slate-900 dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-purple-50 rounded-xl font-bold tracking-tight transition-all active:scale-[0.98] shadow-lg" 
                                disabled={loading || !user}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                                        <span>GENESISING...</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-4 w-4 text-purple-500" /> 
                                        <span>GENERATE DRAFT</span>
                                    </>
                                )}
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Preview Section */}
                <div className="lg:col-span-2 min-h-[600px] flex flex-col glass-panel rounded-3xl overflow-hidden border border-slate-200 dark:border-white/10">
                    <div className="p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex flex-row items-center justify-between shrink-0">
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900 dark:text-white/80">Document Preview</h3>
                            <p className="text-xs text-slate-500 dark:text-white/40 mt-1">Review and download your generated document.</p>
                        </div>
                        {generated && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={handlePrint}
                                className="rounded-xl border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 text-xs"
                            >
                                <Printer className="mr-2 h-3.5 w-3.5" /> Print / PDF
                            </Button>
                        )}
                    </div>
                    <div className="flex-1 bg-white/30 dark:bg-black/20 p-0 overflow-hidden relative">
                        {generated ? (
                            <div className="h-full overflow-y-auto p-8 sm:p-12 font-serif text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed text-base custom-scrollbar" ref={printRef}>
                                {generated}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-white/20 p-8 text-center space-y-4">
                                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/5">
                                    <FileText className="w-10 h-10 opacity-20" />
                                </div>
                                <div className="max-w-[260px]">
                                    <p className="text-sm font-medium">Ready to assist</p>
                                    <p className="text-xs opacity-60 mt-1">Configure your document on the left and click generate to see the magic happen.</p>
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
