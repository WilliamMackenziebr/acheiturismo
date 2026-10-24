import { ENTRY_KINDS, type AdminEntry, type EntryKind } from "@/types/admin";
import { entryConfig } from "@/lib/entry-config";

export class EntryValidationError extends Error {}

export function validateEntry(input: unknown): AdminEntry {
  const invalid = (message: string): never => { throw new EntryValidationError(message); };
  if (!input || typeof input !== "object" || Array.isArray(input)) return invalid("Cadastro inválido.");
  const source = input as Record<string, unknown>;
  function text(key: string, max: number, required = false) {
    const value = source[key];
    if (typeof value !== "string" || value.length > max || (required && !value.trim())) return invalid(`Confira o campo ${key}.`);
    return value.trim();
  }
  function list(key: string, max: number) {
    const value = source[key];
    if (!Array.isArray(value) || value.length > max || !value.every(item => typeof item === "string" && item.length <= 100)) return invalid("Lista de informações inválida.");
    return value as string[];
  }
  const id = text("id", 100, true), slug = text("slug", 160, true);
  if (!/^[a-zA-Z0-9-]+$/.test(id) || !/^[a-z0-9-]+$/.test(slug)) return invalid("Identificador ou endereço do cadastro inválido.");
  if (!ENTRY_KINDS.includes(source.kind as EntryKind)) return invalid("Tipo de cadastro inválido.");
  if (!["draft", "published", "archived"].includes(String(source.status))) return invalid("Status inválido.");
  if (typeof source.featured !== "boolean") return invalid("Confira o destaque do cadastro.");
  const state = text("state", 2, true);
  if (!"AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split(" ").includes(state)) return invalid("Selecione um estado válido.");
  if (!Array.isArray(source.photos) || source.photos.length > 12) return invalid("Cada cadastro pode ter até 12 fotos.");
  const photos = source.photos.map(photo => {
    if (!photo || typeof photo !== "object" || typeof photo.id !== "string" || !/^[a-zA-Z0-9-]{1,100}$/.test(photo.id) || typeof photo.url !== "string" || photo.url.length > 2048 || typeof photo.name !== "string" || photo.name.length > 200) return invalid("Foto inválida. Envie novamente a imagem.");
    if (!/^https:\/\/[^\s]+$/i.test(photo.url) && !/^\/images\/[a-zA-Z0-9/_ .-]+$/.test(photo.url)) return invalid("Endereço de foto inválido.");
    return { id: photo.id, url: photo.url, name: photo.name, ...(typeof photo.path === "string" && photo.path.length <= 500 ? { path: photo.path } : {}) };
  });
  const entry: AdminEntry = {
    id, slug, kind: source.kind as EntryKind, status: source.status as AdminEntry["status"],
    name: text("name", 120, true), city: text("city", 100, true), state,
    description: text("description", 5000), address: text("address", 500), phone: text("phone", 40),
    email: text("email", 254), website: text("website", 2048), category: text("category", 100),
    amenities: list("amenities", 30), languages: list("languages", 15), cadastur: text("cadastur", 40),
    featured: source.featured, photos, createdAt: text("createdAt", 40), updatedAt: new Date().toISOString(),
  };
  if (!Number.isFinite(Date.parse(entry.createdAt))) return invalid("Data de cadastro inválida.");
  if (entry.phone && !/^\d{10,15}$/.test(entry.phone.replace(/\D/g, ""))) return invalid("Informe um telefone válido com DDD.");
  if (entry.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry.email)) return invalid("Informe um e-mail válido.");
  if (entry.website && !/^https?:\/\/[^\s]+$/i.test(entry.website)) return invalid("O site deve começar com https:// ou http://.");
  if (entry.status === "published" && (entry.description.length < 30 || !entry.photos.length)) return invalid("Para publicar, adicione uma descrição de pelo menos 30 caracteres e uma foto.");
  if (entry.status === "published" && entryConfig[entry.kind].phoneRequired && !entry.phone) return invalid("Adicione um telefone de contato com DDD antes de publicar.");
  return entry;
}
