"use server"

import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkRateLimit } from "@/lib/ratelimit";
import { verifyActionUser } from "@/lib/actionAuth";
import { deductTokensAdmin, refundTokensAdmin } from "@/lib/tokensAdmin";
import { TOKEN_COSTS } from "@/lib/billing/plans";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024;

/** Only documents in our own Firebase Storage bucket may be analyzed. */
function isOwnStorageUrl(raw: string): URL | null {
  const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  if (!bucket) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  const ok =
    url.protocol === "https:" &&
    url.hostname === "firebasestorage.googleapis.com" &&
    url.pathname.startsWith(`/v0/b/${bucket}/o/`);
  return ok ? url : null;
}

export async function analyzeDocument(idToken: string, documentUrl: string, documentType: string, userData: any, mimeType: string) {
  let chargedUid: string | null = null;
  try {
    const user = await verifyActionUser(idToken);
    if (!user) {
      return { success: false, error: "Please sign in to analyze documents." };
    }
    const rateLimit = await checkRateLimit("aiGeneration", user.uid);
    if (!rateLimit.success) {
      return { success: false, error: "Too many requests. Please slow down and try again shortly." };
    }

    // 1. Fetch the file — own storage bucket only, capped size
    const url = isOwnStorageUrl(documentUrl);
    if (!url) {
      return { success: false, error: "Document must be uploaded to Elora Visa storage." };
    }
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error("Failed to fetch document");
    const declaredLength = Number(response.headers.get("content-length") || 0);
    if (declaredLength > MAX_DOCUMENT_BYTES) {
      return { success: false, error: "Document is too large to analyze (20MB max)." };
    }
    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_DOCUMENT_BYTES) {
      return { success: false, error: "Document is too large to analyze (20MB max)." };
    }
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    // Charge server-side once the input has passed validation; refunded in
    // the catch below if generation fails after this point.
    try {
      await deductTokensAdmin(user.uid, TOKEN_COSTS.DOCUMENT_REVIEW);
    } catch {
      return { success: false, error: `Insufficient tokens. You need ${TOKEN_COSTS.DOCUMENT_REVIEW} tokens for a document review.` };
    }
    chargedUid = user.uid;

    // 2. Initialize Model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // 3. Construct Enhanced Prompt
    const userProfileString = JSON.stringify({
        fullName: userData.fullName,
        destination: userData.onboarding?.destination,
        visaType: userData.onboarding?.visaType,
    }, null, 2);

    const prompt = `
      Analyze this document, which is supposed to be a "${documentType}", for a visa application.

      Cross-reference the document's content against the applicant's profile provided below. Pay close attention to any mismatches in names, destination country, visa purpose, or other key details.

      **Applicant Profile:**
      ${userProfileString}

      **Analysis Requirements:**
      1.  **Summary:** Briefly summarize the document's content.
      2.  **Strengths:** List strong points that support the visa application.
      3.  **Weaknesses:** List weak points or areas of concern.
      4.  **Inconsistencies:** Explicitly list any information in the document that contradicts the user's profile (e.g., different destination country, misspelled name).
      5.  **Missing Information:** List critical information that is expected but not found.
      6.  **Risk Flags:** List potential red flags for a visa officer.
      7.  **Improvement Suggestions:** Provide actionable advice to improve the document.
      8.  **Overall Score:** Provide a score from 0 to 100 based on its quality and alignment with the user's profile.

      **Important:**
      - If the document is not a valid "${documentType}" (e.g., a random image uploaded as a bank statement), state this clearly in the summary and assign a very low score.
      - Return the analysis as a single, clean JSON object without any markdown formatting (e.g., no \`\`\`json).

      The JSON structure must be:
      {
        "summary": "string",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "inconsistencies": ["string"],
        "missing_info": ["string"],
        "risk_flags": ["string"],
        "improvement_suggestions": ["string"],
        "score": 0
      }
    `;

    // 4. Generate Content
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
    ]);

    const responseText = result.response.text();

    // 5. Parse JSON
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const analysis = JSON.parse(cleanedText);

    return { success: true, data: analysis };

  } catch (error: any) {
    if (chargedUid) {
      await refundTokensAdmin(chargedUid, TOKEN_COSTS.DOCUMENT_REVIEW).catch(() => {});
    }
    console.error("AI Analysis Error:", error);
    return { success: false, error: "Document analysis failed. Please try again." };
  }
}

export async function getVisaInformation(idToken: string, userData: any) {
  let chargedUid: string | null = null;
  try {
    const user = await verifyActionUser(idToken);
    if (!user) {
      return { success: false, error: "Please sign in to generate visa information." };
    }
    const rateLimit = await checkRateLimit("aiGeneration", user.uid);
    if (!rateLimit.success) {
      return { success: false, error: "Too many requests. Please slow down and try again shortly." };
    }

    // Charge server-side; refunded in the catch below if generation fails.
    try {
      await deductTokensAdmin(user.uid, TOKEN_COSTS.INFORMATION_GENERATION);
    } catch {
      return { success: false, error: `Insufficient tokens. You need ${TOKEN_COSTS.INFORMATION_GENERATION} tokens to generate new information.` };
    }
    chargedUid = user.uid;

    // Use the specific model version that is known to work for text generation
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const date = new Date();

    const prompt = `
      Generate a personalized visa application checklist and best practices guide for a user with the following profile:
      - **Nationality:** ${userData.country || "Unknown"}
      - **Residence:** ${userData.onboarding?.residence || "Unknown"}
      - **Destination:** ${userData.onboarding?.destination || "Unknown"}
      - **Visa Type:** ${userData.onboarding?.visaType || "Unknown"}
      - **Date:** ${date.toISOString()}

      Please provide 12 specific, actionable sections that cover the most critical requirements and tips for this specific visa route (e.g., specific financial requirements for ${userData.onboarding?.destination}, common refusal reasons for ${userData.country} citizens, etc.).

      Return a JSON object with a "sections" array. Each item in the array should have:
      - "title": A short, punchy title (e.g., "1. Valid Passport").
      - "icon": A string keyword representing the icon (choose from: "Book", "Plane", "CreditCard", "Home", "FileText", "History", "PenTool", "MessageCircle", "FolderCheck", "Clock", "ShieldCheck", "Scale").
      - "description": A brief one-line description.
      - "content": An array of strings (bullet points) with specific details.
      - "note": A short "Why it matters" or "Pro tip" note.

      Also include a "mentorAdvice" string at the root level with a final piece of encouraging advice.

      **Important:** Return ONLY valid JSON without markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(cleanedText);

    return { success: true, data };

  } catch (error: any) {
    if (chargedUid) {
      await refundTokensAdmin(chargedUid, TOKEN_COSTS.INFORMATION_GENERATION).catch(() => {});
    }
    console.error("AI Visa Info Error:", error);
    return { success: false, error: "Failed to generate visa information. Please try again." };
  }
}
