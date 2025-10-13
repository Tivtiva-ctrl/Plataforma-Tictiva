// src/components/PersonalesForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import "../styles/personales.css";

/** Mapa: id de tu cl_regiones -> id oficial usado por cl_comunas */
const FIX_REGION_ID = {
  1: 1,  2: 2,  3: 3,  4: 4,  5: 5,  6: 6,  7: 7,  8: 8,
  9: 9, 10:10, 11:11, 12:12, 13:13, 14:14, 15:15, 16:16,
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

/**
 * Props esperadas POR EmpleadoFicha.jsx:
 * - initialValues: objeto employees (first_name, last_name, rut, role, region_id, comuna_id, mobile_phone, phone, email_personal, email_corporate, office, schedule, birth_date)
 * - isEditing: boolean → habilita/deshabilita inputs
 * - onSubmit: (payload) => void  (se invoca al submit del form)
 */
export default function PersonalesForm({ initialValues, isEditing, onSubmit }) {
  // catálogos
  const [regiones, setRegiones] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [estadosCivil, setEstadosCivil] = useState([]);
  const [nacionalidades, setNacionalidades] = useState([]);

  // estado del form (usa nombres de columnas reales de employees)
  const [form, setForm] = useState(() => {
    // initialValues.region_id viene guardado con ID OFICIAL → convertir a ID LOCAL para el select
    const oficialRid = asInt(initialValues?.region_id);
    const localRid = oficialRid == null ? null : (INV_FIX_REGION_ID[oficialRid] ?? oficialRid);

    return {
      first_name: initialValues?.first_name ?? "",
      last_name: initialValues?.last_name ?? "",
      rut: initialValues?.rut ?? "",
      role: initialValues?.role ?? "",

      birth_date: toYMD(initialValues?.birth_date) || "",
      address: initialValues?.address ?? "", // por si existiera en tu tabla (no se guarda si no la usas)

      region_id: localRid,                       // ← select usa ID LOCAL
      comuna_id: asInt(initialValues?.comuna_id),

      mobile_phone: initialValues?.mobile_phone ?? "",
      phone: initialValues?.phone ?? "",
      email_personal: initialValues?.email_personal ?? "",
      email_corporate: initialValues?.email_corporate ?? "",

      // catálogos opcionales (si tu tabla employees no los tiene, no se enviarán)
      estado_civil_id: asInt(initialValues?.estado_civil_id),
      nacionalidad_id: asInt(initialValues?.nacionalidad_id),

      // Info rápida
      office: initialValues?.office ?? "",
      schedule: initialValues?.schedule ?? "",
    };
  });

  const [errors, setErrors] = useState({});

  // Si cambian los initialValues (p. ej. tras guardar), rehidrata el form
  useEffect(() => {
    if (!initialValues) return;
    const oficialRid = asInt(initialValues.region_id);
    const localRid = oficialRid == null ? null : (INV_FIX_REGION_ID[oficialRid] ?? oficialRid);
    setForm((prev) => ({
      ...prev,
      first_name: initialValues.first_name ?? "",
      last_name: initialValues.last_name ?? "",
      rut: initialValues.rut ?? "",
      role: initialValues.role ?? "",
      birth_date: toYMD(initialValues.birth_date) || "",
      region_id: localRid,
      comuna_id: asInt(initialValues.comuna_id),
      mobile_phone: initialValues.mobile_phone ?? "",
      phone: initialValues.phone ?? "",
      email_personal: initialValues.email_personal ?? "",
      email_corporate: initialValues.email_corporate ?? "",
      estado_civil_id: asInt(initialValues.estado_civil_id),
      nacionalidad_id: asInt(initialValues.nacionalidad_id),
      office: initialValues.office ?? "",
      schedule: initialValues.schedule ?? "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValues?.id]);

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

        // Si el form ya trae región, carga sus comunas (ID LOCAL)
        const ridLocal = asInt(form.region_id);
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
    if (!form.first_name?.trim()) e.first_name = "Obligatorio";
    if (!form.last_name?.trim()) e.last_name = "Obligatorio";
    if (!form.rut?.trim()) e.rut = "Obligatorio";
    if (form.comuna_id && !form.region_id) e.region_id = "Selecciona región para esa comuna";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // payload con columnas reales de employees (guardando region_id en ID OFICIAL)
  const payload = useMemo(
    () => ({
      first_name: form.first_name?.trim() || null,
      last_name: form.last_name?.trim() || null,
      rut: form.rut?.trim() || null,
      role: form.role?.trim() || null,

      birth_date: form.birth_date || null,

      // Guardar con ID OFICIAL (alineado a cl_comunas.region_id)
      region_id: (() => {
        const ridLocal = asInt(form.region_id);
        return ridLocal == null ? null : (FIX_REGION_ID[ridLocal] ?? ridLocal);
      })(),

      comuna_id: asInt(form.comuna_id),

      mobile_phone: form.mobile_phone?.trim() || null,
      phone: form.phone?.trim() || null,
      email_personal: form.email_personal?.trim() || null,
      email_corporate: form.email_corporate?.trim() || null,

      // Estos dos son los que muestra la card de Info Rápida
      office: form.office?.trim() || null,
      schedule: form.schedule?.trim() || null,

      // Campos opcionales (solo si existen en tu schema; si no, supabase ignorará)
      estado_civil_id: asInt(form.estado_civil_id),
      nacionalidad_id: asInt(form.nacionalidad_id),
    }),
    [form]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit?.(payload);
  };

  return (
    <form id="personales-form" onSubmit={handleSubmit} className="card grandes" style={{ marginTop: 12 }}>
      <h2>Editar Información Personal</h2>

      <div className="form-grid">
        {/* Nombres / Apellidos */}
        <div className="form-field">
          <label>Nombres *</label>
          <input
            value={form.first_name}
            onChange={(e) => setField("first_name", e.target.value)}
            disabled={!isEditing}
          />
          {errors.first_name && <div className="form-error">{errors.first_name}</div>}
        </div>

        <div className="form-field">
          <label>Apellidos *</label>
          <input
            value={form.last_name}
            onChange={(e) => setField("last_name", e.target.value)}
            disabled={!isEditing}
          />
          {errors.last_name && <div className="form-error">{errors.last_name}</div>}
        </div>

        {/* RUT / Cargo */}
        <div className="form-field">
          <label>RUT *</label>
          <input
            value={form.rut}
            onChange={(e) => setField("rut", e.target.value)}
            disabled={!isEditing}
          />
          {errors.rut && <div className="form-error">{errors.rut}</div>}
        </div>

        <div className="form-field">
          <label>Cargo</label>
          <input
            value={form.role}
            onChange={(e) => setField("role", e.target.value)}
            disabled={!isEditing}
          />
        </div>

        {/* Fecha de nacimiento */}
        <div className="form-field">
          <label>Fecha de nacimiento</label>
          <input
            type="date"
            value={form.birth_date || ""}
            onChange={(e) => setField("birth_date", e.target.value)}
            disabled={!isEditing}
            placeholder="aaaa-mm-dd"
          />
          <small className="field-hint">
            Obligatorio para DT. Se usa para calcular “Próx. cumple”.
          </small>
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
              if (val) loadComunas(val);
            }}
            disabled={!isEditing}
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
            disabled={!isEditing || !form.region_id || comunas.length === 0}
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

        {/* Teléfonos */}
        <div className="form-field">
          <label>Teléfono móvil</label>
          <input
            value={form.mobile_phone}
            onChange={(e) => setField("mobile_phone", e.target.value)}
            disabled={!isEditing}
          />
        </div>

        <div className="form-field">
          <label>Teléfono fijo</label>
          <input
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            disabled={!isEditing}
          />
        </div>

        {/* Emails */}
        <div className="form-field">
          <label>Email personal</label>
          <input
            type="email"
            value={form.email_personal}
            onChange={(e) => setField("email_personal", e.target.value)}
            disabled={!isEditing}
          />
        </div>

        <div className="form-field">
          <label>Email corporativo</label>
          <input
            type="email"
            value={form.email_corporate}
            onChange={(e) => setField("email_corporate", e.target.value)}
            disabled={!isEditing}
          />
        </div>

        {/* Oficina / Horario (Info rápida) */}
        <div className="form-field">
          <label>Oficina</label>
          <input
            value={form.office}
            onChange={(e) => setField("office", e.target.value)}
            placeholder="Ej: Santiago Centro"
            disabled={!isEditing}
          />
        </div>

        <div className="form-field">
          <label>Horario</label>
          <input
            value={form.schedule}
            onChange={(e) => setField("schedule", e.target.value)}
            placeholder="Ej: 08:30 - 18:00"
            disabled={!isEditing}
          />
        </div>

        <div className="form-col-2" />
      </div>
      {/* Sin botones internos: los maneja EmpleadoFicha con el único botón de Guardar */}
    </form>
  );
}
