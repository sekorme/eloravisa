import "server-only";

import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { Attachment, EmailParams, MailerSend, Recipient, Sender } from "mailersend";
import { db } from "@/firebase/admin";
import { isAllowed, type NotificationPrefs } from "@/lib/notificationPrefs";

/**
 * Server-side user notifications for paid live sessions: push (FCM), the
 * in-app notifications list, and a branded email. Mirrors notifyUser in
 * eloraadmin's lib/adminServer.ts, which sends the other session emails.
 */

export const SITE_URL = "https://eloravisa.com";

export interface NotifyOptions {
  title: string;
  body: string;
  type: string;
  /** Page on this site the notification links to, e.g. "/live/abc". */
  path: string;
  ctaLabel?: string;
  /** Email attachment, e.g. a calendar invite. */
  attachment?: { filename: string; content: string };
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

let mailer: MailerSend | null = null;

async function sendEmail(to: string, name: string | undefined, { title, body, path, ctaLabel = "Open Elora Visa", attachment }: NotifyOptions) {
  if (!process.env.MAILERSEND_API_KEY) throw new Error("MAILERSEND_API_KEY is not set");
  mailer ??= new MailerSend({ apiKey: process.env.MAILERSEND_API_KEY });
  const url = `${SITE_URL}${path}`;
  const paragraphs = body.split(/\n{2,}/).map((p) => `<p>${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`).join("");
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; color: #111;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${SITE_URL}/512.png" alt="Elora Visa" style="width: 80px; height: auto; border-radius: 50%;"/>
      </div>
      <h2 style="color: #1d4ed8;">${escapeHtml(title)}</h2>
      ${paragraphs}
      <p style="margin: 28px 0;">
        <a href="${escapeHtml(url)}" style="background: #1d4ed8; color: #fff; padding: 12px 22px; border-radius: 999px; text-decoration: none; font-weight: bold;">${escapeHtml(ctaLabel)}</a>
      </p>
      <p>Warm regards,<br/>The Elora Visa Team</p>
      <p style="margin-top: 32px; font-size: 12px; color: #6b7280;">
        <a href="${SITE_URL}/dashboard/settings#notifications" style="color: #6b7280;">Manage which emails you get</a>
      </p>
    </div>`;

  const params = new EmailParams()
    .setFrom(new Sender("info@eloravisa.com", "Elora Visa"))
    .setTo([new Recipient(to, name)])
    .setSubject(title)
    .setHtml(html)
    .setText(`${body}\n\n${url}`);
  if (attachment) {
    params.setAttachments([new Attachment(Buffer.from(attachment.content).toString("base64"), attachment.filename, "attachment")]);
  }
  await mailer.email.send(params);
}

/**
 * Push + in-app + email. Push and email respect the user's notification
 * preferences (lib/notificationPrefs.ts); in-app is always written. Each
 * channel is best-effort; returns what went out.
 */
export async function notifyUser(uid: string, options: NotifyOptions): Promise<{ pushed: boolean; emailed: boolean }> {
  const userRef = db.collection("users").doc(uid);
  const snap = await userRef.get();
  if (!snap.exists) return { pushed: false, emailed: false };
  const url = `${SITE_URL}${options.path}`;

  let pushed = false;
  const prefs = snap.get("notificationPrefs") as NotificationPrefs | undefined;
  const fcmToken: string | undefined = snap.get("fcmToken") || undefined;
  if (fcmToken && isAllowed(prefs, options.type, "push")) {
    try {
      await getMessaging().send({ token: fcmToken, data: { title: options.title, body: options.body, icon: "/512.png", link: url } });
      pushed = true;
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === "messaging/registration-token-not-registered" || code === "messaging/invalid-argument") {
        await userRef.update({ fcmToken: "" }).catch(() => {});
      }
    }
  }

  let emailed = false;
  const address: string | undefined = snap.get("email") || undefined;
  if (address && isAllowed(prefs, options.type, "email")) {
    try {
      await sendEmail(address, snap.get("fullName") || undefined, options);
      emailed = true;
    } catch (err) {
      console.warn(`Email to user ${uid} failed:`, err instanceof Error ? err.message : err);
    }
  }

  await userRef.collection("notifications").add({
    title: options.title,
    body: options.body,
    icon: "/512.png",
    url,
    createdAt: FieldValue.serverTimestamp(),
    expiresAt: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
    read: false,
    type: options.type,
  });

  return { pushed, emailed };
}
