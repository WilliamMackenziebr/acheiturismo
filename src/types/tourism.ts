export type TourismKind = "lugar" | "hospedagem" | "restaurante" | "evento";

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
  featured?: boolean;
  partner?: boolean;
  amenities?: string[];
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
