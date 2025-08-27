// src/components/PersonalesTab.jsx
import React from "react";

export default function PersonalesTab({ empleado, modoEdicion, onChange }) {
  if (!empleado) return <div className="sin-datos">No hay datos personales</div>;

  const renderDato = (label, campo) => (
    <div className="dato-item">
      <strong>{label}</strong>{" "}
      {modoEdicion ? (
        <input
          type="text"
          value={empleado[campo] || ""}
          onChange={(e) => onChange(campo, e.target.value)}
        />
      ) : (
        empleado[campo] || "N/D"
      )}
    </div>
  );

  return (
    <div className="detalle-card-datos personales-tictiva">
      <h3 className="titulo-datos">Datos Personales</h3>
      <div className="datos-grid-personales">
        {renderDato("RUT:", "rut")}
        {renderDato("Fecha de nacimiento:", "fechaNacimiento")}
        {renderDato("Dirección Particular:", "direccion")}
        {renderDato("Comuna Particular:", "comuna")}
        {renderDato("Región Particular:", "region")}
        {renderDato("Sexo:", "sexo")}
        {renderDato("Estado Civil:", "estadoCivil")}
        {renderDato("Nacionalidad:", "nacionalidad")}
        {renderDato("Teléfono:", "telefono")}
        {renderDato("Correo Electrónico:", "correo")}
      </div>
    </div>
  );
}
