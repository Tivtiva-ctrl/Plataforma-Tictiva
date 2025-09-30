import React, { useEffect, useState, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";

// Rutas centralizadas
import { ROUTES } from "./router/routes";

// Páginas / componentes (asegura las rutas y mayúsculas exactas)
import LoginPage from "./components/LoginPage.jsx";
import RecuperarContrasena from "./components/RecuperarContrasena.jsx";
import CambiarContrasena from "./components/CambiarContrasena.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import ListadoFichas from "./pages/ListadoFichas.jsx";

function AppRoutes({ isLoggedIn, onLoginSuccess, onLogout }) {
  const navigate = useNavigate();

  // Al loguear, manda al dashboard
  useEffect(() => {
    if (isLoggedIn) navigate(ROUTES.dashboard, { replace: true });
  }, [isLoggedIn, navigate]);

  // Rutas públicas (no logueado)
  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path={ROUTES.login} element={<LoginPage onLoginSuccess={onLoginSuccess} />} />
        <Route path={ROUTES.recuperar} element={<RecuperarContrasena />} />
        <Route path={ROUTES.cambiarContrasena} element={<CambiarContrasena />} />

        {/* Cualquier otra ruta pública redirige a /login */}
        <Route path={ROUTES.notFound} element={<Navigate to={ROUTES.login} replace />} />
      </Routes>
    );
  }

  // Rutas privadas (logueado)
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Cargando…</div>}>
      <Routes>
        <Route
          path={ROUTES.dashboard}
          element={<Dashboard userName="Verónica Mateo" onLogout={onLogout} />}
        />

        {/* RRHH */}
        <Route path={ROUTES.rrhh.listadoFichas} element={<ListadoFichas />} />
        {/* Ejemplo de ficha individual si luego la implementas */}
        {/* <Route path={ROUTES.rrhh.ficha()} element={<FichaEmpleado />} /> */}

        {/* Cualquier otra ruta privada va al dashboard */}
        <Route path={ROUTES.notFound} element={<Navigate to={ROUTES.dashboard} replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  // Cambia a true si ya tienes auth real con session
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = () => setIsLoggedIn(false);

  return (
    <Router>
      <AppRoutes
        isLoggedIn={isLoggedIn}
        onLoginSuccess={() => setIsLoggedIn(true)}
        onLogout={handleLogout}
      />
    </Router>
  );
}
