// src/context/TenantProvider.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase"; // ajusta si tu ruta real es distinta

const TenantContext = createContext(null);

function TenantProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [tenant, setTenant] = useState(null); // { id, name, slug }
  const [loading, setLoading] = useState(true);

  // Carga usuario y suscribe a cambios de auth
  useEffect(() => {
    let authSub;
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user ?? null);

      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      authSub = sub?.subscription;
    })();

    return () => {
      try { authSub?.unsubscribe(); } catch (_) {}
    };
  }, []);

  // Carga tenants por membresía y fija activo
  useEffect(() => {
    (async () => {
      if (!user) {
        setTenants([]);
        setTenant(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data: tdata, error } = await supabase
        .from("tenants")
        .select("id, name, slug")
        .order("name", { ascending: true });

      if (error) {
        console.error(error);
        setTenants([]);
        setTenant(null);
        setLoading(false);
        return;
      }

      const list = tdata || [];
      setTenants(list);

      // Activo: metadata o primero disponible
      const currentId = user.user_metadata?.current_tenant_id || null;
      const active = list.find((t) => t.id === currentId) || list[0] || null;
      setTenant(active);

      // Guarda en metadata para próximos tokens (opcional pero útil)
      if (active && active.id !== currentId) {
        await supabase.auth.updateUser({
          data: {
            current_tenant_id: active.id,
            current_tenant_slug: active.slug,
            current_tenant_name: active.name,
          },
        });
      }

      setLoading(false);
    })();
  }, [user]);

  const value = useMemo(() => ({
    user,
    tenants,
    tenant,
    loading,
    setActiveTenant: async (t) => {
      setTenant(t);
      try {
        await supabase.auth.updateUser({
          data: {
            current_tenant_id: t?.id || null,
            current_tenant_slug: t?.slug || null,
            current_tenant_name: t?.name || null,
          },
        });
      } catch (e) {
        console.error(e);
      }
      // Si quieres forzar refresh de token en todas las llamadas:
      // window.location.reload();
    },
  }), [user, tenants, tenant, loading]);

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

function useTenant() {
  return useContext(TenantContext);
}

export { TenantProvider, useTenant };
export default TenantProvider;
