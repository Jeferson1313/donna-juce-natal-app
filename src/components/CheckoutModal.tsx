import { useState, useEffect } from "react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCart } from "@/contexts/CartContext";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageCircle, Loader2 } from "lucide-react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const WHATSAPP_NUMBER = "5575983192638";

export function CheckoutModal({ isOpen, onClose, onSuccess }: CheckoutModalProps) {
  const { items, totalPrice, clearCart } = useCart();
  const { customer } = useCustomerAuth();
  const { toast } = useToast();

  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedAddress, setSavedAddress] = useState<string | null>(null);
  const [customerData, setCustomerData] = useState<{ name: string; phone: string } | null>(null);

  useEffect(() => {
    if (isOpen && customer) {
      fetchCustomerData();
    }
  }, [isOpen, customer]);

  const fetchCustomerData = async () => {
    if (!customer) return;
    
    const { data } = await supabase
      .from("customers")
      .select("name, phone, address")
      .eq("id", customer.id)
      .maybeSingle();

    if (data) {
      setCustomerData({ name: data.name, phone: data.phone });
      if (data.address) {
        setSavedAddress(data.address);
        setAddress(data.address);
      }
    }
  };

  const saveAddress = async (newAddress: string) => {
    if (!customer) return;

    await supabase
      .from("customers")
      .update({ address: newAddress })
      .eq("id", customer.id);
  };

  const generateOrderText = () => {
    let text = `*NOVO PEDIDO*\n\n`;
    text += `*Cliente:* ${customerData?.name || "N/A"}\n`;
    text += `*Telefone:* ${customerData?.phone || "N/A"}\n\n`;

    text += `*Itens do Pedido:*\n`;
    text += `─────────────────\n`;

    items.forEach((item) => {
      text += `• ${item.name}\n`;
      text += `  ${item.quantity} ${item.unit} x R$ ${item.price.toFixed(2)} = R$ ${(item.price * item.quantity).toFixed(2)}\n`;
      if (item.notes) {
        text += `  _Obs: ${item.notes}_\n`;
      }
    });

    text += `─────────────────\n`;
    text += `*Total: R$ ${totalPrice.toFixed(2)}*\n\n`;

    text += `*Forma de Pagamento:* ${getPaymentLabel(paymentMethod)}\n`;
    
    if (deliveryType === "delivery") {
      text += `*Entrega no endereço:*\n${address}\n`;
    } else {
      text += `*Retirada no local*\n`;
    }

    if (notes) {
      text += `\n*Observações:* ${notes}\n`;
    }

    return text;
  };

  const getPaymentLabel = (method: string) => {
    const labels: Record<string, string> = {
      pix: "PIX",
      cash: "Dinheiro",
      card: "Cartão",
    };
    return labels[method] || method;
  };

  const handleSubmit = async () => {
    if (deliveryType === "delivery" && !address.trim()) {
      toast({
        title: "Endereço obrigatório",
        description: "Por favor, informe o endereço de entrega.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Save address if it's new or different
      if (deliveryType === "delivery" && address !== savedAddress) {
        await saveAddress(address);
      }

      const orderText = generateOrderText();
      const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(orderText)}`;

      window.open(whatsappUrl, "_blank");

      clearCart();
      
      toast({
        title: "Pedido enviado!",
        description: "Você será redirecionado para o WhatsApp.",
      });

      onSuccess();
    } catch (error) {
      toast({
        title: "Erro ao enviar pedido",
        description: "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Finalizar Pedido</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label>Forma de Recebimento</Label>
            <RadioGroup
              value={deliveryType}
              onValueChange={(v) => setDeliveryType(v as "delivery" | "pickup")}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="delivery" id="delivery" />
                <Label htmlFor="delivery" className="cursor-pointer">
                  Entrega
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pickup" id="pickup" />
                <Label htmlFor="pickup" className="cursor-pointer">
                  Retirar no Local
                </Label>
              </div>
            </RadioGroup>
          </div>

          {deliveryType === "delivery" && (
            <div className="space-y-2">
              <Label htmlFor="address">Endereço de Entrega</Label>
              {savedAddress && savedAddress !== address && (
                <Button
                  type="button"
                  variant="link"
                  className="h-auto p-0 text-xs"
                  onClick={() => setAddress(savedAddress)}
                >
                  Usar endereço salvo
                </Button>
              )}
              <Textarea
                id="address"
                placeholder="Rua, número, bairro, complemento..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <div className="space-y-3">
            <Label>Forma de Pagamento</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="flex flex-wrap gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pix" id="pix" />
                <Label htmlFor="pix" className="cursor-pointer">
                  PIX
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="cursor-pointer">
                  Dinheiro
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="cursor-pointer">
                  Cartão
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações do Pedido (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Alguma observação sobre o pedido..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total:</span>
              <span className="text-primary">R$ {totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Voltar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MessageCircle className="h-4 w-4" />
            )}
            Enviar via WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
