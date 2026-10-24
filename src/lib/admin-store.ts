"use client";

import { places } from "@/data/places";
import { adminPreviewMode, adminRequest, backendConfigured } from "@/lib/admin-api";
import { entryConfig } from "@/lib/entry-config";
import { seedEntry } from "@/lib/seed-entry";
import type { AdminEntry, EntryKind, EntryPhoto } from "@/types/admin";

export const CATALOG_EVENT = "achei:catalog-updated";
const DB_NAME = "achei-admin-preview-v1";

export function seedEntries(): AdminEntry[] {
  return places.filter(place => place.kind !== "evento").map(seedEntry);
}

export function newEntry(kind: EntryKind): AdminEntry {
  const now = new Date().toISOString();
  return { id: crypto.randomUUID(), slug: "", kind, status: "draft", name: "", description: "", city: "", state: "SP", address: "", phone: "", email: "", website: "", category: entryConfig[kind].categories[0], amenities: [], languages: kind === "guide" ? ["Português"] : [], cadastur: "", featured: false, photos: [], createdAt: now, updatedAt: now };
}

function openPreview(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore("entries", { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error("Não foi possível abrir o armazenamento local do navegador."));
  });
}

async function localEntries(): Promise<AdminEntry[]> {
  const db = await openPreview();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("entries", "readonly");
    const request = transaction.objectStore("entries").getAll();
    request.onsuccess = () => resolve(request.result as AdminEntry[]);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
}

type CatalogEntry = AdminEntry | { id: string; status: "archived"; updatedAt: string };

export function mergeEntries<T extends CatalogEntry>(overrides: T[]) {
  const merged = new Map<string, AdminEntry | T>(seedEntries().map(entry => [entry.id, entry]));
  overrides.forEach(entry => merged.set(entry.id, entry));
  return [...merged.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function listEntries(publicOnly: true): Promise<CatalogEntry[]>;
export function listEntries(publicOnly?: false): Promise<AdminEntry[]>;
export async function listEntries(publicOnly = false): Promise<CatalogEntry[]> {
  if (adminPreviewMode) {
    const deletedIds: string[] = JSON.parse(localStorage.getItem("achei-admin-deleted-v1") || "[]");
    const entries = mergeEntries(await localEntries());
    return publicOnly ? [...entries.filter(entry => !deletedIds.includes(entry.id)), ...deletedIds.map(id => ({ id, status: "archived" as const, updatedAt: new Date().toISOString() }))] : entries.filter(entry => !deletedIds.includes(entry.id));
  }
  if (!backendConfigured) {
    if (publicOnly) return seedEntries();
    throw new Error("A conexão com o painel ainda não foi configurada.");
  }
  const result = await adminRequest<{ entries: AdminEntry[]; deletedIds?: string[] }>(publicOnly ? "/api/catalog" : "/api/admin/entries");
  return mergeEntries(result.entries).filter(entry => !result.deletedIds?.includes(entry.id));
}

export async function deleteEntry(id: string) {
  if (adminPreviewMode) {
    const db = await openPreview();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("entries", "readwrite");
      transaction.objectStore("entries").delete(id);
      transaction.oncomplete = () => { db.close(); resolve(); };
      transaction.onerror = () => { db.close(); reject(new Error("Não foi possível excluir o cadastro.")); };
    });
    const deletedIds: string[] = JSON.parse(localStorage.getItem("achei-admin-deleted-v1") || "[]");
    localStorage.setItem("achei-admin-deleted-v1", JSON.stringify([...new Set([...deletedIds, id])]));
  } else {
    if (!backendConfigured) throw new Error("A conexão com o painel ainda não foi configurada.");
    await adminRequest("/api/admin/entries", { method: "DELETE", body: JSON.stringify({ id }) });
  }
  notifyCatalog();
}

function notifyCatalog() {
  window.dispatchEvent(new Event(CATALOG_EVENT));
  if (typeof BroadcastChannel !== "undefined") {
    const channel = new BroadcastChannel(CATALOG_EVENT);
    channel.postMessage("updated"); channel.close();
  }
}

export async function saveEntry(entry: AdminEntry): Promise<AdminEntry> {
  let saved = { ...entry, updatedAt: new Date().toISOString() };
  if (backendConfigured && !adminPreviewMode) {
    // Upload only on save. A failed write leaves the editor intact for retry.
    const uploaded: EntryPhoto[] = [];
    for (const photo of saved.photos) {
      if (!photo.url.startsWith("data:")) { uploaded.push(photo); continue; }
      const upload = await adminRequest<{ cloudName: string; apiKey: string; publicId: string; timestamp: number; signature: string }>("/api/admin/uploads/sign", { method: "POST", body: JSON.stringify({ entryId: entry.id, photoId: photo.id }) });
      const form = new FormData();
      form.set("file", await (await fetch(photo.url)).blob(), `${photo.id}.webp`);
      form.set("api_key", upload.apiKey); form.set("public_id", upload.publicId);
      form.set("timestamp", String(upload.timestamp)); form.set("signature", upload.signature); form.set("overwrite", "true");
      const response = await fetch(`https://api.cloudinary.com/v1_1/${encodeURIComponent(upload.cloudName)}/image/upload`, { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok || typeof result.secure_url !== "string") throw new Error(`Não foi possível enviar a foto ${photo.name}. Suas alterações continuam no formulário; tente salvar novamente.`);
      uploaded.push({ ...photo, path: result.public_id, url: result.secure_url });
    }
    saved.photos = uploaded;
    saved = (await adminRequest<{ entry: AdminEntry }>("/api/admin/entries", { method: "POST", body: JSON.stringify(saved) })).entry;
  } else if (adminPreviewMode) {
    const db = await openPreview();
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("entries", "readwrite");
      transaction.objectStore("entries").put(saved);
      transaction.oncomplete = () => { db.close(); resolve(); };
      transaction.onerror = () => { db.close(); reject(new Error("Não foi possível salvar. Verifique o espaço disponível no navegador.")); };
      transaction.onabort = () => reject(new Error("O navegador cancelou o salvamento. Tente novamente."));
    });
  } else throw new Error("A conexão com o painel ainda não foi configurada.");
  notifyCatalog();
  return saved;
}

export function slugify(name: string) {
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function preparePhoto(file: File): Promise<EntryPhoto> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) throw new Error("Escolha imagens JPG, PNG ou WebP.");
  if (file.size > 5 * 1024 * 1024) throw new Error(`A foto ${file.name} ultrapassa o limite de 5 MB.`);
  const bitmap = await createImageBitmap(file).catch(() => { throw new Error(`Não foi possível ler a imagem ${file.name}.`); });
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) { bitmap.close(); throw new Error("Não foi possível processar a foto neste navegador."); }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return { id: crypto.randomUUID(), url: canvas.toDataURL("image/webp", .85), name: file.name };
}

export function friendlyError(error: unknown) {
  if (error instanceof TypeError && /fetch/i.test(error.message)) return "Sem conexão. Confira a internet e tente novamente.";
  return error instanceof Error ? error.message : "Não foi possível concluir. Tente novamente.";
}
