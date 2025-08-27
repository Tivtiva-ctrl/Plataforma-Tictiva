// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import logoTictiva from "../assets/logo-tictiva.png";
import "./Navbar.css";
import { useEmpresa } from "../context/EmpresaContext";

function Navbar({ userName = "Verónica Mateo", onLogout }) {
  const [openMenu, setOpenMenu] = useState(false);
  const [openEmpresas, setOpenEmpresas] = useState(false);

  const { empresas = [], empresaSeleccionada, setEmpresaSeleccionada } = useEmpresa();

  const getInitials = (name) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return parts[0][0].toUpperCase() + (parts[1]?.[0]?.toUpperCase() || "");
  };
  const initials = getInitials(userName);

  return (
    <header className="navbar-tictiva">
      {/* Izquierda: marca (lleva al home) */}
      <div className="navbar-left">
        <Link to="/" className="navbar-brand-link" title="Ir al inicio">
          <img src={logoTictiva} alt="Tictiva" className="navbar-logo" />
          <span className="navbar-title">Tictiva</span>
        </Link>
      </div>

      {/* Derecha: multiempresa + notificaciones + usuario */}
      <div className="navbar-right">
        {/* Multiempresa */}
        <div className="navbar-empresa-dropdown">
          <button
            className="navbar-empresa-btn"
            onClick={() => setOpenEmpresas(!openEmpresas)}
          >
            {empresaSeleccionada ? empresaSeleccionada.nombre : "Sin empresa"} ▼
          </button>
          {openEmpresas && (
            <div className="navbar-empresa-menu">
              {empresas.map((empresa) => (
                <div
                  key={empresa.id}
                  className={`navbar-empresa-item ${
                    empresaSeleccionada?.id === empresa.id ? "selected" : ""
                  }`}
                  onClick={() => {
                    setEmpresaSeleccionada(empresa);
                    setOpenEmpresas(false);
                  }}
                >
                  {empresa.nombre}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Campana */}
        <span className="navbar-bell" tabIndex={0}>🔔</span>

        {/* Usuario */}
        <div
          className="navbar-user"
          tabIndex={0}
          onClick={() => setOpenMenu((o) => !o)}
        >
          <span className="navbar-avatar">{initials}</span>
          <span className="navbar-username">{userName.split(" ")[0]}</span>
          <span className="navbar-chevron">▼</span>
          {openMenu && (
            <div className="navbar-menu">
              <div className="navbar-menu-item">⚙️ Configuración</div>
              <div
                className="navbar-menu-item"
                onClick={() => {
                  setOpenMenu(false);
                  if (onLogout) onLogout();
                }}
                style={{ cursor: "pointer" }}
              >
                📚 Cerrar sesión
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
