import type { Metadata } from "next";
import AffiliateHomeNavbar from "@/components/affiliate/AffiliateHomeNavbar";
import AffiliatePublicGuard from "@/components/affiliate/guards/AffiliatePublicGuard";

export const metadata: Metadata = {
    title: {
        default: "Elora Visa Affiliate Program - Partner with Us & Earn",
        template: "%s | Elora Visa Affiliate"
    },
    description: "Join the Elora Visa Affiliate Program. Help your audience master their visa applications with AI and earn 10% commission on every successful referral.",
    keywords: ["affiliate program", "earn money", "visa assistant partner", "referral program", "eloravisa affiliate", "passive income", "travel affiliate"],
    openGraph: {
        title: "Elora Visa Affiliate Program - Partner with Us & Earn",
        description: "Earn 10% commission by helping others simplify their visa journey with Elora Visa's AI-powered platform.",
        url: "https://eloravisa.com/affiliate",
        siteName: "Elora Visa Affiliate",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Elora Visa Affiliate Program",
        description: "Join our affiliate program and earn 10% commission on every referral. Help people succeed in their visa applications.",
    },
};

export default function AffiliateLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <AffiliateHomeNavbar />
            <AffiliatePublicGuard>
                {children}
            </AffiliatePublicGuard>
        </>
    );
}
