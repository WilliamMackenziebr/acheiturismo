export const ENTRY_KINDS = ["stay", "guide", "food", "nature", "destination"] as const;
export type EntryKind = typeof ENTRY_KINDS[number];
export type EntryStatus = "published" | "draft" | "archived";

export interface EntryPhoto {
  id: string;
  url: string;
  name: string;
  path?: string;
}

export interface AdminEntry {
  id: string;
  slug: string;
  kind: EntryKind;
  status: EntryStatus;
  name: string;
  description: string;
  city: string;
  state: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  category: string;
  amenities: string[];
  languages: string[];
  cadastur: string;
  featured: boolean;
  photos: EntryPhoto[];
  createdAt: string;
  updatedAt: string;
}
