// src/components/BodegaSubnav.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { ROUTES } from "../routes";
import "./Bodega.css";

export default function BodegaSubnav() {
  const items = [
    { to: ROUTES.rrhhBodegaDashboard,     label: "Dashboard" },
    { to: ROUTES.rrhhBodegaInventario,    label: "Inventario" },
    { to: ROUTES.rrhhBodegaColaboradores, label: "Colaboradores" },
    { to: ROUTES.rrhhBodegaOperaciones,   label: "Operaciones" },
  ];
  return (
    <div className="bod-subnav" role="navigation" aria-label="Submenú Bodega & EPP">
      {items.map(i => (
        <NavLink key={i.to} to={i.to} end className={({isActive}) => "bod-pill" + (isActive?" is-active":"")}>
          {i.label}
        </NavLink>
      ))}
    </div>
  );
}
