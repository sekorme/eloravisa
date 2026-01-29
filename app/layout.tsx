import type { Metadata } from "next";
import { Geist, Geist_Mono, Nunito_Sans } from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";




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

const nunitoSans = Nunito_Sans({variable:'--font-sans'});

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
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
        <html lang="en" className={nunitoSans.variable} suppressHydrationWarning>
        <head>
            <Script
                src="https://www.googletagmanager.com/gtag/js?id=G-M11K918X76"
                strategy="afterInteractive"
            />

            <Script id="google-tags" strategy="afterInteractive">
                {`
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-M11K918X76'); // Google Analytics
  gtag('config', 'AW-17910098280'); // Google Ads
`}
            </Script>

        </head>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
        <ThemeProvider
            attribute="class"
            defaultTheme={ "system"}
            enableSystem
            disableTransitionOnChange
        >
            <AuthProvider>
                {children}

            </AuthProvider>
            <Toaster />
        </ThemeProvider>
        </body>
        </html>
    );
}
