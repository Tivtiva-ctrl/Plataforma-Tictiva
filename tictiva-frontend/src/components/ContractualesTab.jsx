// src/components/ContractualesTab.jsx
import React from "react";

export default function ContractualesTab({ datos, modoEdicion, onChange }) {
  if (!datos) {
    return <div className="sin-datos">No hay datos contractuales disponibles</div>;
  }

  const handleChange = (campo, valor) => {
    // Pasa el objeto completo modificado al padre
    onChange("datosContractuales", { ...datos, [campo]: valor });
  };

  return (
    <div className="detalle-card-datos">
      <h3 className="titulo-datos">
        <span style={{ marginRight: "8px", color: "#1a1a1a", fontSize: "20px" }}>📄</span>
        <span>Datos Contractuales</span>
      </h3>
      <div className="datos-grid">
        <div>
          <strong>Cargo Actual:</strong>{" "}
          {modoEdicion ? (
            <input
              name="cargoActual"
              value={datos.cargoActual || ""}
              onChange={(e) => handleChange("cargoActual", e.target.value)}
            />
          ) : (
            datos.cargoActual
          )}
        </div>
        <div>
          <strong>Tipo de Contrato:</strong>{" "}
          {modoEdicion ? (
            <input
              name="tipoContrato"
              value={datos.tipoContrato || ""}
              onChange={(e) => handleChange("tipoContrato", e.target.value)}
            />
          ) : (
            datos.tipoContrato
          )}
        </div>
        <div>
          <strong>Jornada:</strong>{" "}
          {modoEdicion ? (
            <input
              name="jornada"
              value={datos.jornada || ""}
              onChange={(e) => handleChange("jornada", e.target.value)}
            />
          ) : (
            datos.jornada
          )}
        </div>
        <div>
          <strong>Sucursal/Lugar de Trabajo:</strong>{" "}
          {modoEdicion ? (
            <input
              name="lugarTrabajo"
              value={datos.lugarTrabajo || ""}
              onChange={(e) => handleChange("lugarTrabajo", e.target.value)}
            />
          ) : (
            datos.lugarTrabajo
          )}
        </div>
        <div>
          <strong>Responsable Directo:</strong>{" "}
          {modoEdicion ? (
            <input
              name="responsable"
              value={datos.responsable || ""}
              onChange={(e) => handleChange("responsable", e.target.value)}
            />
          ) : (
            datos.responsable
          )}
        </div>
        <div>
          <strong>PIN Marcación:</strong>{" "}
          <span style={{ fontWeight: "600", color: "#181e23" }}>
            {datos.pinMarcacion || "Sin PIN"}
          </span>
        </div>
        <div>
          <strong>Última Actualización de Contrato:</strong>{" "}
          {modoEdicion ? (
            <input
              name="ultimaActualizacion"
              type="date"
              value={datos.ultimaActualizacion || ""}
              onChange={(e) => handleChange("ultimaActualizacion", e.target.value)}
            />
          ) : (
            datos.ultimaActualizacion
          )}
        </div>
        <div>
          <strong>Anexos Firmados:</strong>{" "}
          {modoEdicion ? (
            <input
              name="anexosFirmados"
              value={datos.anexosFirmados || ""}
              onChange={(e) => handleChange("anexosFirmados", e.target.value)}
            />
          ) : (
            datos.anexosFirmados
          )}
        </div>
        <div>
          <strong>Licencias/Permisos Activos:</strong>{" "}
          {modoEdicion ? (
            <input
              name="licencias"
              value={datos.licencias || ""}
              onChange={(e) => handleChange("licencias", e.target.value)}
            />
          ) : (
            datos.licencias
          )}
        </div>
        <div>
          <strong>Fecha de Ingreso:</strong>{" "}
          {modoEdicion ? (
            <input
              name="fechaIngreso"
              type="date"
              value={datos.fechaIngreso || ""}
              onChange={(e) => handleChange("fechaIngreso", e.target.value)}
            />
          ) : (
            datos.fechaIngreso
          )}
        </div>
        <div>
          <strong>Centro de Costo/Área:</strong>{" "}
          {modoEdicion ? (
            <input
              name="centroCosto"
              value={datos.centroCosto || ""}
              onChange={(e) => handleChange("centroCosto", e.target.value)}
            />
          ) : (
            datos.centroCosto
          )}
        </div>
        <div>
          <strong>Contrato Firmado:</strong>{" "}
          {modoEdicion ? (
            <input
              name="contratoFirmado"
              value={datos.contratoFirmado || ""}
              onChange={(e) => handleChange("contratoFirmado", e.target.value)}
            />
          ) : (
            datos.contratoFirmado
          )}
        </div>
        <div>
          <strong>Finiquito Firmado:</strong>{" "}
          {modoEdicion ? (
            <input
              name="finiquitoFirmado"
              value={datos.finiquitoFirmado || ""}
              onChange={(e) => handleChange("finiquitoFirmado", e.target.value)}
            />
          ) : (
            datos.finiquitoFirmado
          )}
        </div>
      </div>
    </div>
  );
}
