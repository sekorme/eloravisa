import "server-only";

import { auth } from "@/firebase/admin";
import type { DecodedIdToken } from "firebase-admin/auth";

/**
 * Verifies the Firebase ID token a Server Action received from its caller.
 * Server Actions are public POST endpoints — every action that spends money
 * (AI calls, email sends) must gate on this and key its rate limit on the
 * returned uid, mirroring what app/api/* routes do with the Bearer header.
 */
export async function verifyActionUser(idToken: unknown): Promise<DecodedIdToken | null> {
  if (typeof idToken !== "string" || !idToken) return null;
  try {
    return await auth.verifyIdToken(idToken);
  } catch {
    return null;
  }
}
