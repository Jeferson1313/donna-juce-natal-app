import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function normalizeVapidKey(value: string | undefined) {
  return (value || "")
    .trim()
    .replace(/\s+/g, "")
    .replace(/^"|"$/g, "")
    .replace(/^'|'$/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customer_id, to_admins, title, body, link } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const publicKey = normalizeVapidKey(Deno.env.get("WEB_PUSH_PUBLIC_KEY"));
    const privateKey = normalizeVapidKey(Deno.env.get("WEB_PUSH_PRIVATE_KEY"));

    if (!publicKey || !privateKey) {
      return new Response(JSON.stringify({ error: "Missing WEB_PUSH_PUBLIC_KEY or WEB_PUSH_PRIVATE_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    webpush.setVapidDetails("mailto:push@lovable.app", publicKey, privateKey);

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let subscriptions: any[] | null = null;
    let error: any = null;

    if (to_admins) {
      // Get admin user_ids
      const { data: admins } = await supabase.from("admin_users").select("user_id");
      const adminUserIds = admins?.map((a: any) => a.user_id) || [];

      if (adminUserIds.length > 0) {
        // Get customer records that belong to admin users
        const { data: adminCustomers } = await supabase
          .from("customers")
          .select("id")
          .in("user_id", adminUserIds);
        
        const adminCustomerIds = adminCustomers?.map((c: any) => c.id) || [];

        if (adminCustomerIds.length > 0) {
          const result = await supabase
            .from("push_subscriptions")
            .select("*")
            .in("customer_id", adminCustomerIds);
          subscriptions = result.data;
          error = result.error;
        } else {
          subscriptions = [];
        }
      } else {
        subscriptions = [];
      }
    } else if (customer_id) {
      const result = await supabase
        .from("push_subscriptions")
        .select("*")
        .eq("customer_id", customer_id);
      subscriptions = result.data;
      error = result.error;
    } else {
      return new Response(
        JSON.stringify({ error: "customer_id or to_admins is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (error) {
      console.error("Error fetching subscriptions:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Found ${subscriptions?.length || 0} subscriptions`);

    const payload = JSON.stringify({ title, body, link });
    let sent = 0;
    const failed: string[] = [];

    for (const sub of subscriptions || []) {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          payload
        );
        sent++;
      } catch (err: any) {
        console.error(`Push failed for ${sub.id}:`, err.statusCode || err.message);
        if (err.statusCode === 404 || err.statusCode === 410) {
          await supabase.from("push_subscriptions").delete().eq("id", sub.id);
          failed.push(sub.id);
        }
      }
    }

    return new Response(JSON.stringify({ sent, total: subscriptions?.length || 0, removed: failed.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error("send-push error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
