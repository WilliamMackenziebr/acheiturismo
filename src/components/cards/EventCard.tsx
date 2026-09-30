import Image from "next/image";
import Link from "next/link";
import { CalendarDots, MapPin } from "@phosphor-icons/react/dist/ssr";
import type { TourismEvent } from "@/types/tourism";

export function EventCard({ event }: { event: TourismEvent }) {
  return <article className="event-card"><Link href={`/eventos/${event.slug}`}><div className="event-card__image"><Image src={event.image} alt="" fill /><span>{event.category}</span></div></Link><div className="event-card__body"><div className="event-meta"><CalendarDots size={17} />{event.date}</div><h3><Link href={`/eventos/${event.slug}`}>{event.name}</Link></h3><p><MapPin size={17} />{event.location}</p><Link className="button button--outline" href={`/eventos/${event.slug}`}>Conhecer evento</Link></div></article>;
}
