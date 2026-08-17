import type { NextRequest } from "next/server";
import type { Auth } from "firebase-admin/auth";

type AdminCheckResult =
  | { uid: string; error?: undefined; status?: undefined }
  | { error: string; status: 401 | 403; uid?: undefined };

// Requires a Bearer ID token whose decoded claims include `admin: true`.
// Grant that claim out-of-band with admin.auth().setCustomUserClaims(uid, { admin: true }).
export async function requireAdmin(req: NextRequest, authInstance: Auth): Promise<AdminCheckResult> {
  const authHeader = req.headers.get("authorization") || "";
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) {
    return { error: "Unauthorized", status: 401 };
  }

  try {
    const decoded = await authInstance.verifyIdToken(match[1]);
    if (decoded.admin !== true) {
      return { error: "Forbidden: admin access required", status: 403 };
    }
    return { uid: decoded.uid };
  } catch {
    return { error: "Invalid or expired token", status: 401 };
  }
}
