import type { Metadata } from "next"
import { AuthEntryPage } from "@/components/auth/AuthEntryPage"

export const metadata: Metadata = {
  title: "Create an Account",
  description: "Create your free Elora Visa account and begin preparing your visa application.",
}

export default function SignupPage() {
  return <AuthEntryPage mode="signup" />
}
