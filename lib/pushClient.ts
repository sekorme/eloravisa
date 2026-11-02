"use client"

import { getToken } from "firebase/messaging"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/firebase/client"
import { getFirebaseMessaging } from "@/lib/firebase"

/**
 * Browser side of web push: permission state, enabling, and saving this
 * device's FCM token. Server side: lib/push.ts.
 *
 * Phones are why this is careful:
 * - iOS only allows web push in an app added to the Home Screen (16.4+), and
 *   only asks for permission from a tap. Android Chrome also blocks prompts
 *   that appear on page load. So permission is only ever requested from a
 *   button (enablePush), never automatically.
 * - Accounts are used on several devices, so tokens are kept as a list
 *   (fcmTokens, newest last) instead of one field that each device overwrote.
 */

export type PushState = "unsupported" | "ios-needs-install" | "denied" | "default" | "granted"

const MAX_DEVICES = 5
const SW_URL = "/firebase-messaging-sw.js"

function isIos() {
  const ua = navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1)
}

function isStandalone() {
  return window.matchMedia?.("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
}

export function getPushState(): PushState {
  if (typeof window === "undefined") return "unsupported"
  if (isIos() && !isStandalone()) return "ios-needs-install"
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) return "unsupported"
  return Notification.permission as PushState
}

/** Saves this device's token (permission must already be granted). */
export async function registerPushToken(uid: string): Promise<boolean> {
  if (getPushState() !== "granted") return false
  const messaging = await getFirebaseMessaging()
  if (!messaging) return false
  // Our own worker (handles clicks and older message formats), not a second
  // copy Firebase would register under its own scope.
  const registration = await navigator.serviceWorker.register(SW_URL, { scope: "/" })
  await navigator.serviceWorker.ready
  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID,
    serviceWorkerRegistration: registration,
  })
  if (!token) return false

  const ref = doc(db, "users", uid)
  const existing: string[] = (await getDoc(ref)).get("fcmTokens") ?? []
  if (existing[existing.length - 1] === token) return true
  const fcmTokens = [...existing.filter((t) => t !== token), token].slice(-MAX_DEVICES)
  // fcmToken (newest device) is kept for older code paths and queries.
  await updateDoc(ref, { fcmTokens, fcmToken: token })
  return true
}

/** Call from a click/tap: asks for permission, then registers this device. */
export async function enablePush(uid: string): Promise<PushState> {
  const state = getPushState()
  if (state === "unsupported" || state === "ios-needs-install" || state === "denied") return state
  const permission = state === "granted" ? "granted" : await Notification.requestPermission()
  if (permission !== "granted") return permission as PushState
  await registerPushToken(uid)
  return "granted"
}
