// src/components/PersonalesForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

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
  // Catálogos
  const [regiones, setRegiones] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [estadosCivil, setEstadosCivil] = useState([]);
  const [nacionalidades, setNacionalidades] = useState([]);

  // Carga catálogos de una
  useEffect(() => {
    let cancel = false;
    (async () => {
      const [regRes, ecRes, nacRes] = await Promise.all([
        supabase.from("cl_regiones").select("id, nombre").order("id", { ascending: true }),
        supabase.from("catalog_estado_civil").select("id, nombre").order("id", { ascending: true }),
        supabase.from("catalog_nacionalidades").select("id, nombre").order("nombre", { ascending: true }),
      ]);
      if (cancel) return;
      setRegiones(regRes.data || []);
      setEstadosCivil(ecRes.data || []);
      setNacionalidades(nacRes.data || []);
    })();
    return () => { cancel = true; };
  }, []);

  // Estado del formulario (soporta columnas antiguas y nuevas)
  const [form, setForm] = useState(() => ({
    nombre: employee?.nombre ?? employee?.nombres ?? "",
    apellido: employee?.apellido ?? employee?.apellidos ?? "",
    rut: employee?.rut ?? "",
    cargo: employee?.cargo ?? "",
    genero: employee?.genero ?? "O", // 'M','F','O'
    discapacidad: !!employee?.discapacidad,
    activo: employee?.activo ?? true,

    fecha_nacimiento: toYMD(employee?.fecha_nacimiento) || "",
    direccion: employee?.direccion ?? "",

    region_id: employee?.region_id ?? null,
    comuna_id: employee?.comuna_id ?? null,

    telefono_movil: employee?.telefono_movil ?? "",
    telefono_fijo: employee?.telefono_fijo ?? "",
    email_personal: employee?.email_personal ?? "",
    email_corporativo: employee?.email_corporativo ?? "",

    estado_civil_id: employee?.estado_civil_id ?? null,
    nacionalidad_id: employee?.nacionalidad_id ?? null,

    pais_residencia: employee?.pais_residencia ?? "",
    idioma_preferido: employee?.idioma_preferido ?? "",
    pronombres: employee?.pronombres ?? "",
  }));
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar comunas cuando cambia la región (y al iniciar si viene seteada)
  useEffect(() => {
    let cancel = false;
    const load = async () => {
      if (!form.region_id) {
        setComunas([]);
        // si quitan la región, limpia comuna
        setForm((s) => ({ ...s, comuna_id: null }));
        return;
      }
      const { data } = await supabase
        .from("cl_comunas")
        .select("id, nombre")
        .eq("region_id", form.region_id)
        .order("nombre", { ascending: true });
      if (!cancel) setComunas(data || []);
    };
    load();
    return () => { cancel = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.region_id]);

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  // Validación mínima
  const validate = () => {
    const e = {};
    if (!form.nombre?.trim()) e.nombre = "Obligatorio";
    if (!form.apellido?.trim()) e.apellido = "Obligatorio";
    if (!form.rut?.trim()) e.rut = "Obligatorio";
    // Si hay comuna, debe haber región (el trigger en DB también lo cuida)
    if (form.comuna_id && !form.region_id) e.region_id = "Selecciona región para esa comuna";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Payload a enviar (incluye columnas antiguas y nuevas si existen)
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

      region_id: form.region_id ?? null,
      comuna_id: form.comuna_id ?? null,

      telefono_movil: form.telefono_movil?.trim() || null,
      telefono_fijo: form.telefono_fijo?.trim() || null,
      email_personal: form.email_personal?.trim() || null,
      email_corporativo: form.email_corporativo?.trim() || null,

      estado_civil_id: form.estado_civil_id ?? null,
      nacionalidad_id: form.nacionalidad_id ?? null,

      pais_residencia: form.pais_residencia?.trim() || null,
      idioma_preferido: form.idioma_preferido?.trim() || null,
      pronombres: form.pronombres?.trim() || null,
    };
    // Por compatibilidad con columnas nuevas (si las usas)
    return {
      ...base,
      nombres: base.nombre,
      apellidos: base.apellido,
    };
  }, [form]);

  const save = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    const { data, error } = await supabase
      .from("employees")
      .update(payload)
      .eq("id", employee.id)
      .select("*")
      .single();
    setSaving(false);

    if (error) {
      console.error(error);
      alert(error.message || "No se pudo guardar la ficha.");
      return;
    }
    onSaved?.(data);
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
            onChange={(e) => set("nombre", e.target.value)}
            placeholder="Ej: Eva"
          />
          {errors.nombre && <div className="form-error">{errors.nombre}</div>}
        </div>
        <div className="form-field">
          <label>Apellidos *</label>
          <input
            value={form.apellido}
            onChange={(e) => set("apellido", e.target.value)}
            placeholder="Ej: Green"
          />
          {errors.apellido && <div className="form-error">{errors.apellido}</div>}
        </div>

        {/* RUT / Cargo */}
        <div className="form-field">
          <label>RUT *</label>
          <input
            value={form.rut}
            onChange={(e) => set("rut", e.target.value)}
            placeholder="11.111.111-1"
          />
          {errors.rut && <div className="form-error">{errors.rut}</div>}
        </div>
        <div className="form-field">
          <label>Cargo</label>
          <input
            value={form.cargo}
            onChange={(e) => set("cargo", e.target.value)}
            placeholder="Ej: Tester Lead"
          />
        </div>

        {/* Género / Discapacidad */}
        <div className="form-field">
          <label>Género</label>
          <select
            value={form.genero}
            onChange={(e) => set("genero", e.target.value)}
          >
            <option value="O">Otro/No especifica</option>
            <option value="F">Femenino</option>
            <option value="M">Masculino</option>
          </select>
        </div>
        <div className="form-field">
          <label>Discapacidad</label>
          <div style={{ display: "flex", alignItems: "center", height: 38 }}>
            <input
              type="checkbox"
              checked={form.discapacidad}
              onChange={(e) => set("discapacidad", e.target.checked)}
              style={{ width: 18, height: 18, marginRight: 8 }}
            />
            <span>{form.discapacidad ? "Sí" : "No"}</span>
          </div>
        </div>

        {/* Fecha Nac. / Dirección */}
        <div className="form-field">
          <label>Fecha de nacimiento</label>
          <input
            type="date"
            value={form.fecha_nacimiento}
            onChange={(e) => set("fecha_nacimiento", e.target.value)}
          />
        </div>
        <div className="form-field">
          <label>Dirección</label>
          <input
            value={form.direccion}
            onChange={(e) => set("direccion", e.target.value)}
            placeholder="Calle, número"
          />
        </div>

        {/* Región / Comuna (dependiente) */}
        <div className="form-field">
          <label>Región</label>
          <select
            value={form.region_id ?? ""}
            onChange={(e) => set("region_id", e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">— Selecciona región —</option>
            {regiones.map((r) => (
              <option key={r.id} value={r.id}>{r.nombre}</option>
            ))}
          </select>
          {errors.region_id && <div className="form-error">{errors.region_id}</div>}
        </div>
        <div className="form-field">
          <label>Comuna</label>
          <select
            value={form.comuna_id ?? ""}
            onChange={(e) => set("comuna_id", e.target.value ? Number(e.target.value) : null)}
            disabled={!form.region_id}
          >
            <option value="">{form.region_id ? "— Selecciona comuna —" : "Selecciona región primero"}</option>
            {comunas.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>

        {/* Teléfonos */}
        <div className="form-field">
          <label>Teléfono móvil</label>
          <input
            value={form.telefono_movil}
            onChange={(e) => set("telefono_movil", e.target.value)}
            placeholder="+56 9 ...."
          />
        </div>
        <div className="form-field">
          <label>Teléfono fijo</label>
          <input
            value={form.telefono_fijo}
            onChange={(e) => set("telefono_fijo", e.target.value)}
          />
        </div>

        {/* Emails */}
        <div className="form-field">
          <label>Email personal</label>
          <input
            type="email"
            value={form.email_personal}
            onChange={(e) => set("email_personal", e.target.value)}
            placeholder="nombre@correo.com"
          />
        </div>
        <div className="form-field">
          <label>Email corporativo</label>
          <input
            type="email"
            value={form.email_corporativo}
            onChange={(e) => set("email_corporativo", e.target.value)}
            placeholder="nombre@empresa.com"
          />
        </div>

        {/* Nacionalidad / Estado Civil */}
        <div className="form-field">
          <label>Nacionalidad</label>
          <select
            value={form.nacionalidad_id ?? ""}
            onChange={(e) => set("nacionalidad_id", e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">— Selecciona nacionalidad —</option>
            {nacionalidades.map((n) => (
              <option key={n.id} value={n.id}>{n.nombre}</option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label>Estado civil</label>
          <select
            value={form.estado_civil_id ?? ""}
            onChange={(e) => set("estado_civil_id", e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">— Selecciona estado civil —</option>
            {estadosCivil.map((ec) => (
              <option key={ec.id} value={ec.id}>{ec.nombre}</option>
            ))}
          </select>
        </div>

        {/* Extras */}
        <div className="form-field">
          <label>País de residencia</label>
          <input
            value={form.pais_residencia}
            onChange={(e) => set("pais_residencia", e.target.value)}
          />
        </div>
        <div className="form-field">
          <label>Idioma preferido</label>
          <input
            value={form.idioma_preferido}
            onChange={(e) => set("idioma_preferido", e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Pronombres</label>
          <input
            value={form.pronombres}
            onChange={(e) => set("pronombres", e.target.value)}
            placeholder="él/ella/elle"
          />
        </div>

        {/* Estado activo */}
        <div className="form-field">
          <label>Estado</label>
          <select
            value={form.activo ? "1" : "0"}
            onChange={(e) => set("activo", e.target.value === "1")}
          >
            <option value="1">Activo</option>
            <option value="0">Inactivo</option>
          </select>
        </div>

        {/* Full row (espaciador opcional) */}
        <div className="form-col-2" />
      </div>

      <div className="form-actions">
        <button type="button" className="lf-btn lf-btn-ghost" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
        <button type="submit" className="lf-btn lf-btn-primary" disabled={saving}>
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
