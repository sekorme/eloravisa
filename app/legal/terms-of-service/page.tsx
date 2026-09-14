import { LegalDocument, type LegalSection } from "@/features/legal/LegalDocument"
import { Bullets, Callout } from "@/features/legal/blocks"
import { LegalLink } from "@/features/legal/LegalLink"
import { ROUTES } from "@/features/elora-home/adapters/routes"

const SECTIONS: readonly LegalSection[] = [
  {
    id: "agreement-to-terms",
    title: "Agreement to Terms",
    body: (
      <p>
        By accessing or using Elora Visa, you agree to be bound by these Terms of Service and our <LegalLink href={ROUTES.privacy}>Privacy Policy</LegalLink>. If you do not agree to these terms, please do not use our services.
      </p>
    ),
  },
  {
    id: "description-of-service",
    title: "Description of Service",
    body: (
      <p>
        Elora Visa provides AI-powered tools to assist users with their visa applications, including document analysis and mock interviews. We are an educational and preparatory tool, not a law firm or a government agency.
      </p>
    ),
  },
  {
    id: "no-guarantee-of-visa-approval",
    title: "No Guarantee of Visa Approval",
    body: (
      <Callout tone="important">
        Elora Visa does not guarantee that your visa application will be approved. The decision to grant or deny a visa rests solely with the relevant government authorities (embassies/consulates). Our services are designed to improve your preparation, but we cannot influence the outcome.
      </Callout>
    ),
  },
  {
    id: "user-responsibilities",
    title: "User Responsibilities",
    body: (
      <>
        <p>You are responsible for:</p>
        <Bullets
          items={[
            "Providing accurate and truthful information.",
            "Ensuring that your use of the service complies with all applicable laws and regulations.",
            "Maintaining the confidentiality of your account credentials.",
          ]}
        />
      </>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    body: (
      <p>
        The content, features, and functionality of Elora Visa, including but not limited to text, graphics, logos, and software, are the exclusive property of Elora Visa and are protected by copyright, trademark, and other intellectual property laws.
      </p>
    ),
  },
  {
    id: "limitation-of-liability",
    title: "Limitation of Liability",
    body: (
      <p>
        In no event shall Elora Visa, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
      </p>
    ),
  },
  {
    id: "changes-to-terms",
    title: "Changes to Terms",
    body: (
      <p>
        We reserve the right to modify or replace these Terms at any time. If a revision is material, we will try to provide at least 30 days&rsquo; notice prior to any new terms taking effect.
      </p>
    ),
  },
]

export default function TermsOfService() {
  return (
    <LegalDocument
      doc="terms"
      lead="Please read these terms carefully before using our services."
      updated="2026-01-22"
      sections={SECTIONS}
    />
  )
}
