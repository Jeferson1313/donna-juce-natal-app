import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { requestNotificationPermission } from "@/hooks/useNotifications";

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  phone: string;
}

export function useCustomerAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(() => {
            fetchCustomer(session.user.id);
          }, 0);
        } else {
          setCustomer(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCustomer(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchCustomer = async (userId: string) => {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data) {
      setCustomer(data);
      // Request notification permission when customer is identified
      requestNotificationPermission();
    }
    setLoading(false);
  };

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    const redirectUrl = `${window.location.origin}/catalogo`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) return { error };

    // Create customer profile
    if (data.user) {
      const { error: customerError } = await supabase
        .from("customers")
        .insert({
          user_id: data.user.id,
          name,
          phone,
        });

      if (customerError) return { error: customerError };
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setCustomer(null);
  };

  return {
    user,
    session,
    customer,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user && !!customer,
  };
}
