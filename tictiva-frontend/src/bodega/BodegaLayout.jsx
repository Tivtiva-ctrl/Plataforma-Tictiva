// src/bodega/BodegaLayout.jsx
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import HRSubnav from "../components/HRSubnav";

// ⬅️ IMPORTA EL CSS (ajusta SOLO si tu archivo está en otra ruta)
import "../components/Bodega.css";

export default function BodegaLayout() {
  return (
    <div className="dashboard-bg" style={{ padding: 16 }}>
      {/* Submenú principal de RRHH */}
      <HRSubnav />

      {/* Subtabs internas del módulo Bodega & EPP */}
      <div
        className="hr-pillbar-wrap"
        role="navigation"
        aria-label="Submenú Bodega & EPP"
        style={{ marginTop: 8 }}
      >
        <nav className="hr-pillbar">
          {/* ✅ Enlaces RELATIVOS al layout /rrhh/bodega/* */}
          <NavLink
            to="dashboard"
            end
            className={({ isActive }) => `hr-pill${isActive ? " is-active" : ""}`}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="inventario"
            className={({ isActive }) => `hr-pill${isActive ? " is-active" : ""}`}
          >
            Inventario
          </NavLink>
          <NavLink
            to="colaboradores"
            className={({ isActive }) => `hr-pill${isActive ? " is-active" : ""}`}
          >
            Colaboradores
          </NavLink>
          <NavLink
            to="operaciones"
            className={({ isActive }) => `hr-pill${isActive ? " is-active" : ""}`}
          >
            Operaciones
          </NavLink>
        </nav>
      </div>

      {/* Contenido de cada subpágina (viene del router padre) */}
      <div className="b-wrap">
        <Outlet />
      </div>
    </div>
  );
}
