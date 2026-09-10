import { EloraHome } from "@/features/elora-home/EloraHome"
import { homeMetadata } from "@/features/elora-home/seo"

/**
 * The homepage route.
 *
 * A thin shell on purpose: the entire experience lives in the isolated
 * `features/elora-home` module, so nothing about this file constrains the
 * design and the feature can be developed, reviewed or replaced as one unit.
 *
 * Metadata is exported from the feature too, so page copy and search copy stay
 * next to each other and can't drift apart.
 */
export const metadata = homeMetadata

/**
 * Regenerate hourly.
 *
 * The page embeds live Firestore aggregate counts (applicants, document
 * reviews, mock interviews). Left as a pure static export those numbers would
 * freeze at build time and slowly become false, which is exactly the failure
 * mode `adapters/proof.ts` exists to prevent. An hour is well inside the
 * accuracy these counts need, and still gives every visitor a fully cached
 * HTML response.
 */
export const revalidate = 3600

export default function Page() {
    return <EloraHome />
}
