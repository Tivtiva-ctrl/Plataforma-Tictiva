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
import { ROUTES } from "./routes";

// Login / Shell
import LoginPage from "./components/LoginPage";

// 👇 Dashboard (le pasamos onLogout para cerrar sesión desde el avatar)
import Dashboard from "./components/Dashboard.jsx";

// RRHH
import ListadoFichas from "./pages/ListadoFichas";
import EmpleadoDetalle from "./pages/EmpleadoDetalle";
import PermisosJustificaciones from "./pages/PermisosJustificaciones";
import ValidacionDT from "./pages/ValidacionDT";
import RepoDocs from "./pages/RepoDocs";

// Bodega (usa ROUTES)
import BodegaLayout from "./bodega/BodegaLayout";
import BodegaDashboard from "./bodega/BodegaDashboard";
import BodegaInventario from "./bodega/BodegaInventario";
import BodegaColaboradores from "./bodega/BodegaColaboradores";
import BodegaOperaciones from "./bodega/BodegaOperaciones";

// Asistencia
import SupervisionIntegral from "./pages/SupervisionIntegral";
import MarcasRegistradas from "./pages/MarcasRegistradas";
import MapaCobertura from "./pages/MapaCobertura";
import GestionDispositivos from "./pages/GestionDispositivos";
import GestionTurnos from "./pages/GestionTurnos";

import { EmpresaProvider } from "./context/EmpresaContext";

// ============ MainApp ============
function MainApp({ isLoggedIn, handleLoginSuccess, handleLogout }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) navigate(ROUTES.home || "/", { replace: true });
  }, [isLoggedIn, navigate]);

  return (
    <>
      {!isLoggedIn ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Suspense fallback={<div style={{ padding: 24 }}>Cargando…</div>}>
          <Routes>
            {/* Home */}
            <Route
              path={ROUTES.home}
              element={<Dashboard onLogout={handleLogout} />}
            />

            {/* RRHH */}
            <Route path={ROUTES.listadoFichas} element={<ListadoFichas />} />
            <Route path={ROUTES.rrhhPermisos} element={<PermisosJustificaciones />} />
            <Route path={`${ROUTES.rrhhValidacionDT}/*`} element={<ValidacionDT />} />
            <Route path={ROUTES.rrhhDocumentos} element={<RepoDocs />} />

            {/* Bodega (anidado con ROUTES) */}
            <Route path={`${ROUTES.rrhhBodegaRoot}/*`} element={<BodegaLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<BodegaDashboard />} />
              <Route path="inventario" element={<BodegaInventario />} />
              <Route path="colaboradores" element={<BodegaColaboradores />} />
              <Route path="operaciones" element={<BodegaOperaciones />} />
            </Route>

            {/* Empleado */}
            <Route path={ROUTES.empleadoDetalleById} element={<EmpleadoDetalle />} />
            <Route path={ROUTES.empleadoDetalleByRut} element={<EmpleadoDetalle />} />
            <Route
              path={ROUTES.empleadoBase}
              element={<Navigate to={ROUTES.listadoFichas} replace />}
            />

            {/* Asistencia */}
            <Route
              path="/asistencia"
              element={<Navigate to={ROUTES.asistenciaSupervision} replace />}
            />
            <Route path={ROUTES.asistenciaSupervision} element={<SupervisionIntegral />} />
            <Route path={ROUTES.asistenciaMarcas} element={<MarcasRegistradas />} />
            <Route path={ROUTES.asistenciaMapa} element={<MapaCobertura />} />
            <Route path={ROUTES.asistenciaDispositivos} element={<GestionDispositivos />} />
            <Route path={ROUTES.asistenciaTurnos} element={<GestionTurnos />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
          </Routes>
        </Suspense>
      )}
    </>
  );
}

// ============ App (root) ============
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const handleLoginSuccess = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  return (
    <EmpresaProvider>
      <Router>
        <MainApp
          isLoggedIn={isLoggedIn}
          handleLoginSuccess={handleLoginSuccess}
          handleLogout={handleLogout}
        />
      </Router>
    </EmpresaProvider>
  );
}
