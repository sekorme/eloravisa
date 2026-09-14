import type { LucideIcon } from "lucide-react"
import { Cookie, FileText, ShieldAlert, ShieldCheck } from "lucide-react"
import { ROUTES } from "@/features/elora-home/adapters/routes"

/**
 * The four legal documents, in the order the switcher lists them.
 *
 * Paths come from the homepage route adapter so a rename stays a one-line
 * change there.
 */
export type LegalDocKey = "privacy" | "terms" | "cookies" | "disclaimer"

export interface LegalDocEntry {
    key: LegalDocKey
    label: string
    href: string
    icon: LucideIcon
}

export const LEGAL_DOCS: readonly LegalDocEntry[] = [
    { key: "privacy", label: "Privacy Policy", href: ROUTES.privacy, icon: ShieldCheck },
    { key: "terms", label: "Terms of Service", href: ROUTES.terms, icon: FileText },
    { key: "cookies", label: "Cookie Policy", href: ROUTES.cookies, icon: Cookie },
    { key: "disclaimer", label: "Disclaimer", href: ROUTES.disclaimer, icon: ShieldAlert },
]

export const SUPPORT_EMAIL = "support@eloravisa.com"
