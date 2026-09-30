import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import "./globals.css";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import type { ReactNode } from "react";
import { SiteIntro } from "@/components/intro/SiteIntro";
import { AppShell } from "@/components/layout/AppShell";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";

export const metadata: Metadata = {
  title: "Achei Turismo",
  description: "O Achei conecta você a lugares incríveis na Serra da Mantiqueira.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Achei Turismo" },
  icons: {
    icon: [{ url: "/icons/achei-icon-192.png", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#05351f",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <Script id="achei-intro-session" strategy="beforeInteractive">
          {`try{if(sessionStorage.getItem("acheiTurismoIntroPlayed")==="true"){document.documentElement.dataset.acheiIntroPlayed="true"}}catch{}`}
        </Script>
      </head>
      <body>
        <SiteIntro />
        <SmoothScrollProvider>
          <AppShell>{children}</AppShell>
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
