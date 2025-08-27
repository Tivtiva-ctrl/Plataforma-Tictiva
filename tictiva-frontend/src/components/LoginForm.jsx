// src/components/LoginForm.jsx
import React, { useState } from "react";

const LoginForm = ({ onLoginSuccess }) => {
  const [rememberMe, setRememberMe] = useState(false);

  const handleRememberMeChange = (e) => setRememberMe(e.target.checked);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (typeof onLoginSuccess === "function") onLoginSuccess();
  };

  return (
    <form className="login-form-card" onSubmit={handleSubmit}>
      <div className="login-form-title">Iniciar sesión</div>
      <div className="login-form-subtitle">
        Bienvenido de nuevo a tu plataforma de gestión
      </div>

      {/* Email */}
      <label className="login-form-label" htmlFor="email">Correo electrónico</label>
      <input
        className="login-form-input"
        id="email"
        type="email"
        placeholder="ejemplo@empresa.com"
        autoComplete="username"
      />

      {/* Password */}
      <label className="login-form-label" htmlFor="password">Contraseña</label>
      <div className="login-form-input-password">
        <input
          className="login-form-input"
          id="password"
          type="password"
          placeholder="********"
          autoComplete="current-password"
        />
        <span className="login-form-eye">
          {/* Ojo SVG aquí si quieres */}
        </span>
      </div>

      <div className="login-form-row">
        <label className="login-checkbox-label">
          <input
            type="checkbox"
            className="login-checkbox"
            checked={rememberMe}
            onChange={handleRememberMeChange}
          />
          Recordarme
        </label>
        <a className="login-form-link" href="#">¿Olvidaste tu contraseña?</a>
      </div>

      <button type="submit" className="login-form-button">
        Iniciar sesión
      </button>

      <div className="login-form-footer">
        ¿No tienes cuenta? <a href="#" className="login-form-link">Regístrate</a>
      </div>
    </form>
  );
};

export default LoginForm;
