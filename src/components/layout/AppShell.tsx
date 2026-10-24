"use client";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SiteIntro } from "@/components/intro/SiteIntro";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import { CatalogProvider } from "@/components/tourism/CatalogProvider";
import { DesktopHeader } from "@/components/navigation/DesktopHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { InstallAppPrompt } from "@/components/pwa/InstallAppPrompt";
import { PWAServiceWorker } from "@/components/pwa/PWAServiceWorker";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin" || pathname.startsWith("/admin/")) return <>{children}</>;
  return <CatalogProvider><SiteIntro /><SmoothScrollProvider><DesktopHeader /><main>{children}</main><SiteFooter /><BottomNavigation /><PWAServiceWorker /><InstallAppPrompt /></SmoothScrollProvider></CatalogProvider>;
}
