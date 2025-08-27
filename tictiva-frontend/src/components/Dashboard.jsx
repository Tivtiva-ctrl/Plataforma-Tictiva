// src/components/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../App.css";
import { ROUTES } from "../routes"; // ✅ usar rutas centralizadas

export default function Dashboard() {
  // 🔧 Estilo fijo para todos los enlaces (evita :visited morado y unifica tipografía)
  const linkStyle = {
    color: "#111827",
    textDecoration: "none",
    fontWeight: 700,
    lineHeight: 1.25,
  };

  return (
    <div className="dashboard-bg">
      {/* Encabezado */}
      <div className="dashboard-header-content">
        <h1 className="dashboard-greeting">
          Buenas tardes, Verónica Mateo <span role="img" aria-label="emoji">😊</span>
        </h1>
        <p className="dashboard-motivation">
          "Creemos en la fuerza del trabajo bien hecho, incluso cuando nadie lo ve.
          Porque lo invisible hoy, es lo que sostiene lo valioso mañana."
        </p>
      </div>

      {/* Tip de VictorIA */}
      <div className="dashboard-tip-card">
        <span className="dashboard-tip-icon">💡</span>
        <div>
          <span className="dashboard-tip-title">Tip de VictorIA</span>
          <div className="dashboard-tip-text">
            Recuerda revisar la sección de 'Validación DT' en Recursos Humanos para asegurar que
            toda la documentación de tus colaboradores esté al día. ¡Un pequeño chequeo puede ahorrar
            muchos problemas!
          </div>
        </div>
      </div>

      {/* Grid de módulos */}
      <div className="dashboard-modules-grid">
        {/* Recursos Humanos */}
        <div className="dashboard-module-card">
          <div className="dashboard-module-header hr-gradient">
            <span className="dashboard-module-emoji">👥</span>
            <span className="dashboard-module-title">Recursos Humanos</span>
          </div>
          <div className="dashboard-module-desc">
            Gestiona fichas de personal, contratos y documentación legal.
          </div>
          <div className="dashboard-module-links">
            <Link to={ROUTES.listadoFichas} style={linkStyle}>👥 Listado y Fichas</Link>
            <Link to={ROUTES.rrhhPermisos} style={linkStyle}>📝 Permisos y Justificaciones</Link>
            <Link to={ROUTES.rrhhValidacionDT} style={linkStyle}>✅ Validación DT</Link>
            <Link to={ROUTES.rrhhDocumentos} style={linkStyle}>📁 Repositorio Documental</Link>
          </div>
        </div>

        {/* Asistencia */}
        <div className="dashboard-module-card">
          <div className="dashboard-module-header asistencia-gradient">
            <span className="dashboard-module-emoji">🕒</span>
            <span className="dashboard-module-title">Asistencia</span>
          </div>
          <div className="dashboard-module-desc">
            Control de horarios, marcas y gestión de turnos.
          </div>
          {/* 👇 usa el mismo contenedor que RR.HH. (no <ul>) */}
          <div className="dashboard-module-links">
            <Link to={ROUTES.asistenciaSupervision} style={linkStyle}>🔎👁️ Supervisión Integral</Link>
            <Link to={ROUTES.asistenciaMarcas} style={linkStyle}>🕒✅ Marcas Registradas</Link>
            <Link to={ROUTES.asistenciaMapa} style={linkStyle}>🗺️📍 Mapa de Cobertura</Link>
            <Link to={ROUTES.asistenciaDispositivos} style={linkStyle}>📟⚙️ Gestión de Dispositivos</Link>
            <Link to="/asistencia/turnos" style={linkStyle}>📅🛠️ Gestión de Turnos y Jornadas</Link>
          </div>
        </div>

        {/* Comunicaciones (pendiente de rutas) */}
        <div className="dashboard-module-card">
          <div className="dashboard-module-header comunicaciones-gradient">
            <span className="dashboard-module-emoji">💬</span>
            <span className="dashboard-module-title">Comunicaciones</span>
          </div>
          <div className="dashboard-module-desc">
            Mensajería, encuestas y comunicados para tu equipo.
          </div>
          <div className="dashboard-module-links">
            <span className="mod-link-disabled">✉️ Enviar mensaje</span>
            <span className="mod-link-disabled">📝 Plantillas</span>
            <span className="mod-link-disabled">⭐ Encuestas</span>
          </div>
        </div>

        {/* Reportes (pendiente de rutas) */}
        <div className="dashboard-module-card">
          <div className="dashboard-module-header reportes-gradient">
            <span className="dashboard-module-emoji">📊</span>
            <span className="dashboard-module-title">Reportes</span>
          </div>
          <div className="dashboard-module-desc">
            Informes gerenciales y análisis de datos.
          </div>
          <div className="dashboard-module-links">
            <span className="mod-link-disabled">📄 Informes Gerenciales</span>
            <span className="mod-link-disabled">📈 Dashboards</span>
            <span className="mod-link-disabled">📁 Documentos</span>
          </div>
        </div>

        {/* Tictiva Cuida (pendiente de rutas) */}
        <div className="dashboard-module-card">
          <div className="dashboard-module-header tictiva-cuida-gradient">
            <span className="dashboard-module-emoji">🧠</span>
            <span className="dashboard-module-title">Tictiva Cuida</span>
          </div>
          <div className="dashboard-module-desc">
            Bienestar psicoemocional y salud organizacional.
          </div>
          <div className="dashboard-module-links">
            <span className="mod-link-disabled">🧑‍⚕️ Test Psicológicos</span>
            <span className="mod-link-disabled">📊 Dashboard de Bienestar</span>
            <span className="mod-link-disabled">🤖 VictorIA</span>
          </div>
        </div>

        {/* Espacio para cuadrícula */}
        <div
          className="dashboard-module-card"
          style={{ background: "transparent", boxShadow: "none", pointerEvents: "none" }}
        />
      </div>
    </div>
  );
}
