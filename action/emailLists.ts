"use server"

import { createHash } from "crypto"
import { FieldValue } from "firebase-admin/firestore"
import { db } from "@/firebase/admin"
import { getClientIp } from "@/lib/getClientIp"
import { checkRateLimit } from "@/lib/ratelimit"

export type EmailListResult = { ok: true; message: string } | { ok: false; message: string }

// Deliberately conservative: catches typos without rejecting valid addresses.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Adds an address to one of the marketing email lists.
 *
 * The document id is a SHA-256 of the lowercased address, which makes repeat
 * submissions idempotent without needing a query, and keeps the raw address out
 * of the document path. `createdAt` is written once; re-submitting only moves
 * `updatedAt`.
 */
async function addToList(
  email: string,
  collection: "class_waitlist" | "newsletter_subscribers",
  source: string,
  successMessage: string
): Promise<EmailListResult> {
  const trimmed = email.trim().toLowerCase()

  if (!trimmed) return { ok: false, message: "Please enter your email address." }
  if (trimmed.length > 254 || !EMAIL_RE.test(trimmed)) {
    return { ok: false, message: "That doesn't look like a valid email address." }
  }

  // Public, unauthenticated endpoint, so the limiter is keyed on caller IP.
  const ip = await getClientIp()
  const { success } = await checkRateLimit("classWaitlist", ip)
  if (!success) {
    return { ok: false, message: "Too many attempts. Please try again in a few minutes." }
  }

  try {
    const id = createHash("sha256").update(trimmed).digest("hex")
    const ref = db.collection(collection).doc(id)
    const existing = await ref.get()

    await ref.set(
      {
        email: trimmed,
        source,
        ...(existing.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )

    return { ok: true, message: successMessage }
  } catch (err) {
    console.error(`[emailLists] failed to write to ${collection}:`, err)
    return { ok: false, message: "Something went wrong on our side. Please try again shortly." }
  }
}

/**
 * Records interest in the (not yet launched) live visa classes.
 *
 * Live classes have no scheduling backend yet, so this is a genuine waitlist and
 * nothing more — the homepage must not advertise dates, instructors or seat
 * counts that don't exist. When classes do launch, `class_waitlist` is the list
 * to email.
 */
export async function joinClassWaitlist(email: string): Promise<EmailListResult> {
  return addToList(
    email,
    "class_waitlist",
    "homepage_live_classes",
    "You're on the list. We'll email you as soon as class dates are confirmed."
  )
}

/** General product-updates list, used by the footer subscription field. */
export async function subscribeToUpdates(email: string): Promise<EmailListResult> {
  return addToList(
    email,
    "newsletter_subscribers",
    "homepage_footer",
    "Thanks — you'll hear from us when there's something genuinely useful to share."
  )
}
