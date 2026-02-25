// app/affiliate/dashboard/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { getInfluencerData } from "@/lib/influencerAuth"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { db } from "@/firebase/client"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { Loader2 } from "lucide-react"

import PromoCodeCard from '@/components/affiliate/PromoCodeCard'
import StatsCards from '@/components/affiliate/StatsCards'
import ProgramDetails from '@/components/affiliate/ProgramDetails'
import WithdrawalForm from '@/components/affiliate/WithdrawalForm'
import PaymentsTable from '@/components/affiliate/PaymentsTable'
import WithdrawalsTable from '@/components/affiliate/WithdrawalsTable'
import AffiliateHero from '@/components/affiliate/AffiliateHero'
import MonthlyBarChart from '@/components/affiliate/MonthlyBarChart'

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
    const [loadingWithdrawals, setLoadingWithdrawals] = useState(false)
    const [loading, setLoading] = useState(true)
    const [payments, setPayments] = useState<Payment[]>([])
    const [loadingPayments, setLoadingPayments] = useState(false)

    useEffect(() => {
        async function fetchData() {
            if (user) {
                try {
                    const data = await getInfluencerData(user.uid)
                    if (data) {
                        setInfluencerDataState(data as InfluencerData)
                    } else {
                        // Not an influencer
                        router.push("/affiliate/signin")
                    }
                } catch (error) {
                    console.error("Error fetching influencer data:", error)
                    toast.error("Failed to load dashboard data")
                } finally {
                    setLoading(false)
                }
            }
        }
        fetchData()
    }, [user, router])

    // Fetch payments that belong to this influencer
    useEffect(() => {
        async function fetchPayments() {
            if (!influencerData?.uid) return
            setLoadingPayments(true)
            try {
                const paymentsRef = collection(db, "payments")
                const q = query(paymentsRef, where("influencerId", "==", influencerData.uid), orderBy("createdAt", "desc"))
                const snap = await getDocs(q)
                const items: Payment[] = []
                snap.forEach(doc => {
                    items.push({ id: doc.id, ...(doc.data() as unknown as Payment) })
                })
                setPayments(items)
            } catch (err) {
                console.error("Error fetching affiliate payments:", err)
                toast.error("Failed to load referrals")
            } finally {
                setLoadingPayments(false)
            }
        }
        fetchPayments()
    }, [influencerData])

    // Fetch withdrawal history for influencer
    useEffect(() => {
        async function fetchWithdrawals() {
            if (!influencerData?.uid) return
            setLoadingWithdrawals(true)
            try {
                const wRef = collection(db, 'withdrawals')
                const q = query(wRef, where('influencerId', '==', influencerData.uid), orderBy('requestedAt', 'desc'))
                const snap = await getDocs(q)
                const items: Withdrawal[] = []
                snap.forEach(d => {
                    items.push({ id: d.id, ...(d.data() as unknown as Withdrawal) })
                })
                setWithdrawals(items)
            } catch (err) {
                console.error('Error fetching withdrawals:', err)
                toast.error('Failed to load withdrawal history')
            } finally {
                setLoadingWithdrawals(false)
            }
        }
        fetchWithdrawals()
    }, [influencerData])

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        toast.success("Promo code copied to clipboard!")
    }

    const handleWithdrawalSuccess = (newBalance: number) => {
        setInfluencerDataState(prev => prev ? { ...prev, totalCommission: newBalance } : prev);
        // Refresh withdrawals list after a successful request
        (async () => {
            try {
                if (!influencerData?.uid) return
                const wRef = collection(db, 'withdrawals')
                const q = query(wRef, where('influencerId', '==', influencerData.uid), orderBy('requestedAt', 'desc'))
                const snap = await getDocs(q)
                const items: Withdrawal[] = []
                snap.forEach(d => items.push({ id: d.id, ...(d.data() as unknown as Withdrawal) }))
                setWithdrawals(items)
            } catch (err) {
                console.error('Error refreshing withdrawals:', err)
            }
        })()
    }

    const isTimestamp = (v: unknown): v is { seconds: number } => {
        return typeof v === 'object' && v !== null && 'seconds' in (v as any) && typeof (v as any).seconds === 'number'
    }

    // Build monthly data (last 12 months) for visuals
    const monthlyData = (() => {
        const counts = new Array(12).fill(0)
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
                counts[11 - monthsDiff] += 1
            }
        })
        return counts
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
                        monthlyData={monthlyData}
                        promoCode={influencerData.promoCode}
                        totalWithdrawn={totalWithdrawn}
                    />
                </div>

                {/* Performance & Metrics Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-3">
                        <div className="h-full p-6 bg-card rounded-xl border shadow-sm flex flex-col">
                            <h3 className="text-sm font-semibold mb-6 text-muted-foreground uppercase tracking-widest">
                                Monthly Referrals Over Time
                            </h3>
                            <div className="flex-1 min-h-[250px] flex items-end overflow-hidden">
                                <MonthlyBarChart 
                                    data={monthlyData} 
                                    labels={['11m','10m','9m','8m','7m','6m','5m','4m','3m','2m','1m','Now']} 
                                />
                            </div>
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
                            <PaymentsTable payments={payments} loading={loadingPayments} />
                        </CardContainer>
                    </div>

                    {/* Right Column: Details & History (1/3 width) */}
                    <div className="space-y-8">
                        {/* Program Details */}
                        <ProgramDetails />

                        {/* Withdrawal History */}
                        <CardContainer title="Withdrawal History">
                            <WithdrawalsTable withdrawals={withdrawals} loading={loadingWithdrawals} />
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
