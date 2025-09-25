import { useState } from "react";
import "./LoginPage.css";
// Para usar Supabase en el futuro:
// import { supabase } from "@/services/supabaseClient";

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      // MOCK login simplificado
      if (!email || !pass) throw new Error("Ingresa correo y contraseña");
      onLoginSuccess?.();

      // Supabase (más adelante)
      /*
      const { error } = await supabase.auth.signInWithPassword({
        email, password: pass,
      });
      if (error) throw error;
      onLoginSuccess?.();
      */
    } catch (e) {
      setErr(e.message || "No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-col left">
          <div className="brand">
            <div className="logo-dot" />
            <span>Tictiva</span>
          </div>

          <h1>Bienvenido de nuevo</h1>
          <p className="subtitle">a tu plataforma de gestión</p>
          <p className="lead">Humanizamos la gestión, digitalizamos tu tranquilidad.</p>

          <form onSubmit={handleSubmit} className="form">
            {err && <div className="alert">{err}</div>}

            <label className="label">Correo electrónico</label>
            <input
              className="input"
              type="email"
              placeholder="ejemplo@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <label className="label">Contraseña</label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              autoComplete="current-password"
            />

            <div className="row">
              <label className="remember">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Recuérdame</span>
              </label>
              <a className="link" href="#">¿Olvidaste tu contraseña?</a>
            </div>

            <button className="btn-primary" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>

            <div className="hint">
              ¿No tienes cuenta? <a className="link" href="#">Regístrate</a>
            </div>
          </form>

          <a className="dt-card" href="#">
            <strong>Acceso para Fiscalización DT</strong> — Acceso temporal para
            fiscalizadores según normativa legal
            <span className="arrow">→</span>
          </a>
        </div>

        <div className="login-col right">
          <div className="art">
            {/* Si la imagen está en /public/img/login-illustration.png */}
            <img
              src="/img/login-illustration.png"
              alt="Ilustración de trabajo en equipo"
              className="hero-img"
            />
            <h3>Humanizamos la gestión,</h3>
            <h3>digitalizamos tu tranquilidad</h3>
          </div>
        </div>
      </div>
    </div>
  );
}
