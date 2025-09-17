import React, { useState } from "react";
import "./LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pass, setPass]  = useState("");
  const [remember, setRemember] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    // TODO: integrar con tu API
    // login({ email, pass, remember })
  };

  return (
    <main className="login">
      {/* Columna izquierda: formulario */}
      <section className="login__form">
        <header className="login__brand">
          {/* Reemplaza por tu logo SVG/IMG si quieres */}
          <span className="login__logoMark" aria-hidden>◩</span>
          <span className="login__logoText">Tictiva</span>
        </header>

        <h1 className="login__title">Bienvenido de nuevo</h1>
        <p className="login__subtitle">a tu plataforma de gestión</p>

        <p className="login__slogan">
          Humanizamos la gestión, digitalizamos tu tranquilidad.
        </p>

        <form className="login__card" onSubmit={onSubmit}>
          <label className="login__label" htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            type="email"
            className="login__input"
            placeholder="ejemplo@empresa.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />

          <label className="login__label" htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            className="login__input"
            placeholder="••••••••"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            autoComplete="current-password"
            required
          />

          <div className="login__row">
            <label className="login__checkbox">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Recuérdame</span>
            </label>

            <a className="login__link" href="/recuperar">¿Olvidaste tu contraseña?</a>
          </div>

          <button className="login__btn" type="submit">Iniciar sesión</button>

          <div className="login__footerRow">
            <span>¿No tienes cuenta?</span>
            <a className="login__link" href="/registro">Regístrate</a>
          </div>
        </form>

        <div className="login__dtBanner" role="note">
          <span className="login__dtIcon" aria-hidden>🛡️</span>
          <div className="login__dtText">
            <strong>Acceso para Fiscalización DT</strong>
            <span> Acceso temporal para fiscalizadores según normativa legal</span>
          </div>
          <a className="login__dtAction" href="/dt/acceso">→</a>
        </div>
      </section>

      {/* Columna derecha: ilustración + texto institucional */}
      <aside className="login__art">
        <Illustration />
        <p className="login__artCaption">
          Humanizamos la gestión,<br />digitalizamos tu tranquilidad
        </p>
      </aside>
    </main>
  );
}

/* Ilustración simple en SVG (sin assets externos). 
   Si prefieres tu imagen, reemplaza <Illustration /> por <img src="/mi-ilustracion.png" alt="Equipo colaborando" /> */
function Illustration() {
  return (
    <svg className="login__svg" viewBox="0 0 720 520" aria-hidden>
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0%"  stopColor="#1F8BFF"/>
          <stop offset="50%" stopColor="#22D3EE"/>
          <stop offset="100%" stopColor="#14B8A6"/>
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="720" height="520" fill="url(#g1)" opacity="0.18" />
      {/* figuras básicas estilo flat */}
      <circle cx="600" cy="110" r="24" fill="#FFD966" />
      <rect x="120" y="360" width="480" height="10" rx="5" fill="#0F172A" opacity="0.08" />
      <g fill="#0EA5E9" opacity="0.9">
        <rect x="180" y="280" width="110" height="60" rx="10"/>
        <rect x="315" y="240" width="125" height="85" rx="12"/>
        <rect x="470" y="260" width="120" height="70" rx="12"/>
      </g>
      <g fill="#0F172A" opacity="0.12">
        <circle cx="200" cy="160" r="48"/>
        <circle cx="360" cy="120" r="40"/>
        <circle cx="520" cy="160" r="48"/>
      </g>
    </svg>
  );
}
