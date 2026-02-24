export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  product_name: string;
  quantity: number;
  unit: string;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  customer_id: string;
  status: "pending" | "confirmed" | "ready" | "delivered" | "cancelled";
  delivery_type: "delivery" | "pickup";
  address?: string;
  payment_method: string;
  notes?: string;
  total: number;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  customer?: {
    name: string;
    phone: string;
  };
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmado",
  ready: "Pronto",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  ready: "bg-green-100 text-green-800",
  delivered: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};
