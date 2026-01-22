// lib/googleSignIn.ts
import {
    GoogleAuthProvider,
    signInWithPopup,
    setPersistence,
    browserLocalPersistence,
} from "firebase/auth"
import { auth } from "@/firebase/client"

export async function signInWithGoogle() {
    await setPersistence(auth, browserLocalPersistence)

    const provider = new GoogleAuthProvider()
    provider.setCustomParameters({
        prompt: "select_account",
    })

    const result = await signInWithPopup(auth, provider)
    return result.user
}
