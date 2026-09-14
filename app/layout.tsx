import type { Metadata } from "next";
import { Inter, Manrope, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import {TrackVisit} from "@/components/TrackVisit";
import { LenisProvider } from "@/components/LenisProvider";




const images = [
    {
        url: "https://eloravisa.com/elora1.jpeg",
        width: 1200,
        height: 630,
        alt: "Elora Visa one"
    },
    {
        url: "https://eloravisa.com/elora2.jpeg",
        width: 1200,
        height: 630,
        alt: "Elora Visa Two",
    },
    {
        url: "https://eloravisa.com/elora3.jpeg",
        width: 1200,
        height: 630,
        alt: "Elora Visa Three",
    },

    {
        url: "https://eloravisa.com/elora4.jpeg",
        width: 1200,
        height: 630,
        alt: "Elora Visa Four",
    },
    {
        url: "https://eloravisa.com/elora5.jpeg",
        width: 1200,
        height: 630,
        alt: "Elora Visa Five",
    },
    {
        url: "https://eloravisa.com/elora6.jpeg",
        width: 1200,
        height: 630,
        alt: "Elora Visa Six",
    },
];

const randomIndex = Math.floor(Math.random() * images.length);
const selected = images[randomIndex];

const geistSans = Inter({
    variable: "--font-inter",
    subsets: ["latin"],
});

const headingFont = Manrope({ variable: "--font-manrope", subsets: ["latin"], display: "swap" });

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

/**
 * Display serif for the marketing homepage (`features/elora-home`).
 *
 * Fraunces is a variable font with an optical-size axis, which is what lets one
 * family carry both a 5.5rem engraved hero headline and a 2rem section title
 * without the larger sizes looking bloated. Only the weights actually used are
 * requested, and `display: "swap"` means a missing font never blocks text.
 */
const displaySerif = Fraunces({
    variable: "--font-fraunces",
    subsets: ["latin"],
    // No `weight` key: next/font only accepts `axes` for a font loaded as a
    // variable font, and specifying a fixed weight list opts out of that. The
    // full weight range plus the optical-size axis is exactly what the display
    // type needs.
    axes: ["SOFT", "WONK", "opsz"],
    display: "swap",
});

export const metadata: Metadata = {
    title: {
        default: "Elora Visa - AI-Powered Visa Application Assistant",
        template: "%s | Elora Visa"
    },
    description: "Master your visa application with Elora Visa. Get AI-powered document reviews, personalized checklists, and realistic mock interviews to boost your approval chances.",
    keywords: ["visa application", "visa interview", "AI visa assistant", "mock interview", "study visa", "work visa", "immigration", "document review", "visa help"],
    authors: [{ name: "Elora Visa Team" }],
    creator: "Elora Visa",
    publisher: "Elora Visa",
    icons: {
        icon: "https://eloravisa.com/eloravisa.PNG",
        apple: "https://eloravisal.com/apple-touch-icon.png",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    manifest: "/manifest.json",
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://eloravisa.com", // Replace with actual domain
        title: "Elora Visa - Your AI Visa Companion",
        description: "Simplify your visa journey with AI. Document analysis, interview prep, and expert guidance all in one place.",
        siteName: "Elora Visa",
        images: [
            selected
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Elora Visa - AI Visa Application Assistant",
        description: "Boost your visa approval chances with AI-powered reviews and mock interviews.",
        images: ["https://eloravisa.com/OG.png"], // Same as OG image
        creator: "@eloravisa", // Replace with actual handle
    },
    metadataBase: new URL("https://eloravisa.com"), // Replace with actual domain
    alternates: {
        canonical: "/",
    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // `data-scroll-behavior="smooth"`: globals.css sets `scroll-behavior:
        // smooth` on <html>, which turned Next's reset-to-top on navigation
        // into a slow animation that GSAP's ScrollTrigger refresh then
        // cancelled, so a page could open scrolled halfway down. With the
        // attribute, Next switches smooth scrolling off just for route
        // changes; in-page anchor links stay smooth.
        <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
        <head>
            <Script
                src="https://www.googletagmanager.com/gtag/js?id=G-M11K918X76"
                strategy="afterInteractive"
            />

            {/* Analytics + Ads config only. The Google Ads *conversion* event is
                deliberately NOT fired here: firing it on every page load
                reported every visitor as a conversion. It now fires once, from
                `trackSignupConversion()` in lib/analytics.ts, when an account
                has actually been created. */}
            <Script id="google-tags" strategy="afterInteractive">
                {`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-M11K918X76'); // Google Analytics
  gtag('config', 'AW-17910098280'); // Google Ads
`}
            </Script>
            <meta name="google-site-verification" content="WaPSANjh4xYxdDhEX_bIetVlh6Z5gUkcaesHbibqXtE" />
        </head>
        <body
            className={`${geistSans.variable} ${headingFont.variable} ${geistMono.variable} ${displaySerif.variable} antialiased`}
        >
        <ThemeProvider
            attribute="class"
            defaultTheme={ "system"}
            enableSystem
            disableTransitionOnChange
        >
            <TrackVisit/>
            <LenisProvider>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </LenisProvider>
            <Toaster />
        </ThemeProvider>
        </body>
        </html>
    );
}
