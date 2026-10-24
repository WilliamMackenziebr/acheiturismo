"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { places as originalPlaces } from "@/data/places";
import { CATALOG_EVENT, listEntries } from "@/lib/admin-store";
import type { Place } from "@/types/tourism";

const CatalogContext = createContext({ places: [] as Place[], loading: true, error: "" });

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pathname = usePathname();
  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const entries = await listEntries(true);
        const merged = new Map(originalPlaces.map(place => [place.id, place]));
        for (const entry of entries) {
          if (entry.status !== "published") { merged.delete(entry.id); continue; }
          const original = merged.get(entry.id);
          merged.set(entry.id, {
            id: entry.id, slug: entry.slug, name: entry.name, description: entry.description,
            image: entry.photos[0]?.url || "/images/mantiqueira-valley.jpg", photos: entry.photos.map(photo => photo.url),
            category: entry.category, city: entry.city, state: entry.state,
            rating: original?.rating || 0, kind: entry.kind === "stay" ? "hospedagem" : entry.kind === "guide" ? "guia" : entry.kind === "food" ? "restaurante" : "lugar", entryKind: entry.kind,
            featured: entry.featured, partner: original?.partner, amenities: entry.amenities,
            phone: entry.phone, email: entry.email, website: entry.website, address: entry.address,
            languages: entry.languages, cadastur: entry.cadastur,
          } satisfies Place);
        }
        if (active) { setPlaces([...merged.values()]); setError(""); }
      } catch { if (active) setError("Não foi possível atualizar o catálogo. Tente recarregar a página em instantes."); }
      finally { if (active) setLoading(false); }
    }
    void refresh();
    const onVisible = () => { if (document.visibilityState === "visible") void refresh(); };
    window.addEventListener(CATALOG_EVENT, refresh);
    document.addEventListener("visibilitychange", onVisible);
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(CATALOG_EVENT) : null;
    if (channel) channel.onmessage = () => void refresh();
    return () => { active = false; window.removeEventListener(CATALOG_EVENT, refresh); document.removeEventListener("visibilitychange", onVisible); channel?.close(); };
  }, [pathname]);
  return <CatalogContext.Provider value={{ places, loading, error }}>{children}</CatalogContext.Provider>;
}

export function useCatalog() { return useContext(CatalogContext); }
