import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { docType, userData, extra } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
    
    // Using the specific model requested
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

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

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return NextResponse.json({ generated: responseText });

  } catch (error: any) {
    console.error("Generate Letter Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate document" }, { status: 500 });
  }
}
