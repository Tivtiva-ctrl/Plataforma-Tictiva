// src/App.jsx
import React, { useEffect, useState, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { ROUTES } from "./router/routes";

import LoginPage from "./components/LoginPage.jsx";
import RecuperarContrasena from "./components/RecuperarContrasena.jsx";
import CambiarContrasena from "./components/CambiarContrasena.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import ListadoFichas from "./pages/ListadoFichas.jsx";
import EmpleadoFicha from "./pages/EmpleadoFicha.jsx";

// Provider multi-empresa (import por DEFECTO)
import TenantProvider from "./context/TenantProvider.jsx";

/* ===== Util: Restaurar scroll al cambiar ruta ===== */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppRoutes({ isLoggedIn, onLoginSuccess, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isPublicPath = (p) =>
    p === "/" ||
    p === ROUTES.login ||
    p === ROUTES.recuperar ||
    p === ROUTES.cambiarContrasena;

  useEffect(() => {
    if (isLoggedIn && isPublicPath(location.pathname)) {
      navigate(ROUTES.dashboard, { replace: true });
    }
  }, [isLoggedIn, location.pathname, navigate]);

  if (!isLoggedIn) {
    return (
      <>
        <ScrollToTop />
        <Routes>
          <Route
            path={ROUTES.login}
            element={<LoginPage onLoginSuccess={onLoginSuccess} />}
          />
          <Route path={ROUTES.recuperar} element={<RecuperarContrasena />} />
          <Route path={ROUTES.cambiarContrasena} element={<CambiarContrasena />} />
          <Route path={ROUTES.notFound} element={<Navigate to={ROUTES.login} replace />} />
        </Routes>
      </>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<div style={{ padding: 24 }}>Cargando…</div>}>
        <Routes>
          <Route
            path={ROUTES.dashboard}
            element={<Dashboard userName="Verónica Mateo" onLogout={onLogout} />}
          />

          {/* RRHH */}
          <Route path={ROUTES.rrhh.listadoFichas} element={<ListadoFichas />} />

          {/* Rutas históricas (las dejo para compatibilidad) */}
          <Route path="/rrhh/ficha/:rut" element={<EmpleadoFicha />} />
          <Route path="/rrhh/empleado/fichas/:id" element={<EmpleadoFicha />} />
          <Route path="/rrhh/empleado/fichas/rut/:rut" element={<EmpleadoFicha />} />

          {/* NUEVAS rutas recomendadas (por ID y por query) */}
          <Route path="/empleados/:id" element={<EmpleadoFicha />} />
          <Route path="/empleado" element={<EmpleadoFicha />} />

          {/* Catch-all privado */}
          <Route path={ROUTES.notFound} element={<Navigate to={ROUTES.dashboard} replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const handleLogout = () => setIsLoggedIn(false);

  return (
    <Router>
      <TenantProvider>
        <AppRoutes
          isLoggedIn={isLoggedIn}
          onLoginSuccess={() => setIsLoggedIn(true)}
          onLogout={handleLogout}
        />
      </TenantProvider>
    </Router>
  );
}
