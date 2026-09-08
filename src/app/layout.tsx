import type { Metadata } from "next";
import Script from "next/script";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { RouteChrome } from "@/components/layout/RouteChrome";
import { CartProvider } from "@/components/cart/CartProvider";
import "./globals.css";

const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://comeat-drab.vercel.app";
const siteUrl = (configuredSiteUrl.startsWith("http") ? configuredSiteUrl : `https://${configuredSiteUrl}`).replace(/\/+$/, "");
const googleSiteVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ComEat",
    template: "%s | ComEat",
  },
  description: "Authentic Nigerian food, made to bring people together.",
  icons: {
    icon: "/images/comeat-logo.png",
    apple: "/images/comeat-logo.png",
  },
  verification: googleSiteVerification ? { google: googleSiteVerification } : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const configuredGaId = process.env.NEXT_PUBLIC_GA_ID?.trim();
  const gaId = configuredGaId && /^G-[A-Z0-9]+$/.test(configuredGaId) ? configuredGaId : null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <a
          className="sr-only z-[100] bg-gold px-4 py-3 font-semibold text-background focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          href="#main-content"
        >
          Skip to content
        </a>
        <CartProvider>
          <RouteChrome footer={<Footer />} header={<Navbar />}>
            {children}
          </RouteChrome>
        </CartProvider>
        {gaId ? (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`} strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', { anonymize_ip: true });
              `}
            </Script>
          </>
        ) : null}
      </body>
    </html>
  );
}
