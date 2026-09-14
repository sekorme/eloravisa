import { BarChart3, LayoutGrid, Mail, ShieldCheck } from "lucide-react"
import { LegalDocument, type LegalSection } from "@/features/legal/LegalDocument"
import { Callout, Definitions, EmailLink, TermGrid } from "@/features/legal/blocks"

/* `#ai-processing` and `#contact` are linked from the site footer. */
const SECTIONS: readonly LegalSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    body: (
      <p>
        Welcome to Elora Visa (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our AI-powered visa assistance services. By using our service, you agree to the collection and use of information in accordance with this policy.
      </p>
    ),
  },
  {
    id: "information-we-collect",
    title: "Information We Collect",
    body: (
      <>
        <p>We collect information that you provide directly to us:</p>
        <Definitions
          items={[
            { term: "Personal Data", detail: "Name, email address, phone number, and country of residence." },
            { term: "Application Data", detail: "Visa type, destination country, and uploaded documents (e.g., passport copies, bank statements) for analysis." },
            { term: "Usage Data", detail: "Information about how you use our website, such as access times, pages viewed, and IP address." },
          ]}
        />
      </>
    ),
  },
  {
    id: "how-we-use-your-information",
    title: "How We Use Your Information",
    body: (
      <>
        <p>We use the collected data for various purposes:</p>
        <TermGrid
          items={[
            { icon: LayoutGrid, title: "Service Delivery", body: "To provide and maintain our Service, including AI analysis and mock interviews." },
            { icon: Mail, title: "Communication", body: "To contact you with newsletters, marketing or promotional materials." },
            { icon: BarChart3, title: "Improvement", body: "To provide analysis or valuable information so that we can improve the Service." },
            { icon: ShieldCheck, title: "Security", body: "To monitor the usage of the Service and detect, prevent and address technical issues." },
          ]}
        />
      </>
    ),
  },
  {
    id: "data-security",
    title: "Data Security",
    body: (
      <p>
        The security of your data is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
      </p>
    ),
  },
  {
    id: "ai-processing",
    title: "AI Processing",
    body: (
      <>
        <p>
          Our services utilize Artificial Intelligence (AI) to analyze your documents and simulate interviews. Data processed by our AI models is used solely for the purpose of providing you with feedback.
        </p>
        <Callout label="Your data and our models">
          We do not use your personal data to train our public AI models without your explicit consent.
        </Callout>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact Us",
    body: (
      <>
        <p>If you have any questions about this Privacy Policy, please contact us:</p>
        <EmailLink />
      </>
    ),
  },
]

export default function PrivacyPolicy() {
  return (
    <LegalDocument
      doc="privacy"
      lead="We value your trust and are committed to protecting your personal information."
      updated="2026-01-22"
      sections={SECTIONS}
    />
  )
}
