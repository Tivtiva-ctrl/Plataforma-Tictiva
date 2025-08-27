// src/components/AsistenciaSubnav.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { ROUTES } from "../routes";

export default function AsistenciaSubnav() {
  const items = [
    { to: ROUTES.asistenciaSupervision, label: "Supervisión Integral", },
    { to: ROUTES.asistenciaMarcas,      label: "Marcas Registradas",   },
    { to: ROUTES.asistenciaMapa,        label: "Mapa de Cobertura"},
    { to: ROUTES.asistenciaDispositivos,label: "Gestión de Dispositivos"},
    // si aún no tienes ruta de turnos, puedes dejarlo apuntando a un placeholder
    { to: "/asistencia/turnos",         label: "Gestión de Turnos y Jornadas", },
  ];

  return (
    <div className="as-subnav-wrap">
      <nav className="as-subnav">
        {items.map(it => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              "as-subnav-link" + (isActive ? " is-active" : "")
            }
          >
            <span className="as-subnav-emoji" aria-hidden>{it.emoji}</span>
            <span>{it.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* estilos locales para no romper nada más */}
      <style>{`
        .as-subnav-wrap { padding: 8px 16px 12px; }
        .as-subnav {
          display:flex; gap:18px; align-items:center; flex-wrap:wrap;
          background:#fff; border:1px solid #e5e7eb; border-radius:16px;
          padding:10px; box-shadow:0 2px 10px rgba(0,0,0,.04);
        }
        .as-subnav-link {
          display:inline-flex; align-items:center; gap:8px;
          font-weight:900; font-size:16px;
          color:#0f172a; text-decoration:none;
          padding:10px 14px; border-radius:12px;
          outline:0;
        }
        .as-subnav-link:hover { background:#f8fafc; }
        .as-subnav-link.is-active {
          background:#e9f1ff; border:1px solid #cfe0ff;
          box-shadow: inset 0 -2px 0 #2563eb;
          color:#1e40af;
        }
        .as-subnav-emoji { font-size:18px; line-height:1; }
      `}</style>
    </div>
  );
}
