import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
  onReserve: (product: Product) => void;
}

export function ProductCard({ product, onReserve }: ProductCardProps) {
  return (
    <div className="card-product group">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="absolute top-3 left-3 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-medium">
          {product.category}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-display text-lg font-semibold text-card-foreground line-clamp-1">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-2xl font-bold text-primary">
              R$ {product.price.toFixed(2)}
            </span>
            <span className="text-muted-foreground text-sm">/{product.unit}</span>
          </div>
          <Button
            variant="christmas"
            size="sm"
            onClick={() => onReserve(product)}
            className="gap-1"
          >
            <ShoppingCart className="h-4 w-4" />
            Reservar
          </Button>
        </div>
      </div>
    </div>
  );
}
