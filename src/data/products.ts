import { Product } from "@/components/ProductCard";

export const sampleProducts: Product[] = [
  {
    id: "1",
    name: "Pernil Suíno",
    description: "Pernil suíno temperado, ideal para sua ceia de Natal. Peça inteira com osso.",
    price: 24.90,
    unit: "kg",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=400&h=400&fit=crop",
    category: "Suínos",
  },
  {
    id: "2",
    name: "Chester Sadia",
    description: "Chester congelado Sadia, temperado e pronto para assar. Aproximadamente 3kg.",
    price: 32.90,
    unit: "kg",
    image: "https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=400&h=400&fit=crop",
    category: "Aves",
  },
  {
    id: "3",
    name: "Tender Seara",
    description: "Tender bovino defumado Seara, macio e suculento. Peso médio 3,5kg.",
    price: 45.90,
    unit: "kg",
    image: "https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=400&fit=crop",
    category: "Bovinos",
  },
  {
    id: "4",
    name: "Picanha Premium",
    description: "Picanha bovina premium, com capa de gordura perfeita para churrasco.",
    price: 69.90,
    unit: "kg",
    image: "https://images.unsplash.com/photo-1603048297172-c92544798d5a?w=400&h=400&fit=crop",
    category: "Bovinos",
  },
  {
    id: "5",
    name: "Costela Bovina",
    description: "Costela bovina para assar, corte especial com osso. Peça inteira.",
    price: 34.90,
    unit: "kg",
    image: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&h=400&fit=crop",
    category: "Bovinos",
  },
  {
    id: "6",
    name: "Linguiça Toscana",
    description: "Linguiça toscana artesanal, temperada com ervas finas. Pacote 1kg.",
    price: 28.90,
    unit: "kg",
    image: "https://images.unsplash.com/photo-1551028150-64b9f398f678?w=400&h=400&fit=crop",
    category: "Embutidos",
  },
];

export const categories = ["Todos", "Bovinos", "Suínos", "Aves", "Embutidos"];
