"use client";

import { useEffect } from "react";

export function PWAServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // The site remains fully usable if service-worker registration is unavailable.
    });
  }, []);

  return null;
}
