// src/pages/EmpleadoFicha.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./EmpleadoFicha.css";
import PersonalesView from "../components/Personales"; // lectura
import PersonalesForm from "../components/PersonalesForm";
import "../styles/personales.css";

/** Pestañas de la ficha */
const TABS = [
  { key: "personales", label: "Personales" },
  { key: "contractuales", label: "Contractuales" },
  { key: "documentos", label: "Documentos" },
  { key: "prevision", label: "Previsión" },
  { key: "bancarios", label: "Bancarios" },
  { key: "asistencia", label: "Asistencia" }, // pantalla completa
  { key: "hoja", label: "Hoja de Vida" },
  { key: "historial", label: "Historial" },   // pantalla completa
];

const isUUID = (v = "") =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
const likelyRut = (v = "") => v.includes("-") || v.includes(".");
const fullName = (e) => `${e?.nombre ?? ""} ${e?.apellido ?? ""}`.trim();

/** Mapa de IDs locales (cl_regiones) -> IDs oficiales (cl_comunas / guardado) */
const FIX_REGION_ID = {
  1: 15, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 13, 8: 6,
  9: 7, 10: 8, 11: 9, 12: 10, 13: 12, 14: 14, 15: 11, 16: 16,
};
/** Inverso: ID oficial -> ID local (para mostrar el nombre correcto desde cl_regiones) */
const INV_FIX_REGION_ID = Object.fromEntries(
  Object.entries(FIX_REGION_ID).map(([local, oficial]) => [Number(oficial), Number(local)])
);

export default function EmpleadoFicha() {
  const navigate = useNavigate();
  const params = useParams();
  // Ruta recomendada: /rrhh/ficha/:rut  (pero también acepta :id)
  const refRaw = params.rut ?? params.id ?? params.ref ?? "";
  const ref = decodeURIComponent(String(refRaw || ""));

  const [loading, setLoading] = useState(true);
  const [emp, setEmp] = useState(null);
  const [tab, setTab] = useState("personales");
  const [editing, setEditing] = useState(false);

  // Catálogo de regiones (locales)
  const [regiones, setRegiones] = useState([]);

  // ---------- Estado para edición rápida (Horario / Oficina) ----------
  const [quickEdit, setQuickEdit] = useState(false);
  const [quickForm, setQuickForm] = useState({ office: "", horario: "" });
  useEffect(() => {
    setQuickForm({ office: emp?.office ?? "", horario: emp?.horario ?? "" });
  }, [emp?.office, emp?.horario]);

  const saveQuickInfo = async () => {
    const payload = {
      office: (quickForm.office || "").trim() || null,
      horario: (quickForm.horario || "").trim() || null,
    };
    const { data, error } = await supabase
      .from("employees")
      .update(payload)
      .eq("id", emp.id)
      .select("*")
      .single();

    if (error) {
      alert(error.message || "No se pudo guardar la Información rápida.");
      return;
    }
    setEmp(data);
    setQuickEdit(false);
  };
  // -------------------------------------------------------------------

  // Carga empleado (por RUT o por ID)
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
        if (cancel) return;

        if (error) {
          console.error("Error cargando ficha:", error);
          setEmp(null);
        } else {
          setEmp(data || null);
        }
      } catch (e) {
        if (!cancel) {
          console.error("Excepción cargando ficha:", e);
          setEmp(null);
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    load();
    return () => { cancel = true; };
  }, [ref]);

  // Carga catálogo de regiones (IDs locales) para resolver el nombre correcto
  useEffect(() => {
    let cancel = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("cl_regiones")
          .select("id,nombre")
          .order("id", { ascending: true });
        if (!cancel) {
          if (error) console.error("Error cargando regiones:", error);
          setRegiones(data || []);
        }
      } catch (e) {
        if (!cancel) console.error("Excepción cargando regiones:", e);
      }
    })();
    return () => { cancel = true; };
  }, []);

  const initials = useMemo(() => {
    const n = emp?.nombre?.[0] ?? "E";
    const a = emp?.apellido?.[0] ?? "";
    return (n + a).toUpperCase();
  }, [emp]);

  // Derivados para la vista de lectura:
  // employee.region_id viene en ID OFICIAL (porque lo guardamos así).
  const regionLocalId = useMemo(() => {
    const oficial = Number(emp?.region_id);
    if (!Number.isFinite(oficial)) return null;
    return INV_FIX_REGION_ID[oficial] ?? oficial;
  }, [emp?.region_id]);

  const regionNombre = useMemo(() => {
    if (!regionLocalId) return "—";
    return regiones.find((r) => r.id === regionLocalId)?.nombre ?? "—";
  }, [regiones, regionLocalId]);

  // En lectura le pasamos a PersonalesView un "emp" enriquecido con el nombre correcto
  const empForView = useMemo(() => {
    if (!emp) return null;
    return {
      ...emp,
      region_id_local: regionLocalId, // por si PersonalesView lo quiere usar
      region_nombre: regionNombre,    // nombre correcto para mostrar
    };
  }, [emp, regionLocalId, regionNombre]);

  if (loading) {
    return (
      <div className="ef-page">
        <div className="ef-wrap">
          <div className="ef-card p20">Cargando ficha…</div>
        </div>
      </div>
    );
  }

  if (!emp) {
    return (
      <div className="ef-page">
        <div className="ef-wrap">
          <div className="ef-card p20" style={{ marginTop: 16 }}>
            <h3 className="ef-title-sm">
              No encontramos la ficha para RUT/ID: <strong>{ref}</strong>
            </h3>
            <button
              className="lf-btn lf-btn-primary mt12"
              onClick={() => navigate("/rrhh/listado-fichas")}
            >
              Volver al Listado
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sidebarHidden = tab === "asistencia" || tab === "historial";

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
              Miembro desde el{" "}
              {new Date(emp.created_at).toLocaleDateString("es-CL", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>
          <div className="ef-head-actions">
            <button
              className="lf-btn lf-btn-primary"
              onClick={() => setEditing(true)}
            >
              Editar Ficha
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="ef-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`ef-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => { setTab(t.key); if (t.key !== "personales") setEditing(false); }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Layout principal */}
        <div className={`ef-layout ${sidebarHidden ? "full" : ""}`}>
          <div className="ef-main">
            {/* PERSONALES */}
            {tab === "personales" && (
              editing ? (
                <PersonalesForm
                  key={emp.id}
                  employee={emp} // ← el form sigue recibiendo el objeto original (region_id OFICIAL)
                  onCancel={() => setEditing(false)}
                  onSaved={(updated) => { setEmp(updated); setEditing(false); }}
                />
              ) : (
                // ← En lectura pasamos emp enriquecido con region_nombre correcto
                <PersonalesView emp={empForView} />
              )
            )}

            {/* Resto de pestañas */}
            {tab === "contractuales" && null}
            {tab === "documentos" && null}
            {tab === "prevision" && null}
            {tab === "bancarios" && null}
            {tab === "asistencia" && null}
            {tab === "hoja" && null}
            {tab === "historial" && null}
          </div>

          {/* Sidebar: oculto para Asistencia e Historial */}
          {!sidebarHidden && (
            <div className="ef-side">
              {/* Información Rápida (editable inline) */}
              <div className="ef-card p16 ef-quick">
                <h3 className="ef-side-title">Información Rápida</h3>
                <ul className="ef-quick-list">
                  <li>
                    <span className="ef-ico">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M7 2v3M17 2v3M3 9h18M5 6h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
                          stroke="#6b7280" strokeWidth="1.6" strokeLinecap="round"/>
                      </svg>
                    </span>
                    <span>Próximo cumpleaños: <strong>15 Abril</strong></span>
                  </li>

                  {/* Horario */}
                  <li>
                    <span className="ef-ico">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 7v5l3 2" stroke="#6b7280" strokeWidth="1.6"
                          strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="12" r="9" stroke="#6b7280" strokeWidth="1.6"/>
                      </svg>
                    </span>
                    <span style={{ flex: 1 }}>
                      {quickEdit ? (
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <label style={{ color: "#374151" }}>Horario:</label>
                          <input
                            value={quickForm.horario}
                            onChange={(e) =>
                              setQuickForm((s) => ({ ...s, horario: e.target.value }))
                            }
                            placeholder="Ej: 08:30 - 18:00"
                            style={{
                              height: 34,
                              border: "1px solid #e5e7eb",
                              borderRadius: 8,
                              padding: "0 10px",
                              flex: 1,
                            }}
                          />
                        </div>
                      ) : (
                        <>Horario: <strong>{emp.horario || "—"}</strong></>
                      )}
                    </span>
                  </li>

                  {/* Oficina */}
                  <li>
                    <span className="ef-ico">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z"
                          stroke="#6b7280" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                        <circle cx="12" cy="10" r="2.5" stroke="#6b7280" strokeWidth="1.6"/>
                      </svg>
                    </span>
                    <span style={{ flex: 1 }}>
                      {quickEdit ? (
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <label style={{ color: "#374151" }}>Oficina:</label>
                          <input
                            value={quickForm.office}
                            onChange={(e) =>
                              setQuickForm((s) => ({ ...s, office: e.target.value }))
                            }
                            placeholder="Ej: Santiago Centro"
                            style={{
                              height: 34,
                              border: "1px solid #e5e7eb",
                              borderRadius: 8,
                              padding: "0 10px",
                              flex: 1,
                            }}
                          />
                        </div>
                      ) : (
                        <>Oficina: <strong>{emp.office || "—"}</strong></>
                      )}
                    </span>
                  </li>
                </ul>

                {/* Acciones de la tarjeta */}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  {quickEdit ? (
                    <>
                      <button
                        className="lf-btn lf-btn-ghost"
                        type="button"
                        onClick={() => {
                          setQuickForm({ office: emp?.office ?? "", horario: emp?.horario ?? "" });
                          setQuickEdit(false);
                        }}
                      >
                        Cancelar
                      </button>
                      <button
                        className="lf-btn lf-btn-primary"
                        type="button"
                        onClick={saveQuickInfo}
                      >
                        Guardar
                      </button>
                    </>
                  ) : (
                    <button
                      className="lf-btn lf-btn-primary"
                      type="button"
                      onClick={() => setQuickEdit(true)}
                    >
                      Editar
                    </button>
                  )}
                </div>
              </div>

              {/* Rendimiento */}
              <div className="ef-card p16 ef-perf">
                <h3 className="ef-side-title">Rendimiento</h3>

                <div className="ef-metric-row">
                  <span className="ef-metric-label">Productividad</span>
                  <span className="ef-metric-val blue">92%</span>
                </div>
                <div className="ef-meter"><span className="blue" style={{ width: "92%" }} /></div>

                <div className="ef-metric-row">
                  <span className="ef-metric-label">Puntualidad</span>
                  <span className="ef-metric-val green">96%</span>
                </div>
                <div className="ef-meter"><span className="green" style={{ width: "96%" }} /></div>

                <div className="ef-metric-row">
                  <span className="ef-metric-label">Colaboración</span>
                  <span className="ef-metric-val purple">88%</span>
                </div>
                <div className="ef-meter"><span className="purple" style={{ width: "88%" }} /></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
