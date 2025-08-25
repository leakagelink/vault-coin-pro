
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function check() {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user?.id;
      if (!userId) {
        if (mounted) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }
      const { data, error } = await (supabase as any).rpc("is_admin", {
        user_id: userId,
      });
      if (mounted) {
        if (error) {
          console.error("[useIsAdmin] is_admin RPC error:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(Boolean(data));
        }
        setLoading(false);
      }
    }

    check();
    return () => {
      mounted = false;
    };
  }, []);

  return { isAdmin, loading };
}
