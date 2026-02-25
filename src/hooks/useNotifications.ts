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
      // Insert notification in DB
      const { error } = await supabase
        .from("notifications")
        .insert({
          customer_id: customerId,
          title,
          body,
          link
        });

      if (error) throw error;

      // Send push notification via edge function
      try {
        await supabase.functions.invoke("send-push", {
          body: { customer_id: customerId, title, body, link },
        });
      } catch (e) {
        console.warn("Push notification failed (non-blocking):", e);
      }
    },
  });
}

/**
 * Register the app Service Worker as early as possible.
 */
export async function registerAppServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return null;
  }

  try {
    const existing = await navigator.serviceWorker.getRegistration("/service-worker.js");
    if (existing) return existing;

    return await navigator.serviceWorker.register("/service-worker.js");
  } catch (err) {
    console.warn("Service Worker registration failed:", err);
    return null;
  }
}

/**
 * Register service worker and subscribe to Web Push.
 * Call after login/signup when customerId is known.
 */
export async function subscribeToPush(customerId: string) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push not supported");
    return false;
  }

  try {
    const registration = await registerAppServiceWorker();
    if (!registration) return false;

    await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return false;

    // Fetch VAPID public key from backend function
    const { data: vapidData } = await supabase.functions.invoke("get-vapid-key");
    const vapidPublicKey = vapidData?.publicKey;
    if (!vapidPublicKey) {
      console.warn("VAPID public key not available");
      return false;
    }

    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    const pushManager = (registration as ServiceWorkerRegistration & {
      pushManager: PushManager;
    }).pushManager;

    let subscription = await pushManager.getSubscription();

    if (!subscription) {
      subscription = await pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey as unknown as BufferSource,
      });
    }

    const subJson = subscription.toJSON();

    // Save to DB (upsert by endpoint)
    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          customer_id: customerId,
          endpoint: subJson.endpoint!,
          p256dh: subJson.keys!.p256dh!,
          auth: subJson.keys!.auth!,
        },
        { onConflict: "endpoint" }
      );

    if (error) {
      console.error("Failed to save push subscription:", error);
      return false;
    }

    console.log("Push subscription saved successfully");
    return true;
  } catch (err) {
    console.error("Push subscription failed:", err);
    return false;
  }
}

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return false;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
