// src/components/RegionComunaPicker.jsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchComunasByRegion } from "../services/comunas";

/**
 * Componente drop-in para Región/Comuna (CL)
 * - No afecta los demás campos
 * - Carga comunas filtradas cada vez que cambia la región
 *
 * Props:
 *  value: { regionId: number|null|string, comunaCodigo: string }
 *  onChange: (next: { regionId, comunaCodigo }) => void
 *  disabled?: boolean
 *  className?: string
 */
export default function RegionComunaPicker({
  value = { regionId: "", comunaCodigo: "" },
  onChange,
  disabled = false,
  className = "",
}) {
  const [regionId, setRegionId] = useState(value.regionId ?? "");
  const [comunas, setComunas] = useState([]);
  const [comunaCodigo, setComunaCodigo] = useState(value.comunaCodigo ?? "");

  // IDs oficiales (1..16). Ajusta nombres si quieres.
  const REGIONES = useMemo(
    () => [
      { id: 1, nombre: "Tarapacá" },
      { id: 2, nombre: "Antofagasta" },
      { id: 3, nombre: "Atacama" },
      { id: 4, nombre: "Coquimbo" },
      { id: 5, nombre: "Valparaíso" },
      { id: 6, nombre: "O'Higgins" },
      { id: 7, nombre: "Maule" },
      { id: 8, nombre: "Ñuble" },
      { id: 9, nombre: "Biobío" },
      { id: 10, nombre: "La Araucanía" },
      { id: 11, nombre: "Los Ríos" },
      { id: 12, nombre: "Los Lagos" },
      { id: 13, nombre: "Metropolitana" },
      { id: 14, nombre: "Aysén" },
      { id: 15, nombre: "Magallanes" },
      { id: 16, nombre: "Arica y Parinacota" },
    ],
    []
  );

  // Carga comunas cuando cambia la región
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const rid = Number(regionId);
      if (!Number.isFinite(rid)) {
        setComunas([]);
        setComunaCodigo("");
        onChange?.({ regionId: "", comunaCodigo: "" });
        return;
      }

      const data = await fetchComunasByRegion(rid);
      if (cancelled) return;

      setComunas(data);
      setComunaCodigo(""); // reset al cambiar región
      onChange?.({ regionId: rid, comunaCodigo: "" });
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionId]);

  const handleRegion = (e) => {
    const v = e.target.value; // string del <select>
    setRegionId(v === "" ? "" : Number(v));
  };

  const handleComuna = (e) => {
    const v = e.target.value;
    setComunaCodigo(v);
    onChange?.({ regionId: regionId === "" ? null : Number(regionId), comunaCodigo: v });
  };

  return (
    <div className={className}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Región</span>
          <select
            value={regionId === "" ? "" : Number(regionId)}
            onChange={handleRegion}
            disabled={disabled}
            className="border rounded px-2 py-1"
          >
            <option value="">Seleccione...</option>
            {REGIONES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Comuna</span>
          <select
            value={comunaCodigo}
            onChange={handleComuna}
            disabled={disabled || !comunas.length}
            className="border rounded px-2 py-1"
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
    </div>
  );
}
