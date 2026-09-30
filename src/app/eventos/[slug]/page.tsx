import Image from "next/image";
import { notFound } from "next/navigation";
import { CalendarDots, MapPin } from "@phosphor-icons/react/dist/ssr";
import { events } from "@/data/events";
import { Container } from "@/components/ui/Container";
export function generateStaticParams() { return events.map(({ slug }) => ({ slug })); }
export default async function EventDetail({ params }: { params: Promise<{ slug: string }> }) { const { slug } = await params; const event = events.find(item => item.slug === slug); if (!event) notFound(); return <Container className="page event-detail"><div className="event-detail__image"><Image src={event.image} alt={event.name} fill priority /></div><span className="eyebrow">{event.category}</span><h1>{event.name}</h1><div className="event-facts"><span><CalendarDots />{event.date}</span><span><MapPin />{event.location}</span></div><p>{event.description}</p><button className="button">Quero participar</button></Container>; }
