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

function PasswordChangeNotice({ onGoChange, onDismiss }) {
  return (
    <div
      style={{
        padding: "12px 16px",
        borderRadius: 12,
        background: "#fff7ed",
        border: "1px solid #fed7aa",
        color: "#7c2d12",
        display: "flex",
        alignItems: "center",
        gap: 12,
        justifyContent: "space-between",
        boxShadow: "0 6px 18px rgba(124,45,18,.06)",
        marginBottom: 16,
      }}
    >
      <div style={{ fontWeight: 700 }}>
        🔒 Por seguridad, te recomendamos cambiar tu contraseña.
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={onGoChange}
          style={{
            height: 36,
            padding: "0 14px",
            borderRadius: 10,
            border: "none",
            fontWeight: 700,
            background: "linear-gradient(90deg, #2563eb 0%, #06b6d4 100%)",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          Cambiar ahora
        </button>
        <button
          onClick={onDismiss}
          style={{
            height: 36,
            padding: "0 12px",
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            background: "#fff",
            color: "#0f172a",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Después
        </button>
      </div>
    </div>
  );
}

function Home({ mustChangePassword, onGoChange, onDismissNotice }) {
  return (
    <main style={{ padding: 24 }}>
      {mustChangePassword && (
        <PasswordChangeNotice onGoChange={onGoChange} onDismiss={onDismissNotice} />
      )}
      {/* Dashboard real */}
      <Dashboard />
    </main>
  );
}

function AppRoutes({ isLoggedIn, onLoginSuccess, mustChangePassword, setMustChangePassword }) {
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
        <Route
          path="/"
          element={
            <Home
              mustChangePassword={mustChangePassword}
              onGoChange={() => navigate("/cambiar-contrasena")}
              onDismissNotice={() => setMustChangePassword(false)}
            />
          }
        />
        <Route path="/cambiar-contrasena" element={<CambiarContrasena />} />
        <Route path="/recuperar" element={<RecuperarContrasena />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  return (
    <Router>
      <AppRoutes
        isLoggedIn={isLoggedIn}
        mustChangePassword={mustChangePassword}
        setMustChangePassword={setMustChangePassword}
        onLoginSuccess={() => {
          setIsLoggedIn(true);
          setMustChangePassword(true);
        }}
      />
    </Router>
  );
}
