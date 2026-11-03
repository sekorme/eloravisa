import { OG_CONTENT_TYPE, OG_SIZE, renderOgCard } from "@/lib/og";

export const alt = "Elora Visa: an AI-powered visa preparation workspace";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default function Image() {
  return renderOgCard({
    eyebrow: "AI visa preparation workspace",
    title: "Prepare smarter.",
    accent: "Apply with confidence.",
    subtitle: "AI document review, personalised checklists and voice mock interviews.",
    chips: ["Document review", "Mock interviews", "Visa checklists"],
  });
}
