import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/firebase/admin';

// Server-side route to create a withdrawal request and decrement influencer balance atomically
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get('authorization') || '';
    const match = authHeader.match(/^Bearer (.+)$/);
    if (!match) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const idToken = match[1];

    // Verify ID token
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // Ensure the authenticated user matches the influencerId in body (or use uid)
    const influencerId = body.influencerId || uid;
    if (influencerId !== uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const requestedAmount = Number(body.requestedAmount || 0);
    const taxAmount = Number(body.taxAmount || 0);
    const transferFee = Number(body.transferFee || 0);
    const totalDeducted = Number(body.totalDeducted || 0);
    const payoutMethod = body.payoutMethod;
    const payoutDetails = body.payoutDetails || null;
    const payoutInfo = body.payoutInfo || null;

    if (!requestedAmount || requestedAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // References
    const influencerRef = db.collection('influencers').doc(influencerId);
    const withdrawalsRef = db.collection('withdrawals');

    // Run transaction
    const result = await db.runTransaction(async (tx) => {
      const infSnap = await tx.get(influencerRef);
      if (!infSnap.exists) throw new Error('Influencer not found');
      const infData = infSnap.data();
      const balance = Number(infData?.totalCommission || 0);

      if (balance < totalDeducted) {
        throw new Error('Insufficient balance');
      }

      // create withdrawal doc
      const newDocRef = withdrawalsRef.doc();
      const withdrawalData = {
        influencerId,
        influencerName: infData?.fullName || null,
        requestedAmount: Math.round(requestedAmount * 100) / 100,
        taxAmount: Math.round(taxAmount * 100) / 100,
        transferFee: Math.round(transferFee * 100) / 100,
        totalDeducted: Math.round(totalDeducted * 100) / 100,
        payoutMethod,
        payoutDetails,
        payoutInfo,
        status: 'pending',
        requestedAt: new Date(),
        commissionBalanceBefore: balance,
      };

      tx.set(newDocRef, withdrawalData);

      // update influencer balance
      const newBalance = Math.round((balance - totalDeducted) * 100) / 100;
      tx.update(influencerRef, { totalCommission: newBalance, updatedAt: Date.now() });

      return { newBalance };
    });

    return NextResponse.json({ success: true, newBalance: result.newBalance });
  } catch (err) {
    console.error('Withdrawal API error:', err);
    const unknownErr = err as unknown;
    const msg = unknownErr instanceof Error ? unknownErr.message : 'Internal error';
    if (msg === 'Insufficient balance') {
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
