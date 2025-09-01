// src/App.jsx
import React, { useState, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import "./App.css";

import { ROUTES } from "./routes";

// Shell
import LogoBar from "./components/LogoBar";
import Navbar from "./components/Navbar";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard";

// RRHH
import ListadoFichas from "./pages/ListadoFichas";
import EmpleadoDetalle from "./pages/EmpleadoDetalle";
import PermisosJustificaciones from "./pages/PermisosJustificaciones";
import ValidacionDT from "./pages/ValidacionDT";
import RepoDocs from "./pages/RepoDocs.jsx";

// ===== Bodega & EPP (nuevo submódulo con tabs) =====
// 👇 OJO: los archivos están en src/bodega/, no en bodega/pages
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

// Rutas locales para Bodega (independientes de ROUTES por si no lo tienes aún)
const BODEGA = {
  root: "/rrhh/bodega",
  dashboard: "/rrhh/bodega/dashboard",
  inventario: "/rrhh/bodega/inventario",
  colaboradores: "/rrhh/bodega/colaboradores",
  operaciones: "/rrhh/bodega/operaciones",
};

function NavbarWithLogout({ userName, onLogout }) {
  const navigate = useNavigate();
  const handleLogout = () => {
    onLogout();
    navigate(ROUTES?.home || "/");
  };
  return <Navbar userName={userName} onLogout={handleLogout} />;
}

function MainApp({ isLoggedIn, handleLoginSuccess, handleLogout }) {
  return (
    <div className={isLoggedIn ? "dashboard-bg" : "login-page-container"}>
      {isLoggedIn ? (
        <NavbarWithLogout userName="Verónica" onLogout={handleLogout} />
      ) : (
        <LogoBar />
      )}

      {!isLoggedIn ? (
        <div className="login-form-wrapper">
          <LoginForm onLoginSuccess={handleLoginSuccess} />
          <div className="dt-card">
            <div className="dt-card-content">
              <span className="dt-card-icon">🛡️</span>
              <div className="dt-card-text">
                <span className="dt-card-title">Acceso para Fiscalización DT</span>
                <span className="dt-card-desc">
                  Acceso temporal para fiscalizadores de la DT según normativa legal
                </span>
              </div>
            </div>
            <span className="dt-card-arrow">&gt;</span>
          </div>
        </div>
      ) : (
        <Suspense fallback={<div style={{ padding: 24 }}>Cargando…</div>}>
          <Routes>
            {/* Home */}
            <Route path={ROUTES.home} element={<Dashboard />} />

            {/* RRHH */}
            <Route path={ROUTES.listadoFichas} element={<ListadoFichas />} />
            <Route path={ROUTES.rrhhPermisos} element={<PermisosJustificaciones />} />
            <Route path={`${ROUTES.rrhhValidacionDT}/*`} element={<ValidacionDT />} />
            <Route path={ROUTES.rrhhDocumentos} element={<RepoDocs />} />

            {/* Bodega & EPP (submódulo con pestañas) */}
            <Route path={`${BODEGA.root}/*`} element={<BodegaLayout />}>
              {/* /rrhh/bodega → /rrhh/bodega/dashboard */}
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<BodegaDashboard />} />
              <Route path="inventario" element={<BodegaInventario />} />
              <Route path="colaboradores" element={<BodegaColaboradores />} />
              <Route path="operaciones" element={<BodegaOperaciones />} />
            </Route>

            {/* Empleado (variantes) */}
            <Route path="/rrhh/empleado/:id" element={<EmpleadoDetalle />} />
            <Route path="/rrhh/empleado/rut/:rut" element={<EmpleadoDetalle />} />
            <Route
              path="/rrhh/empleado"
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
    </div>
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
