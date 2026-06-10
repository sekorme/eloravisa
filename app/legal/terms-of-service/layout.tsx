import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Elora Visa",
  description: "Read the Terms of Service for Elora Visa to understand the rules and guidelines for using our AI-powered visa application assistance.",
};

export default function TermsOfServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
