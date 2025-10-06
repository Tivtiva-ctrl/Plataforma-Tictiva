// src/components/PersonalesForm.jsx
import React, { useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  validaRut, isEmail, isPhoneCL, isPastDate, isAdult,
  required, compose
} from "../utils/validators";

export default function PersonalesForm({ employee, onCancel, onSaved }) {
  const [form, setForm] = useState({
    rut: employee.rut || "",
    nombre: employee.nombre || "",
    apellido: employee.apellido || "",
    fecha_nacimiento: employee.fecha_nacimiento || "",
    nacionalidad_id: employee.nacionalidad_id || "",
    sexo_legal: employee.sexo_legal || "",
    estado_civil_id: employee.estado_civil_id || "",
    direccion: employee.direccion || "",
    region_id: employee.region_id || "",
    comuna_id: employee.comuna_id || "",
    telefono_movil: employee.telefono_movil || "",
    email_personal: employee.email_personal || "",
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Catálogos de ejemplo (reemplaza por fetch real)
  const nacionalidades = useMemo(() => [{id:1,nombre:"Chile"},{id:2,nombre:"Argentina"}],[]);
  const estadosCiviles = useMemo(() => [{id:1,nombre:"Soltero"},{id:2,nombre:"Casado"}],[]);
  const regiones = useMemo(() => [{id:1,nombre:"Metropolitana"}],[]);
  const comunas = useMemo(() => [{id:1,region_id:1,nombre:"Santiago Centro"}],[]);

  const validators = {
    rut: (v) => required(v) || (validaRut(v) ? null : "RUT inválido"),
    nombre: required,
    apellido: required,
    fecha_nacimiento: (v) =>
      required(v) || (!isPastDate(v) ? "Fecha futura no válida" : !isAdult(v, 15) ? "Menor de edad (≤14)" : null),
    nacionalidad_id: required,
    sexo_legal: compose(required, (v) => (["M","F","O"].includes(v) ? null : "Valor inválido")),
    estado_civil_id: required,
    direccion: required,
    region_id: required,
    comuna_id: required,
    telefono_movil: (v) => (v ? (isPhoneCL(v) ? null : "Teléfono CL inválido") : null),
    email_personal: (v) => (v ? (isEmail(v) ? null : "Email inválido") : null),
  };

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const validateAll = () => {
    const e = {};
    for (const [k, fn] of Object.entries(validators)) {
      const err = fn(form[k]);
      if (err) e[k] = err;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async (ev) => {
    ev.preventDefault();
    if (!validateAll()) return;
    setSaving(true);
    const patch = { ...form };
    // normalizaciones simples
    patch.sexo_legal = (patch.sexo_legal || "").toUpperCase();

    const { data, error } = await supabase
      .from("employees")
      .update(patch)
      .eq("id", employee.id)
      .select("*")
      .single();

    setSaving(false);
    if (error) {
      console.error(error);
      alert("No pudimos guardar los cambios");
      return;
    }
    onSaved?.(data);
  };

  const errorMsg = (k) => errors[k] ? <div className="form-error">{errors[k]}</div> : null;

  return (
    <form onSubmit={save} className="ef-card p20" style={{marginTop:12}}>
      <h3 className="ef-block-title">Editar Información Personal</h3>

      <div className="form-grid">
        <div className="form-field">
          <label>RUT *</label>
          <input value={form.rut} onChange={(e)=>set("rut", e.target.value)} />
          {errorMsg("rut")}
        </div>

        <div className="form-field">
          <label>Nombres *</label>
          <input value={form.nombre} onChange={(e)=>set("nombre", e.target.value)} />
          {errorMsg("nombre")}
        </div>

        <div className="form-field">
          <label>Apellidos *</label>
          <input value={form.apellido} onChange={(e)=>set("apellido", e.target.value)} />
          {errorMsg("apellido")}
        </div>

        <div className="form-field">
          <label>Fecha de nacimiento *</label>
          <input type="date" value={form.fecha_nacimiento || ""} onChange={(e)=>set("fecha_nacimiento", e.target.value)} />
          {errorMsg("fecha_nacimiento")}
        </div>

        <div className="form-field">
          <label>Nacionalidad *</label>
          <select value={form.nacionalidad_id} onChange={(e)=>set("nacionalidad_id", Number(e.target.value))}>
            <option value="">Selecciona…</option>
            {nacionalidades.map(n=> <option key={n.id} value={n.id}>{n.nombre}</option>)}
          </select>
          {errorMsg("nacionalidad_id")}
        </div>

        <div className="form-field">
          <label>Sexo/Género legal *</label>
          <select value={form.sexo_legal} onChange={(e)=>set("sexo_legal", e.target.value)}>
            <option value="">Selecciona…</option>
            <option value="F">Femenino</option>
            <option value="M">Masculino</option>
            <option value="O">Otro</option>
          </select>
          {errorMsg("sexo_legal")}
        </div>

        <div className="form-field">
          <label>Estado civil *</label>
          <select value={form.estado_civil_id} onChange={(e)=>set("estado_civil_id", Number(e.target.value))}>
            <option value="">Selecciona…</option>
            {estadosCiviles.map(n=> <option key={n.id} value={n.id}>{n.nombre}</option>)}
          </select>
          {errorMsg("estado_civil_id")}
        </div>

        <div className="form-field form-col-2">
          <label>Dirección *</label>
          <input value={form.direccion} onChange={(e)=>set("direccion", e.target.value)} />
          {errorMsg("direccion")}
        </div>

        <div className="form-field">
          <label>Región *</label>
          <select value={form.region_id} onChange={(e)=>set("region_id", Number(e.target.value))}>
            <option value="">Selecciona…</option>
            {regiones.map(r=> <option key={r.id} value={r.id}>{r.nombre}</option>)}
          </select>
          {errorMsg("region_id")}
        </div>

        <div className="form-field">
          <label>Comuna *</label>
          <select value={form.comuna_id} onChange={(e)=>set("comuna_id", Number(e.target.value))}>
            <option value="">Selecciona…</option>
            {comunas
              .filter(c => !form.region_id || c.region_id === Number(form.region_id))
              .map(c=> <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
          {errorMsg("comuna_id")}
        </div>

        <div className="form-field">
          <label>Teléfono móvil</label>
          <input value={form.telefono_movil} onChange={(e)=>set("telefono_movil", e.target.value)} placeholder="+569XXXXXXXX" />
          {errorMsg("telefono_movil")}
        </div>

        <div className="form-field">
          <label>Email personal</label>
          <input value={form.email_personal} onChange={(e)=>set("email_personal", e.target.value)} />
          {errorMsg("email_personal")}
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="lf-btn lf-btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="lf-btn lf-btn-primary" disabled={saving}>
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
