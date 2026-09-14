import { LegalDocument, type LegalSection } from "@/features/legal/LegalDocument"
import { Callout } from "@/features/legal/blocks"

/* `#ai-guidance` is an existing deep link into the first section. */
const SECTIONS: readonly LegalSection[] = [
  {
    id: "ai-guidance",
    title: "Not Legal Advice",
    body: (
      <>
        <p>
          The information provided by Elora Visa (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) on our website and through our services is for <strong>general informational and educational purposes only</strong>. All information is provided in good faith, however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information.
        </p>
        <Callout tone="important">
          Elora Visa is not a law firm and does not provide legal advice. Our AI-powered tools are designed to assist with preparation but should not be considered a substitute for professional legal counsel or official government guidance.
        </Callout>
      </>
    ),
  },
  {
    id: "no-guarantee-of-results",
    title: "No Guarantee of Results",
    body: (
      <p>
        We do not guarantee that using our services will result in the approval of your visa application. <strong>Visa issuance is at the sole discretion of the respective embassy or consulate.</strong> Past performance or examples shown on the site do not guarantee future results.
      </p>
    ),
  },
  {
    id: "external-links",
    title: "External Links",
    body: (
      <p>
        Our website may contain links to other websites or content belonging to or originating from third parties. Such external links are not investigated, monitored, or checked for accuracy, adequacy, validity, reliability, availability, or completeness by us. We do not warrant, endorse, guarantee, or assume responsibility for the accuracy or reliability of any information offered by third-party websites linked through the site.
      </p>
    ),
  },
  {
    id: "use-at-your-own-risk",
    title: "Use at Your Own Risk",
    body: (
      <p>
        Your use of the site and our services and your reliance on any information is solely at your own risk.
      </p>
    ),
  },
]

export default function Disclaimer() {
  return (
    <LegalDocument
      doc="disclaimer"
      lead="Please read this disclaimer carefully before using Elora Visa."
      updated="2026-01-22"
      sections={SECTIONS}
    />
  )
}
