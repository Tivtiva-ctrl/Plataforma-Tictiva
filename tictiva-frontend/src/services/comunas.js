// src/services/comunas.js
import { supabase } from "../lib/supabase";

/**
 * Trae comunas por region_id (int). Devuelve [] si no hay región o hay error.
 */
export async function fetchComunasByRegion(regionId) {
  const rid = Number(regionId);
  if (!Number.isFinite(rid)) return [];

  const { data, error } = await supabase
    .from("import_cl_comunas") // usa "public.import_cl_comunas" si tu tabla está fuera de public
    .select("codigo,nombre,region_id")
    .eq("region_id", rid)
    .order("nombre", { ascending: true });

  if (error) {
    console.error("[fetchComunasByRegion] error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return [];
  }
  return data ?? [];
}
