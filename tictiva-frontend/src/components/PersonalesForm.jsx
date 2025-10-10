// src/components/PersonalesForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

/** Mapa: id de tu cl_regiones -> id oficial usado por cl_comunas */
const FIX_REGION_ID = {
  1: 15,  // Arica y Parinacota
  2: 1,   // Tarapacá
  3: 2,   // Antofagasta
  4: 3,   // Atacama
  5: 4,   // Coquimbo
  6: 5,   // Valparaíso
  7: 13,  // Metropolitana
  8: 6,   // O'Higgins
  9: 7,   // Maule
  10: 8,  // Biobío
  11: 9,  // La Araucanía
  12: 10, // Los Lagos
  13: 12, // Magallanes
  14: 14, // Los Ríos
  15: 11, // Aysén
  16: 16, // Ñuble
};

/** Mapa inverso: id oficial -> id de tu cl_regiones (para mostrar correcto en el select) */
const INV_FIX_REGION_ID = Object.entries(FIX_REGION_ID).reduce((acc, [localId, oficialId]) => {
  acc[Number(oficialId)] = Number(localId);
  return acc;
}, {});

const asInt = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

function toYMD(d) {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "";
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const da = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

export default function PersonalesForm({ employee, onCancel, onSaved }) {
  // catálogos
  const [regiones, setRegiones] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [estadosCivil, setEstadosCivil] = useState([]);
  const [nacionalidades, setNacionalidades] = useState([]);

  // estado del form
  const [form, setForm] = useState(() => {
    // employee.region_id viene guardado con ID OFICIAL → convertir a ID LOCAL para el select
    const oficialRid = asInt(employee?.region_id);
    const localRid = oficialRid == null ? null : (INV_FIX_REGION_ID[oficialRid] ?? oficialRid);

    return {
      nombre: employee?.nombre ?? employee?.nombres ?? "",
      apellido: employee?.apellido ?? employee?.apellidos ?? "",
      rut: employee?.rut ?? "",
      cargo: employee?.cargo ?? "",
      genero: employee?.genero ?? "O",
      discapacidad: !!employee?.discapacidad,
      activo: employee?.activo ?? true,

      fecha_nacimiento: toYMD(employee?.fecha_nacimiento) || "",
      direccion: employee?.direccion ?? "",

      region_id: localRid,                  // ← ahora el select muestra la región correcta
      comuna_id: asInt(employee?.comuna_id),

      telefono_movil: employee?.telefono_movil ?? "",
      telefono_fijo: employee?.telefono_fijo ?? "",
      email_personal: employee?.email_personal ?? "",
      email_corporativo: employee?.email_corporativo ?? "",

      estado_civil_id: asInt(employee?.estado_civil_id),
      nacionalidad_id: asInt(employee?.nacionalidad_id),

      pais_residencia: employee?.pais_residencia ?? "",
      idioma_preferido: employee?.idioma_preferido ?? "",
      pronombres: employee?.pronombres ?? "",
    };
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Carga catálogos base
  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const [rRes, ecRes, nRes] = await Promise.all([
          supabase.from("cl_regiones").select("id,nombre").order("id", { ascending: true }),
          supabase.from("catalog_estado_civil").select("id,nombre").order("id", { ascending: true }),
          supabase.from("catalog_nacionalidades").select("id,nombre").order("nombre", { ascending: true }),
        ]);
        if (canceled) return;
        setRegiones(rRes.data || []);
        setEstadosCivil(ecRes.data || []);
        setNacionalidades(nRes.data || []);

        // Cargar comunas con el ID LOCAL inicial (ya convertido arriba)
        const ridLocal = asInt((employee && (INV_FIX_REGION_ID[asInt(employee.region_id)] ?? asInt(employee.region_id))) ?? form.region_id);
        if (ridLocal) await loadComunas(ridLocal);
      } catch (err) {
        console.error("Error cargando catálogos:", err);
      }
    })();
    return () => { canceled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cargar comunas por región (aplicando FIX_REGION_ID)
  const loadComunas = async (regionIdRaw) => {
    const regionId = Number(regionIdRaw);
    if (!Number.isFinite(regionId)) {
      setComunas([]);
      return [];
    }
    const regionIdFixed = FIX_REGION_ID[regionId] ?? regionId; // LOCAL -> OFICIAL
    try {
      const { data, error } = await supabase
        .from("cl_comunas")
        .select("id,nombre,region_id")
        .eq("region_id", regionIdFixed)
        .order("nombre", { ascending: true });
      if (error) {
        console.error("Error fetch comunas:", error);
        setComunas([]);
        return [];
      }
      setComunas(data || []);
      return data || [];
    } catch (e) {
      console.error("Excepción loadComunas:", e);
      setComunas([]);
      return [];
    }
  };

  // Recarga comunas cuando cambia la región (desde el select: ID LOCAL)
  useEffect(() => {
    let canceled = false;
    (async () => {
      const ridLocal = asInt(form.region_id);
      if (!ridLocal) {
        setComunas([]);
        setForm((s) => ({ ...s, comuna_id: null }));
        return;
      }
      const data = await loadComunas(ridLocal);
      if (canceled) return;
      if (
        form.comuna_id &&
        Array.isArray(data) &&
        data.length > 0 &&
        !data.some((c) => c.id === form.comuna_id)
      ) {
        setForm((s) => ({ ...s, comuna_id: null }));
      }
    })();
    return () => { canceled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.region_id]);

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  // validación mínima
  const validate = () => {
    const e = {};
    if (!form.nombre?.trim()) e.nombre = "Obligatorio";
    if (!form.apellido?.trim()) e.apellido = "Obligatorio";
    if (!form.rut?.trim()) e.rut = "Obligatorio";
    if (form.comuna_id && !form.region_id) e.region_id = "Selecciona región para esa comuna";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const payload = useMemo(() => {
    const base = {
      nombre: form.nombre?.trim() || null,
      apellido: form.apellido?.trim() || null,
      rut: form.rut?.trim() || null,
      cargo: form.cargo?.trim() || null,
      genero: form.genero || "O",
      discapacidad: !!form.discapacidad,
      activo: !!form.activo,

      fecha_nacimiento: form.fecha_nacimiento || null,
      direccion: form.direccion?.trim() || null,

      // Guardar con ID OFICIAL (alineado a cl_comunas.region_id)
      region_id: (() => {
        const ridLocal = asInt(form.region_id);
        return ridLocal == null ? null : (FIX_REGION_ID[ridLocal] ?? ridLocal);
      })(),

      comuna_id: asInt(form.comuna_id), // INT (id de cl_comunas)

      telefono_movil: form.telefono_movil?.trim() || null,
      telefono_fijo: form.telefono_fijo?.trim() || null,
      email_personal: form.email_personal?.trim() || null,
      email_corporativo: form.email_corporativo?.trim() || null,

      estado_civil_id: asInt(form.estado_civil_id),
      nacionalidad_id: asInt(form.nacionalidad_id),

      pais_residencia: form.pais_residencia?.trim() || null,
      idioma_preferido: form.idioma_preferido?.trim() || null,
      pronombres: form.pronombres?.trim() || null,
    };
    return { ...base, nombres: base.nombre, apellidos: base.apellido };
  }, [form]);

  const save = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("employees")
        .update(payload)
        .eq("id", employee?.id)
        .select("*")
        .single();
      if (error) {
        console.error("Save error:", error);
        alert(error.message || "No se pudo guardar.");
      } else {
        onSaved?.(data);
      }
    } catch (err) {
      console.error("Excepción guardar:", err);
      alert("Error inesperado guardando.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="ef-card p20" style={{ marginTop: 12 }}>
      <h3 className="ef-block-title">Editar Información Personal</h3>

      <div className="form-grid">
        {/* Nombre / Apellido */}
        <div className="form-field">
          <label>Nombres *</label>
          <input
            value={form.nombre}
            onChange={(e) => setField("nombre", e.target.value)}
          />
          {errors.nombre && <div className="form-error">{errors.nombre}</div>}
        </div>

        <div className="form-field">
          <label>Apellidos *</label>
          <input
            value={form.apellido}
            onChange={(e) => setField("apellido", e.target.value)}
          />
          {errors.apellido && <div className="form-error">{errors.apellido}</div>}
        </div>

        {/* RUT / Cargo */}
        <div className="form-field">
          <label>RUT *</label>
          <input
            value={form.rut}
            onChange={(e) => setField("rut", e.target.value)}
          />
          {errors.rut && <div className="form-error">{errors.rut}</div>}
        </div>

        <div className="form-field">
          <label>Cargo</label>
          <input
            value={form.cargo}
            onChange={(e) => setField("cargo", e.target.value)}
          />
        </div>

        {/* Región / Comuna */}
        <div className="form-field">
          <label>Región</label>
          <select
            value={form.region_id ?? ""}
            onChange={(e) => {
              const val = asInt(e.target.value);
              setField("region_id", val);
              setField("comuna_id", null);
            }}
          >
            <option value="">— Selecciona región —</option>
            {regiones.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
          {errors.region_id && <div className="form-error">{errors.region_id}</div>}
        </div>

        <div className="form-field">
          <label>Comuna</label>
          <select
            value={form.comuna_id ?? ""}
            onChange={(e) => setField("comuna_id", asInt(e.target.value))}
            disabled={!form.region_id || comunas.length === 0}
          >
            <option value="">
              {form.region_id ? "— Selecciona comuna —" : "Selecciona región primero"}
            </option>
            {comunas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Otros campos */}
        <div className="form-field">
          <label>Teléfono móvil</label>
          <input
            value={form.telefono_movil}
            onChange={(e) => setField("telefono_movil", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Teléfono fijo</label>
          <input
            value={form.telefono_fijo}
            onChange={(e) => setField("telefono_fijo", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Email personal</label>
          <input
            type="email"
            value={form.email_personal}
            onChange={(e) => setField("email_personal", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Email corporativo</label>
          <input
            type="email"
            value={form.email_corporativo}
            onChange={(e) => setField("email_corporativo", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Nacionalidad</label>
          <select
            value={form.nacionalidad_id ?? ""}
            onChange={(e) => setField("nacionalidad_id", asInt(e.target.value))}
          >
            <option value="">— Selecciona nacionalidad —</option>
            {nacionalidades.map((n) => (
              <option key={n.id} value={n.id}>
                {n.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Estado civil</label>
          <select
            value={form.estado_civil_id ?? ""}
            onChange={(e) => setField("estado_civil_id", asInt(e.target.value))}
          >
            <option value="">— Selecciona estado civil —</option>
            {estadosCivil.map((ec) => (
              <option key={ec.id} value={ec.id}>
                {ec.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="form-col-2" />
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="lf-btn lf-btn-ghost"
          onClick={onCancel}
          disabled={saving}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="lf-btn lf-btn-primary"
          disabled={saving}
        >
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
