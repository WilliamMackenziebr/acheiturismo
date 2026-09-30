import { Container } from "@/components/ui/Container";
import { SearchBar } from "@/components/ui/SearchBar";
import { PlaceCard } from "@/components/cards/PlaceCard";
import { places } from "@/data/places";

export default function PlacesPage() { return <Container className="page"><div className="page-heading"><span>LUGARES QUE O ACHEI ENCONTROU</span><h1>Achados que valem a viagem</h1><p>Uma seleção do Achei com destinos, hospedagens e experiências da Mantiqueira.</p></div><SearchBar placeholder="Buscar nos achados" /><div className="filter-row"><button className="active">Todos</button><button>Natureza</button><button>Hospedagens</button><button>Gastronomia</button></div><div className="cards-grid cards-grid--wide">{places.map(place => <PlaceCard place={place} key={place.id} />)}</div></Container>; }
