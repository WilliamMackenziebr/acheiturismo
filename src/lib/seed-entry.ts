import type { AdminEntry } from "@/types/admin";
import type { Place } from "@/types/tourism";

export function seedEntry(place: Place): AdminEntry {
  const kind = place.entryKind || (place.kind === "hospedagem" ? "stay" : place.kind === "restaurante" ? "food" : place.kind === "guia" ? "guide" : "destination");
  return {
    id: place.id, slug: place.slug, kind, status: "published", name: place.name, description: place.description,
    city: place.city, state: place.state, address: place.address || "", phone: place.phone || "", email: place.email || "", website: place.website || "", category: place.category,
    amenities: place.amenities || [], languages: place.languages || [], cadastur: place.cadastur || "", featured: !!place.featured,
    photos: (place.photos?.length ? place.photos : [place.image]).map((url, index) => ({ id: `original-${place.id}-${index}`, url, name: place.name })),
    createdAt: "2026-09-01T12:00:00.000Z", updatedAt: "2026-09-01T12:00:00.000Z",
  };
}
