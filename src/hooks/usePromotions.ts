import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Promotion {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromotionItem {
  id: string;
  promotion_id: string;
  product_id: string;
  promotional_price: number;
  created_at: string;
}

export interface PromotionWithItems extends Promotion {
  items: (PromotionItem & {
    product?: {
      id: string;
      name: string;
      price: number;
      unit: string;
      image_url: string | null;
      category: string;
    };
  })[];
}

export function useActivePromotions() {
  return useQuery({
    queryKey: ["promotions", "active"],
    queryFn: async () => {
      const now = new Date().toISOString();

      const { data: promotions, error } = await supabase
        .from("promotions" as any)
        .select("*")
        .eq("is_active", true)
        .lte("start_date", now)
        .gte("end_date", now);

      if (error) throw error;
      if (!promotions || promotions.length === 0) return [];

      const promoIds = (promotions as any[]).map((p) => p.id);

      const { data: items, error: itemsError } = await supabase
        .from("promotion_items" as any)
        .select("*, product:products(id, name, price, unit, image_url, category)")
        .in("promotion_id", promoIds);

      if (itemsError) throw itemsError;

      return (promotions as any[]).map((promo) => ({
        ...promo,
        items: ((items as any[]) || []).filter((i) => i.promotion_id === promo.id),
      })) as PromotionWithItems[];
    },
  });
}

export function useAdminPromotions() {
  return useQuery({
    queryKey: ["promotions", "admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("promotions" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as unknown as Promotion[];
    },
  });
}

export function usePromotionItems(promotionId?: string) {
  return useQuery({
    queryKey: ["promotion-items", promotionId],
    queryFn: async () => {
      if (!promotionId) return [];

      const { data, error } = await supabase
        .from("promotion_items" as any)
        .select("*, product:products(id, name, price, unit, image_url)")
        .eq("promotion_id", promotionId);

      if (error) throw error;
      return data as unknown as (PromotionItem & { product: any })[];
    },
    enabled: !!promotionId,
  });
}

export function useCreatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      start_date: string;
      end_date: string;
      is_active?: boolean;
    }) => {
      const { data: promo, error } = await supabase
        .from("promotions" as any)
        .insert(data as any)
        .select()
        .single();
      if (error) throw error;
      return promo as unknown as Promotion;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
}

export function useUpdatePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; [key: string]: any }) => {
      const { error } = await supabase
        .from("promotions" as any)
        .update(data as any)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
}

export function useDeletePromotion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("promotions" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
}

export function useAddPromotionItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      promotion_id: string;
      product_id: string;
      promotional_price: number;
    }) => {
      const { error } = await supabase
        .from("promotion_items" as any)
        .insert(data as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotion-items"] });
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
}

export function useRemovePromotionItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("promotion_items" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotion-items"] });
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
}
