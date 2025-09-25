import React, { useState, useEffect, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import "./App.css";
import { ROUTES } from "./router/routes";

import LoginPage from "./components/LoginPage.jsx";
import ListadoFichas from "./pages/ListadoFichas.jsx";

function AppRoutes({ isLoggedIn, onLoginSuccess }) {
  const navigate = useNavigate();

  // Post-login → Listado de Fichas
  useEffect(() => {
    if (isLoggedIn) navigate(ROUTES.listadoFichas, { replace: true });
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage onLoginSuccess={onLoginSuccess} />} />
      </Routes>
    );
  }

  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Cargando…</div>}>
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.listadoFichas} replace />} />
        <Route path={ROUTES.listadoFichas} element={<ListadoFichas />} />
        <Route path="*" element={<Navigate to={ROUTES.listadoFichas} replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  // si aún no cableamos auth real, partimos en false y probamos login
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <AppRoutes
        isLoggedIn={isLoggedIn}
        onLoginSuccess={() => setIsLoggedIn(true)}
      />
    </Router>
  );
}
