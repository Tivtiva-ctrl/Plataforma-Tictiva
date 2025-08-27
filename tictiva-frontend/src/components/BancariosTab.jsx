// src/components/BancariosTab.jsx
import React from "react";

export default function BancariosTab({ empleado, modoEdicion, onChange }) {
  return (
    <div className="detalle-card-datos">
      <h3 className="titulo-datos">💳 Datos Bancarios</h3>
      <p className="descripcion-docs">
        Información bancaria del colaborador
      </p>
      <div className="datos-grid">
        <div>
          <strong>Banco:</strong>{" "}
          {modoEdicion ? (
            <input
              value={empleado.banco || ""}
              onChange={(e) => onChange("banco", e.target.value)}
            />
          ) : (
            empleado.banco || "N/D"
          )}
        </div>
        <div>
          <strong>Tipo de Cuenta:</strong>{" "}
          {modoEdicion ? (
            <input
              value={empleado.tipoCuenta || ""}
              onChange={(e) => onChange("tipoCuenta", e.target.value)}
            />
          ) : (
            empleado.tipoCuenta || "N/D"
          )}
        </div>
        <div>
          <strong>Número de Cuenta:</strong>{" "}
          {modoEdicion ? (
            <input
              value={empleado.numeroCuenta || ""}
              onChange={(e) => onChange("numeroCuenta", e.target.value)}
            />
          ) : (
            empleado.numeroCuenta || "N/D"
          )}
        </div>
        <div>
          <strong>Titular de la Cuenta:</strong>{" "}
          {modoEdicion ? (
            <input
              value={empleado.titularCuenta || ""}
              onChange={(e) => onChange("titularCuenta", e.target.value)}
            />
          ) : (
            empleado.titularCuenta || "N/D"
          )}
        </div>
      </div>
    </div>
  );
}
