import type { Metadata } from "next"
import { AuthEntryPage } from "@/components/auth/AuthEntryPage"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in securely to continue your Elora Visa preparation journey.",
}

export default function LoginPage() {
  return <AuthEntryPage mode="signin" />
}
