import React, { useState } from "react";
import "./LoginPage.css";
import { supabase } from "../lib/supabase"; // ⬅️ NUEVO: cliente Supabase

/** Imagen servida desde /public/assets/ */
const ILLUSTRATION_ABS_PATH = "/assets/login-illustration.png";

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !pwd.trim()) {
      setError("Ingresa correo y contraseña");
      return;
    }

    setError("");
    try {
      // ⬇️ Inicia sesión en Supabase
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pwd.trim(),
      });
      if (authError) {
        setError("Correo o contraseña inválidos");
        return;
      }

      // Guarda email si corresponde
      if (remember) {
        try {
          localStorage.setItem("tictiva.remember.email", email.trim());
        } catch (_) {}
      }

      // Continúa con tu flujo actual
      if (typeof onLoginSuccess === "function") onLoginSuccess();
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    }
  };

  return (
    <div className="loginPage">
      <div className="loginCard">
        {/* Izquierda: formulario */}
        <section className="loginLeft">
          <header className="brand">
            <span className="brand-dot" />
            <span className="brand-name">Tictiva</span>
          </header>

          <h1 className="title">Bienvenido de nuevo</h1>
          <p className="subtitle">a tu plataforma de gestión</p>
          <p className="tagline">Humanizamos la gestión, digitalizamos tu tranquilidad.</p>

          {error && <div className="errorBox">{error}</div>}

          <form className="form" onSubmit={handleSubmit} noValidate>
            <label className="label" htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="ejemplo@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />

            <div className="fieldGap" />

            <label className="label" htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="••••••••"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              autoComplete="current-password"
              required
            />

            {/* Solo el checkbox; quitamos el link azul de arriba */}
            <div className="rowBetween" style={{ justifyContent: "flex-start" }}>
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Recuérdame</span>
              </label>
            </div>

            <button type="submit" className="btnPrimary">Iniciar sesión</button>
          </form>

          {/* Enlace único de recuperación debajo del botón */}
          <p className="small" style={{ marginTop: 12 }}>
            ¿Olvidaste tu contraseña?{" "}
            <a className="link" href="/recuperar">Recuperar acceso</a>
          </p>

          <div className="dtBox">
            <strong>Acceso para Fiscalización DT</strong> — Acceso temporal para
            fiscalizadores según normativa legal <span className="arrow">→</span>
          </div>
        </section>

        {/* Derecha: ilustración + lema */}
        <aside className="loginRight" aria-label="Ilustración">
          {/* Fallback accesible */}
          <img
            className="sr-only"
            src={ILLUSTRATION_ABS_PATH}
            alt="Ilustración de trabajo en equipo"
          />
          <div className="rightOverlay">
            <p className="rightSlogan">
              Humanizamos la gestión,<br />digitalizamos tu tranquilidad
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
