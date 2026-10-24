"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ChatCircleDots, CheckCircle, Export, MapPin } from "@phosphor-icons/react";
import { Container } from "@/components/ui/Container";
import { PhotoGallery } from "@/components/gallery/PhotoGallery";
import { DirectionsMap } from "@/components/maps/DirectionsMap";
import { useCatalog } from "./CatalogProvider";
import { entryConfig } from "@/lib/entry-config";

export function PublicPlaceDetail({ slug }: { slug: string }) {
  const { places, loading, error } = useCatalog();
  const [shareNotice, setShareNotice] = useState("");
  const place = places.find(item => item.slug === slug);
  if (loading && !place) return <Container className="page"><p role="status">Buscando este achado…</p></Container>;
  if (!place) return <Container className="page empty-state"><h1>Este achado não está disponível.</h1><p>{error || "O cadastro pode estar em atualização ou ter sido retirado do catálogo."}</p><Link className="button" href="/lugares">Explorar outros achados</Link></Container>;
  const isGuide = place.kind === "guia";
  const kind = place.entryKind || (isGuide ? "guide" : place.kind === "hospedagem" ? "stay" : place.kind === "restaurante" ? "food" : "destination");
  const config = entryConfig[kind];
  const backPath = kind === "guide" ? "/guias" : kind === "stay" ? "/onde-ficar" : kind === "food" ? "/onde-comer" : kind === "nature" ? "/trilhas-ecoturismo" : "/destinos";
  const galleryImages = place.photos?.length ? place.photos : [place.image, "/images/mantiqueira-valley.jpg", "/images/chale-serra.jpg", "/images/trilha-ecoturismo.jpg"];
  const digits = place.phone?.replace(/\D/g, "");
  const phone = digits && (digits.length === 10 || digits.length === 11) ? `55${digits}` : digits;
  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: place!.name, url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); setShareNotice("Link copiado!"); }
    } catch (cause) { if ((cause as Error).name !== "AbortError") setShareNotice("Copie o endereço da página para compartilhar."); }
  }
  return <article className="detail-page"><div className="detail-hero"><Image src={place.image} unoptimized={place.image.startsWith("http") || place.image.startsWith("data:")} alt={place.name} fill priority /><Container className="detail-hero__nav"><Link href={backPath} aria-label="Voltar"><ArrowLeft /></Link><button aria-label="Compartilhar" onClick={() => void share()}><Export /></button></Container>{place.partner && <span className="partner-badge partner-badge--detail">PARCEIRO ACHEI</span>}</div><Container className="detail-sheet"><span className="eyebrow">{place.category}</span><h1>{place.name}</h1><p className="detail-location"><MapPin weight="fill" />{place.city} - {place.state}</p>{shareNotice && <p role="status">{shareNotice}</p>}<div className="detail-actions">{phone && <a className="button" href={`https://wa.me/${phone}?text=${encodeURIComponent(`Olá! Vi ${place.name} no Achei o Turismo e gostaria de saber mais.`)}`} target="_blank" rel="noreferrer"><ChatCircleDots size={22} weight="fill" />Falar no WhatsApp</a>}<DirectionsMap placeName={place.address || place.name} city={place.city} state={place.state} /></div><section><h2>{config.aboutLabel}</h2><p>{place.description}</p>{place.address && <p><strong>{isGuide ? "Região / ponto de encontro:" : "Endereço:"}</strong> {place.address}</p>}{place.languages?.length ? <p><strong>Idiomas:</strong> {place.languages.join(", ")}</p> : null}{place.cadastur && <p><strong>Cadastur:</strong> {place.cadastur}</p>}{place.email && <p><a href={`mailto:${place.email}`}>{place.email}</a></p>}{place.website && /^https?:\/\//i.test(place.website) && <p><a className="text-link" href={place.website} target="_blank" rel="noreferrer">Visitar site / Instagram ↗</a></p>}</section>{!!place.amenities?.length && <section><h2>{config.featuresLabel}</h2><div className="amenities">{place.amenities.map(name => <div key={name}><CheckCircle size={28} /><span>{name}</span></div>)}</div></section>}<section><h2>Galeria de fotos</h2><PhotoGallery images={galleryImages} placeName={place.name} /></section></Container></article>;
}
