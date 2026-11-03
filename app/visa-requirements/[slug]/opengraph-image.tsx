import { getPublishedRequirement } from "@/lib/countryRequirementsServer";
import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og";

export const revalidate = 3600;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Visa requirements on Elora Visa";

type Props = { params: Promise<{ slug: string }> };

const money = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-GB", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
};

export default async function Image({ params }: Props) {
  const entry = await getPublishedRequirement((await params).slug);

  if (!entry) {
    return renderOgCard({
      eyebrow: "Visa requirements",
      title: "Know exactly what",
      accent: "your visa needs.",
      subtitle: "Fees, documents, proof of funds and embassy details by country.",
      url: "eloravisa.com/visa-requirements",
    });
  }

  const chips: string[] = [];
  if (entry.fees[0]) chips.push(`Fee ${money(entry.fees[0].amount, entry.fees[0].currency)}`);
  if (entry.processingTime) chips.push(entry.processingTime);
  if (entry.documents.length) chips.push(`${entry.documents.length} documents`);

  return renderOgCard({
    eyebrow: "Visa requirements",
    title: entry.country,
    accent: `${entry.visaType} visa`,
    subtitle: "Fees, documents, proof of funds and embassy details — in one checklist.",
    chips,
    url: "eloravisa.com/visa-requirements",
  });
}
