import React, { useState, useEffect, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  Link,
} from "react-router-dom";
import "./App.css";
import LoginPage from "./components/LoginPage.jsx";

/** Aviso superior para forzar cambio de contraseña post-login */
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
            background:
              "linear-gradient(90deg, #2563eb 0%, #06b6d4 100%)",
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

/** Inicio (placeholder de dashboard) con aviso de cambio de contraseña */
function Home({ mustChangePassword, onGoChange, onDismissNotice }) {
  return (
    <main style={{ padding: 24 }}>
      {mustChangePassword && (
        <PasswordChangeNotice
          onGoChange={onGoChange}
          onDismiss={onDismissNotice}
        />
      )}

      <h1 style={{ margin: 0 }}>Inicio</h1>
      <p style={{ opacity: 0.75, marginTop: 8 }}>
        🚧 Aquí irá tu Dashboard principal.
      </p>
    </main>
  );
}

/** Vista: Recuperar contraseña (placeholder funcional) */
function RecuperarContrasena() {
  return (
    <main style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <h1 style={{ margin: 0 }}>Recuperar acceso</h1>
      <p style={{ opacity: 0.75, marginTop: 8 }}>
        Ingresa tu correo para enviarte un enlace de recuperación.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          alert("Si el correo existe, enviaremos un enlace de recuperación.");
        }}
        style={{ marginTop: 16, display: "grid", gap: 12 }}
      >
        <label style={{ fontSize: 14, color: "#475569" }}>Correo electrónico</label>
        <input
          type="email"
          required
          placeholder="ejemplo@empresa.com"
          style={{
            height: 44,
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            padding: "0 14px",
            fontSize: 15,
          }}
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="submit"
            style={{
              height: 44,
              border: "none",
              borderRadius: 12,
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
              background: "linear-gradient(90deg, #2563eb, #06b6d4)",
              boxShadow: "0 6px 18px rgba(37, 99, 235, .25)",
              padding: "0 16px",
            }}
          >
            Enviar enlace
          </button>
          <Link
            to="/"
            style={{
              height: 44,
              display: "inline-flex",
              alignItems: "center",
              padding: "0 14px",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              color: "#0f172a",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Volver
          </Link>
        </div>
      </form>
    </main>
  );
}

/** Vista: Cambiar contraseña (placeholder funcional) */
function CambiarContrasena() {
  return (
    <main style={{ padding: 24, maxWidth: 520, margin: "0 auto" }}>
      <h1 style={{ margin: 0 }}>Cambiar contraseña</h1>
      <p style={{ opacity: 0.75, marginTop: 8 }}>
        Define una nueva contraseña segura para tu cuenta.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          alert("Contraseña actualizada correctamente.");
        }}
        style={{ marginTop: 16, display: "grid", gap: 12 }}
      >
        <label style={{ fontSize: 14, color: "#475569" }}>Contraseña actual</label>
        <input
          type="password"
          required
          placeholder="••••••••"
          style={{
            height: 44,
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            padding: "0 14px",
            fontSize: 15,
          }}
        />

        <label style={{ fontSize: 14, color: "#475569" }}>Nueva contraseña</label>
        <input
          type="password"
          required
          placeholder="••••••••"
          minLength={8}
          style={{
            height: 44,
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            padding: "0 14px",
            fontSize: 15,
          }}
        />

        <label style={{ fontSize: 14, color: "#475569" }}>Confirmar nueva contraseña</label>
        <input
          type="password"
          required
          placeholder="••••••••"
          minLength={8}
          style={{
            height: 44,
            borderRadius: 12,
            border: "1px solid #e2e8f0",
            padding: "0 14px",
            fontSize: 15,
          }}
        />

        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="submit"
            style={{
              height: 44,
              border: "none",
              borderRadius: 12,
              fontWeight: 700,
              color: "#fff",
              cursor: "pointer",
              background: "linear-gradient(90deg, #2563eb, #06b6d4)",
              boxShadow: "0 6px 18px rgba(37, 99, 235, .25)",
              padding: "0 16px",
            }}
          >
            Guardar
          </button>
          <Link
            to="/"
            style={{
              height: 44,
              display: "inline-flex",
              alignItems: "center",
              padding: "0 14px",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
              color: "#0f172a",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Cancelar
          </Link>
        </div>
      </form>
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
  // Mock de auth: al iniciar sesión, habilitamos aviso de cambio de contraseña
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
