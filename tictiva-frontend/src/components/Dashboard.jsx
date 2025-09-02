// src/components/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../App.css";
import { ROUTES } from "../routes";

export default function Dashboard() {
  const linkStyle = {
    color: "#111827",
    textDecoration: "none",
    fontWeight: 600,
    lineHeight: 1.35,
  };

  return (
    <div className="dashboard-bg">
      <div className="home-wrap">
        {/* Saludo */}
        <header className="home-header">
          <h1 className="home-title">
            Buenas tardes, Verónica Mateo <span aria-hidden>👋</span>
          </h1>
          <p className="home-quote">
            "Creemos en la fuerza del trabajo bien hecho, incluso cuando nadie lo ve."
          </p>
        </header>

        {/* Tip con lamparita */}
        <section className="tip-card" aria-label="Tip de VictorIA">
          <div className="tip-ico" aria-hidden>💡</div>
          <div>
            <div className="tip-title">Tip de VictorIA</div>
            <div className="tip-text">
              ¡Es un buen momento para revisar <b>Permisos</b> y la <b>Validación DT</b> en RR.HH.!
            </div>
          </div>
        </section>

        {/* Módulos principales (como la 2ª imagen) */}
        <div className="modules-grid">
          {/* Recursos Humanos */}
          <section className="module accent-blue">
            <div className="module-head">
              <div className="module-ico" aria-hidden>🫂</div>
              <div className="module-title">Recursos Humanos</div>
            </div>
            <p className="module-desc">
              Gestiona fichas, contratos y documentación legal.
            </p>
            <nav className="module-links">
              <Link to={ROUTES.listadoFichas} style={linkStyle}>📅 Listado y Fichas</Link>
              <Link to={ROUTES.rrhhPermisos} style={linkStyle}>📋 Permisos y Justificaciones</Link>
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
            <p className="module-desc">
              Control de horarios, marcas y gestión de turnos.
            </p>
            <nav className="module-links">
              <Link to={ROUTES.asistenciaMarcas} style={linkStyle}>✅ Marcas Registradas</Link>
              <Link to={ROUTES.asistenciaMapa} style={linkStyle}>📍 Mapa de Cobertura</Link>
              <Link to={ROUTES.asistenciaGestionTurnos} style={linkStyle}>📅 Gestión de Turnos</Link>
            </nav>
          </section>
        </div>
      </div>

      {/* Estilos locales del dashboard (look & feel 2ª imagen) */}
      <style>{`
        .home-wrap{max-width:1100px;margin:0 auto;padding:24px}
        .home-header{margin-bottom:12px}
        .home-title{font-size:42px;line-height:1.1;margin:0 0 6px;font-weight:800;color:#0f172a}
        .home-quote{margin:0;color:#64748b;font-size:16px}

        .tip-card{display:flex;gap:12px;align-items:flex-start;background:#e6f0ff;border:1px solid #bfdbfe;
          border-radius:16px;padding:16px 18px;margin:16px 0 22px}
        .tip-ico{font-size:26px;line-height:1;background:#fff;border:1px solid #dbeafe;border-radius:12px;padding:6px 10px}
        .tip-title{font-weight:800;color:#1e3a8a;margin-bottom:4px}
        .tip-text{color:#1f2937}

        .modules-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
        @media (max-width:980px){ .modules-grid{grid-template-columns:1fr} }

        .module{position:relative;background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:18px 18px 14px;
          box-shadow:0 2px 8px rgba(15,23,42,.04)}
        .module:before{content:"";position:absolute;left:14px;right:14px;top:-2px;height:8px;border-radius:999px}
        .accent-blue:before{background:#3b82f6}
        .accent-green:before{background:#10b981}

        .module-head{display:flex;align-items:center;gap:12px;margin-top:2px}
        .module-ico{font-size:22px;background:#f1f5f9;border:1px solid #e5e7eb;border-radius:14px;padding:10px 12px}
        .module-title{font-size:24px;font-weight:800;color:#0f172a}
        .module-desc{margin:8px 0 10px;color:#6b7280}

        .module-links{display:grid;gap:10px}
      `}</style>
    </div>
  );
}
