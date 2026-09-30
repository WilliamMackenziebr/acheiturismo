import { PlaceCard } from "@/components/cards/PlaceCard";
import { Container } from "@/components/ui/Container";
import { SearchBar } from "@/components/ui/SearchBar";
import type { Place } from "@/types/tourism";
export function ListingPage({ eyebrow, title, description, items }: { eyebrow: string; title: string; description: string; items: Place[] }) { return <Container className="page"><div className="page-heading"><span>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div><SearchBar placeholder={`Buscar em ${title.toLowerCase()}`} /><div className="cards-grid cards-grid--wide">{items.map(item => <PlaceCard place={item} key={item.id} />)}</div></Container>; }
