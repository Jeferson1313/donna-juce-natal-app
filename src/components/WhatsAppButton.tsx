import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WhatsAppButtonProps {
  phoneNumber?: string;
}

export function WhatsAppButton({ phoneNumber = "5500000000000" }: WhatsAppButtonProps) {
  const handleClick = () => {
    const message = "Olá! Gostaria de tirar algumas dúvidas.";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <Button
      variant="whatsapp"
      size="lg"
      className="fixed bottom-6 right-6 z-40 rounded-full h-14 w-14 p-0 shadow-elevated animate-pulse-glow"
      onClick={handleClick}
    >
      <MessageCircle className="h-7 w-7" />
    </Button>
  );
}
