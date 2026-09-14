import { BarChart3, ShieldCheck, SlidersHorizontal } from "lucide-react"
import { LegalDocument, type LegalSection } from "@/features/legal/LegalDocument"
import { TermGrid } from "@/features/legal/blocks"

const SECTIONS: readonly LegalSection[] = [
  {
    id: "what-are-cookies",
    title: "What Are Cookies?",
    body: (
      <p>
        Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to the owners of the site.
      </p>
    ),
  },
  {
    id: "how-we-use-cookies",
    title: "How We Use Cookies",
    body: (
      <>
        <p>We use cookies for the following purposes:</p>
        <TermGrid
          columns={3}
          items={[
            { icon: ShieldCheck, title: "Essential", body: "Necessary for the website to function properly, such as managing your login session." },
            { icon: SlidersHorizontal, title: "Functionality", body: "Allow the website to remember choices you make (like language or region) for a personalized experience." },
            { icon: BarChart3, title: "Analytics", body: "Help us understand how visitors interact with our website by collecting and reporting information anonymously." },
          ]}
        />
      </>
    ),
  },
  {
    id: "managing-cookies",
    title: "Managing Cookies",
    body: (
      <p>
        Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience, since it will no longer be personalized to you. It may also stop you from saving customized settings like login information.
      </p>
    ),
  },
  {
    id: "changes-to-this-policy",
    title: "Changes to This Policy",
    body: (
      <p>
        We may update our Cookie Policy from time to time. We encourage you to periodically review this page for the latest information on our privacy practices.
      </p>
    ),
  },
]

export default function CookiePolicy() {
  return (
    <LegalDocument
      doc="cookies"
      lead="Understanding how and why we use cookies to improve your experience."
      updated="2026-01-22"
      sections={SECTIONS}
    />
  )
}
