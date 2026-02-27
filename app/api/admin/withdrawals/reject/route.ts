import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/firebase/admin';
import admin from "firebase-admin";

if (!admin.apps.length) {
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

    if (serviceAccountKey) {
        try {
            const serviceAccount = JSON.parse(serviceAccountKey);
            admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
        } catch (error) {
            console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:", error);
        }
    } else {
        console.warn("FIREBASE_SERVICE_ACCOUNT_KEY is not defined");
    }
}



export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { withdrawalId } = body;

    if (!withdrawalId) {
      return NextResponse.json({ error: 'Missing withdrawalId' }, { status: 400 });
    }

    // Verify Admin (Basic check - in production, check custom claims or specific admin UID)
    const authHeader = req.headers.get('authorization') || '';
    const match = authHeader.match(/^Bearer (.+)$/);
    if (!match) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const idToken = match[1];
    await auth.verifyIdToken(idToken);
    // TODO: Add check for admin role here

    const withdrawalRef = db.collection('withdrawals').doc(withdrawalId);

    await db.runTransaction(async (tx) => {
      const withdrawalSnap = await tx.get(withdrawalRef);
      if (!withdrawalSnap.exists) {
        throw new Error('Withdrawal not found');
      }

      const withdrawalData = withdrawalSnap.data();
      if (withdrawalData?.status !== 'pending') {
        throw new Error('Withdrawal is not pending');
      }

      const influencerId = withdrawalData.influencerId;
      // Ensure numeric values to prevent string concatenation
      const refundAmount = Number(withdrawalData.totalDeducted || 0); 

      const influencerRef = db.collection('influencers').doc(influencerId);
      const influencerSnap = await tx.get(influencerRef);

      if (!influencerSnap.exists) {
        throw new Error('Influencer not found');
      }

      const currentBalance = Number(influencerSnap.data()?.totalCommission || 0);
      const newBalance = Math.round((currentBalance + refundAmount) * 100) / 100;

      console.log(`[Reject Withdrawal] Refunding ${refundAmount} to influencer ${influencerId}. Old Balance: ${currentBalance}, New Balance: ${newBalance}`);

      // Update withdrawal status
      tx.update(withdrawalRef, { 
        status: 'rejected',
        rejectedAt: new Date(),
        notes: 'Rejected by admin' 
      });

      // Refund balance
      tx.update(influencerRef, { 
        totalCommission: newBalance,
        updatedAt: Date.now()
      });
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Reject withdrawal error:', err);
    const msg = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
