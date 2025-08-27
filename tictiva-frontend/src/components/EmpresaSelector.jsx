import React, { useState } from "react";
import { useEmpresa } from "../context/EmpresaContext";
import "./EmpresaSelector.css";

export default function EmpresaSelector() {
  const { empresaSeleccionada, setEmpresaSeleccionada, empresas } = useEmpresa();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleSelect = (empresa) => {
    setEmpresaSeleccionada(empresa);
    setMenuAbierto(false);
  };

  // Inicial de la empresa seleccionada
  const inicial =
    empresaSeleccionada?.nombre?.charAt(0).toUpperCase() || "?";

  return (
    <div className="empresa-selector-container">
      <div
        className="empresa-selector-trigger"
        onClick={() => setMenuAbierto(!menuAbierto)}
      >
        <div className="empresa-avatar">{inicial}</div>
        <span className="empresa-nombre">
          {empresaSeleccionada ? empresaSeleccionada.nombre : "Sin empresa"}
        </span>
        <span className="empresa-arrow">{menuAbierto ? "▲" : "▼"}</span>
      </div>

      {menuAbierto && (
        <div className="empresa-dropdown">
          {empresas.map((empresa) => (
            <div
              key={empresa.id}
              className={`empresa-item ${
                empresaSeleccionada?.id === empresa.id ? "seleccionada" : ""
              }`}
              onClick={() => handleSelect(empresa)}
            >
              <div className="empresa-avatar">{empresa.nombre.charAt(0)}</div>
              <span>{empresa.nombre}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
