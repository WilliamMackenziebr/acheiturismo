import Link from "next/link";
import { Gear, Heart, MapPin, IdentificationCard } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/ui/Container";
export default function ProfilePage() { return <Container className="page profile"><IdentificationCard size={82} weight="duotone" /><h1>Olá, viajante!</h1><p>Organize seus lugares, roteiros e preferências.</p><div className="profile-links"><Link href="/favoritos"><Heart />Meus favoritos</Link><Link href="/lugares"><MapPin />Lugares visitados</Link><button><Gear />Configurações</button></div></Container>; }
