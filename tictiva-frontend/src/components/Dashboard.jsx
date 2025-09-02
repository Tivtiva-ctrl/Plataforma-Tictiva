// src/components/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { ROUTES } from "../routes";

export default function Dashboard() {
  const linkStyle = { color: "#111827", textDecoration: "none", fontWeight: 700, lineHeight: 1.25 };

  return (
    <div className="xhome-wrap">
      {/* Saludo */}
      <header className="xhome-header">
        <h1 className="xhome-title">
          Buenas tardes, Verónica Mateo <span aria-hidden>👋</span>
        </h1>
        <p className="xhome-quote">
          "Creemos en la fuerza del trabajo bien hecho, incluso cuando nadie lo ve."
        </p>
      </header>

      {/* Tip de VictorIA (💡) */}
      <section className="xhome-tip" aria-label="Tip de VictorIA">
        <div className="xhome-tip-ico" aria-hidden>💡</div>
        <div>
          <div className="xhome-tip-title">Tip de VictorIA</div>
          <div className="xhome-tip-text">
            ¡Es fin de mes! Revisa <b>Permisos</b> y <b>Validación DT</b> en RR.HH.
          </div>
        </div>
      </section>

      {/* Grid de módulos (diseño tarjetas con barra superior de color) */}
      <div className="xhome-grid">
        {/* RR.HH. */}
        <section className="xcard">
          <div className="xcard-bar" style={{ background: "#3b82f6" }} />
          <div className="xcard-head">
            <div className="xcard-ico" aria-hidden>🫂</div>
            <div className="xcard-title">Recursos Humanos</div>
          </div>
          <p className="xcard-desc">Gestiona fichas, contratos y documentación legal.</p>
          <nav className="xcard-links">
            <Link to={ROUTES.listadoFichas} style={linkStyle}>📅 Listado y Fichas</Link>
            <Link to={ROUTES.rrhhPermisos} style={linkStyle}>📋 Permisos y Justificaciones</Link>
            <Link to={ROUTES.rrhhValidacionDT} style={linkStyle}>✅ Validación DT</Link>
            <Link to={ROUTES.rrhhDocumentos} style={linkStyle}>📁 Repositorio Documental</Link>
            <Link to={ROUTES?.rrhhBodegaInventario || "/rrhh/bodega"} style={linkStyle}>📦 Bodega y EPP</Link>
          </nav>
        </section>

        {/* Asistencia */}
        <section className="xcard">
          <div className="xcard-bar" style={{ background: "#10b981" }} />
          <div className="xcard-head">
            <div className="xcard-ico" aria-hidden>🕒</div>
            <div className="xcard-title">Asistencia</div>
          </div>
          <p className="xcard-desc">Control de horarios, marcas y gestión de turnos.</p>
          <nav className="xcard-links">
            <Link to={ROUTES.asistenciaSupervision} style={linkStyle}>🔎 Supervisión Integral</Link>
            <Link to={ROUTES.asistenciaMarcas} style={linkStyle}>✅ Marcas Registradas</Link>
            <Link to={ROUTES.asistenciaMapa} style={linkStyle}>📍 Mapa de Cobertura</Link>
            <Link to={ROUTES.asistenciaGestionDispositivos} style={linkStyle}>📟 Gestión de Dispositivos</Link>
            <Link to={ROUTES.asistenciaGestionTurnos} style={linkStyle}>📅 Gestión de Turnos y Jornadas</Link>
          </nav>
        </section>

        {/* Comunicaciones */}
        <section className="xcard">
          <div className="xcard-bar" style={{ background: "#8b5cf6" }} />
          <div className="xcard-head">
            <div className="xcard-ico" aria-hidden>💬</div>
            <div className="xcard-title">Comunicaciones</div>
          </div>
          <p className="xcard-desc">Mensajería, encuestas y comunicados para tu equipo.</p>
          <div className="xcard-links">
            <span className="xlink-disabled">✉️ Enviar mensaje</span>
            <span className="xlink-disabled">📝 Plantillas</span>
            <span className="xlink-disabled">⭐ Encuestas</span>
          </div>
        </section>

        {/* Reportes */}
        <section className="xcard">
          <div className="xcard-bar" style={{ background: "#ec4899" }} />
          <div className="xcard-head">
            <div className="xcard-ico" aria-hidden>📊</div>
            <div className="xcard-title">Reportes</div>
          </div>
          <p className="xcard-desc">Informes gerenciales y análisis de datos.</p>
          <div className="xcard-links">
            <span className="xlink-disabled">📄 Informes Gerenciales</span>
            <span className="xlink-disabled">📈 Dashboards</span>
            <span className="xlink-disabled">📁 Documentos</span>
          </div>
        </section>

        {/* Tictiva Cuida */}
        <section className="xcard">
          <div className="xcard-bar" style={{ background: "#f59e0b" }} />
          <div className="xcard-head">
            <div className="xcard-ico" aria-hidden>🧠</div>
            <div className="xcard-title">Tictiva Cuida</div>
          </div>
          <p className="xcard-desc">Bienestar psicoemocional y salud organizacional.</p>
          <div className="xcard-links">
            <span className="xlink-disabled">🧑‍⚕️ Test Psicológicos</span>
            <span className="xlink-disabled">📊 Dashboard de Bienestar</span>
            <span className="xlink-disabled">🤖 VictorIA</span>
          </div>
        </section>
      </div>

      {/* Estilos scoping (no choca con App.css) */}
      <style>{`
        .xhome-wrap{max-width:1100px;margin:0 auto;padding:24px}
        .xhome-header{margin-bottom:10px}
        .xhome-title{font-size:42px;line-height:1.1;margin:0 0 6px;font-weight:800;color:#0f172a}
        .xhome-quote{margin:0;color:#64748b;font-size:16px}

        .xhome-tip{display:flex;gap:12px;align-items:flex-start;background:#e6f0ff;border:1px solid #bfdbfe;
          border-radius:16px;padding:16px 18px;margin:16px 0 22px}
        .xhome-tip-ico{font-size:22px;line-height:1;background:#fff;border:1px solid #dbeafe;border-radius:999px;padding:8px}
        .xhome-tip-title{font-weight:800;color:#1e3a8a;margin-bottom:4px}
        .xhome-tip-text{color:#1f2937}

        .xhome-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
        @media (max-width:980px){ .xhome-grid{grid-template-columns:1fr} }

        .xcard{position:relative;background:#fff;border:1px solid #eef2f9;border-radius:16px;padding:18px;
          box-shadow:0 4px 6px -1px rgba(0,0,0,.05),0 2px 4px -2px rgba(0,0,0,.05);overflow:hidden}
        .xcard:hover{transform:translateY(-2px);transition:transform .2s ease, box-shadow .2s ease;
          box-shadow:0 10px 15px -3px rgba(0,0,0,.07),0 4px 6px -2px rgba(0,0,0,.05)}
        .xcard-bar{position:absolute;left:0;right:0;top:0;height:6px}

        .xcard-head{display:flex;align-items:center;gap:12px;margin-top:6px}
        .xcard-ico{font-size:22px;background:#f1f5f9;border:1px solid #e5e7eb;border-radius:14px;padding:10px 12px}
        .xcard-title{font-size:24px;font-weight:800;color:#0f172a}
        .xcard-desc{margin:8px 0 10px;color:#6b7280}

        .xcard-links{display:grid;gap:8px}
        .xlink-disabled{color:#9ca3af;cursor:not-allowed;display:inline-block;padding:2px 0}
      `}</style>
    </div>
  );
}
