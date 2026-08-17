import Image from "next/image"
import Link from "next/link"
import { Check, ShieldCheck } from "lucide-react"
import { LoginModal } from "./LoginModal"
import { SignupSheet } from "./SignupSheet"

interface AuthEntryPageProps {
  mode: "signin" | "signup"
}

export function AuthEntryPage({ mode }: AuthEntryPageProps) {
  const signingIn = mode === "signin"

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-landing-navy text-white lg:block">
        <Image src="/firsttime.png" alt="Applicant preparing for an international visa journey" fill priority className="object-cover opacity-55" sizes="50vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-landing-navy via-landing-navy/65 to-landing-blue/20" aria-hidden="true" />
        <div className="absolute inset-x-0 bottom-0 p-12 xl:p-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-landing-cyan">Elora Visa</p>
          <h1 className="mt-5 max-w-xl text-4xl font-black leading-tight tracking-tight xl:text-6xl">Prepare your application with clarity and control.</h1>
          <ul className="mt-8 space-y-3 text-white/75">
            {["Personalized visa checklist", "AI document preparation feedback", "Realistic mock interview practice"].map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-landing-cyan/20 text-landing-cyan"><Check className="h-4 w-4" aria-hidden="true" /></span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-16 sm:px-8">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-blue">
            <Image src="/eloravisa.PNG" alt="" width={48} height={48} className="h-12 w-12 object-contain" />
            <span className="text-xl font-black">Elora Visa</span>
          </Link>
          <p className="mt-12 text-xs font-semibold uppercase tracking-[0.2em] text-landing-blue dark:text-landing-cyan">{signingIn ? "Welcome back" : "Start free"}</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{signingIn ? "Continue your preparation." : "Create your Elora Visa account."}</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">{signingIn ? "Sign in securely to return to your checklist, documents and interview practice." : "Set up your account and build a preparation path around your visa objective."}</p>

          <div className="mt-8 [&_button]:min-h-12 [&_button]:w-full [&_button]:rounded-full [&_button]:bg-gradient-to-r [&_button]:from-landing-cyan [&_button]:via-landing-blue [&_button]:to-landing-violet [&_button]:font-semibold [&_button]:text-white">
            {signingIn ? <LoginModal /> : <SignupSheet desscription="Create free account" />}
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {signingIn ? "New to Elora Visa?" : "Already have an account?"}{" "}
            <Link href={signingIn ? "/signup" : "/login"} className="font-semibold text-landing-blue underline underline-offset-4 dark:text-landing-cyan">
              {signingIn ? "Create an account" : "Sign in"}
            </Link>
          </p>
          <div className="mt-10 flex items-start gap-3 rounded-2xl border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-landing-blue dark:text-landing-cyan" aria-hidden="true" />
            <p>Authentication is handled securely through the platform&apos;s existing Firebase account system.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
