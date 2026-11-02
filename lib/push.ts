import "server-only";

import { FieldValue } from "firebase-admin/firestore";
import { getMessaging, type MulticastMessage } from "firebase-admin/messaging";

/**
 * Web push via FCM, shared by every sender. eloraadmin has an identical copy
 * (lib/push.ts there); change both together.
 *
 * - A user can be signed in on several devices: tokens live in
 *   users/{uid}.fcmTokens (newest last; fcmToken is the legacy single field,
 *   still read so older registrations keep working).
 * - Messages carry a webpush *notification* (displayed by the browser even if
 *   our service worker code fails, and required by iOS, which revokes
 *   subscriptions that receive "silent" data-only pushes), high urgency so
 *   Android doesn't hold them back, and a click-through link.
 * - Only tokens FCM reports as dead are removed; other errors (a bad payload,
 *   a temporary outage) must not unsubscribe the user.
 */

const DEAD_TOKEN_CODES = new Set([
  "messaging/registration-token-not-registered",
  "messaging/invalid-registration-token",
]);

export function userTokens(data: FirebaseFirestore.DocumentData | undefined): string[] {
  const list: string[] = Array.isArray(data?.fcmTokens) ? data!.fcmTokens : [];
  const legacy = typeof data?.fcmToken === "string" && data.fcmToken ? [data.fcmToken] : [];
  return [...new Set([...list, ...legacy].filter((t) => typeof t === "string" && t.length > 20))];
}

export function pushPayload(title: string, body: string, link: string): Omit<MulticastMessage, "tokens"> {
  return {
    // Kept for the foreground handler (useFCMToken) and older service workers.
    data: { title, body, icon: "/512.png", link },
    webpush: {
      headers: { Urgency: "high", TTL: "86400" },
      notification: { title, body, icon: "/512.png", badge: "/512.png" },
      fcmOptions: { link },
    },
  };
}

/** Sends to every device of one user and prunes dead tokens. True if any delivered. */
export async function pushToUser(userRef: FirebaseFirestore.DocumentReference, data: FirebaseFirestore.DocumentData | undefined, title: string, body: string, link: string): Promise<boolean> {
  const tokens = userTokens(data);
  if (tokens.length === 0) return false;
  const res = await getMessaging().sendEachForMulticast({ tokens, ...pushPayload(title, body, link) });
  const dead = tokens.filter((_, i) => !res.responses[i].success && DEAD_TOKEN_CODES.has(res.responses[i].error?.code ?? ""));
  if (dead.length) await removeTokens(userRef, data, dead).catch(() => {});
  return res.successCount > 0;
}

export async function removeTokens(userRef: FirebaseFirestore.DocumentReference, data: FirebaseFirestore.DocumentData | undefined, dead: string[]) {
  await userRef.update({
    fcmTokens: FieldValue.arrayRemove(...dead),
    ...(dead.includes(data?.fcmToken) ? { fcmToken: "" } : {}),
  });
}

export const isDeadTokenError = (code: string | undefined) => DEAD_TOKEN_CODES.has(code ?? "");
