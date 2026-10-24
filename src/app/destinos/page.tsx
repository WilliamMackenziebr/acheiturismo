import type { Metadata } from "next";
import { ListingPage } from "@/components/tourism/ListingPage";

export const metadata: Metadata = { title: "Destinos imperdíveis | Achei Turismo" };
export default function DestinationsPage() {
  return <ListingPage eyebrow="LUGARES QUE MERECEM A VIAGEM" title="Destinos imperdíveis" description="Mirantes, cidades e atrativos que não podem faltar no seu roteiro pela região." entryKind="destination" />;
}
