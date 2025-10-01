// src/data/useEmployees.js
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useTenant } from "../context/TenantProvider";

export function useEmployees() {
  const { tenant } = useTenant();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      if (!tenant?.id) { setEmployees([]); setLoading(false); return; }
      setLoading(true);
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("created_at", { ascending: false });

      if (ignore) return;
      if (error) setError(error);
      setEmployees(data ?? []);
      setLoading(false);
    }

    load();
    return () => { ignore = true; };
  }, [tenant?.id]);

  return { employees, loading, error, tenant };
}
