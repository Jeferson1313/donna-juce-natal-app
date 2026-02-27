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

  promotion_items?: {
    promotional_price: number;
    promotions?: {
      is_active: boolean;
      end_date: string | null;
    } | null;
  }[];
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
  const now = new Date();

  const activePromotion = product.promotion_items?.find((item) => {
    if (!item.promotions) return false;

    const isActive = item.promotions.is_active;

    const notExpired =
      !item.promotions.end_date ||
      new Date(item.promotions.end_date) > now;

    return isActive && notExpired;
  });

  const finalPrice = activePromotion
    ? Number(activePromotion.promotional_price)
    : Number(product.price);

  return {
    id: product.id,
    name: product.name,
    description: product.description || "",
    price: finalPrice,
    unit: product.unit,
    image: product.image_url || "/placeholder.svg",
    category: product.category,
    availability_type: product.availability_type,
    reservation_type: product.reservation_type,
    reservation_date: product.reservation_date,
  };
}
