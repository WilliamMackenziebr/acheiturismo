import type { Metadata } from "next";
import { ListingPage } from "@/components/tourism/ListingPage";
export const metadata: Metadata = { title: "Guias de turismo | Achei Turismo" };
export default function GuidesPage() { return <ListingPage eyebrow="QUEM CONHECE, MOSTRA O CAMINHO" title="Guias de turismo" description="Encontre quem conhece a região e transforme seu passeio em uma experiência inesquecível." kind="guia" />; }
