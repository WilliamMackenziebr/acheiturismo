import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Broadcast, ChatCircleDots, Coffee, Car, Export, Leaf, MapPin } from "@phosphor-icons/react/dist/ssr";
import { places } from "@/data/places";
import { Container } from "@/components/ui/Container";
import { PhotoGallery } from "@/components/gallery/PhotoGallery";
import { DirectionsMap } from "@/components/maps/DirectionsMap";

export function generateStaticParams() { return places.map(({ slug }) => ({ slug })); }

export default async function PlaceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const place = places.find(item => item.slug === slug); if (!place) notFound();
  const amenities = [{ n: "Café da manhã", i: Coffee }, { n: "Wi-Fi", i: Broadcast }, { n: "Piscina aquecida", i: Leaf }, { n: "Estacionamento", i: Car }, { n: "Área verde", i: Leaf }];
  const galleryImages = [place.image, "/images/mantiqueira-valley.jpg", "/images/chale-serra.jpg", "/images/trilha-ecoturismo.jpg"];
  return <article className="detail-page"><div className="detail-hero"><Image src={place.image} alt={place.name} fill priority /><Container className="detail-hero__nav"><Link href="/lugares" aria-label="Voltar"><ArrowLeft /></Link><button aria-label="Compartilhar"><Export /></button></Container>{place.partner && <span className="partner-badge partner-badge--detail">PARCEIRO ACHEI</span>}</div><Container className="detail-sheet"><h1>{place.name}</h1><p className="detail-location"><MapPin weight="fill" />{place.city} - {place.state}</p><div className="detail-actions"><a className="button" href={`https://wa.me/?text=${encodeURIComponent(`Olá! Vi ${place.name} no Achei o Turismo.`)}`}><ChatCircleDots size={22} weight="fill" />Falar no WhatsApp</a><DirectionsMap placeName={place.name} city={place.city} state={place.state} /></div><section><h2>Sobre {place.kind === "hospedagem" ? "a pousada" : "o lugar"}</h2><p>{place.description} Uma experiência autêntica para aproveitar o melhor da região, com acolhimento e tranquilidade.</p></section><section><h2>Comodidades</h2><div className="amenities">{amenities.map(({ n, i: Icon }) => <div key={n}><Icon size={30} /><span>{n}</span></div>)}</div></section><section><h2>Galeria de fotos</h2><PhotoGallery images={galleryImages} placeName={place.name} /></section></Container></article>;
}
