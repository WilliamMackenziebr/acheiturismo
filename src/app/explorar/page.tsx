"use client";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SearchBar } from "@/components/ui/SearchBar";
import { PlaceCard } from "@/components/cards/PlaceCard";
import { useCatalog } from "@/components/tourism/CatalogProvider";

const categories = [
  { name: "Pousadas & Chalés", image: "/images/chale-serra.jpg", href: "/onde-ficar" },
  { name: "Gastronomia Típica", image: "/images/gastronomia-tipica.jpg", href: "/onde-comer" },
  { name: "Trilhas & Ecoturismo", image: "/images/trilha-ecoturismo.jpg", href: "/trilhas-ecoturismo" },
  { name: "Destinos Imperdíveis", image: "/images/destinos-imperdiveis.png", href: "/destinos" },
  { name: "Guias de turismo", image: "/images/trilha-ecoturismo.jpg", href: "/guias" },
];

export default function ExplorePage() { const { places } = useCatalog(); return <Container className="page"><div className="page-heading"><span>BUSCA NO ACHEI</span><h1>O que você quer achar?</h1><p>O Achei reúne experiências, lugares e sabores perto de você.</p></div><SearchBar placeholder="Digite um destino, pousada, restaurante..." /><div className="chips"><span>Campos do Jordão</span><span>Cachoeiras</span><span>Chalés românticos</span></div><h2 className="subheading">Categorias que o Achei separou</h2><div className="category-grid">{categories.map(category => <Link href={category.href} key={category.name}><Image src={category.image} alt="" fill /><strong>{category.name}</strong></Link>)}</div><h2 className="subheading">Achados para você</h2><div className="stack-list">{places.slice(2, 5).map(place => <PlaceCard place={place} horizontal key={place.id} />)}</div></Container>; }
