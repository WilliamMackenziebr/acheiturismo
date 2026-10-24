import type { EntryKind } from "./admin";

export type TourismKind = "lugar" | "hospedagem" | "restaurante" | "evento" | "guia";

export interface Place {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  category: string;
  city: string;
  state: string;
  rating: number;
  kind: TourismKind;
  entryKind?: EntryKind;
  featured?: boolean;
  partner?: boolean;
  amenities?: string[];
  photos?: string[];
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  languages?: string[];
  cadastur?: string;
}

export interface TourismEvent {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  date: string;
  location: string;
  category: string;
}
