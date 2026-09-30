import { ListingPage } from "@/components/tourism/ListingPage";
import { places } from "@/data/places";
export default function FoodPage() { return <ListingPage eyebrow="SABORES QUE O ACHEI ENCONTROU" title="Onde comer" description="Restaurantes, cafés e sabores que o Achei selecionou pela Mantiqueira." items={places.filter(p => p.kind === "restaurante")} />; }
