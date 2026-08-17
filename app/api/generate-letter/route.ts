import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { auth, db } from "@/firebase/admin";
import { TOKEN_COSTS } from "@/lib/subscriptions";
import { checkRateLimit } from "@/lib/ratelimit";
import { deductTokensAdmin, refundTokensAdmin } from "@/lib/tokensAdmin";

// This route used to have no auth check at all — anyone could POST here and
// generate documents on the app's Gemini quota for free. It now requires a
// Firebase ID token, deducts tokens atomically server-side (previously only
// the client deducted them, so calling this route directly skipped payment
// entirely), and reads applicant details from Firestore instead of trusting
// the client-supplied userData blob.
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const match = authHeader.match(/^Bearer (.+)$/);
    if (!match) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let uid: string;
    try {
      const decoded = await auth.verifyIdToken(match[1]);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const rateLimit = await checkRateLimit("aiGeneration", uid);
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429 });
    }

    const body = await request.json();
    const { docType, extra } = body;

    if (!docType || typeof docType !== "string") {
      return NextResponse.json({ error: "docType is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const userSnap = await db.collection("users").doc(uid).get();
    const userData = userSnap.data() || {};

    try {
      await deductTokensAdmin(uid, TOKEN_COSTS.DOCUMENT_DRAFT);
    } catch (err: any) {
      return NextResponse.json({ error: err?.message || "Unable to deduct tokens" }, { status: 402 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const prompt = `
      You are an expert immigration lawyer and professional writer.
      Draft a formal, high-quality "${docType}" for a visa application.

      **Applicant Details:**
      - Name: ${userData?.fullName || '[Full Name]'}
      - Nationality: ${userData?.country || userData?.nationality || '[Nationality]'}
      - Destination: ${userData?.onboarding?.destination || userData?.destination || '[Destination Country]'}
      - Visa Type: ${userData?.onboarding?.visaType || userData?.visaType || '[Visa Type]'}

      **Specific Instructions:**
      ${extra || 'None provided. Infer standard details based on the document type.'}

      **Strict Formatting Rules:**
      1.  **Do NOT use Markdown.** No bolding (**), no italics (*), no headers (##).
      2.  **Do NOT use bullet points (-)** unless it is a formal list of documents attached. Use full sentences and paragraphs.
      3.  **Tone:** Professional, respectful, persuasive, and formal.
      4.  **Structure:**
          - Sender's Details (Name, Address, Date(get the current date))
          - Recipient's Details (The Visa Officer, Embassy Name, Address)
          - Subject Line (Formal)
          - Salutation (Dear Visa Officer,)
          - Introduction (Purpose of letter)
          - Body Paragraphs (Detailed explanation, ties to home, funding, intent to return)
          - Conclusion (Thank you, contact info)
          - Sign-off (Sincerely, Name)
      5.  **Content:** Make it sound human-written, not robotic. Avoid generic fluff. Be specific and direct.

      Generate ONLY the document content. No intro/outro text from you.
    `;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      return NextResponse.json({ generated: responseText });
    } catch (genErr) {
      await refundTokensAdmin(uid, TOKEN_COSTS.DOCUMENT_DRAFT).catch(() => {});
      throw genErr;
    }

  } catch (error: any) {
    console.error("Generate Letter Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate document" }, { status: 500 });
  }
}
