// src/layouts/RRHHLayout.jsx
import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { ROUTES } from '../router/routes';
import './RRHHLayout.css';

const Tab = ({ to, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      'rrhh-tab' + (isActive ? ' rrhh-tab--active' : '')
    }
  >
    {children}
  </NavLink>
);

export default function RRHHLayout() {
  return (
    <div className="rrhh-wrap">
      <header className="rrhh-header">
        <h1 className="rrhh-title">Módulo RRHH</h1>
        <nav className="rrhh-tabs">
          <Tab to={ROUTES.rrhhDashboard}>Resumen</Tab>
          <Tab to={ROUTES.rrhhPermisos}>Permisos y Justificaciones</Tab>
          <Tab to={ROUTES.rrhhDocumentos}>Documentos</Tab>
          <Tab to={ROUTES.rrhhValidacionDT}>Validación DT</Tab>
        </nav>
      </header>

      {/* SIN ESTO… pantalla en blanco al entrar a subrutas */}
      <main className="rrhh-content">
        <Outlet />
      </main>
    </div>
  );
}
