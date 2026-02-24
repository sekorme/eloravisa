// lib/influencerAuth.ts
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from "firebase/auth";
import { auth, db } from "@/firebase/client";
import { doc, getDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore";
import { enablePersistence } from "./authPersistence";
import { sendAffiliateWelcomeEmail } from "./affiliateEmail";

export async function influencerSignup(
  email: string, 
  password: string, 
  fullName: string,
  country: string,
  phone: string,
  dob: string,
  socialMedia: {
    tiktok?: string;
    instagram?: string;
    facebook?: string;
    other?: string;
  }
) {
  await enablePersistence();

  // Check if account already exists as a normal user (optional but good for clarity)
  // Actually, the requirement says "influencers can not use their account details to sign in in the users account"
  // and they should have separate accounts. Firebase auth doesn't easily support multiple "types" with same email.
  // We'll enforce that in the app logic. If they sign up here, we'll mark them as influencers.

  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Generate promo code (First name + random string)
  const firstName = fullName.split(" ")[0].toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  const promoCode = `${firstName}${randomStr}`;

  const influencerData = {
    uid: user.uid,
    email: user.email,
    fullName,
    country,
    phone,
    dob,
    socialMedia,
    promoCode,
    role: "influencer",
    createdAt: Date.now(),
    totalCommission: 0,
    referralCount: 0,
  };

  await setDoc(doc(db, "influencers", user.uid), influencerData);
  
  // Also add to a global promo_codes collection for easy lookup
  await setDoc(doc(db, "promo_codes", promoCode), {
    influencerId: user.uid,
    code: promoCode,
    commissionRate: 0.1,
    extraTokens: 50,
  });

  await sendAffiliateWelcomeEmail({
    name: fullName,
    email,
    promoCode,
  });

  return influencerData;
}

export async function influencerSignin(email: string, password: string) {
  await enablePersistence();
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Verify they are an influencer
  const influencerDoc = await getDoc(doc(db, "influencers", user.uid));
  if (!influencerDoc.exists()) {
    await firebaseSignOut(auth);
    throw new Error("This account is not registered as an influencer.");
  }

  return influencerDoc.data();
}

export async function getInfluencerData(uid: string) {
  const influencerDoc = await getDoc(doc(db, "influencers", uid));
  if (influencerDoc.exists()) {
    return influencerDoc.data();
  }
  return null;
}

export async function checkPromoCode(code: string) {
  const promoDoc = await getDoc(doc(db, "promo_codes", code.toUpperCase()));
  if (promoDoc.exists()) {
    return promoDoc.data();
  }
  return null;
}
