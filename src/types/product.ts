export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  unit: string;
  image_url: string | null;
  category: string;
  is_available: boolean;
  order: number;
  reservation_type: string;
  reservation_date: string | null;
  created_at: string;
  updated_at: string;
}

// For compatibility with existing ProductCard
export interface ProductDisplay {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image: string;
  category: string;
}

export function toProductDisplay(product: Product): ProductDisplay {
  return {
    id: product.id,
    name: product.name,
    description: product.description || "",
    price: Number(product.price),
    unit: product.unit,
    image: product.image_url || "/placeholder.svg",
    category: product.category,
  };
}
