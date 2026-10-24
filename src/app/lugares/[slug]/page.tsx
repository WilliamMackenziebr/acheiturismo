import { PublicPlaceDetail } from "@/components/tourism/PublicPlaceDetail";
export default async function PlaceDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <PublicPlaceDetail slug={slug} />;
}
