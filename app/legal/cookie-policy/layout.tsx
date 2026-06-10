import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy | Elora Visa",
  description: "Learn about how Elora Visa uses cookies to improve your user experience and provide personalized services.",
};

export default function CookiePolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
