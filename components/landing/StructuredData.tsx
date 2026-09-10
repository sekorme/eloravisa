import { faqSchema, organizationSchema, softwareApplicationSchema } from "@/lib/landing/schema"

/**
 * Emits the homepage's JSON-LD. Rendered from a server component so the markup
 * is in the initial HTML where crawlers will see it, with no client JS cost.
 */
export function StructuredData() {
  const graphs = [organizationSchema(), softwareApplicationSchema(), faqSchema()]

  return (
    <>
      {graphs.map((graph, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Content is built from our own typed config, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
        />
      ))}
    </>
  )
}
