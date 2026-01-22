// lib/authPersistence.ts
import { auth } from "@/firebase/client"
import { setPersistence, browserLocalPersistence } from "firebase/auth"

export async function enablePersistence() {
    await setPersistence(auth, browserLocalPersistence)
}
