// src/components/PrevisionTab.jsx
import React from "react";

export default function PrevisionTab({ empleado, modoEdicion, onChange }) {
  return (
    <div className="detalle-card-datos">
      <h3 className="titulo-datos">Datos Previsionales y Legales</h3>
      <div className="datos-grid-personales">
        <div className="dato-item">
          <strong>AFP:</strong>{" "}
          {modoEdicion ? (
            <input
              value={empleado.afp || ""}
              onChange={(e) => onChange("afp", e.target.value)}
            />
          ) : (
            empleado.afp || "N/D"
          )}
        </div>
        <div className="dato-item">
          <strong>Sistema de Salud:</strong>{" "}
          {modoEdicion ? (
            <input
              value={empleado.sistemaSalud || ""}
              onChange={(e) => onChange("sistemaSalud", e.target.value)}
            />
          ) : (
            empleado.sistemaSalud || "N/D"
          )}
        </div>
        <div className="dato-item">
          <strong>Nombre Isapre:</strong>{" "}
          {modoEdicion ? (
            <input
              value={empleado.nombreIsapre || ""}
              onChange={(e) => onChange("nombreIsapre", e.target.value)}
            />
          ) : (
            empleado.nombreIsapre || "N/D"
          )}
        </div>
        <div className="dato-item">
          <strong>Caja de Compensación:</strong>{" "}
          {modoEdicion ? (
            <input
              value={empleado.cajaCompensacion || ""}
              onChange={(e) => onChange("cajaCompensacion", e.target.value)}
            />
          ) : (
            empleado.cajaCompensacion || "N/D"
          )}
        </div>
        <div className="dato-item">
          <strong>Mutual de Seguridad:</strong>{" "}
          {modoEdicion ? (
            <input
              value={empleado.mutualSeguridad || ""}
              onChange={(e) => onChange("mutualSeguridad", e.target.value)}
            />
          ) : (
            empleado.mutualSeguridad || "N/D"
          )}
        </div>
        <div className="dato-item">
          <strong>Pensión de Alimentos (Monto):</strong>{" "}
          {modoEdicion ? (
            <input
              value={empleado.pensionAlimentos || ""}
              onChange={(e) => onChange("pensionAlimentos", e.target.value)}
            />
          ) : (
            empleado.pensionAlimentos || "N/A"
          )}
        </div>
        <div className="dato-item">
          <strong>Resolución Pensión:</strong>{" "}
          {modoEdicion ? (
            <input
              value={empleado.resolucionPension || ""}
              onChange={(e) => onChange("resolucionPension", e.target.value)}
            />
          ) : (
            empleado.resolucionPension || "N/D"
          )}
        </div>
        <div className="dato-item">
          <strong>Asignación Familiar (Tramo):</strong>{" "}
          {modoEdicion ? (
            <input
              value={empleado.asignacionFamiliar || ""}
              onChange={(e) => onChange("asignacionFamiliar", e.target.value)}
            />
          ) : (
            empleado.asignacionFamiliar || "N/D"
          )}
        </div>
        <div className="dato-item">
          <strong>Discapacidad Declarada:</strong>{" "}
          {modoEdicion ? (
            <input
              value={empleado.discapacidadDeclarada || ""}
              onChange={(e) => onChange("discapacidadDeclarada", e.target.value)}
            />
          ) : (
            empleado.discapacidadDeclarada || "N/D"
          )}
        </div>
      </div>
    </div>
  );
}
