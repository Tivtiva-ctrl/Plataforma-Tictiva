import React from "react";
import { Link } from "react-router-dom";
import "./SidePanel.css";

export default function SidePanel({
  isOpen = false,
  onClose = () => {},
  title = "RRHH",
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="panelBackdrop" onClick={onClose} />

      {/* Panel */}
      <aside className="sidePanel" aria-modal="true" role="dialog">
        <header className="panelHeader">
          <h3 className="panelTitle">{title}</h3>
          <button className="panelCloseIcon" onClick={onClose} aria-label="Cerrar">×</button>
        </header>

        <div className="panelBody">
          <p className="panelLead">Gestión humana, clara y cercana</p>

          <h4 className="panelSubtitle">Accesos rápidos</h4>
          <ul className="panelLinks">
            <li><Link className="panelLinkBtn" to="/rrhh/listado-fichas">Listado de fichas</Link></li>
            <li><Link className="panelLinkBtn" to="/rrhh/permisos">Permisos y justificaciones</Link></li>
            <li><Link className="panelLinkBtn" to="/rrhh/turnos">Gestión de turnos</Link></li>
            <li><Link className="panelLinkBtn" to="/rrhh/validacion-dt">Validación DT</Link></li>
          </ul>

          <div className="adiaTip">
            <div className="adiaIcon">💡</div>
            <div className="adiaText">
              <strong>Tip de ADIA</strong>
              <p>Mantén actualizadas las fichas para agilizar permisos y procesos.</p>
            </div>
          </div>
        </div>

        <footer className="panelFooter">
          <button className="btnEmbossed" onClick={onClose}>Cerrar</button>
        </footer>
      </aside>
    </>
  );
}
