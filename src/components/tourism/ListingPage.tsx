"use client";
import { useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { PlaceCard } from "@/components/cards/PlaceCard";
import { Container } from "@/components/ui/Container";
import { useCatalog } from "./CatalogProvider";
import type { Place, TourismKind } from "@/types/tourism";
import type { EntryKind } from "@/types/admin";

export function ListingPage({ eyebrow, title, description, items, kind, entryKind, showCategories = false }: { eyebrow: string; title: string; description: string; items?: Place[]; kind?: TourismKind; entryKind?: EntryKind; showCategories?: boolean }) {
  const { places, loading, error } = useCatalog();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const visible = (items || places).filter(place => (!kind || place.kind === kind) && (!entryKind || place.entryKind === entryKind) && (filter === "all" || place.kind === filter || place.entryKind === filter) && normalize(`${place.name} ${place.city} ${place.category}`).includes(normalize(search)));
  return <Container className="page"><div className="page-heading"><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div><label className="search-bar"><MagnifyingGlass size={24} /><input aria-label={`Buscar em ${title.toLowerCase()}`} placeholder="Buscar por nome, cidade ou categoria" value={search} onChange={event => setSearch(event.target.value)} /></label>{showCategories && <div className="filter-row">{[["all", "Todos"], ["nature", "Trilhas e ecoturismo"], ["destination", "Destinos"], ["hospedagem", "Hospedagens"], ["guia", "Guias"], ["restaurante", "Gastronomia"]].map(([value, label]) => <button key={value} aria-pressed={filter === value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{label}</button>)}</div>}{error && <p role="status" className="catalog-notice">{error}</p>}<div className="cards-grid cards-grid--wide">{visible.map(item => <PlaceCard place={item} key={item.id} />)}</div>{!visible.length && <p className="catalog-empty" role="status">{loading ? "Buscando novos achados…" : "Nenhum achado encontrado. Tente outra busca ou volte em breve."}</p>}</Container>;
}
