import { ListingPage } from "@/components/tourism/ListingPage";
import { places } from "@/data/places";
export default function StayPage() { return <ListingPage eyebrow="REFÚGIOS QUE O ACHEI ENCONTROU" title="Onde ficar" description="Pousadas e chalés que o Achei escolheu para você descansar e aproveitar." items={places.filter(p => p.kind === "hospedagem")} />; }
