import React, { useState } from "react";
import "./LoginPage.css"; // reutiliza paleta, inputs y botones

export default function CambiarContrasena() {
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

    // TODO: llamar a tu endpoint real de cambio de contraseña
    alert("Contraseña actualizada correctamente.");
    window.location.href = "/"; // vuelve al inicio
  };

  return (
    <div className="authPage">
      <div className="authCard">
        <h1 className="authTitle">Cambiar contraseña</h1>
        <p className="authSub">
          Define una nueva contraseña segura para tu cuenta.
        </p>

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
