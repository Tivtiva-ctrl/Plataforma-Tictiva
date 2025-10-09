// src/components/PersonalesForm.jsx
// -------------------------------------------------------------
// Ficha > Personales (UI como la maqueta) + Región/Comuna OK
// - Diseño: card redondeada, grid, labels arriba, inputs consistentes
// - Lógica: consulta comunas filtradas por region_id (int) en Supabase
// - API: usa supabase-js (evita armar URLs manuales)
// - Props esperadas:
//     empleado: objeto con datos iniciales
//     onSave(form): callback al guardar
//     onCancel(): callback al cancelar
//     disabled?: deshabilitar inputs
// -------------------------------------------------------------

import React from "react";
import { supabase } from "../lib/supabase";

/* ============================================================
   Subcomponente: RegionComunaPicker (aislado + estilizado)
   ============================================================ */
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

  // IDs oficiales 1..16
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

  // sincroniza cuando edites otra ficha
  React.useEffect(() => {
    setRegionId(value?.regionId ?? "");
    setComunaCodigo(value?.comunaCodigo ?? "");
  }, [value?.regionId, value?.comunaCodigo]);

  // trae comunas filtradas por región
  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      const rid = Number(regionId);
      if (!Number.isFinite(rid)) {
        setComunas([]);
        setComunaCodigo("");
        onChange?.({ regionId: "", comunaCodigo: "" });
        return;
      }

      const { data, error } = await supabase
        .from("import_cl_comunas")
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
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionId]);

  const handleRegion = (e) => {
    const v = e.target.value;
    setRegionId(v === "" ? "" : Number(v));
  };

  const handleComuna = (e) => {
    const v = e.target.value;
    setComunaCodigo(v);
    onChange?.({
      regionId: regionId === "" ? null : Number(regionId),
      comunaCodigo: v,
    });
  };

  const baseInput =
    "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[15px] outline-none " +
    "focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition";

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="block text-sm text-slate-600 mb-1">Región</label>
        <select
          value={regionId === "" ? "" : Number(regionId)}
          onChange={handleRegion}
          disabled={disabled}
          className={baseInput}
        >
          <option value="">Selecciona región…</option>
          {REGIONES.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-slate-600 mb-1">Comuna</label>
        <select
          value={comunaCodigo}
          onChange={handleComuna}
          disabled={disabled || !comunas.length}
          className={baseInput}
        >
          <option value="">— Selecciona comuna —</option>
          {comunas.map((c) => (
            <option key={c.codigo} value={c.codigo}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/* ============================================================
   Form principal
   ============================================================ */
export default function PersonalesForm({
  empleado = {},
  onSave,
  onCancel,
  disabled = false,
}) {
  // Estado del formulario (agrega o renombra campos según tu modelo)
  const [form, setForm] = React.useState({
    // básicos
    nombres: empleado?.nombres ?? "",
    apellidos: empleado?.apellidos ?? "",
    rut: empleado?.rut ?? "",
    cargo: empleado?.cargo ?? "",

    // contacto
    telefonoMovil: empleado?.telefonoMovil ?? "",
    telefonoFijo: empleado?.telefonoFijo ?? "",
    emailPersonal: empleado?.emailPersonal ?? "",
    emailCorporativo: empleado?.emailCorporativo ?? "",
    direccion: empleado?.direccion ?? "",

    // ubic
    regionId: empleado?.regionId ?? "",
    comunaCodigo: empleado?.comunaCodigo ?? "",

    // otros (demo para que se vea como tu captura)
    nacionalidad: empleado?.nacionalidad ?? "Chile",
    estadoCivil: empleado?.estadoCivil ?? "Soltero/a",
  });

  // si cambia de ficha, sincroniza
  React.useEffect(() => {
    setForm((prev) => ({
      ...prev,
      nombres: empleado?.nombres ?? "",
      apellidos: empleado?.apellidos ?? "",
      rut: empleado?.rut ?? "",
      cargo: empleado?.cargo ?? "",
      telefonoMovil: empleado?.telefonoMovil ?? "",
      telefonoFijo: empleado?.telefonoFijo ?? "",
      emailPersonal: empleado?.emailPersonal ?? "",
      emailCorporativo: empleado?.emailCorporativo ?? "",
      direccion: empleado?.direccion ?? "",
      regionId: empleado?.regionId ?? "",
      comunaCodigo: empleado?.comunaCodigo ?? "",
      nacionalidad: empleado?.nacionalidad ?? "Chile",
      estadoCivil: empleado?.estadoCivil ?? "Soltero/a",
    }));
  }, [empleado]);

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const baseInput =
    "w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[15px] outline-none " +
    "focus:ring-4 focus:ring-violet-100 focus:border-violet-400 transition";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave?.(form);
      }}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 md:p-6"
    >
      <h3 className="text-[18px] font-semibold text-slate-800 mb-4">
        Editar Información Personal
      </h3>

      {/* Nombres / Apellidos */}
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm text-slate-600 mb-1">Nombres *</label>
          <input
            className={baseInput}
            value={form.nombres}
            onChange={(e) => setField("nombres", e.target.value)}
            disabled={disabled}
            required
            placeholder="Eva"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Apellidos *</label>
          <input
            className={baseInput}
            value={form.apellidos}
            onChange={(e) => setField("apellidos", e.target.value)}
            disabled={disabled}
            required
            placeholder="Green"
          />
        </div>
      </div>

      {/* RUT / Cargo */}
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <div>
          <label className="block text-sm text-slate-600 mb-1">RUT *</label>
          <input
            className={baseInput}
            value={form.rut}
            onChange={(e) => setField("rut", e.target.value)}
            disabled={disabled}
            placeholder="11.111.111-1"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Cargo</label>
          <input
            className={baseInput}
            value={form.cargo}
            onChange={(e) => setField("cargo", e.target.value)}
            disabled={disabled}
            placeholder="Tester Lead"
          />
        </div>
      </div>

      {/* Región / Comuna */}
      <div className="mt-4">
        <RegionComunaPicker
          value={{ regionId: form.regionId, comunaCodigo: form.comunaCodigo }}
          onChange={({ regionId, comunaCodigo }) => {
            setField("regionId", regionId);
            setField("comunaCodigo", comunaCodigo);
          }}
          disabled={disabled}
        />
      </div>

      {/* Teléfonos */}
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <div>
          <label className="block text-sm text-slate-600 mb-1">
            Teléfono móvil
          </label>
        <input
            className={baseInput}
            value={form.telefonoMovil}
            onChange={(e) => setField("telefonoMovil", e.target.value)}
            disabled={disabled}
            placeholder="+56 9 1234 5678"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">
            Teléfono fijo
          </label>
          <input
            className={baseInput}
            value={form.telefonoFijo}
            onChange={(e) => setField("telefonoFijo", e.target.value)}
            disabled={disabled}
            placeholder=""
          />
        </div>
      </div>

      {/* Emails */}
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <div>
          <label className="block text-sm text-slate-600 mb-1">
            Email personal
          </label>
          <input
            className={baseInput}
            type="email"
            value={form.emailPersonal}
            onChange={(e) => setField("emailPersonal", e.target.value)}
            disabled={disabled}
            placeholder="correo@ejemplo.com"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">
            Email corporativo
          </label>
          <input
            className={baseInput}
            type="email"
            value={form.emailCorporativo}
            onChange={(e) => setField("emailCorporativo", e.target.value)}
            disabled={disabled}
            placeholder="nombre@empresa.com"
          />
        </div>
      </div>

      {/* Dirección */}
      <div className="mt-4">
        <label className="block text-sm text-slate-600 mb-1">Dirección</label>
        <input
          className={baseInput}
          value={form.direccion}
          onChange={(e) => setField("direccion", e.target.value)}
          disabled={disabled}
          placeholder="Calle 123, depto 45"
        />
      </div>

      {/* Nacionalidad / Estado civil (decorativos para el layout de tu captura) */}
      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <div>
          <label className="block text-sm text-slate-600 mb-1">Nacionalidad</label>
          <select
            className={baseInput}
            value={form.nacionalidad}
            onChange={(e) => setField("nacionalidad", e.target.value)}
            disabled={disabled}
          >
            {["Chile","Argentina","Uruguay","Perú","Colombia","Venezuela","Bolivia"].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Estado civil</label>
          <select
            className={baseInput}
            value={form.estadoCivil}
            onChange={(e) => setField("estadoCivil", e.target.value)}
            disabled={disabled}
          >
            {["Soltero/a","Casado/a","Divorciado/a","Viudo/a","Conviviente"].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Acciones */}
      <div className="mt-6 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => onCancel?.()}
          className="h-10 px-4 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="h-10 px-5 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-medium shadow-sm hover:shadow transition"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
