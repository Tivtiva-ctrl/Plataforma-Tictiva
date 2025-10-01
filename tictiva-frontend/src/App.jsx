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

// Rutas centralizadas
import { ROUTES } from "./router/routes";

// Páginas / componentes
import LoginPage from "./components/LoginPage.jsx";
import RecuperarContrasena from "./components/RecuperarContrasena.jsx";
import CambiarContrasena from "./components/CambiarContrasena.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import ListadoFichas from "./pages/ListadoFichas.jsx";

/* ⬇️⬇️ ÚNICO AGREGADO: Provider multi-empresa ⬇️⬇️ */
import { TenantProvider } from "./context/TenantProvider.jsx";

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

  // Detecta si la ruta actual es pública
  const isPublicPath = (p) => {
    return (
      p === "/" ||
      p === ROUTES.login ||
      p === ROUTES.recuperar ||
      p === ROUTES.cambiarContrasena
    );
  };

  // Si se loguea y estaba en una ruta pública, lo mandamos al dashboard.
  useEffect(() => {
    if (isLoggedIn && isPublicPath(location.pathname)) {
      navigate(ROUTES.dashboard, { replace: true });
    }
  }, [isLoggedIn, location.pathname, navigate]);

  // Rutas públicas (no logueado)
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
          <Route
            path={ROUTES.cambiarContrasena}
            element={<CambiarContrasena />}
          />
          {/* Cualquier otra ruta pública redirige a /login */}
          <Route
            path={ROUTES.notFound}
            element={<Navigate to={ROUTES.login} replace />}
          />
        </Routes>
      </>
    );
  }

  // Rutas privadas (logueado)
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
          {/* Ejemplo de ruta futura:
          <Route path={ROUTES.rrhh.ficha(":rut")} element={<FichaEmpleado />} />
          */}

          {/* Cualquier otra ruta privada va al dashboard */}
          <Route
            path={ROUTES.notFound}
            element={<Navigate to={ROUTES.dashboard} replace />}
          />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  // Cambia a true si ya tienes auth real con session
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = () => setIsLoggedIn(false);

  return (
    <Router>
      {/* ⬇️ Envolvemos TODAS las rutas dentro del TenantProvider */}
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
