// src/pages/EmpleadoFicha.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./EmpleadoFicha.css";
import PersonalesView from "../components/Personales"; // lectura
import PersonalesForm from "../components/PersonalesForm";
import "../styles/personales.css";

// ... utilidades y constantes (sin cambios) ...
const TABS = [
  { key: "personales", label: "Personales" },
  { key: "contractuales", label: "Contractuales" },
  { key: "documentos", label: "Documentos" },
  { key: "prevision", label: "Previsión" },
  { key: "bancarios", label: "Bancarios" },
  { key: "asistencia", label: "Asistencia" },
  { key: "hoja", label: "Hoja de Vida" },
  { key: "historial", label: "Historial" },
];

const isUUID = (v = "") =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
const likelyRut = (v = "") => v.includes("-") || v.includes(".");
const fullName = (e) => `${e?.nombre ?? ""} ${e?.apellido ?? ""}`.trim();

const FIX_REGION_ID = { 1:15,2:1,3:2,4:3,5:4,6:5,7:13,8:6,9:7,10:8,11:9,12:10,13:12,14:14,15:11,16:16 };
const INV_FIX_REGION_ID = Object.fromEntries(Object.entries(FIX_REGION_ID).map(([l,o]) => [Number(o),Number(l)]));

function safeDate(v){ if(!v) return null; const d=new Date(v); return Number.isNaN(d.getTime())?null:d; }
function formatDayMonth(date){ try{ return date.toLocaleDateString("es-CL",{day:"2-digit",month:"long"}); }catch{ const d=String(date.getDate()).padStart(2,"0"); const m=String(date.getMonth()+1).padStart(2,"0"); return `${d}/${m}`; } }
function nextBirthdayFrom(dobStr){ const dob=safeDate(dobStr); if(!dob) return null; const t=new Date(); const y=t.getFullYear(); const nb=new Date(y,dob.getMonth(),dob.getDate()); const t0=new Date(t.getFullYear(),t.getMonth(),t.getDate()); return nb<t0?new Date(y+1,dob.getMonth(),dob.getDate()):nb; }

export default function EmpleadoFicha() {
  const navigate = useNavigate();
  const params = useParams();
  const refRaw = params.rut ?? params.id ?? params.ref ?? "";
  const ref = decodeURIComponent(String(refRaw || ""));

  const [loading, setLoading] = useState(true);
  const [emp, setEmp] = useState(null);
  const [tab, setTab] = useState("personales");
  const [editing, setEditing] = useState(false);
  const [regiones, setRegiones] = useState([]);
  const [quickForm, setQuickForm] = useState({ office: "", horario: "" });

  useEffect(() => {
    setQuickForm({ office: emp?.office ?? "", horario: emp?.horario ?? "" });
  }, [emp?.office, emp?.horario]);

  const updateQuickAfterMainSave = async (base) => {
    const office = (quickForm.office || "").trim() || null;
    const horario = (quickForm.horario || "").trim() || null;
    const changed = (base.office ?? null) !== office || (base.horario ?? null) !== horario;
    if (!changed) return base;
    const { data, error } = await supabase.from("employees").update({ office, horario }).eq("id", base.id).select("*").single();
    if (error) { console.error("Error guardando Información Rápida:", error); alert(error.message || "No se pudo guardar Horario/Oficina."); return base; }
    return data || base;
  };

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      setLoading(true);
      try {
        let q = supabase.from("employees").select("*").limit(1);
        if (likelyRut(ref)) q = q.eq("rut", ref);
        else if (isUUID(ref)) q = q.eq("id", ref);
        else q = q.or(`rut.eq.${ref},id.eq.${ref}`);
        const { data, error } = await q.single();
        if (!cancel) setEmp(error ? null : (data || null));
      } finally { if (!cancel) setLoading(false); }
    };
    load();
    return () => { cancel = true; };
  }, [ref]);

  useEffect(() => {
    supabase.from("cl_regiones").select("id,nombre").order("id",{ascending:true}).then(({data})=>setRegiones(data||[]));
  }, []);

  const initials = useMemo(() => ((emp?.nombre?.[0] ?? "E") + (emp?.apellido?.[0] ?? "")).toUpperCase(), [emp]);

  const regionLocalId = useMemo(() => {
    const oficial = Number(emp?.region_id);
    return Number.isFinite(oficial) ? (INV_FIX_REGION_ID[oficial] ?? oficial) : null;
  }, [emp?.region_id]);

  const regionNombre = useMemo(() => {
    if (!regionLocalId) return "—";
    return regiones.find((r) => r.id === regionLocalId)?.nombre ?? "—";
  }, [regiones, regionLocalId]);

  const proxCumpleTexto = useMemo(() => {
    const nb = nextBirthdayFrom(emp?.fecha_nacimiento);
    return nb ? formatDayMonth(nb) : "—";
  }, [emp?.fecha_nacimiento]);

  const empForView = useMemo(() => {
    if (!emp) return null;
    const dob = safeDate(emp.fecha_nacimiento);
    const fecha_nacimiento_fmt = dob ? dob.toLocaleDateString("es-CL",{year:"numeric",month:"long",day:"2-digit"}) : "—";
    return { ...emp, region_id_local: regionLocalId, region_nombre: regionNombre, fecha_nacimiento_fmt };
  }, [emp, regionLocalId, regionNombre]);

  if (loading) return <div className="ef-page"><div className="ef-wrap"><div className="ef-card p20">Cargando ficha…</div></div></div>;
  if (!emp) return (
    <div className="ef-page"><div className="ef-wrap">
      <div className="ef-card p20" style={{ marginTop: 16 }}>
        <h3 className="ef-title-sm">No encontramos la ficha para RUT/ID: <strong>{ref}</strong></h3>
        <button className="lf-btn lf-btn-primary mt12" onClick={() => navigate("/rrhh/listado-fichas")}>Volver al Listado</button>
      </div>
    </div></div>
  );

  const sidebarHidden = tab === "asistencia" || tab === "historial";
  const handleSaved = async (updated) => { const withQuick = await updateQuickAfterMainSave(updated); setEmp(withQuick); setEditing(false); };
  const submitPersonales = () => { const form = document.getElementById("personales-form"); if (form) form.requestSubmit(); };

  return (
    <div className="ef-page">
      <div className="ef-wrap">
        {/* Header */}
        <div className="ef-card ef-header">
          <div className="ef-avatar">{initials}</div>
          <div className="ef-head-main">
            <div className="ef-head-top">
              <h1 className="ef-title">{fullName(emp)}</h1>
              <span className={emp.activo ? "ef-pill ef-pill-green" : "ef-pill ef-pill-gray"}>
                {emp.activo ? "Activo" : "Inactivo"}
              </span>
            </div>
            <div className="ef-role">{emp.cargo || "—"}</div>
            <div className="ef-meta">
              Miembro desde el {new Date(emp.created_at).toLocaleDateString("es-CL",{day:"2-digit",month:"long",year:"numeric"})}
            </div>
          </div>
          <div className="ef-head-actions">
            {!editing ? (
              <button className="lf-btn lf-btn-primary" onClick={() => setEditing(true)}>Editar Ficha</button>
            ) : (
              <>
                <button className="lf-btn lf-btn-primary" onClick={submitPersonales}>Guardar</button>
                <button className="lf-btn lf-btn-ghost" onClick={() => setEditing(false)}>Cancelar</button>
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="ef-tabs">
          {TABS.map((t) => (
            <button key={t.key} className={`ef-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => { setTab(t.key); if (t.key !== "personales") setEditing(false); }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Layout principal */}
        <div className={`ef-layout ${sidebarHidden ? "full" : ""}`}>
          <div className="ef-main">
            {tab === "personales" && (
              editing ? (
                <PersonalesForm
                  id="personales-form"
                  employee={emp}
                  isEditing={true}        /* 👈 ahora SÍ habilita los inputs */  
                  onSaved={handleSaved}
                  onCancel={() => setEditing(false)}
                />
              ) : (
                <PersonalesView emp={empForView} />
              )
            )}
          </div>

          {/* Sidebar: Información Rápida (DOB solo lectura) */}
          {!sidebarHidden && (
            <div className="ef-side">
              <div className="ef-card p16 ef-quick">
                <h3 className="ef-side-title">Información Rápida</h3>
                <ul className="ef-quick-list">
                  <li>
                    <span className="ef-ico">{/* calendario */}</span>
                    <span style={{ flex: 1 }}>
                      Próximo cumpleaños: <strong>{proxCumpleTexto}</strong>
                    </span>
                  </li>
                  <li>
                    <span className="ef-ico">{/* reloj */}</span>
                    <span style={{ flex: 1 }}>
                      {editing ? (
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <label style={{ color: "#374151" }}>Horario:</label>
                          <input
                            value={quickForm.horario}
                            onChange={(e) => setQuickForm((s) => ({ ...s, horario: e.target.value }))}
                            placeholder="Ej: 08:30 - 18:00"
                            style={{ height: 34, border: "1px solid #e5e7eb", borderRadius: 8, padding: "0 10px", flex: 1 }}
                          />
                        </div>
                      ) : (<>Horario: <strong>{emp.horario || "—"}</strong></>)}
                    </span>
                  </li>
                  <li>
                    <span className="ef-ico">{/* pin */}</span>
                    <span style={{ flex: 1 }}>
                      {editing ? (
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <label style={{ color: "#374151" }}>Oficina:</label>
                          <input
                            value={quickForm.office}
                            onChange={(e) => setQuickForm((s) => ({ ...s, office: e.target.value }))}
                            placeholder="Ej: Santiago Centro"
                            style={{ height: 34, border: "1px solid #e5e7eb", borderRadius: 8, padding: "0 10px", flex: 1 }}
                          />
                        </div>
                      ) : (<>Oficina: <strong>{emp.office || "—"}</strong></>)}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
