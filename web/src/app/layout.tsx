import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import OfflineRegister from "@/components/OfflineRegister";
import OfflineBanner from "@/components/OfflineBanner";
import OfflineWarmer from "@/components/OfflineWarmer";
import { VirtualTutor } from "@/components/VirtualTutor";
import { ProgressSync } from "@/components/ProgressSync";
import { cspMeta } from "../../next.config";

import { SITE_URL, SITE_NAME } from "@/lib/site";

const TITLE = "LP — Learn & Practice Python Offline | Interactive Python Course";
const DESCRIPTION =
  "Learn Python free — interactive lessons, offline practice, a built-in code editor, video courses and daily streaks. No install, works offline.";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      description: DESCRIPTION,
      inLanguage: "en",
    },
    {
      "@type": "Course",
      name: "Learn Python — Interactive Python Course",
      description: DESCRIPTION,
      provider: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
      isAccessibleForFree: true,
      inLanguage: "en",
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  icons: {
    icon: "/site-icon.png",
    shortcut: "/site-icon.png",
    apple: "/site-icon.png",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: "/lp-logo.png",
        width: 1535,
        height: 1535,
        alt: "Learn Python logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/lp-logo.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Per-request CSP nonce (R2-L17), set by middleware.ts on the
  // matched pages. headers() throws outside a request scope (static
  // export prerender) — then there is no nonce and the theme script
  // runs under the meta-CSP fallback below, which still carries
  // 'unsafe-inline'. Using headers() here makes every page dynamic
  // in the normal build; that is the price of the nonce, and the
  // scratch build + browser repro decide whether it stays.
  let nonce: string | undefined;
  try {
    nonce = (await headers()).get("x-nonce") ?? undefined;
  } catch {
    nonce = undefined;
  }
  return (
    <html lang="en" className="dark">
      <head>
        {/* Static-export fallback (R2-M15): the export build gets no
            headers() from next.config, so the same CSP rides as a
            meta tag. No visible effect; on the web build the header
            carries the same policy plus frame-ancestors. */}
        <meta httpEquiv="Content-Security-Policy" content={cspMeta} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        {/* Apply the saved theme before first paint, so a light-mode
            user never sees a flash of dark. */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("lp_theme")==="light"){document.documentElement.classList.add("light")}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen bg-black text-white antialiased selection:bg-white selection:text-black">
        <LanguageProvider>
          <OfflineRegister />
          <OfflineBanner />
          <OfflineWarmer />
          <VirtualTutor />
          <ProgressSync />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}

