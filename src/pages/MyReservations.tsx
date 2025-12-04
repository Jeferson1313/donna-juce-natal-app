import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { useCustomerReservations } from "@/hooks/useReservations";
import { CatalogSidebar } from "@/components/CatalogSidebar";
import { CustomerAuthModal } from "@/components/CustomerAuthModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, Clock, ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import logo from "@/assets/logo.png";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  confirmed: { label: "Confirmado", variant: "default" },
  ready: { label: "Pronto", variant: "default" },
  completed: { label: "Concluído", variant: "outline" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

export default function MyReservations() {
  const navigate = useNavigate();
  const { customer, isAuthenticated, loading: authLoading } = useCustomerAuth();
  const { data: reservations, isLoading } = useCustomerReservations(customer?.id);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    navigate("/catalogo");
    return null;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Sidebar */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-30">
        <div className="container py-4 flex items-center justify-between">
          <CatalogSidebar onOpenAuth={() => setIsAuthModalOpen(true)} />
          <div className="flex items-center gap-3">
            <img src={logo} alt="Donna Juce Açougue" className="h-10 w-auto" />
            <h1 className="font-display text-lg font-semibold text-foreground hidden sm:block">
              Minhas Reservas
            </h1>
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Auth Modal */}
      <CustomerAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />

      <main className="container py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded w-1/4 mb-4" />
                  <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : reservations && reservations.length > 0 ? (
          <div className="space-y-4">
            {reservations.map((reservation) => {
              const status = statusConfig[reservation.status] || statusConfig.pending;
              const total = reservation.items?.reduce(
                (sum, item) => sum + item.price_at_time * item.quantity,
                0
              ) || 0;

              return (
                <Card key={reservation.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                        Pedido #{reservation.id.slice(0, 8)}
                      </CardTitle>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(reservation.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                      {reservation.pickup_date && (
                        <span className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          Retirada: {format(new Date(reservation.pickup_date + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      )}
                      {reservation.pickup_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {reservation.pickup_time}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="border-t border-border pt-4">
                      <h4 className="font-medium mb-2">Itens:</h4>
                      <ul className="space-y-2">
                        {reservation.items?.map((item) => (
                          <li key={item.id} className="flex justify-between text-sm">
                            <span>
                              {item.quantity} {item.unit} - {item.product_name}
                            </span>
                            <span className="font-medium">
                              {formatCurrency(item.price_at_time * item.quantity)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex justify-between mt-4 pt-4 border-t border-border font-semibold">
                        <span>Total:</span>
                        <span className="text-primary">{formatCurrency(total)}</span>
                      </div>
                    </div>
                    {reservation.notes && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          <strong>Observações:</strong> {reservation.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Nenhuma reserva ainda</h3>
              <p className="text-muted-foreground mb-4">
                Você ainda não fez nenhuma reserva. Que tal começar?
              </p>
              <Button onClick={() => navigate("/catalogo")}>
                Ver Catálogo
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
