// src/components/Dashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { ROUTES } from "../routes";

function Lnk({ to, icon, children }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="xh-link xh-linkbtn"
      title={typeof children === "string" ? children : undefined}
    >
      <span className="xh-li-ico">{icon}</span>
      <span>{children}</span>
    </button>
  );
}

export default function Dashboard() {
  return (
    <div className="dashboard-bg">
      <div className="xh-wrap">
        {/* Encabezado */}
        <header className="xh-head">
          <h1 className="xh-title">
            Buenas tardes, Verónica Mateo <span>👋</span>
          </h1>
          <p className="xh-sub">
            "Creemos en la fuerza del trabajo bien hecho, incluso cuando nadie lo ve."
          </p>
        </header>

        {/* Tip */}
        <section className="xh-tip">
          <div className="xh-tip-ico">💡</div>
          <div>
            <div className="xh-tip-title">Tip de VictorIA</div>
            <div className="xh-tip-text">
              ¡Es fin de mes! Revisa <b>Permisos</b> y <b>Validación DT</b> en RR.HH.
            </div>
          </div>
        </section>

        {/* Grid 2x2 */}
        <div className="xh-grid">
          {/* RRHH */}
          <section className="xh-card">
            <div className="xh-bar xh-blue" />
            <div className="xh-card-head">
              <span className="xh-appico xh-blue-bg">👥</span>
              <h3 className="xh-card-title">Recursos Humanos</h3>
            </div>
            <p className="xh-desc">Gestiona fichas, contratos y documentación legal.</p>
            <div className="xh-links">
              <Lnk to={ROUTES.listadoFichas} icon="📅">Listado y Fichas</Lnk>
              <Lnk to={ROUTES.rrhhPermisos} icon="📋">Permisos y Justificaciones</Lnk>
              <Lnk to={ROUTES.rrhhValidacionDT} icon="✅">Validación DT</Lnk>
              <Lnk to={ROUTES.rrhhDocumentos} icon="📁">Repositorio Documental</Lnk>
              {/* Bodega: al root; adentro ya redirige al dashboard/inventario */}
              <Lnk to={"/rrhh/bodega"} icon="📦">Bodega y EPP</Lnk>
            </div>
          </section>

          {/* Asistencia */}
          <section className="xh-card">
            <div className="xh-bar xh-green" />
            <div className="xh-card-head">
              <span className="xh-appico xh-green-bg">🕒</span>
              <h3 className="xh-card-title">Asistencia</h3>
            </div>
            <p className="xh-desc">Control de horarios, marcas y gestión de turnos.</p>
            <div className="xh-links">
              <Lnk to={ROUTES.asistenciaSupervision} icon="🔎">Supervisión Integral</Lnk>
              <Lnk to={ROUTES.asistenciaMarcas} icon="✅">Marcas Registradas</Lnk>
              <Lnk to={ROUTES.asistenciaMapa} icon="📍">Mapa de Cobertura</Lnk>
              <Lnk to={ROUTES.asistenciaGestionDispositivos} icon="📟">Gestión de Dispositivos</Lnk>
              <Lnk to={ROUTES.asistenciaGestionTurnos} icon="📅">Gestión de Turnos y Jornadas</Lnk>
            </div>
          </section>

          {/* Comunicaciones (placeholder) */}
          <section className="xh-card">
            <div className="xh-bar xh-violet" />
            <div className="xh-card-head">
              <span className="xh-appico xh-violet-bg">💬</span>
              <h3 className="xh-card-title">Comunicaciones</h3>
            </div>
            <p className="xh-desc">Mensajería, encuestas y comunicados para tu equipo.</p>
            <div className="xh-links">
              <span className="xh-link xh-disabled"><span className="xh-li-ico">✉️</span> Enviar mensaje</span>
              <span className="xh-link xh-disabled"><span className="xh-li-ico">📝</span> Plantillas</span>
              <span className="xh-link xh-disabled"><span className="xh-li-ico">⭐</span> Encuestas</span>
            </div>
          </section>

          {/* Reportes (placeholder) */}
          <section className="xh-card">
            <div className="xh-bar xh-pink" />
            <div className="xh-card-head">
              <span className="xh-appico xh-pink-bg">📊</span>
              <h3 className="xh-card-title">Reportes</h3>
            </div>
            <p className="xh-desc">Informes gerenciales y análisis de datos.</p>
            <div className="xh-links">
              <span className="xh-link xh-disabled"><span className="xh-li-ico">📄</span> Informes Gerenciales</span>
              <span className="xh-link xh-disabled"><span className="xh-li-ico">📈</span> Dashboards</span>
              <span className="xh-link xh-disabled"><span className="xh-li-ico">📁</span> Documentos</span>
            </div>
          </section>

          {/* Tictiva Cuida (placeholder) */}
          <section className="xh-card">
            <div className="xh-bar xh-orange" />
            <div className="xh-card-head">
              <span className="xh-appico xh-orange-bg">🧠</span>
              <h3 className="xh-card-title">Tictiva Cuida</h3>
            </div>
            <p className="xh-desc">Bienestar psicoemocional y salud organizacional.</p>
            <div className="xh-links">
              <span className="xh-link xh-disabled"><span className="xh-li-ico">🧑‍⚕️</span> Test Psicológicos</span>
              <span className="xh-link xh-disabled"><span className="xh-li-ico">📊</span> Dashboard de Bienestar</span>
              <span className="xh-link xh-disabled"><span className="xh-li-ico">🤖</span> VictorIA</span>
            </div>
          </section>
        </div>
      </div>

      {/* CSS local */}
      <style>{`
        .xh-wrap{max-width:1080px;margin:0 auto;padding:24px}
        .xh-head{margin-bottom:6px}
        .xh-title{margin:0 0 4px;font-weight:800;font-size:42px;line-height:1.1;color:#0f172a}
        .xh-title span{font-size:.9em}
        .xh-sub{margin:0;color:#64748b}

        .xh-tip{display:flex;gap:12px;align-items:center;background:#e7f0ff;border:1px solid #cfe0ff;
          border-radius:16px;padding:14px 16px;margin:14px 0 18px}
        .xh-tip-ico{font-size:22px;background:#ffe58a;border:1px solid #fcd34d;border-radius:999px;padding:10px}
        .xh-tip-title{font-weight:800;color:#1e40af}
        .xh-tip-text{color:#1f2937}

        .xh-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
        @media (max-width:1024px){ .xh-grid{grid-template-columns:1fr} }

        .xh-card{position:relative;background:#fff;border:1px solid #eef2f9;border-radius:16px;padding:16px;
          box-shadow:0 4px 8px rgba(15,23,42,.06)}
        .xh-bar{position:absolute;left:0;right:0;top:0;height:6px;border-top-left-radius:16px;border-top-right-radius:16px}
        .xh-blue{background:#3b82f6}.xh-green{background:#10b981}.xh-violet{background:#8b5cf6}
        .xh-pink{background:#ec4899}.xh-orange{background:#f59e0b}

        .xh-card-head{display:flex;align-items:center;gap:12px;margin-top:4px}
        .xh-appico{width:44px;height:44px;border-radius:12px;display:grid;place-items:center;
          font-size:22px;border:1px solid rgba(0,0,0,.06)}
        .xh-blue-bg{background:#e5edff}.xh-green-bg{background:#e8fff3}
        .xh-violet-bg{background:#f3e8ff}.xh-pink-bg{background:#ffe4ef}.xh-orange-bg{background:#fff1d6}
        .xh-card-title{margin:0;font-size:22px;font-weight:800;color:#0f172a}
        .xh-desc{margin:6px 0 10px;color:#6b7280}

        .xh-links{display:grid;grid-template-columns:1fr 1fr;gap:8px}
        @media (max-width:780px){ .xh-links{grid-template-columns:1fr} }
        .xh-link{display:flex;align-items:center;gap:8px;padding:10px;border:1px solid #eef2f9;border-radius:10px;background:#fff}
        .xh-link:hover{background:#f8fafc}
        .xh-li-ico{display:inline-grid;place-items:center;width:18px}
        .xh-disabled{opacity:.55;pointer-events:none}

        /* Botón que parece link */
        .xh-linkbtn{cursor:pointer;color:#0f172a;font-weight:700;text-align:left}
        .xh-linkbtn:focus{outline:2px solid #c7d2fe;outline-offset:2px;border-color:#c7d2fe}
      `}</style>
    </div>
  );
}
