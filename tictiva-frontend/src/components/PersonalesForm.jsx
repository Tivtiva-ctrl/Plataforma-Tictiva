// PersonalesForm.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function PersonalesForm() {
  const [regionId, setRegionId] = useState(null);     // número o null
  const [comunas, setComunas] = useState([]);         // opciones de comunas
  const [comunaSel, setComunaSel] = useState("");     // código comuna

  // 1) Cargar comunas cuando cambia la región
  useEffect(() => {
    const fetchComunas = async () => {
      // Si no hay región, limpia
      if (!Number.isFinite(Number(regionId))) {
        setComunas([]);
        setComunaSel("");
        return;
      }

      const rid = Number(regionId);

      const { data, error } = await supabase
        .from("import_cl_comunas")
        .select("codigo,nombre,region_id")
        .eq("region_id", rid)
        .order("nombre", { ascending: true });

      if (error) {
        console.error("[Comunas] error:", {
          msg: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        setComunas([]);
        setComunaSel("");
        return;
      }

      setComunas(data ?? []);
      setComunaSel(""); // 2) resetear selección al cambiar región
    };

    fetchComunas();
  }, [regionId]); // 3) dependencia correcta

  // 4) Asegura que regionId sea número y resetea comuna & lista
  const onRegionChange = (e) => {
    const value = e.target.value; // viene string
    setRegionId(value === "" ? null : Number(value));
  };

  return (
    <div className="grid gap-3">
      {/* Región */}
      <label>
        Región
        <select value={regionId ?? ""} onChange={onRegionChange}>
          <option value="">Seleccione...</option>
          {/* Ejemplo de regiones; asegúrate de que el value sea el ID que usa tu tabla */}
          <option value={7}>Maule</option>
          <option value={6}>O’Higgins</option>
          <option value={13}>Metropolitana</option>
          {/* ... */}
        </select>
      </label>

      {/* Comuna */}
      <label>
        Comuna
        <select
          value={comunaSel}
          onChange={(e) => setComunaSel(e.target.value)}
          disabled={!comunas.length}
        >
          <option value="">Seleccione...</option>
          {comunas.map((c) => (
            <option key={c.codigo} value={c.codigo}>
              {c.nombre}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
