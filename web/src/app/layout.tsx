import type { Metadata } from "next";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Apply the saved theme before first paint, so a light-mode
            user never sees a flash of dark. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.getItem("lp_theme")==="light"){document.documentElement.classList.add("light")}}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-screen bg-black text-white antialiased selection:bg-white selection:text-black">
        {children}
      </body>
    </html>
  );
}

