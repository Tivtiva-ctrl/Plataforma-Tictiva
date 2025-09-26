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

/* Aviso post-login para forzar cambio de contraseña */
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

/* ====== Vistas embebidas (evitan errores de importación) ====== */

/* Recuperar contraseña (estilo Tictiva: reutiliza clases de LoginPage.css) */
function RecuperarContrasena() {
  const [email, setEmail] = useState("");
  const onSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    alert("Si el correo existe, enviaremos un enlace de recuperación.");
  };
  return (
    <div className="authPage">
      <div className="authCard">
        <h1 className="authTitle">Recuperar acceso</h1>
        <p className="authSub">
          Ingresa tu correo para enviarte un enlace de recuperación.
        </p>
        <form onSubmit={onSubmit} className="authForm" noValidate>
          <label className="label" htmlFor="rec-email">Correo electrónico</label>
          <input
            id="rec-email"
            type="email"
            className="input"
            placeholder="ejemplo@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="actionsRow">
            <button type="submit" className="btnPrimary">Enviar enlace</button>
            <a href="/" className="btnSecondary">Volver</a>
          </div>
        </form>
      </div>
    </div>
  );
}

/* Cambiar contraseña */
function CambiarContrasena() {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!oldPass || !newPass || !newPass2) {
      setError("Completa todos los campos.");
      return;
    }
    if (newPass.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPass !== newPass2) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    alert("Contraseña actualizada correctamente.");
    window.location.href = "/";
  };

  return (
    <div className="authPage">
      <div className="authCard">
        <h1 className="authTitle">Cambiar contraseña</h1>
        <p className="authSub">Define una nueva contraseña segura para tu cuenta.</p>

        {error && (
          <div
            style={{
              background: "#fee2e2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
              padding: "10px 12px",
              borderRadius: 10,
              fontWeight: 600,
              marginBottom: 8,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="authForm" noValidate>
          <label className="label" htmlFor="old-pass">Contraseña actual</label>
          <input
            id="old-pass"
            type="password"
            className="input"
            placeholder="••••••••"
            value={oldPass}
            onChange={(e) => setOldPass(e.target.value)}
            required
          />

          <label className="label" htmlFor="new-pass">Nueva contraseña</label>
          <input
            id="new-pass"
            type="password"
            className="input"
            placeholder="••••••••"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            minLength={8}
            required
          />

          <label className="label" htmlFor="new-pass2">Confirmar nueva contraseña</label>
          <input
            id="new-pass2"
            type="password"
            className="input"
            placeholder="••••••••"
            value={newPass2}
            onChange={(e) => setNewPass2(e.target.value)}
            minLength={8}
            required
          />

          <div className="actionsRow">
            <button type="submit" className="btnPrimary">Guardar</button>
            <a href="/" className="btnSecondary">Cancelar</a>
          </div>
        </form>
      </div>
    </div>
  );
}

/* Inicio (placeholder de dashboard) */
function Home({ mustChangePassword, onGoChange, onDismissNotice }) {
  return (
    <main style={{ padding: 24 }}>
      {mustChangePassword && (
        <PasswordChangeNotice onGoChange={onGoChange} onDismiss={onDismissNotice} />
      )}
      <h1 style={{ margin: 0 }}>Inicio</h1>
      <p style={{ opacity: 0.75, marginTop: 8 }}>
        🚧 Aquí irá tu Dashboard principal.
      </p>
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
