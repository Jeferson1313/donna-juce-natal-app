import { useState } from "react";
import { useAdminReservations, useUpdateReservationStatus } from "@/hooks/useReservations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, User, Phone, Search, Package } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  confirmed: { label: "Confirmado", variant: "default" },
  ready: { label: "Pronto para Retirada", variant: "default" },
  completed: { label: "Concluído", variant: "outline" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

const statusOptions = [
  { value: "pending", label: "Pendente" },
  { value: "confirmed", label: "Confirmado" },
  { value: "ready", label: "Pronto para Retirada" },
  { value: "completed", label: "Concluído" },
  { value: "cancelled", label: "Cancelado" },
];

export function ReservationManagement() {
  const { toast } = useToast();
  const { data: reservations, isLoading } = useAdminReservations();
  const updateStatus = useUpdateReservationStatus();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleStatusChange = async (reservationId: string, newStatus: string) => {
    try {
      await updateStatus.mutateAsync({ id: reservationId, status: newStatus });
      toast({ title: "Status atualizado com sucesso!" });
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const filteredReservations = reservations?.filter((reservation) => {
    const matchesSearch =
      searchTerm === "" ||
      reservation.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.customer?.phone.includes(searchTerm) ||
      reservation.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || reservation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
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
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Reservas
        </h2>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, telefone ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reservations List */}
      {filteredReservations && filteredReservations.length > 0 ? (
        <div className="space-y-4">
          {filteredReservations.map((reservation) => {
            const status = statusConfig[reservation.status] || statusConfig.pending;
            const total = reservation.items?.reduce(
              (sum, item) => sum + item.price_at_time * item.quantity,
              0
            ) || 0;

            return (
              <Card key={reservation.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">
                        Pedido #{reservation.id.slice(0, 8)}
                      </CardTitle>
                      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {reservation.customer?.name || "Cliente"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {reservation.customer?.phone || "-"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(reservation.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <Select
                        value={reservation.status}
                        onValueChange={(value) => handleStatusChange(reservation.id, value)}
                      >
                        <SelectTrigger className="w-44">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {(reservation.pickup_date || reservation.pickup_time) && (
                    <div className="flex flex-wrap gap-4 mb-4 p-3 bg-muted/50 rounded-lg">
                      {reservation.pickup_date && (
                        <span className="flex items-center gap-1 text-sm">
                          <Package className="h-4 w-4 text-primary" />
                          <strong>Retirada:</strong> {format(new Date(reservation.pickup_date + "T00:00:00"), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      )}
                      {reservation.pickup_time && (
                        <span className="flex items-center gap-1 text-sm">
                          <Clock className="h-4 w-4 text-primary" />
                          {reservation.pickup_time}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="border-t border-border pt-4">
                    <h4 className="font-medium mb-2">Itens do Pedido:</h4>
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
                    <div className="flex justify-between mt-4 pt-4 border-t border-border font-semibold text-lg">
                      <span>Total:</span>
                      <span className="text-primary">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  {reservation.notes && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm">
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
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Nenhuma reserva encontrada</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== "all"
                ? "Tente ajustar os filtros de busca."
                : "As reservas dos clientes aparecerão aqui."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
