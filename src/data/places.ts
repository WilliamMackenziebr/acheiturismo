import type { Place } from "@/types/tourism";

export const places: Place[] = [
  {
    id: "1", slug: "pousada-recanto-das-montanhas", name: "Pousada Recanto das Montanhas",
    description: "Um refúgio charmoso na Serra da Mantiqueira, cercado por natureza e com uma vista inesquecível.",
    image: "/images/pousada-recanto-montanhas.webp", category: "Pousadas & Chalés", city: "Campos do Jordão", state: "SP",
    rating: 4.9, kind: "hospedagem", featured: true, partner: true,
    amenities: ["Café da manhã", "Wi-Fi", "Piscina aquecida", "Estacionamento", "Área verde"],
  },
  {
    id: "2", slug: "trilha-das-cachoeiras-secretas", name: "Trilha das Cachoeiras Secretas",
    description: "Caminho guiado entre mata preservada, quedas d'água e mirantes naturais.",
    image: "/images/trilha-cachoeiras-secretas.webp", category: "Ecoturismo", city: "Santo Antônio do Pinhal", state: "SP",
    rating: 4.8, kind: "lugar", partner: true,
  },
  {
    id: "3", slug: "chale-vale-verde", name: "Chalé Vale Verde",
    description: "Chalé romântico com vista para as montanhas e contato direto com a natureza.",
    image: "/images/chale-vale-verde.jpg", category: "Chalés", city: "São Bento do Sapucaí", state: "SP",
    rating: 4.7, kind: "hospedagem", partner: true,
  },
  {
    id: "4", slug: "mirante-da-mantiqueira", name: "Mirante da Mantiqueira",
    description: "Vista panorâmica para os vales e montanhas da região.",
    image: "/images/mantiqueira-valley.jpg", category: "Mirantes", city: "Campos do Jordão", state: "SP",
    rating: 4.8, kind: "lugar",
  },
  {
    id: "5", slug: "restaurante-casa-do-sabor", name: "Restaurante Casa do Sabor",
    description: "Cozinha regional feita com ingredientes locais e receitas afetivas.",
    image: "/images/restaurante-casa-do-sabor.webp", category: "Gastronomia típica", city: "Campos do Jordão", state: "SP",
    rating: 4.9, kind: "restaurante", partner: true,
  },
  {
    id: "6", slug: "cafe-da-serra", name: "Café da Serra",
    description: "Cafés especiais, doces artesanais e um ambiente acolhedor.",
    image: "/images/cafe-da-serra.webp", category: "Cafés", city: "Santo Antônio do Pinhal", state: "SP",
    rating: 4.6, kind: "restaurante",
  },
];
