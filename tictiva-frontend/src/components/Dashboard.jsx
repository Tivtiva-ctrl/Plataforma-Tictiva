// src/components/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../App.css";
import { ROUTES } from "../routes";

/* ──────── Icon helpers (SVG minimalistas) ──────── */
const IconWrap = ({ fg = "#1f2937", bg = "#eef2ff", children }) => (
  <div
    className="ico"
    style={{
      background: bg,
      border: "1px solid rgba(0,0,0,.06)",
      color: fg,
    }}
  >
    {children}
  </div>
);

/* Módulos */
const IUsers = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="9" cy="8" r="3" />
    <path d="M3 19c0-3 3-5 6-5s6 2 6 5" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M14.5 19c.3-2.4 2.3-3.9 4.5-4" />
  </svg>
);
const IClock = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v6l4 2" />
  </svg>
);
const IMessage = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="3" y="4" width="18" height="14" rx="3" />
    <path d="M7 10h10M7 14h6" />
  </svg>
);
const IChart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M4 20h16" />
    <rect x="6" y="11" width="3" height="6" rx="1" />
    <rect x="11" y="8" width="3" height="9" rx="1" />
    <rect x="16" y="6" width="3" height="11" rx="1" />
  </svg>
);
const IBrain = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M8 7a3 3 0 1 1 0 6v1a3 3 0 1 1 0 6" />
    <path d="M16 7a3 3 0 1 0 0 6v1a3 3 0 1 0 0 6" />
  </svg>
);

/* Enlaces (íconos) */
const ICalendar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M8 3v4M16 3v4M3 10h18" />
  </svg>
);
const IClipboard = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="6" y="4" width="12" height="16" rx="2" />
    <rect x="9" y="2" width="6" height="4" rx="1.5" />
  </svg>
);
const IBox = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M12 3l9 4.5-9 4.5L3 7.5 12 3z" />
    <path d="M21 7.5V16l-9 4.5-9-4.5V7.5" />
  </svg>
);
const ISearch = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="10" cy="10" r="6" />
    <path d="M14.5 14.5L20 20" />
  </svg>
);
const ICheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <circle cx="12" cy="12" r="9" />
    <path d="M7.5 12l3 3.5 6-7" />
  </svg>
);
const IPin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M12 21s7-6.2 7-11.2A7 7 0 1 0 5 9.8C5 14.8 12 21 12 21z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);
const IDevice = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="7" y="2" width="10" height="20" rx="2" />
    <circle cx="12" cy="18" r="1" />
  </svg>
);
const ITurns = () => <ICalendar />;

/* ───────────────────────────────────────────────── */

export default function Dashboard() {
  return (
    <div className="dashboard-bg">
      <div className="xhome-wrap">
        {/* Saludo */}
        <header className="xhome-header">
          <h1 className="xhome-title">
            Buenas tardes, Verónica Mateo <span>👋</span>
          </h1>
          <p className="xhome-quote">
            "Creemos en la fuerza del trabajo bien hecho, incluso cuando nadie lo ve."
          </p>
        </header>

        {/* Tip de VictorIA (lamparita se mantiene) */}
        <section className="xhome-tip">
          <div className="xhome-tip-bulb">💡</div>
          <div>
            <div className="xhome-tip-title">Tip de VictorIA</div>
            <div className="xhome-tip-text">
              ¡Es fin de mes! Revisa <b>Permisos</b> y <b>Validación DT</b> en RR.HH.
            </div>
          </div>
        </section>

        {/* Grid 2x2 con cards compactas */}
        <div className="xhome-grid">
          {/* RRHH */}
          <section className="xcard">
            <div className="xcard-top xbar-blue" />
            <div className="xcard-head">
              <IconWrap fg="#1e40af" bg="#e5edff">
                <IUsers />
              </IconWrap>
              <div className="xcard-title">Recursos Humanos</div>
            </div>
            <p className="xcard-desc">Gestiona fichas, contratos y documentación legal.</p>

            <div className="xlinks">
              <Link to={ROUTES.listadoFichas} className="xitem">
                <span className="xitem-ico"><ICalendar /></span>
                <span>Listado y Fichas</span>
              </Link>
              <Link to={ROUTES.rrhhPermisos} className="xitem">
                <span className="xitem-ico"><IClipboard /></span>
                <span>Permisos y Justificaciones</span>
              </Link>
              <Link to={ROUTES.rrhhValidacionDT} className="xitem">
                <span className="xitem-ico"><ICheck /></span>
                <span>Validación DT</span>
              </Link>
              <Link to={ROUTES.rrhhDocumentos} className="xitem">
                <span className="xitem-ico"><IClipboard /></span>
                <span>Repositorio Documental</span>
              </Link>
              <Link
                to={ROUTES?.rrhhBodegaInventario || "/rrhh/bodega"}
                className="xitem"
              >
                <span className="xitem-ico"><IBox /></span>
                <span>Bodega y EPP</span>
              </Link>
            </div>
          </section>

          {/* Asistencia */}
          <section className="xcard">
            <div className="xcard-top xbar-green" />
            <div className="xcard-head">
              <IconWrap fg="#065f46" bg="#e8fff3">
                <IClock />
              </IconWrap>
              <div className="xcard-title">Asistencia</div>
            </div>
            <p className="xcard-desc">Control de horarios, marcas y gestión de turnos.</p>

            <div className="xlinks">
              <Link to={ROUTES.asistenciaSupervision} className="xitem">
                <span className="xitem-ico"><ISearch /></span>
                <span>Supervisión Integral</span>
              </Link>
              <Link to={ROUTES.asistenciaMarcas} className="xitem">
                <span className="xitem-ico"><ICheck /></span>
                <span>Marcas Registradas</span>
              </Link>
              <Link to={ROUTES.asistenciaMapa} className="xitem">
                <span className="xitem-ico"><IPin /></span>
                <span>Mapa de Cobertura</span>
              </Link>
              <Link to={ROUTES.asistenciaGestionDispositivos} className="xitem">
                <span className="xitem-ico"><IDevice /></span>
                <span>Gestión de Dispositivos</span>
              </Link>
              <Link to={ROUTES.asistenciaGestionTurnos} className="xitem">
                <span className="xitem-ico"><ITurns /></span>
                <span>Gestión de Turnos y Jornadas</span>
              </Link>
            </div>
          </section>

          {/* Comunicaciones */}
          <section className="xcard">
            <div className="xcard-top xbar-violet" />
            <div className="xcard-head">
              <IconWrap fg="#6d28d9" bg="#f3e8ff">
                <IMessage />
              </IconWrap>
              <div className="xcard-title">Comunicaciones</div>
            </div>
            <p className="xcard-desc">Mensajería, encuestas y comunicados para tu equipo.</p>
            <div className="xlinks">
              <span className="xitem xdisabled"><span className="xitem-ico"><IMessage /></span><span>Enviar mensaje</span></span>
              <span className="xitem xdisabled"><span className="xitem-ico"><IClipboard /></span><span>Plantillas</span></span>
              <span className="xitem xdisabled"><span className="xitem-ico"><ICheck /></span><span>Encuestas</span></span>
            </div>
          </section>

          {/* Reportes */}
          <section className="xcard">
            <div className="xcard-top xbar-pink" />
            <div className="xcard-head">
              <IconWrap fg="#be185d" bg="#ffe4ef">
                <IChart />
              </IconWrap>
              <div className="xcard-title">Reportes</div>
            </div>
            <p className="xcard-desc">Informes gerenciales y análisis de datos.</p>
            <div className="xlinks">
              <span className="xitem xdisabled"><span className="xitem-ico"><IChart /></span><span>Informes Gerenciales</span></span>
              <span className="xitem xdisabled"><span className="xitem-ico"><IChart /></span><span>Dashboards</span></span>
              <span className="xitem xdisabled"><span className="xitem-ico"><IClipboard /></span><span>Documentos</span></span>
            </div>
          </section>

          {/* Tictiva Cuida */}
          <section className="xcard">
            <div className="xcard-top xbar-orange" />
            <div className="xcard-head">
              <IconWrap fg="#9a3412" bg="#fff1d6">
                <IBrain />
              </IconWrap>
              <div className="xcard-title">Tictiva Cuida</div>
            </div>
            <p className="xcard-desc">Bienestar psicoemocional y salud organizacional.</p>
            <div className="xlinks">
              <span className="xitem xdisabled"><span className="xitem-ico"><IBrain /></span><span>Test Psicológicos</span></span>
              <span className="xitem xdisabled"><span className="xitem-ico"><IChart /></span><span>Dashboard de Bienestar</span></span>
              <span className="xitem xdisabled"><span className="xitem-ico"><IMessage /></span><span>VictorIA</span></span>
            </div>
          </section>
        </div>
      </div>

      {/* Estilos locales (no tocan el resto de la app) */}
      <style>{`
        .xhome-wrap{max-width:1080px;margin:0 auto;padding:24px}
        .xhome-title{font-size:42px;line-height:1.1;margin:0 0 6px;font-weight:800;color:#0f172a}
        .xhome-quote{margin:0;color:#64748b;font-size:16px}

        .xhome-tip{display:flex;gap:12px;align-items:center;background:#e7f0ff;border:1px solid #cfe0ff;
          border-radius:16px;padding:14px 16px;margin:14px 0 20px}
        .xhome-tip-bulb{font-size:22px;background:#ffe58a;border:1px solid #fcd34d;border-radius:999px;padding:10px}
        .xhome-tip-title{font-weight:800;color:#1e40af;margin-bottom:2px}
        .xhome-tip-text{color:#1f2937}

        .xhome-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        @media (max-width:1000px){ .xhome-grid{grid-template-columns:1fr} }

        .xcard{position:relative;background:#fff;border:1px solid #eef2f9;border-radius:16px;padding:16px 16px 14px;
          box-shadow:0 3px 6px rgba(0,0,0,.05)}
        .xcard-top{position:absolute;left:0;right:0;top:0;height:6px;border-top-left-radius:16px;border-top-right-radius:16px}
        .xbar-blue{background:#3b82f6}.xbar-green{background:#10b981}.xbar-violet{background:#8b5cf6}
        .xbar-pink{background:#ec4899}.xbar-orange{background:#f59e0b}

        .xcard-head{display:flex;align-items:center;gap:12px;margin-top:6px}
        .ico{width:44px;height:44px;border-radius:12px;display:grid;place-items:center}
        .xcard-title{font-size:22px;font-weight:800;color:#0f172a}
        .xcard-desc{margin:6px 0 8px;color:#6b7280}

        /* grid de enlaces para que la card no quede larga */
        .xlinks{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        @media (max-width:780px){ .xlinks{grid-template-columns:1fr} }

        .xitem{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid #eef2f9;border-radius:10px;
          background:#fff;color:#111827;text-decoration:none;font-weight:700}
        .xitem:hover{background:#f8fafc}
        .xitem-ico{width:18px;height:18px;display:grid;place-items:center;color:#475569}
        .xdisabled{opacity:.55;pointer-events:none}
      `}</style>
    </div>
  );
}
