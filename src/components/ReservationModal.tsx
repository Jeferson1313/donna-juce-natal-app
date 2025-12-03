import { useState } from "react";
import { X, User, Phone, Clock, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product } from "./ProductCard";
import { toast } from "@/hooks/use-toast";

interface ReservationModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ReservationModal({ product, isOpen, onClose }: ReservationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    pickupTime: "",
    quantity: "1",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim() || !formData.pickupTime.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate reservation submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const message = `🎄 *Nova Reserva de Natal*\n\n` +
      `*Produto:* ${product.name}\n` +
      `*Quantidade:* ${formData.quantity} ${product.unit}\n` +
      `*Valor Unitário:* R$ ${product.price.toFixed(2)}\n\n` +
      `*Cliente:* ${formData.name}\n` +
      `*Contato:* ${formData.phone}\n` +
      `*Horário de Retirada:* ${formData.pickupTime}`;

    const whatsappUrl = `https://wa.me/5500000000000?text=${encodeURIComponent(message)}`;
    
    toast({
      title: "Reserva enviada!",
      description: "Você será redirecionado para o WhatsApp para confirmar sua reserva.",
    });

    setTimeout(() => {
      window.open(whatsappUrl, "_blank");
      onClose();
      setFormData({ name: "", phone: "", pickupTime: "", quantity: "1" });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-foreground/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-card rounded-2xl shadow-elevated max-w-md w-full animate-fade-in overflow-hidden">
        {/* Header */}
        <div className="gradient-hero p-6 text-primary-foreground">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-primary-foreground/20 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-8 w-8" />
            <div>
              <h2 className="font-display text-xl font-bold">Fazer Reserva</h2>
              <p className="text-primary-foreground/80 text-sm">Reserve seu pedido de Natal</p>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4 bg-muted/50 border-b border-border flex items-center gap-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div>
            <h3 className="font-semibold text-card-foreground">{product.name}</h3>
            <p className="text-primary font-bold">
              R$ {product.price.toFixed(2)}/{product.unit}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-card-foreground">
              <User className="h-4 w-4" />
              Nome Completo
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Seu nome"
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2 text-card-foreground">
              <Phone className="h-4 w-4" />
              WhatsApp / Telefone
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(00) 00000-0000"
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity" className="flex items-center gap-2 text-card-foreground">
              <ShoppingBag className="h-4 w-4" />
              Quantidade ({product.unit})
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickupTime" className="flex items-center gap-2 text-card-foreground">
              <Clock className="h-4 w-4" />
              Horário de Retirada
            </Label>
            <Input
              id="pickupTime"
              value={formData.pickupTime}
              onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
              placeholder="Ex: 24/12 às 10h"
              className="bg-background"
            />
          </div>

          <Button
            type="submit"
            variant="christmas"
            size="lg"
            className="w-full mt-6"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Enviando..." : "Confirmar Reserva"}
          </Button>
        </form>
      </div>
    </div>
  );
}
