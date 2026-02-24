"use client"

import React, { useEffect, useState } from 'react'
import { useAuth } from "@/context/AuthContext"
import { getInfluencerData } from "@/lib/influencerAuth"
import { db } from "@/firebase/client"
import { doc, updateDoc } from "firebase/firestore"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Save, Landmark, Smartphone, Mail } from "lucide-react"

export default function AffiliateSettingsPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [influencerData, setInfluencerData] = useState<any>(null)

    // Form states
    const [payoutMethod, setPayoutMethod] = useState('paypal')
    const [paypalEmail, setPaypalEmail] = useState('')
    const [mobileNumber, setMobileNumber] = useState('')
    const [bankName, setBankName] = useState('')
    const [bankAccountNumber, setBankAccountNumber] = useState('')
    const [bankAccountName, setBankAccountName] = useState('')
    const [bankSortCode, setBankSortCode] = useState('')

    useEffect(() => {
        async function fetchData() {
            if (user) {
                try {
                    const data = await getInfluencerData(user.uid)
                    if (data) {
                        setInfluencerData(data)
                        const settings = data.withdrawalSettings || {}
                        setPayoutMethod(settings.payoutMethod || 'paypal')
                        setPaypalEmail(settings.paypalEmail || '')
                        setMobileNumber(settings.mobileNumber || '')
                        setBankName(settings.bankName || '')
                        setBankAccountNumber(settings.bankAccountNumber || '')
                        setBankAccountName(settings.bankAccountName || '')
                        setBankSortCode(settings.bankSortCode || '')
                    }
                } catch (error) {
                    console.error("Error fetching influencer settings:", error)
                    toast.error("Failed to load settings")
                } finally {
                    setLoading(false)
                }
            }
        }
        fetchData()
    }, [user])

    const handleSaveSettings = async () => {
        if (!user) return
        setSaving(true)
        try {
            const withdrawalSettings = {
                payoutMethod,
                paypalEmail,
                mobileNumber,
                bankName,
                bankAccountNumber,
                bankAccountName,
                bankSortCode
            }

            await updateDoc(doc(db, "influencers", user.uid), {
                withdrawalSettings,
                updatedAt: Date.now()
            })

            toast.success("Withdrawal settings saved successfully")
        } catch (error) {
            console.error("Error saving settings:", error)
            toast.error("Failed to save settings")
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                    <p className="text-muted-foreground">Manage your withdrawal methods and payout details.</p>
                </div>

                <Card className="shadow-lg border-none ring-1 ring-border/50">
                    <CardHeader className="border-b bg-muted/20">
                        <div className="flex items-center gap-2">
                            <Landmark className="h-5 w-5 text-primary" />
                            <CardTitle>Withdrawal Details</CardTitle>
                        </div>
                        <CardDescription>
                            Configure how you want to receive your commissions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="payoutMethod" className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Preferred Payout Method</Label>
                            <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                                <SelectTrigger className="w-full rounded-xl border-2 py-6">
                                    <SelectValue placeholder="Select payout method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="paypal">PayPal</SelectItem>
                                    <SelectItem value="bank">Bank Transfer</SelectItem>
                                    <SelectItem value="mobile">Mobile Money</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {payoutMethod === 'paypal' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="space-y-2">
                                    <Label htmlFor="paypalEmail" className="text-sm font-bold uppercase tracking-tight text-muted-foreground">PayPal Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="paypalEmail"
                                            type="email"
                                            value={paypalEmail}
                                            onChange={(e) => setPaypalEmail(e.target.value)}
                                            placeholder="your-paypal@example.com"
                                            className="pl-10 rounded-xl border-2 py-6"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {payoutMethod === 'mobile' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="space-y-2">
                                    <Label htmlFor="mobileNumber" className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Mobile Money Number</Label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="mobileNumber"
                                            value={mobileNumber}
                                            onChange={(e) => setMobileNumber(e.target.value)}
                                            placeholder="+233 24 000 0000"
                                            className="pl-10 rounded-xl border-2 py-6"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {payoutMethod === 'bank' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="space-y-2">
                                    <Label htmlFor="bankName" className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Bank Name</Label>
                                    <Input
                                        id="bankName"
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                        placeholder="e.g. Barclays Bank"
                                        className="rounded-xl border-2 py-6"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bankAccountName" className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Account Holder Name</Label>
                                    <Input
                                        id="bankAccountName"
                                        value={bankAccountName}
                                        onChange={(e) => setBankAccountName(e.target.value)}
                                        placeholder="Full Name"
                                        className="rounded-xl border-2 py-6"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bankAccountNumber" className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Account Number / IBAN</Label>
                                    <Input
                                        id="bankAccountNumber"
                                        value={bankAccountNumber}
                                        onChange={(e) => setBankAccountNumber(e.target.value)}
                                        placeholder="Account Number"
                                        className="rounded-xl border-2 py-6"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="bankSortCode" className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Sort Code / SWIFT</Label>
                                    <Input
                                        id="bankSortCode"
                                        value={bankSortCode}
                                        onChange={(e) => setBankSortCode(e.target.value)}
                                        placeholder="Sort Code"
                                        className="rounded-xl border-2 py-6"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="pt-6 border-t flex justify-end">
                            <Button 
                                onClick={handleSaveSettings} 
                                disabled={saving}
                                size="lg"
                                className="px-8 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
