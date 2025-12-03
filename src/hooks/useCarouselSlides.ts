import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CarouselSlide } from "@/types/carousel";

export function useCarouselSlides() {
  return useQuery({
    queryKey: ["carousel-slides"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("carousel_slides")
        .select("*")
        .order("order", { ascending: true });

      if (error) throw error;
      return data as CarouselSlide[];
    },
  });
}

export function useCreateSlide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slide: {
      title: string;
      subtitle?: string | null;
      image_url: string;
      button_text?: string | null;
      button_link?: string | null;
      order?: number;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("carousel_slides")
        .insert([slide])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carousel-slides"] });
    },
  });
}

export function useUpdateSlide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CarouselSlide> & { id: string }) => {
      const { data, error } = await supabase
        .from("carousel_slides")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carousel-slides"] });
    },
  });
}

export function useDeleteSlide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("carousel_slides")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carousel-slides"] });
    },
  });
}
