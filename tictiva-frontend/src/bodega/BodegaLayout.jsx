// src/bodega/BodegaLayout.jsx
import React from "react";
import { NavLink, Outlet, Routes, Route } from "react-router-dom";
import HRSubnav from "../components/HRSubnav";

// Vistas hijas
import BodegaDashboard from "./BodegaDashboard";
import BodegaInventario from "./BodegaInventario";
import BodegaColaboradores from "./BodegaColaboradores";
import BodegaOperaciones from "./BodegaOperaciones";

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
          <NavLink
            to="/rrhh/bodega/dashboard"
            end
            className={({ isActive }) => `hr-pill${isActive ? " is-active" : ""}`}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/rrhh/bodega/inventario"
            className={({ isActive }) => `hr-pill${isActive ? " is-active" : ""}`}
          >
            Inventario
          </NavLink>
          <NavLink
            to="/rrhh/bodega/colaboradores"
            className={({ isActive }) => `hr-pill${isActive ? " is-active" : ""}`}
          >
            Colaboradores
          </NavLink>
          <NavLink
            to="/rrhh/bodega/operaciones"
            className={({ isActive }) => `hr-pill${isActive ? " is-active" : ""}`}
          >
            Operaciones
          </NavLink>
        </nav>
      </div>

      {/* Contenido de cada subpágina */}
      <div className="b-wrap">
        <Outlet />

        {/* Alias directo: asegura que /rrhh/bodega/inventario
            siempre muestre el componente, aunque se llame plano */}
        <Routes>
          <Route path="/rrhh/bodega/dashboard" element={<BodegaDashboard />} />
          <Route path="/rrhh/bodega/inventario" element={<BodegaInventario />} />
          <Route path="/rrhh/bodega/colaboradores" element={<BodegaColaboradores />} />
          <Route path="/rrhh/bodega/operaciones" element={<BodegaOperaciones />} />
        </Routes>
      </div>
    </div>
  );
}
