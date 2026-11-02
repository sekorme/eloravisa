import "server-only";

import type { NextRequest } from "next/server";
import type { DecodedIdToken } from "firebase-admin/auth";
import { auth } from "@/firebase/admin";

/** Signed-in caller from the `Authorization: Bearer <Firebase ID token>` header, or null. */
export async function getRequestUser(req: NextRequest): Promise<DecodedIdToken | null> {
  const header = req.headers.get("authorization") || "";
  const idToken = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!idToken) return null;
  try {
    return await auth.verifyIdToken(idToken);
  } catch {
    return null;
  }
}
