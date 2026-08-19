import type { Metadata } from "next";
import "./globals.css";
import "../App.css";
import { jameelNoori } from "./fonts";
import ResponsiveNav from "./components/nav/ResponsiveNav";
import ModernFooter from "./footer/ModernFooter";
import { Toaster } from "react-hot-toast";
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeProvider, THEME_STORAGE_KEY } from "@/components/theme-provider";

// Applied before paint to avoid a flash of the wrong theme. Must stay in sync
// with ThemeProvider (same storage key, same resolution of 'system').
const themeInitScript = `(function(){try{var k='${THEME_STORAGE_KEY}';var t=localStorage.getItem(k);var d=t==='dark'||((t==='system'||!t)&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL("https://sanjeeda.io"),
  title: "Sanjeeda | Career Clarity, Tools & Guidance",
  description:
    "Discover your strengths, build your professional edge and make better career decisions with Sanjeeda's assessments, tools and expert guidance.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: "/icon-180.png",
  },
  openGraph: {
    title: "Sanjeeda | Know yourself. Build your edge. Choose better.",
    description:
      "Career assessments, smart tools and human guidance for every stage of your career journey.",
    url: "https://sanjeeda.io",
    siteName: "Sanjeeda",
    images: [{ url: "/icon-512.png", width: 512, height: 512, alt: "Sanjeeda" }],
    type: "website",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};
import { Analytics } from "@vercel/analytics/next"
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
     <html lang="en" className="h-full w-full" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Sanjeeda",
              url: "https://sanjeeda.io",
              logo: "https://sanjeeda.io/icon-512.png",
            }),
          }}
        />
      </head>
      <body className={`${jameelNoori.variable} antialiased min-h-screen w-full overflow-x-hidden`}>
        <ThemeProvider>
          <ResponsiveNav/>
            <SpeedInsights />
              {children}
          <Analytics />
          <ModernFooter/>
          <Toaster/>
        </ThemeProvider>
      </body>
    </html>
  );
}
