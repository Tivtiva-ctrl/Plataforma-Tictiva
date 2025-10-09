// src/components/PersonalesForm.jsx
// -------------------------------------------------------------
// PersonalesForm - Versión completa con Región/Comuna corregidos
// - Aislado: no rompe el resto de la ficha
// - Usa supabase-js (evita construir URLs manuales)
// - Convierte regionId a Number para coincidir con region_id (integer)
// - Resetea comuna al cambiar región
// -------------------------------------------------------------

import React from "react";
import { supabase } from "../lib/supabase";

/* =======================
   Subcomponente aislado
   ======================= */
function RegionComunaPicker({
  value = { regionId: "", comunaCodigo: "" },
  onChange,
  disabled = false,
}) {
  const [regionId, setRegionId] = React.useState(value.regionId ?? "");
  const [comunas, setComunas] = React.useState([]);
  const [comunaCodigo, setComunaCodigo] = React.useState(
    value.comunaCodigo ?? ""
  );

  // IDs oficiales 1..16 (ajusta nombres si quieres)
  const REGIONES = React.useMemo(
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

  // Sincroniza valor entrante si cambia desde el padre (editar ficha existente)
  React.useEffect(() => {
    setRegionId(value?.regionId ?? "");
    setComunaCodigo(value?.comunaCodigo ?? "");
  }, [value?.regionId, value?.comunaCodigo]);

  // Carga comunas cuando cambia la región (filtro en DB)
  React.useEffect(() => {
    let cancelled = false;

    async function load() {
      const rid = Number(regionId);
      if (!Number.isFinite(rid)) {
        setComunas([]);
        setComunaCodigo("");
        onChange?.({ regionId: "", comunaCodigo: "" });
        return;
      }

      const { data, error } = await supabase
        .from("import_cl_comunas") // usa "public.import_cl_comunas" si tu tabla no está en 'public'
        .select("codigo,nombre,region_id")
        .eq("region_id", rid)
        .order("nombre", { ascending: true });

      if (cancelled) return;

      if (error) {
        console.error("[RegionComunaPicker] error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        setComunas([]);
        setComunaCodigo("");
        onChange?.({ regionId: rid, comunaCodigo: "" });
        return;
      }

      setComunas(data ?? []);
      setComunaCodigo(""); // reset al cambiar región
      onChange?.({ regionId: rid, comunaCodigo: "" });
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionId]);

  const handleRegion = (e) => {
    const v = e.target.value; // string del select
    setRegionId(v === "" ? "" : Number(v)); // guarda Number, o "" si vacío
  };

  const handleComuna = (e) => {
    const v = e.target.value;
    setComunaCodigo(v);
    onChange?.({
      regionId: regionId === "" ? null : Number(regionId),
      comunaCodigo: v,
    });
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {/* Región */}
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

      {/* Comuna */}
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
  );
}

/* =======================
   Form principal
   ======================= */
export default function PersonalesForm({
  empleado = {},
  onChange, // callback opcional para “levantar” el estado al padre
  disabled = false,
}) {
  // Estado único del formulario (agrega aquí todos tus campos reales)
  const [form, setForm] = React.useState({
    // Identificación
    rut: empleado?.rut ?? "",
    nombres: empleado?.nombres ?? "",
    apellidos: empleado?.apellidos ?? "",

    // Contacto / dirección
    email: empleado?.email ?? "",
    telefono: empleado?.telefono ?? "",
    direccion: empleado?.direccion ?? "",

    // Región / Comuna (los importantes aquí)
    regionId: empleado?.regionId ?? "",
    comunaCodigo: empleado?.comunaCodigo ?? "",
  });

  // Si “empleado” cambia desde afuera (ej: cambiar de ficha), sincroniza
  React.useEffect(() => {
    setForm((prev) => ({
      ...prev,
      rut: empleado?.rut ?? "",
      nombres: empleado?.nombres ?? "",
      apellidos: empleado?.apellidos ?? "",
      email: empleado?.email ?? "",
      telefono: empleado?.telefono ?? "",
      direccion: empleado?.direccion ?? "",
      regionId: empleado?.regionId ?? "",
      comunaCodigo: empleado?.comunaCodigo ?? "",
    }));
  }, [
    empleado?.rut,
    empleado?.nombres,
    empleado?.apellidos,
    empleado?.email,
    empleado?.telefono,
    empleado?.direccion,
    empleado?.regionId,
    empleado?.comunaCodigo,
  ]);

  // Helper para actualizar campo + notificar al padre
  const setField = (k, v) => {
    const next = { ...form, [k]: v };
    setForm(next);
    onChange?.(next);
  };

  return (
    <div className="grid gap-6">
      {/* ====== Identificación ====== */}
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">RUT</span>
          <input
            type="text"
            className="border rounded px-2 py-1"
            value={form.rut}
            onChange={(e) => setField("rut", e.target.value)}
            disabled={disabled}
            placeholder="11.111.111-1"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Nombres</span>
          <input
            type="text"
            className="border rounded px-2 py-1"
            value={form.nombres}
            onChange={(e) => setField("nombres", e.target.value)}
            disabled={disabled}
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Apellidos</span>
          <input
            type="text"
            className="border rounded px-2 py-1"
            value={form.apellidos}
            onChange={(e) => setField("apellidos", e.target.value)}
            disabled={disabled}
          />
        </label>
      </div>

      {/* ====== Contacto ====== */}
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Email</span>
          <input
            type="email"
            className="border rounded px-2 py-1"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            disabled={disabled}
            placeholder="correo@empresa.com"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-gray-600">Teléfono</span>
          <input
            type="tel"
            className="border rounded px-2 py-1"
            value={form.telefono}
            onChange={(e) => setField("telefono", e.target.value)}
            disabled={disabled}
            placeholder="+56 9 1234 5678"
          />
        </label>

        <label className="flex flex-col gap-1 sm:col-span-1">
          <span className="text-sm text-gray-600">Dirección</span>
          <input
            type="text"
            className="border rounded px-2 py-1"
            value={form.direccion}
            onChange={(e) => setField("direccion", e.target.value)}
            disabled={disabled}
            placeholder="Calle 123, depto 45"
          />
        </label>
      </div>

      {/* ====== Región y Comuna (corregidos) ====== */}
      <RegionComunaPicker
        value={{ regionId: form.regionId, comunaCodigo: form.comunaCodigo }}
        onChange={({ regionId, comunaCodigo }) => {
          setField("regionId", regionId);
          setField("comunaCodigo", comunaCodigo);
        }}
        disabled={disabled}
      />

      {/* Aquí puedes dejar el resto de secciones/inputs de tu ficha tal cual */}
    </div>
  );
}
