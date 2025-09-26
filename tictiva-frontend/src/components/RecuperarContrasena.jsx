import React, { useState } from "react";
import "./LoginPage.css"; // reutiliza paleta, inputs y botones

export default function RecuperarContrasena() {
  const [email, setEmail] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: llamar a tu endpoint real de recuperación
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
