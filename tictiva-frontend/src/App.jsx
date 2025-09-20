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
import { ROUTES } from "./router/routes"; // ✅ ruta real de tus rutas

// Login / Shell
import LoginPage from "./components/LoginPage.jsx";

// Dashboard
import Dashboard from "./components/Dashboard.jsx";

// RRHH (están en src/components)
import ListadoFichas from "./components/ListadoFichas.jsx";
import EmpleadoDetalle from "./components/EmpleadoDetalle.jsx";
import PermisosJustificaciones from "./components/PermisosJustificaciones.jsx";
import ValidacionDT from "./components/ValidacionDT.jsx";
import RepoDocs from "./components/RepoDocs.jsx";

// Bodega (están en src/bodega)
import BodegaLayout from "./bodega/BodegaLayout.jsx";
import BodegaDashboard from "./bodega/BodegaDashboard.jsx";
import BodegaInventario from "./bodega/BodegaInventario.jsx";
import BodegaColaboradores from "./bodega/BodegaColaboradores.jsx";
import BodegaOperaciones from "./bodega/BodegaOperaciones.jsx";

// Asistencia (también en src/components)
import SupervisionIntegral from "./components/SupervisionIntegral.jsx";
import MarcasRegistradas from "./components/MarcasRegistradas.jsx";
import MapaCobertura from "./components/MapaCobertura.jsx";
import GestionDispositivos from "./components/GestionDispositivos.jsx";
import GestionTurnos from "./components/GestionTurnos.jsx";

import { EmpresaProvider } from "./context/EmpresaContext";

function MainApp({ isLoggedIn, handleLoginSuccess, handleLogout }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) navigate(ROUTES.home, { replace: true });
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
