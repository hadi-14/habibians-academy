import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
    default: "Habibian's Academy",
    template: "%s | Habibian's Academy"
  },
  description: "Habibian's Academy was envisioned by Sir Abdul Samad Jamal, the founder of ASJ-ERDC, which oversees several educational initiatives, including Habibian’s Academy, Blooms’ Schooling System, and ASJ-Cradle of Wisdom. As technological advancements continue to reshape the educational landscape, the demand for innovative skills and modern teaching methods has never been greater. Recognizing this need, Ailestra Education emerges as a pioneering venture that integrates cutting-edge teaching approaches and offers advanced courses designed to empower the younger generation by unlocking their true potential and master the skills necessary to thrive in a rapidly evolving world.",
  authors: [
    {
      url: 'https://abdul-hadi-millwala.vercel.app',
      name: 'Abdul Hadi Millwala',
    },
  ],
  icons: "favicon.ico",
  keywords: [
    "Habibians' Academy", "habibians-academy", "college", "education", "coaching", "online school",
    "ASJ-ERDC", "Blooms’ Schooling System", "ASJ-Cradle of Wisdom", "Sir Abdul Samad Jamal"
  ],
  openGraph: {
    title: "Habibian's Academy",
    description: "Empowering the next generation with innovative skills and modern teaching methods.",
    url: process.env.NEXT_PUBLIC_URL || "https://habibians-academy.com",
    siteName: "Habibian's Academy",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Habibian's Academy Logo"
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Habibian's Academy",
    description: "Empowering the next generation with innovative skills and modern teaching methods.",
    images: ["/og-image.png"],
    site: "@habibiansacademy",
    creator: "@habibiansacademy"
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_URL || "https://habibians-academy.com"
  },
  other: {
    "facebook-page": "https://facebook.com/HabibiansAcademy"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* SEO Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Habibian's Academy" />
        <meta property="og:description" content="Empowering the next generation with innovative skills and modern teaching methods." />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content={process.env.NEXT_PUBLIC_URL || "https://habibians-academy.com"} />
        <meta property="og:site_name" content="Habibian's Academy" />
        <meta property="fb:page_id" content="HabibiansAcademy" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Habibian's Academy" />
        <meta name="twitter:description" content="Empowering the next generation with innovative skills and modern teaching methods." />
        <meta name="twitter:image" content="/og-image.png" />
        <meta name="twitter:site" content="@habibiansacademy" />
        <meta name="twitter:creator" content="@habibiansacademy" />
        <link rel="canonical" href={process.env.NEXT_PUBLIC_URL || "https://habibians-academy.com"} />
        <meta name="facebook-page" content="https://facebook.com/HabibiansAcademy" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-primary-white text-primary-black font-body min-h-screen flex flex-col`}
      >
        {/* Fixed Logo Background */}
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 0,
            pointerEvents: 'none',
            background: `url('/logo.svg') no-repeat center center`,
            backgroundSize: 'contain',
            opacity: 0.15,
          }}
        />
        <Header />
        <main className="flex-1" style={{ zIndex: 1 }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
