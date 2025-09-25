// src/App.jsx
import React, { useState, Suspense, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import { ROUTES } from "./router/routes";
import { EmpresaProvider } from "./context/EmpresaContext";

// Pages / Components existentes en tu repo
import LoginPage from "./components/LoginPage.jsx";
import Dashboard from "./components/Dashboard.jsx";

import ListadoFichas from "./pages/ListadoFichas.jsx";
import EmpleadoDetalle from "./pages/EmpleadoDetalle.jsx";
import PermisosJustificaciones from "./pages/PermisosJustificaciones.jsx";
import ValidacionDT from "./pages/ValidacionDT.jsx";
import RepoDocs from "./pages/RepoDocs.jsx";

import SupervisionIntegral from "./pages/SupervisionIntegral.jsx";
import MarcasRegistradas from "./pages/MarcasRegistradas.jsx";
import MapaCobertura from "./pages/MapaCobertura.jsx";
import GestionDispositivos from "./pages/GestionDispositivos.jsx";
import GestionTurnos from "./pages/GestionTurnos.jsx";

// Bodega
import BodegaLayout from "./bodega/BodegaLayout.jsx";
import BodegaDashboard from "./bodega/BodegaDashboard.jsx";
import BodegaInventario from "./bodega/BodegaInventario.jsx";
import BodegaColaboradores from "./bodega/BodegaColaboradores.jsx";
import BodegaOperaciones from "./bodega/BodegaOperaciones.jsx";

function AppRoutes({ isLoggedIn, onLoginSuccess, onLogout }) {
  const navigate = useNavigate();

  // Al loguear, enviar directo a Listado de Fichas (evita "Not Available")
  useEffect(() => {
    if (isLoggedIn) navigate(ROUTES.listadoFichas, { replace: true });
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    return (
      <Suspense fallback={<div style={{ padding: 24 }}>Cargando…</div>}>
        <Routes>
          {/* Cargamos siempre Login si no hay sesión */}
          <Route path="*" element={<LoginPage onLoginSuccess={onLoginSuccess} />} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Cargando…</div>}>
      <Routes>
        {/* Redirecciones base y home */}
        <Route path="/" element={<Navigate to={ROUTES.listadoFichas} replace />} />
        <Route path={ROUTES.home} element={<Dashboard onLogout={onLogout} />} />

        {/* RRHH */}
        <Route path={ROUTES.listadoFichas} element={<ListadoFichas />} />
        {/* Si estos módulos están inestables, coméntalos temporalmente */}
        <Route path={ROUTES.rrhhPermisos} element={<PermisosJustificaciones />} />
        <Route path={`${ROUTES.rrhhValidacionDT}/*`} element={<ValidacionDT />} />
        <Route path={ROUTES.rrhhDocumentos} element={<RepoDocs />} />

        {/* Empleado */}
        <Route path={ROUTES.empleadoDetalleById} element={<EmpleadoDetalle />} />
        <Route path={ROUTES.empleadoDetalleByRut} element={<EmpleadoDetalle />} />
        <Route path={ROUTES.empleadoBase} element={<Navigate to={ROUTES.listadoFichas} replace />} />

        {/* Asistencia */}
        <Route path="/asistencia" element={<Navigate to={ROUTES.asistenciaSupervision} replace />} />
        <Route path={ROUTES.asistenciaSupervision} element={<SupervisionIntegral />} />
        <Route path={ROUTES.asistenciaMarcas} element={<MarcasRegistradas />} />
        <Route path={ROUTES.asistenciaMapa} element={<MapaCobertura />} />
        <Route path={ROUTES.asistenciaDispositivos} element={<GestionDispositivos />} />
        <Route path={ROUTES.asistenciaTurnos} element={<GestionTurnos />} />

        {/* Bodega (anidado) */}
        <Route path={`${ROUTES.rrhhBodegaRoot}/*`} element={<BodegaLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<BodegaDashboard />} />
          <Route path="inventario" element={<BodegaInventario />} />
          <Route path="colaboradores" element={<BodegaColaboradores />} />
          <Route path="operaciones" element={<BodegaOperaciones />} />
        </Route>

        {/* Fallback: SIEMPRE manda a Listado de Fichas (evita "Not Available") */}
        <Route path="*" element={<Navigate to={ROUTES.listadoFichas} replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const handleLoginSuccess = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  return (
    <EmpresaProvider>
      <Router>
        <AppRoutes
          isLoggedIn={isLoggedIn}
          onLoginSuccess={handleLoginSuccess}
          onLogout={handleLogout}
        />
      </Router>
    </EmpresaProvider>
  );
}
