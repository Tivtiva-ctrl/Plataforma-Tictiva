// src/pages/EmpleadoFicha.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import "./EmpleadoFicha.css";

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
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v
  );
const likelyRut = (v = "") => v.includes("-") || v.includes(".");
const fullName = (e) => `${e?.nombre ?? ""} ${e?.apellido ?? ""}`.trim();

export default function EmpleadoFicha() {
  const navigate = useNavigate();
  const params = useParams();
  // Ruta recomendada: /rrhh/ficha/:rut  (pero también acepta :id)
  const refRaw = params.rut ?? params.id ?? params.ref ?? "";
  const ref = decodeURIComponent(String(refRaw || ""));

  const [loading, setLoading] = useState(true);
  const [emp, setEmp] = useState(null);
  const [tab, setTab] = useState("personales");

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
    return () => {
      cancel = true;
    };
  }, [ref]);

  const initials = useMemo(() => {
    const n = emp?.nombre?.[0] ?? "E";
    const a = emp?.apellido?.[0] ?? "";
    return (n + a).toUpperCase();
  }, [emp]);

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
              <span
                className={emp.activo ? "ef-pill ef-pill-green" : "ef-pill ef-pill-gray"}
              >
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
            <button className="lf-btn lf-btn-primary">Editar Ficha</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="ef-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`ef-tab ${tab === t.key ? "active" : ""}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Layout principal */}
        <div className={`ef-layout ${sidebarHidden ? "full" : ""}`}>
          <div className="ef-main">
            {tab === "personales" && <Personales emp={emp} />}
            {tab === "contractuales" && <Contractuales emp={emp} />}
            {tab === "documentos" && <Documentos emp={emp} />}
            {tab === "prevision" && <Prevision emp={emp} />}
            {tab === "bancarios" && <Bancarios emp={emp} />}
            {tab === "asistencia" && <Asistencia emp={emp} />}
            {tab === "hoja" && <HojaDeVida emp={emp} />}
            {tab === "historial" && <Historial emp={emp} />}
          </div>

          {/* Sidebar: oculto para Asistencia e Historial */}
          {!sidebarHidden && (
            <div className="ef-side">
              {/* Información Rápida */}
              <div className="ef-card p16 ef-quick">
                <h3 className="ef-side-title">Información Rápida</h3>
                <ul className="ef-quick-list">
                  <li>
                    <span className="ef-ico">
                      {/* calendario */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M7 2v3M17 2v3M3 9h18M5 6h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z"
                          stroke="#6b7280"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <span>
                      Próximo cumpleaños: <strong>15 Abril</strong>
                    </span>
                  </li>
                  <li>
                    <span className="ef-ico">
                      {/* reloj */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 7v5l3 2"
                          stroke="#6b7280"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx="12" cy="12" r="9" stroke="#6b7280" strokeWidth="1.6" />
                      </svg>
                    </span>
                    <span>
                      Horario: <strong>08:30 - 18:00</strong>
                    </span>
                  </li>
                  <li>
                    <span className="ef-ico">
                      {/* pin */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z"
                          stroke="#6b7280"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx="12" cy="10" r="2.5" stroke="#6b7280" strokeWidth="1.6" />
                      </svg>
                    </span>
                    <span>
                      Oficina: <strong>Santiago Centro</strong>
                    </span>
                  </li>
                </ul>
              </div>

              {/* Rendimiento */}
              <div className="ef-card p16 ef-perf">
                <h3 className="ef-side-title">Rendimiento</h3>

                <div className="ef-metric-row">
                  <span className="ef-metric-label">Productividad</span>
                  <span className="ef-metric-val blue">92%</span>
                </div>
                <div className="ef-meter">
                  <span className="blue" style={{ width: "92%" }} />
                </div>

                <div className="ef-metric-row">
                  <span className="ef-metric-label">Puntualidad</span>
                  <span className="ef-metric-val green">96%</span>
                </div>
                <div className="ef-meter">
                  <span className="green" style={{ width: "96%" }} />
                </div>

                <div className="ef-metric-row">
                  <span className="ef-metric-label">Colaboración</span>
                  <span className="ef-metric-val purple">88%</span>
                </div>
                <div className="ef-meter">
                  <span className="purple" style={{ width: "88%" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ======== Secciones de ejemplo (sustituye por tus componentes reales cuando quieras) ======== */
function Row({ label, value }) {
  return (
    <div className="ef-row">
      <div className="ef-row-label">{label}</div>
      <div className="ef-row-value">{value || "—"}</div>
    </div>
  );
}

function Personales({ emp }) {
  return (
    <div className="ef-card p20">
      <h3 className="ef-block-title">Información Personal</h3>
      <Row label="Nombre Completo:" value={`${emp.nombre ?? ""} ${emp.apellido ?? ""}`} />
      <Row label="RUT:" value={emp.rut} />
      <Row label="Cargo:" value={emp.cargo} />
      <Row label="Género:" value={emp.genero} />
      <Row label="Discapacidad:" value={emp.discapacidad ? "Sí" : "No"} />
      <Row label="Estado:" value={emp.activo ? "ACTIVO" : "INACTIVO"} />
    </div>
  );
}

function Contractuales() {
  return (
    <div className="ef-card p20">
      <h3 className="ef-block-title">Información Contractual</h3>
      <div className="ef-hint">Detalle de contrato, tipo, vigencia, anexos, etc.</div>
    </div>
  );
}

function Documentos() {
  return (
    <div className="ef-card p20">
      <h3 className="ef-block-title">Documentos</h3>
      <div className="ef-hint">Listado y acciones de documentos (ver, descargar, subir).</div>
    </div>
  );
}

function Prevision() {
  return (
    <div className="ef-card p20">
      <h3 className="ef-block-title">Previsión</h3>
      <div className="ef-hint">AFP, Isapre/Fonasa, cargas, plan, etc.</div>
    </div>
  );
}

function Bancarios() {
  return (
    <div className="ef-card p20">
      <h3 className="ef-block-title">Bancarios</h3>
      <div className="ef-hint">Banco, tipo de cuenta, número, titular.</div>
    </div>
  );
}

function Asistencia() {
  return (
    <div className="ef-card p20">
      <h3 className="ef-block-title">Asistencia (pantalla completa)</h3>
      <div className="ef-hint">Resumen de marcas, calendario, cumplimiento DT, etc.</div>
    </div>
  );
}

function HojaDeVida() {
  return (
    <div className="ef-card p20">
      <h3 className="ef-block-title">Hoja de Vida</h3>
      <div className="ef-hint">Reconocimientos, llamados de atención, capacitaciones, etc.</div>
    </div>
  );
}

function Historial() {
  return (
    <div className="ef-card p20">
      <h3 className="ef-block-title">Historial (pantalla completa)</h3>
      <div className="ef-hint">Bitácora de cambios, eventos y acciones del colaborador.</div>
    </div>
  );
}
