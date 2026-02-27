"use server"

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateInterviewQuestions(userData: any, count: number) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });

    const prompt = `
      Generate ${count} visa interview questions for a user with the following profile:
      - **Nationality:** ${userData.country}
      - **Destination:** ${userData.onboarding?.destination}
      - **Visa Type:** ${userData.onboarding?.visaType}
      - **Status:** ${userData.onboarding?.appStatus}

      The questions should be realistic, challenging, and relevant to their specific scenario.
      
      Return ONLY a JSON array of strings, e.g.:
      ["Question 1?", "Question 2?", ...]
      
      Do not include markdown formatting.
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const questions = JSON.parse(cleanedText);

    return { success: true, data: questions };

  } catch (error: any) {
    console.error("AI Question Gen Error:", error);
    return { success: false, error: error.message };
  }
}

export async function analyzeAnswer(question: string, answer: string) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });
    
        const prompt = `
          **Question:** "${question}"
          **Applicant's Answer:** "${answer}"
    
          Analyze the answer. Provide:
          1. **Feedback:** Constructive criticism.
          2. **Score:** 0-100 based on clarity, confidence, and relevance.
          3. **Better Answer:** An example of a stronger response.
    
          Return JSON: { "feedback": "string", "score": number, "better_answer": "string" }
          No markdown.
        `;
    
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const analysis = JSON.parse(cleanedText);
    
        return { success: true, data: analysis };
    
      } catch (error: any) {
        console.error("AI Answer Analysis Error:", error);
        return { success: false, error: error.message };
      }
}

export async function generateInterviewFeedback(transcript: any[]) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });

    // Format transcript for the prompt
    const conversation = transcript.map(t => `${t.role.toUpperCase()}: ${t.text}`).join("\n");

    const prompt = `
      Analyze the following visa interview transcript and provide a comprehensive performance review.

      **Transcript:**
      ${conversation}

      **Analysis Requirements:**
      1.  **Scores (0-100):**
          - **Clarity:** How clear and understandable were the answers?
          - **Consistency:** Did the answers align with each other and the visa intent?
          - **Confidence:** Did the applicant sound sure and prepared?
          - **Overall:** A weighted average.
      2.  **Summary:** A brief overview of how the interview went.
      3.  **Strengths:** List 3-5 key strengths demonstrated by the applicant.
      4.  **Weaknesses:** List 3-5 areas where the applicant struggled.
      5.  **Recommendations:** Actionable advice for improvement.

      Return ONLY a JSON object with the following structure (no markdown):
      {
        "clarityScore": number,
        "consistencyScore": number,
        "confidenceScore": number,
        "overallScore": number,
        "summary": "string",
        "strengths": ["string"],
        "weaknesses": ["string"],
        "recommendations": ["string"]
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
    const feedback = JSON.parse(cleanedText);

    return { success: true, data: feedback };

  } catch (error: any) {
    console.error("AI Feedback Gen Error:", error);
    return { success: false, error: error.message };
  }
}
