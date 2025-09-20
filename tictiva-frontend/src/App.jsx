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
import { ROUTES } from "./router/routes.js";
import { EmpresaProvider } from "./context/EmpresaContext";

// --- Tus Componentes de Página ---
import LoginPage from "./components/LoginPage.jsx"; // Asumo que LoginPage está en pages
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


// --- NUEVO COMPONENTE PARA MANEJAR LAS RUTAS ---
// Este componente vive DENTRO del Router y puede usar hooks de navegación sin problemas
function AppRoutes({ isLoggedIn, onLoginSuccess, onLogout }) {
  const navigate = useNavigate();

  // Este efecto te redirige al home después de iniciar sesión
  useEffect(() => {
    if (isLoggedIn) {
      navigate(ROUTES.home, { replace: true });
    }
  }, [isLoggedIn, navigate]);

  // Si el usuario está logueado, muestra las rutas protegidas. Si no, muestra el Login.
  return isLoggedIn ? (
    <Suspense fallback={<div style={{ padding: 24 }}>Cargando…</div>}>
      <Routes>
        {/* Home */}
        <Route path={ROUTES.home} element={<Dashboard onLogout={onLogout} />} />

        {/* RRHH */}
        <Route path={ROUTES.listadoFichas} element={<ListadoFichas />} />
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

        {/* Fallback */}
        <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
      </Routes>
    </Suspense>
  ) : (
    <Routes>
        <Route path="*" element={<LoginPage onLoginSuccess={onLoginSuccess} />} />
    </Routes>
  );
}

// --- COMPONENTE PRINCIPAL (más limpio) ---
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Cambia a true para pruebas sin login
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