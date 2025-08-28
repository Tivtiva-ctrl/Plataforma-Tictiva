import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { ROUTES } from "../routes";
import HRSubnav from "../components/HRSubnav";

const Tab = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `b-tab ${isActive ? "is-active" : ""}`
    }
    end
  >
    {label}
  </NavLink>
);

export default function BodegaLayout() {
  return (
    <div className="b-wrap">
      <HRSubnav />
      <div className="b-tabs">
        <Tab to={ROUTES.rrhhBodega.dashboard}     label="Dashboard" />
        <Tab to={ROUTES.rrhhBodega.inventario}    label="Inventario" />
        <Tab to={ROUTES.rrhhBodega.colaboradores} label="Colaboradores" />
        <Tab to={ROUTES.rrhhBodega.operaciones}   label="Operaciones" />
      </div>
      <div className="b-body">
        <Outlet />
      </div>

      {/* estilos mínimos */}
      <style>{`
        .b-wrap{padding:12px}
        .b-tabs{display:flex; gap:8px; margin:8px 0 16px}
        .b-tab{padding:10px 14px;border:1px solid #E5E7EB;border-radius:10px;text-decoration:none;color:#111827;background:#fff}
        .b-tab.is-active{background:#1A56DB;border-color:#1A56DB;color:#fff}
        .b-body{display:block}
        .b-kpis{display:grid; grid-template-columns:repeat(5, minmax(160px,1fr)); gap:12px; margin:8px 0 16px}
        .b-card{border:1px solid #E5E7EB; border-radius:12px; background:#fff; padding:12px}
        .b-title{font-size:22px; font-weight:800; margin:0 0 6px}
        .b-muted{color:#6B7280; margin:0}
        .b-h2{font-size:18px; font-weight:800; margin:0 0 8px}
        .b-grid-3{display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px}
        .b-actions{display:flex; gap:8px; flex-wrap:wrap}
        .b-btn{border:1px solid #E5E7EB; border-radius:10px; background:#fff; padding:10px 12px; cursor:pointer}
        .b-btn.primary{background:#1A56DB; color:#fff; border-color:#1A56DB}
      `}</style>
    </div>
  );
}
