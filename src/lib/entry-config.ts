import type { EntryKind } from "@/types/admin";

interface EntryConfig {
  title: string; createLabel: string; nameLabel: string; placeholder: string; aboutLabel: string;
  categoryLabel: string; categories: string[]; featuresLabel: string; features: string[];
  description: string; phoneRequired: boolean;
}

export const entryConfig: Record<EntryKind, EntryConfig> = {
  stay: {
    title: "Pousadas", createLabel: "Nova pousada", nameLabel: "Nome da pousada", placeholder: "Ex.: Pousada Vista da Mantiqueira", aboutLabel: "Sobre a hospedagem",
    categoryLabel: "Tipo de hospedagem", categories: ["Pousadas & Chalés", "Pousada", "Chalés", "Hotel", "Hotel fazenda", "Hostel", "Camping"],
    featuresLabel: "Comodidades", features: ["Wi-Fi", "Café da manhã", "Estacionamento", "Piscina", "Piscina aquecida", "Pet friendly", "Acessibilidade", "Restaurante", "Área verde", "Lareira"],
    description: "Gerencie os refúgios que tornam cada viagem especial.", phoneRequired: true,
  },
  guide: {
    title: "Guias de turismo", createLabel: "Novo guia", nameLabel: "Nome do guia", placeholder: "Ex.: Maria da Serra", aboutLabel: "Sobre o guia",
    categoryLabel: "Área de atuação", categories: ["Guia de turismo", "Ecoturismo", "Turismo de aventura", "Turismo cultural", "Turismo rural"],
    featuresLabel: "Especialidades", features: ["Trilhas", "Ecoturismo", "Turismo cultural", "Observação de aves", "Turismo de aventura", "Passeios urbanos", "Turismo rural"],
    description: "Conecte viajantes a quem conhece o melhor da região.", phoneRequired: true,
  },
  food: {
    title: "Gastronomia", createLabel: "Novo estabelecimento", nameLabel: "Nome do estabelecimento", placeholder: "Ex.: Restaurante Sabores da Serra", aboutLabel: "Sobre o estabelecimento",
    categoryLabel: "Tipo de estabelecimento", categories: ["Restaurante", "Gastronomia típica", "Cafés", "Bistrô", "Pizzaria", "Bar", "Doceria", "Cervejaria", "Produtos locais"],
    featuresLabel: "Serviços e opções", features: ["Wi-Fi", "Estacionamento", "Acessibilidade", "Pet friendly", "Área externa", "Opções vegetarianas", "Opções veganas", "Delivery", "Reservas", "Música ao vivo"],
    description: "Apresente restaurantes, cafés e sabores da nossa região.", phoneRequired: true,
  },
  nature: {
    title: "Trilhas e ecoturismo", createLabel: "Nova experiência", nameLabel: "Nome da trilha ou experiência", placeholder: "Ex.: Trilha das Araucárias", aboutLabel: "Sobre a experiência",
    categoryLabel: "Tipo de experiência", categories: ["Trilhas", "Ecoturismo", "Cachoeiras", "Turismo de aventura", "Observação de aves", "Cicloturismo", "Passeio na natureza"],
    featuresLabel: "Características e estrutura", features: ["Trilha sinalizada", "Guia recomendado", "Acesso gratuito", "Entrada paga", "Agendamento necessário", "Estacionamento", "Banheiros", "Acessibilidade", "Área de banho", "Mirante"],
    description: "Cadastre caminhos, cachoeiras e experiências ao ar livre.", phoneRequired: false,
  },
  destination: {
    title: "Destinos imperdíveis", createLabel: "Novo destino", nameLabel: "Nome do destino", placeholder: "Ex.: Mirante do Vale Encantado", aboutLabel: "Sobre o destino",
    categoryLabel: "Tipo de destino", categories: ["Mirantes", "Parques", "Centro histórico", "Museus", "Cidades e vilarejos", "Atrativos culturais", "Pontos turísticos"],
    featuresLabel: "Características e estrutura", features: ["Acesso gratuito", "Entrada paga", "Estacionamento", "Banheiros", "Acessibilidade", "Visita guiada", "Área de lazer", "Vista panorâmica", "Pet friendly"],
    description: "Selecione os lugares que merecem entrar no roteiro.", phoneRequired: false,
  },
};
