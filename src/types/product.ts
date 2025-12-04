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
  availability_type: "immediate" | "reservation";
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
  availability_type: "immediate" | "reservation";
  reservation_type: string;
  reservation_date: string | null;
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
    availability_type: product.availability_type,
    reservation_type: product.reservation_type,
    reservation_date: product.reservation_date,
  };
}
