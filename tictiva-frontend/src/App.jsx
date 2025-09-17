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
// ❌ Quitamos LogoBar del login para evitar el hero viejo
import Navbar from "./components/Navbar";
import LoginPage from "./components/LoginPage";

// RRHH
import ListadoFichas from "./pages/ListadoFichas";
import EmpleadoDetalle from "./pages/EmpleadoDetalle";
import PermisosJustificaciones from "./pages/PermisosJustificaciones";
import ValidacionDT from "./pages/ValidacionDT";
import RepoDocs from "./pages/RepoDocs.jsx";

// Bodega
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
    <div className={isLoggedIn ? "dashboard-bg" : "login-shell"}>
      {/* ✅ En login NO renderizamos LogoBar para que no aparezca el hero viejo */}
      {isLoggedIn ? <NavbarWithLogout userName="Verónica" onLogout={handleLogout} /> : null}

      {!isLoggedIn ? (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <Suspense fallback={<div style={{ padding: 24 }}>Cargando…</div>}>
          <Routes>
            {/* Home */}
            <Route path={ROUTES?.home || "/"} element={<Dashboard />} />

            {/* RRHH */}
            <Route path={ROUTES.listadoFichas} element={<ListadoFichas />} />
            <Route path={ROUTES.rrhhPermisos} element={<PermisosJustificaciones />} />
            <Route path={`${ROUTES.rrhhValidacionDT}/*`} element={<ValidacionDT />} />
            <Route path={ROUTES.rrhhDocumentos} element={<RepoDocs />} />

            {/* Bodega */}
            <Route path={`${BODEGA.root}/*`} element={<BodegaLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<BodegaDashboard />} />
              <Route path="inventario" element={<BodegaInventario />} />
              <Route path="colaboradores" element={<BodegaColaboradores />} />
              <Route path="operaciones" element={<BodegaOperaciones />} />
            </Route>

            {/* Empleado */}
            <Route path="/rrhh/empleado/:id" element={<EmpleadoDetalle />} />
            <Route path="/rrhh/empleado/rut/:rut" element={<EmpleadoDetalle />} />
            <Route path="/rrhh/empleado" element={<Navigate to={ROUTES.listadoFichas} replace />} />

            {/* Asistencia */}
            <Route path="/asistencia" element={<Navigate to={ROUTES.asistenciaSupervision} replace />} />
            <Route path={ROUTES.asistenciaSupervision} element={<SupervisionIntegral />} />
            <Route path={ROUTES.asistenciaMarcas} element={<MarcasRegistradas />} />
            <Route path={ROUTES.asistenciaMapa} element={<MapaCobertura />} />
            <Route path={ROUTES.asistenciaDispositivos} element={<GestionDispositivos />} />
            <Route path={ROUTES.asistenciaTurnos} element={<GestionTurnos />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to={ROUTES?.home || "/"} replace />} />
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
