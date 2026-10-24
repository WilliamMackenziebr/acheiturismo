import type { Metadata } from "next";
import { ListingPage } from "@/components/tourism/ListingPage";

export const metadata: Metadata = { title: "Trilhas e ecoturismo | Achei Turismo" };
export default function NaturePage() {
  return <ListingPage eyebrow="CAMINHOS PARA DESCOBRIR" title="Trilhas e ecoturismo" description="Cachoeiras, trilhas e experiências para viver a natureza da Mantiqueira." entryKind="nature" />;
}
