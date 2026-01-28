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
import { FileText, Download, Printer, Coins } from "lucide-react"
import { toast } from "sonner"
import { TOKEN_COSTS, deductTokens } from '@/lib/subscriptions'
import Link from 'next/link'

export default function DraftPage() {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [docType, setDocType] = useState<string>('Study SOP')
  const [extra, setExtra] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState<string>('')
  
  const printRef = useRef<HTMLDivElement>(null)

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
      // Deduct tokens before generation
      await deductTokens(user.uid, TOKEN_COSTS.DOCUMENT_DRAFT);

      const res = await fetch('/api/generate-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          docType,
          userData,
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
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">AI Document Drafter</h1>
        <p className="text-muted-foreground">
          Generate professional visa documents tailored to your profile in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <Card className="lg:col-span-1 h-fit">
            <CardHeader>
                <CardTitle>Configuration</CardTitle>
                <CardDescription>Select document type and add details.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleGenerate} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Document Type</Label>
                        <Select value={docType} onValueChange={setDocType}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Study SOP">Statement of Purpose (Study)</SelectItem>
                                <SelectItem value="Invitation Letter">Invitation Letter</SelectItem>
                                <SelectItem value="Travel Purpose">Statement of Travel Purpose</SelectItem>
                                <SelectItem value="Sponsorship Letter">Sponsorship Letter</SelectItem>
                                <SelectItem value="Cover Letter">Visa Cover Letter</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Additional Details</Label>
                        <Textarea
                            value={extra}
                            onChange={(e) => setExtra(e.target.value)}
                            placeholder="E.g., University name, course details, host's relationship, travel dates, specific circumstances..."
                            className="min-h-[150px]"
                        />
                        <p className="text-xs text-muted-foreground">
                            The AI will use your profile data automatically. Add specific details here.
                        </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={loading || !user}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                            </>
                        ) : (
                            <>
                                <FileText className="mr-2 h-4 w-4" /> Generate Draft
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>

        {/* Preview Section */}
        <Card className="lg:col-span-2 min-h-[600px] flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                    <CardTitle>Document Preview</CardTitle>
                    <CardDescription>Review and download your generated document.</CardDescription>
                </div>
                {generated && (
                    <Button variant="outline" size="sm" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" /> Print / Save PDF
                    </Button>
                )}
            </CardHeader>
            <CardContent className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-b-xl p-0 overflow-hidden border-t">
                {generated ? (
                    <div className="h-full overflow-y-auto p-8 font-serif text-slate-900 dark:text-slate-200 whitespace-pre-wrap leading-relaxed text-base" ref={printRef}>
                        {generated}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                        <FileText className="w-16 h-16 mb-4 opacity-20" />
                        <p>Select a document type and click generate to see the draft here.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  )
}
