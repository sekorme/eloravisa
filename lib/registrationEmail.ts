// lib/sendRegistrationEmail.ts
"use server";

import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY!, // store securely in .env.local
});

export async function registrationEmail({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const sentFrom = new Sender("info@eloravisa.com", "Elora Visa");
  const recipients = [new Recipient(email, name)];

  const htmlContent = `
   <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; background: #ffffff; padding: 20px;">
  
  <div style="text-align: center; margin-bottom: 20px;">
    <img 
      src="https://eloravisa.com/512.png" 
      alt="Elora Visa Logo" 
      style="width: 120px; height: auto; border-radius: 50%;"
    />
  </div>

  <h2 style="color: #4F46E5; text-align: center;">
    🎉 Welcome to Elora Visa
  </h2>

  <p>Dear ${name || "Applicant"},</p>

  <p>
    We’re excited to welcome you to <strong>Elora Visa</strong>.  
    Your account has been successfully created using the email address:
    <strong>${email}</strong>.
  </p>

  <p>
    By joining Elora Visa, you’ve taken an important step toward 
    <strong>improving your visa application success</strong> through 
    accurate documentation, AI-powered reviews, and expert guidance.
  </p>

 

  <p>
    🔑 <strong>What to do next:</strong><br/><br/>
    1️⃣ Log in to your Elora Visa dashboard<br/>
    2️⃣ Complete your profile and start a new visa application<br/>
    3️⃣ Upload your documents for AI-powered review and consistency checks<br/>
    4️⃣ Book a mock interview or consultation (if available on your plan)<br/>
  </p>

  <p>
    💡 <strong>Why Elora Visa?</strong><br/>
    • Detect document inconsistencies before submission<br/>
    • Reduce common visa rejection risks<br/>
    • Prepare confidently for embassy interviews<br/>
    • Access verified opportunities and expert insights
  </p>

  <p>
    We’re here to guide you every step of the way — from preparation to confidence.
  </p>

  <p style="margin-top: 20px;">
    Let’s get you closer to your visa approval. 🚀
  </p>

  <p>
    Warm regards,<br/>
    <strong>The Elora Visa Team</strong>
  </p>

  <hr style="margin: 30px 0;" />

  <p style="font-size: 12px; color: gray; text-align: center;">
    P.O. Box 10, Accra, Ghana<br/>
    support@eloravisa.com | www.eloravisa.com
  </p>

</div>

  `;

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject("Welcome to Souhait eLearning")
    .setHtml(htmlContent);

  try {
    const result = await mailerSend.email.send(emailParams);

    return { success: true, result };
  } catch (error) {
    console.error("MailerSend error:", error);

    return { success: false, error };
  }
}
