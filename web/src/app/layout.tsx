import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import OfflineRegister from "@/components/OfflineRegister";
import OfflineBanner from "@/components/OfflineBanner";
import OfflineWarmer from "@/components/OfflineWarmer";
import { cspMeta } from "../../next.config";

const SITE_URL = "https://learnpython.fly.dev";
const DESCRIPTION =
  "Learn Python free — 100+ video lessons from CodeWithHarry's Python for Beginners full course in Hindi, with offline video, daily goals and streaks.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "LP — Learn Python",
  description: DESCRIPTION,
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "LP — Learn Python",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Learn Python",
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
    title: "LP — Learn Python",
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
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}

