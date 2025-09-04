import React from "react";

/**
 * Muestra datos contractuales con fallbacks al objeto empleado.
 * - Lee primero de `datos` (datosContractuales), y si falta, usa campos del empleado (raíz).
 * - En edición, cualquier cambio se escribe en `datosContractuales` (no toca raíz).
 */
export default function ContractualesTab({ datos = {}, modoEdicion, onChange, empleado }) {
  // helpers
  const pick = (v, ...fallbacks) => {
    if (v !== undefined && v !== null && String(v) !== "") return v;
    for (const f of fallbacks) {
      if (f !== undefined && f !== null && String(f) !== "") return f;
    }
    return "";
  };
  const safe = (v, dash = "—") => (v || v === 0 ? String(v) : dash);

  // Fallbacks inteligentes (sin romper escritura en datosContractuales)
  const view = {
    cargoActual:         pick(datos.cargoActual, empleado?.cargo),
    tipoContrato:        pick(datos.tipoContrato, "Indefinido"),
    jornada:             pick(datos.jornada, empleado?.datosContractuales?.jornada, "Jornada Completa"),
    lugarTrabajo:        pick(datos.lugarTrabajo, empleado?.centro, empleado?.oficina),
    responsable:         pick(datos.responsable, empleado?.responsable),
    pinMarcacion:        pick(datos.pinMarcacion, empleado?.credencialesApp?.pin, empleado?.pin),
    ultimaActualizacion: pick(datos.ultimaActualizacion, ""),
    anexosFirmados:      pick(datos.anexosFirmados, ""),
    licencias:           pick(datos.licencias, ""),
    fechaIngreso:        pick(datos.fechaIngreso, empleado?.fechaIngreso),
    centroCosto:         pick(datos.centroCosto, empleado?.area, empleado?.centroCosto),
    contratoFirmado:     pick(datos.contratoFirmado, ""),
    finiquitoFirmado:    pick(datos.finiquitoFirmado, ""),
    sueldoBase:          pick(datos.sueldoBase, empleado?.datosContractuales?.sueldoBase),
    horario:             pick(datos.horario, empleado?.horario),
  };

  const handleChange = (campo, valor) => {
    onChange?.("datosContractuales", { ...datos, [campo]: valor });
  };

  return (
    <div className="detalle-card-datos">
      <h3 className="titulo-datos" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span aria-hidden>📄</span>
        <span>Datos Contractuales</span>
      </h3>

      {/* grid tipo “ficha personales” */}
      <div className="datos-grid" style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
        {/* Columna 1 */}
        <div className="dato-item">
          <strong>Cargo Actual:</strong>{" "}
          {modoEdicion ? (
            <input
              name="cargoActual"
              value={view.cargoActual}
              onChange={(e) => handleChange("cargoActual", e.target.value)}
            />
          ) : (
            safe(view.cargoActual)
          )}
        </div>

        <div className="dato-item">
          <strong>Tipo de Contrato:</strong>{" "}
          {modoEdicion ? (
            <select
              name="tipoContrato"
              value={view.tipoContrato}
              onChange={(e) => handleChange("tipoContrato", e.target.value)}
            >
              <option>Indefinido</option>
              <option>Plazo Fijo</option>
              <option>Honorarios</option>
              <option>Obra o Faena</option>
            </select>
          ) : (
            safe(view.tipoContrato)
          )}
        </div>

        <div className="dato-item">
          <strong>Jornada:</strong>{" "}
          {modoEdicion ? (
            <select
              name="jornada"
              value={view.jornada}
              onChange={(e) => handleChange("jornada", e.target.value)}
            >
              <option>Jornada Completa</option>
              <option>Jornada Parcial</option>
              <option>Por Turnos</option>
            </select>
          ) : (
            safe(view.jornada)
          )}
        </div>

        <div className="dato-item">
          <strong>Horario:</strong>{" "}
          {modoEdicion ? (
            <input
              name="horario"
              value={view.horario}
              onChange={(e) => handleChange("horario", e.target.value)}
              placeholder="Ej: 08:30 - 18:00"
            />
          ) : (
            safe(view.horario, "08:30 - 18:00")
          )}
        </div>

        <div className="dato-item">
          <strong>Sucursal / Lugar de Trabajo:</strong>{" "}
          {modoEdicion ? (
            <input
              name="lugarTrabajo"
              value={view.lugarTrabajo}
              onChange={(e) => handleChange("lugarTrabajo", e.target.value)}
              placeholder="Ej: Casa Matriz"
            />
          ) : (
            safe(view.lugarTrabajo)
          )}
        </div>

        <div className="dato-item">
          <strong>Centro de Costo / Área:</strong>{" "}
          {modoEdicion ? (
            <input
              name="centroCosto"
              value={view.centroCosto}
              onChange={(e) => handleChange("centroCosto", e.target.value)}
              placeholder="Ej: Finanzas"
            />
          ) : (
            safe(view.centroCosto)
          )}
        </div>

        <div className="dato-item">
          <strong>Responsable Directo:</strong>{" "}
          {modoEdicion ? (
            <input
              name="responsable"
              value={view.responsable}
              onChange={(e) => handleChange("responsable", e.target.value)}
              placeholder="Ej: Jefe de Área"
            />
          ) : (
            safe(view.responsable)
          )}
        </div>

        <div className="dato-item">
          <strong>Fecha de Ingreso:</strong>{" "}
          {modoEdicion ? (
            <input
              name="fechaIngreso"
              type="date"
              value={view.fechaIngreso}
              onChange={(e) => handleChange("fechaIngreso", e.target.value)}
            />
          ) : (
            safe(view.fechaIngreso)
          )}
        </div>

        <div className="dato-item">
          <strong>Sueldo Base:</strong>{" "}
          {modoEdicion ? (
            <input
              name="sueldoBase"
              type="number"
              min="0"
              step="1000"
              value={view.sueldoBase}
              onChange={(e) => handleChange("sueldoBase", e.target.value)}
              placeholder="Ej: 800000"
            />
          ) : (
            view.sueldoBase ? `$${Number(view.sueldoBase).toLocaleString("es-CL")}` : "—"
          )}
        </div>

        <div className="dato-item">
          <strong>PIN de Marcación:</strong>{" "}
          <span style={{ fontWeight: 600, color: "#181e23" }}>
            {safe(view.pinMarcacion, "Sin PIN")}
          </span>
        </div>

        <div className="dato-item">
          <strong>Última Actualización de Contrato:</strong>{" "}
          {modoEdicion ? (
            <input
              name="ultimaActualizacion"
              type="date"
              value={view.ultimaActualizacion}
              onChange={(e) => handleChange("ultimaActualizacion", e.target.value)}
            />
          ) : (
            safe(view.ultimaActualizacion)
          )}
        </div>

        <div className="dato-item">
          <strong>Anexos Firmados:</strong>{" "}
          {modoEdicion ? (
            <input
              name="anexosFirmados"
              value={view.anexosFirmados}
              onChange={(e) => handleChange("anexosFirmados", e.target.value)}
              placeholder="Ej: Pacto de horas extra, Teletrabajo…"
            />
          ) : (
            safe(view.anexosFirmados)
          )}
        </div>

        <div className="dato-item">
          <strong>Licencias/Permisos Activos:</strong>{" "}
          {modoEdicion ? (
            <input
              name="licencias"
              value={view.licencias}
              onChange={(e) => handleChange("licencias", e.target.value)}
              placeholder="Ej: Médica 2024-08, Parental 2023-10"
            />
          ) : (
            safe(view.licencias)
          )}
        </div>

        <div className="dato-item">
          <strong>Contrato Firmado:</strong>{" "}
          {modoEdicion ? (
            <input
              name="contratoFirmado"
              value={view.contratoFirmado}
              onChange={(e) => handleChange("contratoFirmado", e.target.value)}
              placeholder="N° doc, fecha, etc."
            />
          ) : (
            safe(view.contratoFirmado)
          )}
        </div>

        <div className="dato-item">
          <strong>Finiquito Firmado:</strong>{" "}
          {modoEdicion ? (
            <input
              name="finiquitoFirmado"
              value={view.finiquitoFirmado}
              onChange={(e) => handleChange("finiquitoFirmado", e.target.value)}
              placeholder="N° doc, fecha, etc."
            />
          ) : (
            safe(view.finiquitoFirmado)
          )}
        </div>
      </div>
    </div>
  );
}
