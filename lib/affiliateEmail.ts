// lib/affiliateEmail.ts
"use server";

import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY!,
});

export async function sendAffiliateWelcomeEmail({
  name,
  email,
  promoCode,
}: {
  name: string;
  email: string;
  promoCode: string;
}) {
  const sentFrom = new Sender("info@eloravisa.com", "Elora Visa Affiliate");
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
    🎉 Welcome to Elora Visa Affiliate Program
  </h2>

  <p>Dear ${name || "Influencer"},</p>

  <p>
    We’re excited to have you as an <strong>Elora Visa Affiliate</strong>.  
    Your account has been successfully created.
  </p>

  <p>
    Your unique promo code is: <strong style="font-size: 24px; color: #4F46E5;">${promoCode}</strong>
  </p>

  <p>
    🚀 <strong>How it works:</strong><br/><br/>
    1️⃣ Share your promo code with your audience.<br/>
    2️⃣ When they use it, they get <strong>50 EXTRA TOKENS</strong> on their subscription.<br/>
    3️⃣ You earn <strong>10% COMMISSION</strong> on every successful payment.<br/>
  </p>

  <p>
    You can track your referrals and earnings in your affiliate dashboard.
  </p>

  <p style="margin-top: 20px;">
    Let’s grow together! 🚀
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
    .setSubject("Your Elora Visa Affiliate Promo Code")
    .setHtml(htmlContent);

  try {
    const result = await mailerSend.email.send(emailParams);
    return { success: true, result };
  } catch (error) {
    console.error("MailerSend error:", error);
    return { success: false, error };
  }
}
