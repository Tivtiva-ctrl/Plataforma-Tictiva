// src/components/Personales.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import "../styles/personales.css";



/** IDs locales (cl_regiones) -> IDs oficiales (guardado / cl_comunas) */
const FIX_REGION_ID = {
  1: 15, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 13, 8: 6,
  9: 7, 10: 8, 11: 9, 12: 10, 13: 12, 14: 14, 15: 11, 16: 16,
};
/** Inverso: ID oficial -> ID local */
const INV_FIX_REGION_ID = Object.fromEntries(
  Object.entries(FIX_REGION_ID).map(([local, oficial]) => [Number(oficial), Number(local)])
);

export default function Personales({ emp }) {
  const [regionNombre, setRegionNombre] = useState("—");

  // region_id en DB está en formato OFICIAL; aquí lo convertimos a LOCAL para buscar el nombre
  const regionLocalId = useMemo(() => {
    const oficial = Number(emp?.region_id);
    if (!Number.isFinite(oficial)) return null;
    return INV_FIX_REGION_ID[oficial] ?? oficial;
  }, [emp?.region_id]);

  // Si EmpleadoFicha ya nos pasó el nombre correcto, úsalo
  const regionNombreProp = emp?.region_nombre;

  useEffect(() => {
    let cancel = false;

    async function loadNombre() {
      if (regionNombreProp) {
        setRegionNombre(regionNombreProp);
        return;
      }
      if (!regionLocalId) {
        setRegionNombre("—");
        return;
      }
      try {
        const { data, error } = await supabase
          .from("cl_regiones")
          .select("nombre")
          .eq("id", regionLocalId)
          .single(); // usamos single() para máxima compatibilidad

        if (!cancel) {
          if (error) {
            console.error("Error leyendo nombre de región:", error);
            setRegionNombre("—");
          } else {
            setRegionNombre(data?.nombre ?? "—");
          }
        }
      } catch (e) {
        if (!cancel) {
          console.error("Excepción leyendo región:", e);
          setRegionNombre("—");
        }
      }
    }

    loadNombre();
    return () => { cancel = true; };
  }, [regionLocalId, regionNombreProp]);

  return (
    <div className="ef-card p20" style={{ marginTop: 12 }}>
      <h3 className="ef-block-title">Información Personal</h3>

      <div className="ef-detail">
        <div className="ef-row">
          <div className="ef-label">Nombre Completo:</div>
          <div className="ef-value">
            {`${emp?.nombre ?? ""} ${emp?.apellido ?? ""}`.trim() || "—"}
          </div>
        </div>

        <div className="ef-row">
          <div className="ef-label">RUT:</div>
          <div className="ef-value">{emp?.rut || "—"}</div>
        </div>

        <div className="ef-row">
          <div className="ef-label">Cargo:</div>
          <div className="ef-value">{emp?.cargo || "—"}</div>
        </div>

        <div className="ef-row">
          <div className="ef-label">Género:</div>
          <div className="ef-value">{emp?.genero || "—"}</div>
        </div>

        <div className="ef-row">
          <div className="ef-label">Discapacidad:</div>
          <div className="ef-value">{emp?.discapacidad ? "Sí" : "No"}</div>
        </div>

        <div className="ef-row">
          <div className="ef-label">Estado:</div>
          <div className="ef-value">{emp?.activo ? "ACTIVO" : "INACTIVO"}</div>
        </div>

        <div className="ef-row">
          <div className="ef-label">Región:</div>
          <div className="ef-value">{regionNombre}</div>
        </div>

        <div className="ef-row">
          <div className="ef-label">Comuna:</div>
          <div className="ef-value">
            {/* muestra lo que tengas disponible, sin romper si falta */}
            {emp?.comuna_nombre ?? emp?.comuna ?? emp?.comuna_id ?? "—"}
          </div>
        </div>

        <div className="ef-row">
          <div className="ef-label">Estado civil:</div>
          <div className="ef-value">{emp?.estado_civil_nombre ?? "—"}</div>
        </div>

        <div className="ef-row">
          <div className="ef-label">Nacionalidad:</div>
          <div className="ef-value">{emp?.nacionalidad_nombre ?? "—"}</div>
        </div>

        <div className="ef-row">
          <div className="ef-label">Dirección:</div>
          <div className="ef-value">{emp?.direccion || "—"}</div>
        </div>
      </div>
    </div>
  );
}
