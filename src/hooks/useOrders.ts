import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Order } from "@/types/order";

export function useCustomerOrders(customerId?: string) {
  return useQuery({
    queryKey: ["customer-orders", customerId],
    queryFn: async () => {
      if (!customerId) return [];
      
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          items:order_items(*)
        `)
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
    enabled: !!customerId,
  });
}

export function useAdminOrders() {
  return useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          items:order_items(*),
          customer:customers(name, phone)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Order[];
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);
      
      if (error) throw error;

      if (status !== 'pending') {
        const { data: order } = await supabase
          .from("orders")
          .select("customer_id, delivery_type")
          .eq("id", id)
          .single();

        if (order) {
          let title = "Atualização do Pedido";
          let body = `Seu pedido foi atualizado.`;
          
          if (status === 'confirmed') {
            title = "Pedido Confirmado!";
            body = "Seu pedido foi confirmado e já vamos começar a preparar.";
          } else if (status === 'ready') {
            title = order.delivery_type === 'delivery' ? "Pedido saiu para entrega!" : "Pedido pronto para retirada!";
            body = order.delivery_type === 'delivery' ? "Seu pedido saiu para entrega." : "Você já pode vir buscar seu pedido.";
          } else if (status === 'delivered') {
            title = "Pedido Entregue";
            body = "Obrigado pela preferência!";
          }

          await supabase.from("notifications").insert({
            customer_id: order.customer_id,
            title,
            body,
            link: "/meus-pedidos"
          });

          // Send push notification
          try {
            await supabase.functions.invoke("send-push", {
              body: { customer_id: order.customer_id, title, body, link: "/meus-pedidos" },
            });
          } catch (e) {
            console.warn("Push failed (non-blocking):", e);
          }
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      customerId,
      deliveryType,
      address,
      paymentMethod,
      notes,
      total,
      items,
    }: {
      customerId: string;
      deliveryType: "delivery" | "pickup";
      address?: string;
      paymentMethod: string;
      notes?: string;
      total: number;
      items: {
        productId?: string;
        productName: string;
        quantity: number;
        unit: string;
        price: number;
        notes?: string;
      }[];
    }) => {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          customer_id: customerId,
          delivery_type: deliveryType,
          address: address || null,
          payment_method: paymentMethod,
          notes: notes || null,
          total,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const itemsWithOrderId = items.map((item) => ({
        order_id: order.id,
        product_id: item.productId || null,
        product_name: item.productName,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        notes: item.notes || null,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsWithOrderId);

      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-orders"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });
}
