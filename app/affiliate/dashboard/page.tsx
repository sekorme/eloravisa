// app/affiliate/dashboard/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { db } from "@/firebase/client"
import { collection, query, where, orderBy, onSnapshot, doc } from "firebase/firestore"
import { Loader2 } from "lucide-react"

import AffiliateHero from '@/components/affiliate/AffiliateHero'
import MonthlyBarChart from '@/components/affiliate/MonthlyBarChart'
import PaymentsTable from '@/components/affiliate/PaymentsTable'
import ProgramDetails from '@/components/affiliate/ProgramDetails'
import PromoCodeCard from '@/components/affiliate/PromoCodeCard'

import WithdrawalForm from '@/components/affiliate/WithdrawalForm'
import WithdrawalsTable from '@/components/affiliate/WithdrawalsTable'

// Small local types to avoid explicit `any`
interface InfluencerData {
    uid: string
    fullName?: string
    promoCode?: string
    referralCount?: number
    totalCommission?: number
}

interface Payment {
    id?: string
    userId?: string
    email?: string
    planId?: string
    plan?: string
    createdAt?: number | { seconds?: number } | string
    paidAt?: string | number
    commissionAmount?: number
}

interface Withdrawal {
    id?: string
    influencerId?: string
    requestedAmount?: number
    taxAmount?: number
    transferFee?: number
    totalDeducted?: number
    payoutMethod?: string
    payoutInfo?: Record<string,string> | null
    status?: string
    requestedAt?: number | { seconds?: number } | string
}

export default function AffiliateDashboardPage() {
    const { user } = useAuth()
    const router = useRouter()
    const [influencerData, setInfluencerDataState] = useState<InfluencerData | null>(null)
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
    const [loading, setLoading] = useState(true)
    const [payments, setPayments] = useState<Payment[]>([])

    // Real-time listener for influencer data
    useEffect(() => {
        if (!user) {
            setLoading(false)
            return
        }

        const influencerDocRef = doc(db, "influencers", user.uid)
        const unsubscribe = onSnapshot(influencerDocRef, (docSnap) => {
            if (docSnap.exists()) {
                setInfluencerDataState({ uid: docSnap.id, ...docSnap.data() } as InfluencerData)
            } else {
                // Not an influencer, redirect
                toast.error("Access denied. This account is not registered as an influencer.")
                router.push("/affiliate/signin")
            }
            setLoading(false)
        }, (error) => {
            console.error("Error fetching influencer data:", error)
            toast.error("Failed to load dashboard data")
            setLoading(false)
        })

        return () => unsubscribe()
    }, [user, router])

    // Real-time listener for payments
    useEffect(() => {
        if (!influencerData?.uid) return

        const paymentsRef = collection(db, "payments")
        // Removed orderBy to avoid index issues. Sorting client-side.
        const q = query(paymentsRef, where("influencerId", "==", influencerData.uid))
        
        const unsubscribe = onSnapshot(q, (snap) => {
            const items: Payment[] = []
            snap.forEach(doc => {
                items.push({ id: doc.id, ...(doc.data() as unknown as Payment) })
            })
            // Sort client-side
            items.sort((a, b) => {
                const tA = typeof a.createdAt === 'number' ? a.createdAt : 0
                const tB = typeof b.createdAt === 'number' ? b.createdAt : 0
                return tB - tA
            })
            setPayments(items)
        }, (err) => {
            console.error("Error fetching affiliate payments:", err)
            toast.error("Failed to load referrals")
        })

        return () => unsubscribe()
    }, [influencerData])

    // Real-time listener for withdrawals
    useEffect(() => {
        if (!influencerData?.uid) return

        const wRef = collection(db, 'withdrawals')
        // Removed orderBy to avoid index issues. Sorting client-side.
        const q = query(wRef, where('influencerId', '==', influencerData.uid))
        
        const unsubscribe = onSnapshot(q, (snap) => {
            const items: Withdrawal[] = []
            snap.forEach(d => {
                items.push({ id: d.id, ...(d.data() as unknown as Withdrawal) })
            })
            // Sort client-side
            items.sort((a, b) => {
                const tA = typeof a.requestedAt === 'number' ? a.requestedAt : 0
                const tB = typeof b.requestedAt === 'number' ? b.requestedAt : 0
                return tB - tA
            })
            setWithdrawals(items)
        }, (err) => {
            console.error('Error fetching withdrawals:', err)
            toast.error('Failed to load withdrawal history')
        })

        return () => unsubscribe()
    }, [influencerData])

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Promo code copied to clipboard!")
    }

    const handleWithdrawalSuccess = (newBalance: number) => {
        // The listener will automatically update the balance, but we can optimistically update here if needed
        setInfluencerDataState(prev => prev ? { ...prev, totalCommission: newBalance } : prev)
    }

    const isTimestamp = (v: unknown): v is { seconds: number } => {
        return typeof v === 'object' && v !== null && 'seconds' in (v as any) && typeof (v as any).seconds === 'number'
    }

    // Build monthly data (last 12 months) for visuals
    const { monthlyReferrals, monthlyEarnings } = (() => {
        const referrals = new Array(12).fill(0)
        const earnings = new Array(12).fill(0)
        const now = new Date()
        
        payments.forEach(p => {
            let ts = 0
            if (!p.createdAt) return
            if (typeof p.createdAt === 'number') ts = p.createdAt
            else if (typeof p.createdAt === 'string') ts = Date.parse(p.createdAt)
            else if (isTimestamp(p.createdAt)) ts = p.createdAt.seconds * 1000
            
            const d = new Date(ts)
            const monthsDiff = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
            
            if (monthsDiff >= 0 && monthsDiff < 12) {
                const index = 11 - monthsDiff
                referrals[index] += 1
                earnings[index] += (p.commissionAmount || 0)
            }
        })
        return { monthlyReferrals: referrals, monthlyEarnings: earnings }
    })()

    // Calculate total withdrawn amount
    const totalWithdrawn = withdrawals.reduce((acc, w) => acc + (w.requestedAmount || 0), 0)

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!influencerData) return null

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Hero Section - Full Width */}
                <div className="w-full">
                    <AffiliateHero 
                        name={influencerData.fullName} 
                        balance={influencerData.totalCommission || 0} 
                        referralCount={influencerData.referralCount || 0}
                        monthlyData={monthlyReferrals}
                        promoCode={influencerData.promoCode}
                        totalWithdrawn={totalWithdrawn}
                    />
                </div>

                {/* Performance & Metrics Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Referrals Chart */}
                    <div className="h-full p-6 bg-card rounded-xl border shadow-sm flex flex-col">
                        <h3 className="text-sm font-semibold mb-6 text-muted-foreground uppercase tracking-widest">
                            Monthly Referrals
                        </h3>
                        <div className="flex-1 min-h-[250px] flex items-end overflow-hidden">
                            <MonthlyBarChart 
                                data={monthlyReferrals} 
                                labels={['11m','10m','9m','8m','7m','6m','5m','4m','3m','2m','1m','Now']} 
                            />
                        </div>
                    </div>

                    {/* Earnings Chart */}
                    <div className="h-full p-6 bg-card rounded-xl border shadow-sm flex flex-col">
                        <h3 className="text-sm font-semibold mb-6 text-muted-foreground uppercase tracking-widest">
                            Monthly Earnings ($)
                        </h3>
                        <div className="flex-1 min-h-[250px] flex items-end overflow-hidden">
                            <MonthlyBarChart 
                                data={monthlyEarnings} 
                                labels={['11m','10m','9m','8m','7m','6m','5m','4m','3m','2m','1m','Now']}
                                prefix="$"
                            />
                        </div>
                    </div>
                </div>

                {/* Main Content Grid: Actions & History */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Forms & Tables (2/3 width) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Withdrawal Form */}
                        <WithdrawalForm 
                            availableBalance={influencerData.totalCommission || 0} 
                            onSuccess={handleWithdrawalSuccess} 
                        />

                        {/* Payments Table */}
                        <CardContainer title="Referred Users & Payments">
                            <PaymentsTable payments={payments} loading={false} />
                        </CardContainer>
                    </div>

                    {/* Right Column: Details & History (1/3 width) */}
                    <div className="space-y-8">
                        {/* Program Details */}
                        <ProgramDetails />

                        {/* Withdrawal History */}
                        <CardContainer title="Withdrawal History">
                            <WithdrawalsTable withdrawals={withdrawals} loading={false} />
                        </CardContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Small helper presentational container to keep page file concise
function CardContainer({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
            </div>
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                {children}
            </div>
        </div>
    )
}
