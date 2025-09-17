// src/components/LoginPage.jsx
import React, { useState } from "react";
import "./LoginPage.css"; // ojo con mayúsculas

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLoginSuccess?.();
  };

  return (
    <main className="login">
      {/* Columna izquierda (formulario) */}
      <section className="login__form">
        {/* ✅ Logo real */}
        <div className="login__brand">
          <img
            className="login__brandImg"
            src="/branding/logo-tictiva.png"
            alt="Tictiva"
          />
        </div>

        <h1 className="login__title">Bienvenido de nuevo</h1>
        <div className="login__subtitle">a tu plataforma de gestión</div>
        <p className="login__slogan">
          Humanizamos la gestión, digitalizamos tu tranquilidad.
        </p>

        <form className="login__card" onSubmit={handleSubmit}>
          <label className="login__label">Correo electrónico</label>
          <input
            className="login__input"
            type="email"
            placeholder="ejemplo@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="login__label">Contraseña</label>
          <input
            className="login__input"
            type="password"
            placeholder="••••••••"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />

          <div className="login__row">
            <label className="login__checkbox">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Recuérdame
            </label>
            <a className="login__link" href="#recuperar">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button type="submit" className="login__btn">Iniciar sesión</button>

          <div className="login__footerRow">
            <span>¿No tienes cuenta?</span>
            <a className="login__link" href="#registro">Regístrate</a>
          </div>
        </form>

        {/* ✅ Banner DT fijo al fondo y uniforme */}
        <div className="login__dtBanner">
          <div className="login__dtIcon">🛡️</div>
          <div className="login__dtText">
            <strong>Acceso para Fiscalización DT</strong> — Acceso temporal para fiscalizadores según normativa legal
          </div>
          <a className="login__dtAction" href="#dt">→</a>
        </div>
      </section>

      {/* Columna derecha (ilustración) */}
      <section className="login__art">
        <img
          className="login__svg"
          src="/illustrations/login-illustration.png"
          alt="Ilustración Tictiva"
        />
        <div className="login__artCaption">
          Humanizamos la gestión, <br /> digitalizamos tu tranquilidad
        </div>
      </section>
    </main>
  );
}
