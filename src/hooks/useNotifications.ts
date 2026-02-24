import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppNotification } from "@/types/notification";
import { useEffect } from "react";

export function useNotifications(customerId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!customerId) return;

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `customer_id=eq.${customerId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["notifications", customerId] });
          if (Notification.permission === "granted") {
            new Notification(payload.new.title, {
              body: payload.new.body,
              icon: "/favicon.ico"
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [customerId, queryClient]);

  return useQuery({
    queryKey: ["notifications", customerId],
    queryFn: async () => {
      if (!customerId) return [];
      
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AppNotification[];
    },
    enabled: !!customerId,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (customerId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("customer_id", customerId)
        .eq("is_read", false);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useCreateNotification() {
  return useMutation({
    mutationFn: async ({
      customerId,
      title,
      body,
      link
    }: {
      customerId: string;
      title: string;
      body: string;
      link?: string;
    }) => {
      const { error } = await supabase
        .from("notifications")
        .insert({
          customer_id: customerId,
          title,
          body,
          link
        });

      if (error) throw error;
    },
  });
}

export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}
