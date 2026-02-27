import { NextRequest, NextResponse } from 'next/server'
import { auth, db } from '@/firebase/admin'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()

        const authHeader = req.headers.get('authorization') || ''
        const match = authHeader.match(/^Bearer (.+)$/)

        if (!match) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const idToken = match[1]

        let decoded: any
        try {
            decoded = await auth.verifyIdToken(idToken)
        } catch (e: any) {
            console.error('Token verification failed for withdrawal request:', e)
            // Map admin SDK / Google auth errors to 401 so client knows to re-auth
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
        }

        // Debug: log decoded token aud/iss and expected project id to detect cross-project tokens
        try {
            const expectedProject = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'unknown'
            console.log('[Withdrawals] decoded token uid:', decoded?.uid, 'aud:', decoded?.aud || decoded?.iss, 'expectedProject:', expectedProject)
        } catch (e) {
            console.warn('[Withdrawals] failed to log decoded token details', e)
        }

        const uid = decoded.uid

        const requestedAmount = Number(body.requestedAmount || 0)
        const payoutMethod = body.payoutMethod
        const payoutInfo = body.payoutInfo || null

        // ✅ VALIDATION
        if (requestedAmount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
        }

        if (requestedAmount < 2) {
            return NextResponse.json({ error: 'Minimum withdrawal is $2' }, { status: 400 })
        }

        if (!['bank', 'mobile', 'paypal'].includes(payoutMethod)) {
            return NextResponse.json({ error: 'Invalid payout method' }, { status: 400 })
        }

        const influencerRef = db.collection('influencers').doc(uid)
        const withdrawalsRef = db.collection('withdrawals')

        const result = await db.runTransaction(async (tx) => {
            const infSnap = await tx.get(influencerRef)

            if (!infSnap.exists) throw new Error('Influencer not found')

            const data = infSnap.data()
            const balance = Number(data?.totalCommission || 0)

            // ✅ CALCULATE ON SERVER
            const taxAmount = Math.round(requestedAmount * 0.10 * 100) / 100
            const transferFee = Math.round(requestedAmount * 0.05 * 100) / 100
            const totalDeducted = Math.round((requestedAmount + taxAmount + transferFee) * 100) / 100

            if (balance < totalDeducted) {
                throw new Error('Insufficient balance')
            }

            // ✅ Prevent multiple pending withdrawals
            const pendingSnap = await withdrawalsRef
                .where('influencerId', '==', uid)
                .where('status', '==', 'pending')
                .get()

            if (!pendingSnap.empty) {
                throw new Error('You already have a pending withdrawal')
            }

            const newBalance = Math.round((balance - totalDeducted) * 100) / 100

            const newDocRef = withdrawalsRef.doc()

            tx.set(newDocRef, {
                influencerId: uid,
                influencerName: data?.fullName || null,
                requestedAmount,
                taxAmount,
                transferFee,
                totalDeducted,
                payoutMethod,
                payoutInfo,
                status: 'pending',
                currency: 'USD',
                createdAt: new Date(),
                commissionBalanceBefore: balance,
                commissionBalanceAfter: newBalance,
            })

            tx.update(influencerRef, {
                totalCommission: newBalance,
                updatedAt: Date.now(),
            })

            return { newBalance }
        })

        return NextResponse.json({ success: true, newBalance: result.newBalance })
    } catch (err: any) {
        console.error('Withdrawal API error:', err)

        if (err.message === 'Insufficient balance') {
            return NextResponse.json({ error: err.message }, { status: 400 })
        }

        if (err.message === 'Influencer not found') {
            return NextResponse.json({ error: 'User not found or not an influencer' }, { status: 404 })
        }

        if (err.message === 'You already have a pending withdrawal') {
            return NextResponse.json({ error: err.message }, { status: 400 })
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}