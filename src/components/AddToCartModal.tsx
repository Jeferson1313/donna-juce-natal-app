import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Minus, Plus, ShoppingCart } from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image_url?: string;
}

interface AddToCartModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
}

export function AddToCartModal({ isOpen, onClose, product }: AddToCartModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const { addItem } = useCart();
  const { toast } = useToast();

  const handleAdd = () => {
    if (!product) return;

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      quantity,
      notes,
      imageUrl: product.image_url,
    });

    toast({
      title: "Adicionado ao carrinho",
      description: `${quantity} ${product.unit} de ${product.name}`,
    });

    setQuantity(1);
    setNotes("");
    onClose();
  };

  const handleQuantityChange = (value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num > 0) {
      setQuantity(num);
    }
  };

  const isKg = product?.unit === "kg";
  const step = isKg ? 0.1 : 1;
  const minQty = isKg ? 0.1 : 1;
  
  const incrementQuantity = () => setQuantity((q) => parseFloat((q + step).toFixed(2)));
  const decrementQuantity = () => setQuantity((q) => Math.max(minQty, parseFloat((q - step).toFixed(2))));

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-lg font-semibold text-primary">
            R$ {product.price.toFixed(2)} / {product.unit}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantidade ({product.unit})</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                step={isKg ? "0.1" : "1"}
                min={isKg ? "0.1" : "1"}
                value={quantity}
                onChange={(e) => handleQuantityChange(e.target.value)}
                className="w-24 text-center"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Ex: Corte em bifes, moer..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="pt-2 border-t">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Subtotal:</span>
              <span className="text-primary">
                R$ {(product.price * quantity).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleAdd} className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Adicionar ao Carrinho
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
