import React, { useState, useEffect, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import "./App.css";

import LoginPage from "./components/LoginPage.jsx";
import RecuperarContrasena from "./components/RecuperarContrasena.jsx";
import CambiarContrasena from "./components/CambiarContrasena.jsx";
import Dashboard from "./pages/Dashboard.jsx";

function AppRoutes({ isLoggedIn, onLoginSuccess, onLogout }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) navigate("/", { replace: true });
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/recuperar" element={<RecuperarContrasena />} />
        <Route path="*" element={<LoginPage onLoginSuccess={onLoginSuccess} />} />
      </Routes>
    );
  }

  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Cargando…</div>}>
      <Routes>
        <Route path="/" element={<Dashboard userName="Verónica Mateo" onLogout={onLogout} />} />
        <Route path="/cambiar-contrasena" element={<CambiarContrasena />} />
        <Route path="/recuperar" element={<RecuperarContrasena />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

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
