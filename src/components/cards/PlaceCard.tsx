import Image from "next/image";
import Link from "next/link";
import { MapPin, Medal } from "@phosphor-icons/react/dist/ssr";
import type { Place } from "@/types/tourism";

export function PlaceCard({ place, horizontal = false }: { place: Place; horizontal?: boolean }) {
  return <article className={`place-card ${horizontal ? "place-card--horizontal" : ""}`}>
    <Link href={`/lugares/${place.slug}`} className="place-card__image"><Image src={place.image} alt="" fill sizes="(max-width: 700px) 75vw, 360px" />{place.partner && <span className="partner-badge">Parceiro Achei</span>}</Link>
    <div className="place-card__body"><div className="eyebrow">{place.category}</div><h3><Link href={`/lugares/${place.slug}`}>{place.name}</Link></h3>
      <p className="location"><MapPin size={17} weight="fill" />{place.city} - {place.state}</p>
      <div className="card-footer"><span className="rating"><Medal size={16} weight="fill" /> {place.rating.toFixed(1)}</span><Link className="text-link" href={`/lugares/${place.slug}`}>Ver detalhes</Link></div>
    </div>
  </article>;
}
