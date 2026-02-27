import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useCustomerOrders } from "@/hooks/useOrders";
import { CatalogSidebar } from "@/components/CatalogSidebar";
import { CustomerAuthModal } from "@/components/CustomerAuthModal";
import { CartIcon } from "@/components/CartIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Calendar, MapPin, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types/order";
import logo from "@/assets/logo-extended.png";

export default function MyOrders() {
  const navigate = useNavigate();
  const { customer, isAuthenticated, loading: authLoading } = useCustomerAuth();
  const { data: orders, isLoading } = useCustomerOrders(customer?.id);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/");
    return null;
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const getPaymentLabel = (method: string) => {
    const labels: Record<string, string> = { pix: "PIX", cash: "Dinheiro", card: "Cartão" };
    return labels[method] || method;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-30">
        <div className="container py-4 flex items-center justify-between">
          <CatalogSidebar onOpenAuth={() => setIsAuthModalOpen(true)} />
          <img src={logo} alt="Donna Juce Açougue" className="h-12 w-auto" />
          <CartIcon />
        </div>
      </header>

      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />

      <main className="container py-6 space-y-4">
        <h1 className="font-display text-2xl font-bold">Meus Pedidos</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-1/4 mb-4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                      Pedido #{order.id.slice(0, 8)}
                    </CardTitle>
                    <Badge className={ORDER_STATUS_COLORS[order.status]}>
                      {ORDER_STATUS_LABELS[order.status] || order.status}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(order.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {order.delivery_type === "delivery" ? "Entrega" : "Retirada"}
                    </span>
                    <span className="flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      {getPaymentLabel(order.payment_method)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="border-t border-border pt-4">
                    <h4 className="font-medium mb-2">Itens:</h4>
                    <ul className="space-y-2">
                      {order.items?.map((item) => (
                        <li key={item.id} className="flex justify-between text-sm">
                          <span>
                            {item.quantity} {item.unit} - {item.product_name}
                          </span>
                          <span className="font-medium">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-between mt-4 pt-4 border-t border-border font-semibold">
                      <span>Total:</span>
                      <span className="text-primary">{formatCurrency(Number(order.total))}</span>
                    </div>
                  </div>
                  {order.address && (
                    <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm">
                      <strong>Endereço:</strong> {order.address}
                    </div>
                  )}
                  {order.notes && (
                    <div className="mt-2 p-3 bg-muted/50 rounded-lg text-sm">
                      <strong>Observações:</strong> {order.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Nenhum pedido ainda</h3>
              <p className="text-muted-foreground mb-4">
                Você ainda não fez nenhum pedido.
              </p>
              <Button onClick={() => navigate("/")}>Ver Catálogo</Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
