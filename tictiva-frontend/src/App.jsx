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

/** Placeholder de inicio; reemplázalo por tu Dashboard cuando quieras */
function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ margin: 0 }}>Inicio</h1>
      <p style={{ opacity: 0.75, marginTop: 8 }}>
        🚧 Módulo principal aún no disponible. Aquí irá tu Dashboard.
      </p>
    </main>
  );
}

function AppRoutes({ isLoggedIn, onLoginSuccess }) {
  const navigate = useNavigate();

  // Post-login → ir al inicio "/"
  useEffect(() => {
    if (isLoggedIn) navigate("/", { replace: true });
  }, [isLoggedIn, navigate]);

  // Si NO está logueado: todo va a Login
  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage onLoginSuccess={onLoginSuccess} />} />
      </Routes>
    );
  }

  // Si está logueado: rutas de la app (SIN ListadoFichas)
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Cargando…</div>}>
      <Routes>
        {/* Ruta principal */}
        <Route path="/" element={<Home />} />

        {/* Cualquier ruta desconocida redirige al inicio */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  // Si aún no cableas auth real, parte en false y usa onLoginSuccess para simular login
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
