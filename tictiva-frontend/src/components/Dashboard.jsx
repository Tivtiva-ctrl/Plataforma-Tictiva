// src/components/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../App.css";
import { ROUTES } from "../routes";

export default function Dashboard() {
  const linkStyle = {
    color: "#111827",
    textDecoration: "none",
    fontWeight: 700,
    lineHeight: 1.25,
  };

  return (
    <div className="dashboard-bg">
      <div className="home-wrap">
        {/* Saludo grande */}
        <header className="home-header">
          <h1 className="home-title">
            Buenas tardes, Verónica Mateo <span aria-hidden>👋</span>
          </h1>
          <p className="home-quote">
            "Creemos en la fuerza del trabajo bien hecho, incluso cuando nadie lo ve."
          </p>
        </header>

        {/* Tip de VictorIA con 💡 */}
        <section className="tip-card" aria-label="Tip de VictorIA">
          <div className="tip-ico" aria-hidden>💡</div>
          <div>
            <div className="tip-title">Tip de VictorIA</div>
            <div className="tip-text">
              ¡Es fin de mes! Es un buen momento para revisar los permisos y la
              Validación DT en Recursos Humanos.
            </div>
          </div>
        </section>

        {/* Grid de módulos (estilo 2ª imagen) */}
        <div className="modules-grid">
          {/* Recursos Humanos */}
          <section className="module accent-blue">
            <div className="module-head">
              <div className="module-ico" aria-hidden>🫂</div>
              <div className="module-title">Recursos Humanos</div>
            </div>
            <p className="module-desc">Gestiona fichas, contratos y documentación legal.</p>
            <nav className="module-links">
              <Link to={ROUTES.listadoFichas} style={linkStyle}>📅 Listado y Fichas</Link>
              <Link to={ROUTES.rrhhPermisos} style={linkStyle}>📋 Permisos y Justificaciones</Link>
              <Link to={ROUTES.rrhhValidacionDT} style={linkStyle}>✅ Validación DT</Link>
              <Link to={ROUTES.rrhhDocumentos} style={linkStyle}>📁 Repositorio Documental</Link>
              <Link
                to={ROUTES?.rrhhBodegaInventario || "/rrhh/bodega"}
                style={linkStyle}
              >
                📦 Bodega y EPP
              </Link>
            </nav>
          </section>

          {/* Asistencia */}
          <section className="module accent-green">
            <div className="module-head">
              <div className="module-ico" aria-hidden>🕒</div>
              <div className="module-title">Asistencia</div>
            </div>
            <p className="module-desc">Control de horarios, marcas y gestión de turnos.</p>
            <nav className="module-links">
              <Link to={ROUTES.asistenciaSupervision} style={linkStyle}>🔎 Supervisión Integral</Link>
              <Link to={ROUTES.asistenciaMarcas} style={linkStyle}>✅ Marcas Registradas</Link>
              <Link to={ROUTES.asistenciaMapa} style={linkStyle}>📍 Mapa de Cobertura</Link>
              <Link to={ROUTES.asistenciaGestionDispositivos} style={linkStyle}>📟 Gestión de Dispositivos</Link>
              <Link to={ROUTES.asistenciaGestionTurnos} style={linkStyle}>📅 Gestión de Turnos y Jornadas</Link>
            </nav>
          </section>

          {/* Comunicaciones */}
          <section className="module accent-purple">
            <div className="module-head">
              <div className="module-ico" aria-hidden>💬</div>
              <div className="module-title">Comunicaciones</div>
            </div>
            <p className="module-desc">Mensajería, encuestas y comunicados para tu equipo.</p>
            <div className="module-links">
              <span className="mod-link-disabled">✉️ Enviar mensaje</span>
              <span className="mod-link-disabled">📝 Plantillas</span>
              <span className="mod-link-disabled">⭐ Encuestas</span>
            </div>
          </section>

          {/* Reportes */}
          <section className="module accent-pink">
            <div className="module-head">
              <div className="module-ico" aria-hidden>📊</div>
              <div className="module-title">Reportes</div>
            </div>
            <p className="module-desc">Informes gerenciales y análisis de datos.</p>
            <div className="module-links">
              <span className="mod-link-disabled">📄 Informes Gerenciales</span>
              <span className="mod-link-disabled">📈 Dashboards</span>
              <span className="mod-link-disabled">📁 Documentos</span>
            </div>
          </section>

          {/* Tictiva Cuida */}
          <section className="module accent-yellow">
            <div className="module-head">
              <div className="module-ico" aria-hidden>🧠</div>
              <div className="module-title">Tictiva Cuida</div>
            </div>
            <p className="module-desc">Bienestar psicoemocional y salud organizacional.</p>
            <div className="module-links">
              <span className="mod-link-disabled">🧑‍⚕️ Test Psicológicos</span>
              <span className="mod-link-disabled">📊 Dashboard de Bienestar</span>
              <span className="mod-link-disabled">🤖 VictorIA</span>
            </div>
          </section>
        </div>
      </div>

      {/* Estilos locales para el look de la 2ª imagen (sin Tailwind) */}
      <style>{`
        .home-wrap{max-width:1100px;margin:0 auto;padding:24px}
        .home-header{margin-bottom:12px}
        .home-title{font-size:42px;line-height:1.1;margin:0 0 6px;font-weight:800;color:#0f172a}
        .home-quote{margin:0;color:#64748b;font-size:16px}

        .tip-card{display:flex;gap:12px;align-items:flex-start;background:#e6f0ff;border:1px solid #bfdbfe;
          border-radius:16px;padding:16px 18px;margin:16px 0 22px}
        .tip-ico{font-size:26px;line-height:1;background:#fff;border:1px solid #dbeafe;border-radius:999px;padding:6px 10px}
        .tip-title{font-weight:800;color:#1e3a8a;margin-bottom:4px}
        .tip-text{color:#1f2937}

        .modules-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
        @media (max-width:980px){ .modules-grid{grid-template-columns:1fr} }

        .module{position:relative;background:#fff;border:1px solid #eef2f9;border-radius:16px;padding:18px;
          box-shadow:0 4px 6px -1px rgba(0,0,0,.05),0 2px 4px -2px rgba(0,0,0,.05)}
        .module:hover{transform:translateY(-2px);transition:transform .2s ease, box-shadow .2s ease;
          box-shadow:0 10px 15px -3px rgba(0,0,0,.07),0 4px 6px -2px rgba(0,0,0,.05)}
        .module:before{content:"";position:absolute;left:0;right:0;top:0;height:6px}
        .accent-blue:before{background:#3b82f6}
        .accent-green:before{background:#10b981}
        .accent-purple:before{background:#8b5cf6}
        .accent-pink:before{background:#ec4899}
        .accent-yellow:before{background:#f59e0b}

        .module-head{display:flex;align-items:center;gap:12px;margin-top:6px}
        .module-ico{font-size:22px;background:#f1f5f9;border:1px solid #e5e7eb;border-radius:14px;padding:10px 12px}
        .module-title{font-size:24px;font-weight:800;color:#0f172a}
        .module-desc{margin:8px 0 10px;color:#6b7280}
        .module-links{display:grid;gap:8px}
        .mod-link-disabled{color:#9ca3af;cursor:not-allowed;display:inline-block;padding:2px 0}
      `}</style>
    </div>
  );
}
