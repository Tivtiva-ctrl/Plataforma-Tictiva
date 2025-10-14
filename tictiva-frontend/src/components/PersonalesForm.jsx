// src/components/PersonalesForm.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "../styles/personales.css";

const FIX_REGION_ID = { 1:15,2:1,3:2,4:3,5:4,6:5,7:13,8:6,9:7,10:8,11:9,12:10,13:12,14:14,15:11,16:16 };
const INV_FIX_REGION_ID = Object.fromEntries(Object.entries(FIX_REGION_ID).map(([l,o]) => [Number(o),Number(l)]));

const asInt = (v) => { if (v===null||v===undefined||v==="") return null; const n=Number(v); return Number.isNaN(n)?null:n; };
const toYMD = (d) => { if(!d) return ""; const dt=typeof d==="string"?new Date(d):d; if(Number.isNaN(dt.getTime())) return ""; const y=dt.getFullYear(); const m=String(dt.getMonth()+1).padStart(2,"0"); const da=String(dt.getDate()).padStart(2,"0"); return `${y}-${m}-${da}`; };

export default function PersonalesForm({ id, employee, isEditing, onSaved, onCancel }) {
  const [regiones, setRegiones] = useState([]);
  const [comunas, setComunas] = useState([]);

  const [form, setForm] = useState(() => {
    const oficialRid = asInt(employee?.region_id);
    const localRid = oficialRid == null ? null : (INV_FIX_REGION_ID[oficialRid] ?? oficialRid);
    return {
      nombre: employee?.nombre ?? employee?.nombres ?? "",
      apellido: employee?.apellido ?? employee?.apellidos ?? "",
      rut: employee?.rut ?? "",
      cargo: employee?.cargo ?? "",
      fecha_nacimiento: employee?.fecha_nacimiento ?? "",
      region_id: localRid,
      comuna_id: asInt(employee?.comuna_id),
      telefono_movil: employee?.telefono_movil ?? "",
      telefono_fijo: employee?.telefono_fijo ?? "",
      email_personal: employee?.email_personal ?? "",
      email_corporativo: employee?.email_corporativo ?? "",
      office: employee?.office ?? "",
      horario: employee?.horario ?? "",
    };
  });

  useEffect(() => {
    const oficialRid = asInt(employee?.region_id);
    const localRid = oficialRid == null ? null : (INV_FIX_REGION_ID[oficialRid] ?? oficialRid);
    setForm((prev)=>({
      ...prev,
      nombre: employee?.nombre ?? employee?.nombres ?? "",
      apellido: employee?.apellido ?? employee?.apellidos ?? "",
      rut: employee?.rut ?? "",
      cargo: employee?.cargo ?? "",
      fecha_nacimiento: toYMD(employee?.fecha_nacimiento) || "",
      region_id: localRid,
      comuna_id: asInt(employee?.comuna_id),
      telefono_movil: employee?.telefono_movil ?? "",
      telefono_fijo: employee?.telefono_fijo ?? "",
      email_personal: employee?.email_personal ?? "",
      email_corporativo: employee?.email_corporativo ?? "",
      office: employee?.office ?? "",
      horario: employee?.horario ?? "",
    }));
  }, [employee?.id]);

  // catálogos
  useEffect(() => {
    supabase.from("cl_regiones").select("id,nombre").order("id",{ascending:true}).then(({data})=>setRegiones(data||[]));
  }, []);

  const loadComunas = async (regionLocalId) => {
    const regionIdFixed = FIX_REGION_ID[regionLocalId] ?? regionLocalId;
    const { data, error } = await supabase.from("cl_comunas").select("id,nombre,region_id").eq("region_id", regionIdFixed).order("nombre",{ascending:true});
    if (error) { console.error(error); setComunas([]); return; }
    setComunas(data||[]);
  };

  useEffect(() => {
    const ridLocal = asInt(form.region_id);
    if (ridLocal) loadComunas(ridLocal);
    else setComunas([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.region_id]);

  const setField = (k,v) => setForm((s)=>({ ...s, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Guardar con IDs OFICIALES
    const payload = {
      nombre: form.nombre?.trim() || null,
      apellido: form.apellido?.trim() || null,
      rut: form.rut?.trim() || null,
      cargo: form.cargo?.trim() || null,
      fecha_nacimiento: form.fecha_nacimiento || null,
      region_id: (() => {
        const ridLocal = asInt(form.region_id);
        return ridLocal == null ? null : (FIX_REGION_ID[ridLocal] ?? ridLocal);
      })(),
      comuna_id: asInt(form.comuna_id),
      telefono_movil: form.telefono_movil?.trim() || null,
      telefono_fijo: form.telefono_fijo?.trim() || null,
      email_personal: form.email_personal?.trim() || null,
      email_corporativo: form.email_corporativo?.trim() || null,
      office: form.office?.trim() || null,
      horario: form.horario?.trim() || null,
    };

    const { data, error } = await supabase.from("employees").update(payload).eq("id", employee.id).select("*").single();
    if (error) { console.error(error); alert(error.message || "No se pudo guardar"); return; }
    onSaved?.(data);
  };

  return (
    <form id={id || "personales-form"} onSubmit={handleSubmit} className="card grandes" style={{ marginTop: 12 }}>
      <h2>Editar Información Personal</h2>

      <div className="form-grid">
        {/* Nombres / Apellidos */}
        <div className="form-field">
          <label>Nombres *</label>
          <input value={form.nombre} onChange={(e)=>setField("nombre", e.target.value)} disabled={!isEditing} />
        </div>
        <div className="form-field">
          <label>Apellidos *</label>
          <input value={form.apellido} onChange={(e)=>setField("apellido", e.target.value)} disabled={!isEditing} />
        </div>

        {/* RUT / Cargo */}
        <div className="form-field">
          <label>RUT *</label>
          <input value={form.rut} onChange={(e)=>setField("rut", e.target.value)} disabled={!isEditing} />
        </div>
        <div className="form-field">
          <label>Cargo</label>
          <input value={form.cargo} onChange={(e)=>setField("cargo", e.target.value)} disabled={!isEditing} />
        </div>

        {/* Fecha de nacimiento (sin hint) / Teléfono móvil */}
        <div className="form-field">
          <label>Fecha de nacimiento</label>
          <input type="date" value={form.fecha_nacimiento || ""} onChange={(e)=>setField("fecha_nacimiento", e.target.value)} disabled={!isEditing} />
        </div>
        <div className="form-field">
          <label>Teléfono móvil</label>
          <input value={form.telefono_movil} onChange={(e)=>setField("telefono_movil", e.target.value)} disabled={!isEditing} />
        </div>

        {/* Región y Comuna — JUNTAS en la misma fila */}
        <div className="form-field">
          <label>Región</label>
          <select
            value={form.region_id ?? ""}
            onChange={(e)=>{ const val=asInt(e.target.value); setField("region_id", val); setField("comuna_id", null); }}
            disabled={!isEditing}
          >
            <option value="">— Selecciona región —</option>
            {regiones.map((r)=> (<option key={r.id} value={r.id}>{r.nombre}</option>))}
          </select>
        </div>
        <div className="form-field">
          <label>Comuna</label>
          <select
            value={form.comuna_id ?? ""}
            onChange={(e)=>setField("comuna_id", asInt(e.target.value))}
            disabled={!isEditing || !form.region_id || comunas.length===0}
          >
            <option value="">{form.region_id ? "— Selecciona comuna —" : "Selecciona región primero"}</option>
            {comunas.map((c)=> (<option key={c.id} value={c.id}>{c.nombre}</option>))}
          </select>
        </div>

        {/* Teléfono fijo / Email personal */}
        <div className="form-field">
          <label>Teléfono fijo</label>
          <input value={form.telefono_fijo} onChange={(e)=>setField("telefono_fijo", e.target.value)} disabled={!isEditing} />
        </div>
        <div className="form-field">
          <label>Email personal</label>
          <input type="email" value={form.email_personal} onChange={(e)=>setField("email_personal", e.target.value)} disabled={!isEditing} />
        </div>

        {/* Email corporativo / Oficina */}
        <div className="form-field">
          <label>Email corporativo</label>
          <input type="email" value={form.email_corporativo} onChange={(e)=>setField("email_corporativo", e.target.value)} disabled={!isEditing} />
        </div>
        <div className="form-field">
          <label>Oficina</label>
          <input value={form.office} onChange={(e)=>setField("office", e.target.value)} disabled={!isEditing} placeholder="Ej: Santiago Centro" />
        </div>

        {/* Horario (queda en el form también por consistencia) / relleno */}
        <div className="form-field">
          <label>Horario</label>
          <input value={form.horario} onChange={(e)=>setField("horario", e.target.value)} disabled={!isEditing} placeholder="Ej: 08:30 - 18:00" />
        </div>
        <div className="form-col-2" />
      </div>
      {/* sin botones internos; Guardar/Cancelar vienen desde el header */}
    </form>
  );
}
