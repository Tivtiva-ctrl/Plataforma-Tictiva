import React, { useState } from "react";
import "./LoginPage.css";

/**
 * Usa la imagen desde /public/assets/ con RUTA ABSOLUTA.
 * Verifica que exista: public/assets/login-illustration.png
 * Puedes abrirla directo: https://TU_DOMINIO/assets/login-illustration.png
 */
const ILLUSTRATION_ABS_PATH = "/assets/login-illustration.png";

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim() || !pwd.trim()) {
      setError("Ingresa correo y contraseña");
      return;
    }

    // Aquí iría tu llamada real de login. Por ahora simulamos éxito:
    setError("");
    if (remember) {
      try {
        localStorage.setItem("tictiva.remember.email", email.trim());
      } catch (_) {}
    }
    onLoginSuccess?.();
  };

  return (
    <div className="loginPage">
      <div className="loginCard">
        {/* Columna izquierda: formulario */}
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
            />

            <div className="rowBetween">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Recuérdame</span>
              </label>

              <a className="link" href="#recuperar">¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" className="btnPrimary">Iniciar sesión</button>
          </form>

          <p className="small">
            ¿No tienes cuenta? <a className="link" href="#registro">Regístrate</a>
          </p>

          <div className="dtBox">
            <strong>Acceso para Fiscalización DT</strong> — Acceso temporal para
            fiscalizadores según normativa legal <span className="arrow">→</span>
          </div>
        </section>

        {/* Columna derecha: ilustración + frase (usa fondo por CSS) */}
        <aside className="loginRight" aria-label="Ilustración">
          {/* Fallback por si quisieras usar <img> en lugar de background: */}
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
