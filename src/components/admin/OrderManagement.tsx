import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAdminOrders, useUpdateOrderStatus } from "@/hooks/useOrders";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/types/order";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function OrderManagement() {
  const { data: orders, isLoading } = useAdminOrders();
  const updateStatus = useUpdateOrderStatus();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatus.mutate({ id: orderId, status: newStatus });
  };

  if (isLoading) {
    return <div>Carregando pedidos...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {orders?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Nenhum pedido encontrado.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      {format(new Date(order.created_at), "dd/MM HH:mm", {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer?.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.customer?.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>R$ {Number(order.total).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={order.delivery_type === "delivery" ? "secondary" : "outline"}>
                        {order.delivery_type === "delivery" ? "Entrega" : "Retirada"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(value) => handleStatusChange(order.id, value)}
                      >
                        <SelectTrigger className={`w-[140px] ${ORDER_STATUS_COLORS[order.status]}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="font-semibold">Cliente:</span>
                <span>{selectedOrder.customer?.name}</span>
                <span className="font-semibold">Telefone:</span>
                <span>{selectedOrder.customer?.phone}</span>
                <span className="font-semibold">Pagamento:</span>
                <span className="uppercase">{selectedOrder.payment_method}</span>
                <span className="font-semibold">Endereço:</span>
                <span>{selectedOrder.address || "Retirada no local"}</span>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Itens</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.quantity} {item.unit} x {item.product_name}
                      </span>
                      <span>R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-4 pt-2 flex justify-between font-bold">
                  <span>Total</span>
                  <span>R$ {Number(selectedOrder.total).toFixed(2)}</span>
                </div>
              </div>

              {selectedOrder.notes && (
                <div className="bg-muted p-3 rounded-md text-sm">
                  <span className="font-semibold block mb-1">Observações:</span>
                  {selectedOrder.notes}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
