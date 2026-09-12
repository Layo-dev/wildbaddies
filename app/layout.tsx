import type { Metadata } from "next";
import { Roboto_Condensed } from "next/font/google";
import Script from "next/script";
import Providers from "./providers";
import "./globals.css";

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto-condensed",
  display: "swap",
});

const SITE_URL = "https://wildbaddies.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Wild Baddies | Baddies Porn",
    template: "%s | Wild Baddies",
  },
  description:
    "Wild Baddies — Free baddies porn videos, OnlyFans clips, Latina, Ebony & thick amateurs. Daily new explicit videos and photos. Watch the wildest baddies now.",
  authors: [{ name: "Baddies" }],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  other: {
    rating: "adult",
    "juicyads-site-verification": "ad92204b0dadbbd879f3286c8a531487",
    "6a97888e-site-verification": "6b96ca195225bda9d840812ca6bc22bf",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Wild Baddies | Baddies Porn",
    description:
      "Wild Baddies — Free baddies porn videos, OnlyFans clips, Latina, Ebony & thick amateurs. Daily new explicit videos and photos. Watch the wildest baddies now.",
    images: [
      {
        url: `/baddies-og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "WildBaddies.com logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Baddies",
    title: "Wild Baddies | Baddies Porn",
    description:
      "Wild Baddies — Free baddies porn videos, OnlyFans clips, Latina, Ebony & thick amateurs. Daily new explicit videos and photos. Watch the wildest baddies now.",
    images: [`/baddies-og-image.jpg`],
  },
  icons: { icon: "/favicon.jpg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={robotoCondensed.variable}>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LQRZSSYPRG"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LQRZSSYPRG');
          `}
        </Script>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
