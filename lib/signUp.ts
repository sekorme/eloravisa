// lib/signup.ts
import { createUserWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/firebase/client"
import { enablePersistence } from "./authPersistence"

export async function signup(email: string, password: string) {
    await enablePersistence()

    const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
    )

    return userCredential.user
}
