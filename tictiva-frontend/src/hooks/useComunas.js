import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Carga TODAS las comunas una sola vez y filtra por regionId en memoria.
 * No toca UI ni clases. 100% drop-in.
 */
export default function useComunas(regionId) {
  const [allComunas, setAllComunas] = useState([]);
  const [errorInfo, setErrorInfo] = useState(null);
  const loadedRef = useRef(false);

  // Carga única (una vez) de todas las comunas
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    (async () => {
      const { data, error } = await supabase
        .from("import_cl_comunas")
        .select("codigo,nombre,region_id")
        .order("nombre", { ascending: true });

      if (error) {
        console.error("[useComunas] error cargando comunas:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        setErrorInfo(error);
        setAllComunas([]); // evita crashear UI
        return;
      }
      setAllComunas(data || []);
    })();
  }, []);

  // Filtrado por región (número)
  const comunas = useMemo(() => {
    const rid = Number(regionId);
    if (!Number.isFinite(rid)) return [];
    return allComunas.filter((c) => Number(c.region_id) === rid);
  }, [allComunas, regionId]);

  return { comunas, errorInfo, total: allComunas.length };
}
