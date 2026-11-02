import { NextRequest, NextResponse } from "next/server";
import { db } from "@/firebase/admin";
import { getRequestUser } from "@/lib/requireUser";
import { checkRateLimit } from "@/lib/ratelimit";
import { pushToUser, userTokens } from "@/lib/push";

/** "Send a test notification" in Settings: a push to the caller's own devices only. */
export async function POST(req: NextRequest) {
  const user = await getRequestUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await checkRateLimit("transactionalEmail", user.uid)).success) {
    return NextResponse.json({ error: "Please wait a moment before sending another test" }, { status: 429 });
  }
  const ref = db.collection("users").doc(user.uid);
  const data = (await ref.get()).data();
  const devices = userTokens(data).length;
  if (devices === 0) return NextResponse.json({ error: "No device has notifications turned on yet" }, { status: 400 });
  try {
    const delivered = await pushToUser(ref, data, "Test notification", "Notifications from Elora Visa are working on this device.", "https://www.eloravisa.com/dashboard/settings#notifications");
    return NextResponse.json({ delivered, devices });
  } catch (error) {
    console.error("Test push failed:", error);
    return NextResponse.json({ error: "Couldn't send the test" }, { status: 500 });
  }
}
