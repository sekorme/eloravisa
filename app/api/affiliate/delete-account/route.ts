import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from '@/firebase/admin';

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const match = authHeader.match(/^Bearer (.+)$/);
    if (!match) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const idToken = match[1];
    const decoded = await auth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // 1. Delete Firestore data
    // Influencer document
    const influencerRef = db.collection('influencers').doc(uid);
    const influencerDoc = await influencerRef.get();
    
    if (influencerDoc.exists) {
        const data = influencerDoc.data();
        const promoCode = data?.promoCode;
        
        // Delete promo code mapping
        if (promoCode) {
            await db.collection('promo_codes').doc(promoCode).delete();
        }
        
        // Delete the influencer doc
        await influencerRef.delete();
    }

    // Optional: Delete withdrawals, payments associated? 
    // Usually we might want to keep records for accounting, but the request says "delete influencers data"
    // To be safe and thorough as requested:
    const withdrawals = await db.collection('withdrawals').where('influencerId', '==', uid).get();
    const batch = db.batch();
    withdrawals.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    // 2. Delete Auth account
    await auth.deleteUser(uid);

    return NextResponse.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete account API error:', err);
    const unknownErr = err as unknown;
    const msg = unknownErr instanceof Error ? unknownErr.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
