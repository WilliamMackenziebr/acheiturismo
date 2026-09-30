import { EventCard } from "@/components/cards/EventCard";
import { Container } from "@/components/ui/Container";
import { events } from "@/data/events";
export default function EventsPage() { return <Container className="page"><div className="page-heading"><span>AGENDA ACHEI</span><h1>Achamos eventos para viver e lembrar</h1><p>Festivais, encontros e experiências que o Achei selecionou para você.</p></div><div className="filter-row"><button className="active">Todos</button><button>Este mês</button><button>Gastronomia</button><button>Natureza</button></div><div className="events-grid">{events.map(event => <EventCard event={event} key={event.id} />)}</div></Container>; }
