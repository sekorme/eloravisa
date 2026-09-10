/** CMS-ready tool and journey content. All preview values are illustrative. */
export type ToolId = "document-review" | "mock-interview" | "sop-assistant" | "smart-checklist"
export type PreparationTool = { id: ToolId; title: string; description: string; cta: string; href: string; eyebrow: string }

export const PREPARATION_TOOLS: PreparationTool[] = [
  {
    id: "document-review", title: "A second look. A clearer next step.", eyebrow: "AI Document Review",
    description: "Upload your documents and receive structured feedback on completeness, clarity, consistency, and potential areas to review.",
    cta: "Review My Documents", href: "/dashboard/application",
  },
  {
    id: "mock-interview", title: "Find your voice before the interview.", eyebrow: "AI Mock Interview",
    description: "Practise answering realistic visa interview questions through an interactive voice conversation.",
    cta: "Start a Practice Interview", href: "/dashboard/interview-page",
  },
  {
    id: "sop-assistant", title: "Your story. A stronger first draft.", eyebrow: "AI SOP Assistant",
    description: "Turn your personal background, study plans, and career goals into a structured first draft you can refine in your own voice.",
    cta: "Draft My SOP", href: "/dashboard/draft",
  },
  {
    id: "smart-checklist", title: "Less to remember. More peace of mind.", eyebrow: "Smart Checklist",
    description: "Follow a personalized checklist based on your destination and application type, with a clear view of what still needs your attention.",
    cta: "Create My Checklist", href: "/dashboard/application",
  },
]

export type SupportedJourney = { id: string; title: string; description: string; examples: string; tools: string[]; image: string; alt: string; position?: string; href: string }

export const SUPPORTED_JOURNEYS: SupportedJourney[] = [
  {
    id: "study", title: "Study visas", description: "A new campus. A new chapter. Prepare for what comes next.", examples: "United Kingdom · Canada · Germany",
    tools: ["SOP assistance", "Document review", "Interview practice"], image: "/elora1.jpeg",
    alt: "Illustrative study journey: people reading and working on laptops in a library", position: "center 48%", href: "/visa-guidance",
  },
  {
    id: "visitor", title: "Visitor visas", description: "Make room for the experience. Bring a clear travel plan.", examples: "United States · France · Australia",
    tools: ["Travel checklist", "Document review"], image: "/elora3.jpeg",
    alt: "Illustrative travel journey: a person carrying a backpack on a city street", position: "center 35%", href: "/visa-guidance",
  },
  {
    id: "work", title: "Work-related applications", description: "Organize the evidence behind your next professional step.", examples: "Germany · Ireland · Canada",
    tools: ["Document checklist", "Letter drafting"], image: "/studentworker.png",
    alt: "Illustrative preparation scene: two people reviewing paperwork beside a laptop", position: "center 34%", href: "/visa-guidance",
  },
  {
    id: "family", title: "Family & dependent applications", description: "Keep the people who matter at the heart of your plans.", examples: "United Kingdom · Canada · Australia",
    tools: ["Supporting documents", "Preparation guidance"], image: "/elora2.jpeg",
    alt: "Illustrative shared journey: a group of people posing together outdoors", href: "/visa-guidance",
  },
  {
    id: "business", title: "Conference & business travel", description: "Prepare your purpose of travel, itinerary, and supporting letters.", examples: "United States · France · United Kingdom",
    tools: ["Letter drafting", "Travel checklist"], image: "/elora6.jpeg",
    alt: "Illustrative international travel: a person seated beside a window overlooking a city", position: "center 26%", href: "/visa-guidance",
  },
]
