// src/pages/LoginPage.jsx
import React, { useState } from 'react';
// Asumiremos que tu logo está en esta ruta, ¡ajústala si es necesario!
import logoBlanco from '../assets/logo-tictiva-blanco.png'; 

function LoginPage({ onLoginSuccess }) {
  // Estado para controlar la visibilidad de la contraseña
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault(); // Previene que la página se recargue
    // Aquí iría la lógica para validar el usuario y contraseña
    console.log("Iniciando sesión...");
    onLoginSuccess(); // Llamamos a la función para pasar al dashboard
  };

  return (
    <div className="login-screen">
      {/* === Panel Izquierdo (Gradiente) === */}
      <div className="login-panel-left">
        <div className="login-branding">
          <img src={logoBlanco} alt="Logo Tictiva" className="login-logo-main" />
          <h1 className="login-tagline">Humanizamos la gestión, digitalizamos tu tranquilidad.</h1>
        </div>
      </div>

      {/* === Panel Derecho (Formulario) === */}
      <div className="login-panel-right">
        <div className="login-card">
          <h2>Iniciar sesión</h2>
          <p className="login-card-subtitle">Bienvenido de nuevo a tu plataforma de gestión</p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input type="email" id="email" defaultValue="ejemplo@empresa.com" />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="password-wrapper">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="password" 
                  defaultValue="••••••••" 
                />
                <button type="button" className="password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? '👁️' : '🔒'}
                </button>
              </div>
            </div>

            <div className="form-options">
              <div className="remember-me">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Recordarme</label>
              </div>
              <a href="#" className="forgot-password-link">¿Olvidaste tu contraseña?</a>
            </div>

            <button type="submit" className="login-submit-btn">Iniciar sesión</button>
          </form>

          <p className="signup-link">
            ¿No tienes cuenta? <a href="#">Regístrate</a>
          </p>
        </div>

        <div className="dt-access-card">
          <span>🛡️</span>
          <div>
            <p className="dt-title">Acceso para Fiscalización DT</p>
            <p className="dt-desc">Acceso temporal para fiscalizadores de la DT según normativa legal</p>
          </div>
          <span>›</span>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;