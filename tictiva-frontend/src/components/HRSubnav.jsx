// src/components/HRSubnav.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { ROUTES } from "../router/routes";

import "./HRSubnav.css";

export default function HRSubnav() {
  const items = [
    { to: ROUTES.listadoFichas,    label: "Listado y Fichas" },
    { to: ROUTES.rrhhPermisos,     label: "Permisos y Justificaciones" },
    { to: ROUTES.rrhhValidacionDT, label: "Validación DT" },
    { to: ROUTES.rrhhDocumentos,   label: "Repositorio Documental" },
    { to: ROUTES.rrhhBodegaDashboard, label: "Bodega & EPP" }, // ✅ clave plana
  ];

  return (
    <div className="hr-pillbar-wrap" role="navigation" aria-label="Submenú RRHH">
      <nav className="hr-pillbar">
        {items.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            draggable={false}
            className={({ isActive }) => `hr-pill${isActive ? " is-active" : ""}`}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
