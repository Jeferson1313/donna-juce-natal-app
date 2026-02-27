import { useActivePromotions } from "@/hooks/usePromotions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ShoppingCart, Percent } from "lucide-react";

interface PromotionSectionProps {
  onProductAction: (product: {
    id: string;
    name: string;
    price: number;
    unit: string;
    image_url?: string;
  }) => void;
}

export function PromotionSection({ onProductAction }: PromotionSectionProps) {
  const { data: promotions, isLoading } = useActivePromotions();

  if (isLoading || !promotions || promotions.length === 0) return null;

  return (
    <section className="space-y-4 animate-fade-in">
      {promotions.map((promo) => {
        if (!promo.items || promo.items.length === 0) return null;

        return (
          <div key={promo.id} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Percent className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  {promo.name}
                </h3>
                {promo.description && (
                  <p className="text-muted-foreground text-sm">{promo.description}</p>
                )}
              </div>
            </div>

            <ScrollArea className="w-full">
              <div className="flex gap-4 pb-4">
                {promo.items.map((item) => {
                  const product = item.product;
                  if (!product) return null;

                  const originalPrice = Number(product.price);
                  const promoPrice = Number(item.promotional_price);
                  const discount = Math.round(
                    ((originalPrice - promoPrice) / originalPrice) * 100
                  );

                  return (
                    <div
                      key={item.id}
                      className="min-w-[200px] max-w-[220px] bg-card rounded-xl overflow-hidden shadow-card border-2 border-destructive/20 flex-shrink-0"
                    >
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={product.image_url || "/placeholder.svg"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground hover:bg-destructive">
                          -{discount}%
                        </Badge>
                      </div>
                      <div className="p-3 space-y-2">
                        <h4 className="font-semibold text-sm line-clamp-1">
                          {product.name}
                        </h4>
                        <div className="space-y-0.5">
                          <p className="text-muted-foreground text-xs line-through">
                            R$ {originalPrice.toFixed(2)}/{product.unit}
                          </p>
                          <p className="text-destructive font-bold text-lg">
                            R$ {promoPrice.toFixed(2)}
                            <span className="text-xs font-normal text-muted-foreground">
                              /{product.unit}
                            </span>
                          </p>
                        </div>
                        <Button
                          size="sm"
                          className="w-full gap-1"
                          onClick={() =>
                            onProductAction({
                              id: product.id,
                              name: product.name,
                              price: promoPrice,
                              unit: product.unit,
                              image_url: product.image_url || undefined,
                            })
                          }
                        >
                          <ShoppingCart className="h-3 w-3" />
                          Comprar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        );
      })}
    </section>
  );
}
