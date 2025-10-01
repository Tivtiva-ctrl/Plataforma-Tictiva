import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase"; // ajusta este import a tu ruta real

const TenantContext = createContext(null);

export function TenantProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [tenant, setTenant] = useState(null); // { id, name, slug }
  const [loading, setLoading] = useState(true);

  // Carga usuario
  useEffect(() => {
    let sub = null;
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user ?? null);
      sub = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
    })();
    return () => sub?.data.subscription?.unsubscribe?.();
  }, []);

  // Carga tenants por membresía y fija activo
  useEffect(() => {
    (async () => {
      if (!user) { setTenants([]); setTenant(null); setLoading(false); return; }

      // Traer empresas donde el user tiene membresía
      const { data: tdata, error } = await supabase
        .from("tenants")
        .select("id, name, slug")
        .order("name");

      if (error) { console.error(error); setLoading(false); return; }
      setTenants(tdata || []);

      // Decide activo: metadata o el primero
      const currentId = user.user_metadata?.current_tenant_id || null;
      const found = tdata?.find(t => t.id === currentId) || tdata?.[0] || null;
      setTenant(found);

      // Si no coincide, actualiza metadata para futuros tokens
      if (found && found.id !== currentId) {
        await supabase.auth.updateUser({
          data: {
            current_tenant_id: found.id,
            current_tenant_slug: found.slug,
            current_tenant_name: found.name,
          }
        });
      }
      setLoading(false);
    })();
  }, [user]);

  const value = useMemo(() => ({
    user, tenants, tenant, setActiveTenant: async (t) => {
      setTenant(t);
      await supabase.auth.updateUser({
        data: {
          current_tenant_id: t?.id || null,
          current_tenant_slug: t?.slug || null,
          current_tenant_name: t?.name || null,
        }
      });
      // Opcional: recargar para que el token nuevo aplique en todas las llamadas
      // window.location.reload();
    },
    loading
  }), [user, tenants, tenant, loading]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  return useContext(TenantContext);
}
