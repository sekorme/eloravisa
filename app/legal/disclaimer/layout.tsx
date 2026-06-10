import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer | Elora Visa",
  description: "Read the Elora Visa disclaimer regarding our AI-powered visa assistance services and legal information.",
};

export default function DisclaimerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
