import type { ReactNode } from "react";
import { DesktopHeader } from "@/components/navigation/DesktopHeader";
import { BottomNavigation } from "@/components/navigation/BottomNavigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { InstallAppPrompt } from "@/components/pwa/InstallAppPrompt";
import { PWAServiceWorker } from "@/components/pwa/PWAServiceWorker";

export function AppShell({ children }: { children: ReactNode }) {
  return <><DesktopHeader /><main>{children}</main><SiteFooter /><BottomNavigation /><PWAServiceWorker /><InstallAppPrompt /></>;
}
