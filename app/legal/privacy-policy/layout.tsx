import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Elora Visa",
  description: "Read our privacy policy to understand how Elora Visa handles and protects your personal data.",
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
