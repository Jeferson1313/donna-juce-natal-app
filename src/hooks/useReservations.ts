import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ReservationItem {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit: string;
  price_at_time: number;
}

export interface Reservation {
  id: string;
  customer_id: string;
  status: string;
  pickup_date: string | null;
  pickup_time: string | null;
  notes: string | null;
  created_at: string;
  items?: ReservationItem[];
  customer?: {
    name: string;
    phone: string;
  };
}

// Hook for customers to see their own reservations
export function useCustomerReservations(customerId: string | undefined) {
  return useQuery({
    queryKey: ["customer-reservations", customerId],
    queryFn: async () => {
      if (!customerId) return [];
      
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          *,
          items:reservation_items(*)
        `)
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Reservation[];
    },
    enabled: !!customerId,
  });
}

// Hook for admin to see all reservations
export function useAdminReservations() {
  return useQuery({
    queryKey: ["admin-reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          *,
          items:reservation_items(*),
          customer:customers(name, phone)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Reservation[];
    },
  });
}

// Hook to update reservation status
export function useUpdateReservationStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("reservations")
        .update({ status })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["customer-reservations"] });
    },
  });
}

// Hook to create a new reservation
export function useCreateReservation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      customerId,
      pickupDate,
      pickupTime,
      notes,
      items,
    }: {
      customerId: string;
      pickupDate?: string;
      pickupTime?: string;
      notes?: string;
      items: {
        product_id?: string;
        product_name: string;
        quantity: number;
        unit: string;
        price_at_time: number;
      }[];
    }) => {
      // Create reservation
      const { data: reservation, error: reservationError } = await supabase
        .from("reservations")
        .insert({
          customer_id: customerId,
          pickup_date: pickupDate || null,
          pickup_time: pickupTime || null,
          notes: notes || null,
        })
        .select()
        .single();

      if (reservationError) throw reservationError;

      // Create reservation items
      const itemsWithReservationId = items.map((item) => ({
        ...item,
        reservation_id: reservation.id,
      }));

      const { error: itemsError } = await supabase
        .from("reservation_items")
        .insert(itemsWithReservationId);

      if (itemsError) throw itemsError;

      return reservation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-reservations"] });
      queryClient.invalidateQueries({ queryKey: ["admin-reservations"] });
    },
  });
}
