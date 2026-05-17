import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAnonymousSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const ensureSession = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (sessionError) {
          setAuthError(sessionError.message);
          setIsAuthReady(true);
          return;
        }

        if (sessionData.session?.user) {
          setUser(sessionData.session.user);
          setIsAuthReady(true);
          return;
        }

        const { data, error } = await supabase.auth.signInAnonymously();

        if (!isMounted) return;

        if (error) {
          setAuthError(error.message);
        } else {
          setUser(data.user);
        }
      } catch (error) {
        if (!isMounted) return;

        setAuthError(error instanceof Error ? error.message : "Could not connect to Supabase.");
      } finally {
        if (isMounted) {
          setIsAuthReady(true);
        }
      }
    };

    ensureSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, isAuthReady, authError };
};
