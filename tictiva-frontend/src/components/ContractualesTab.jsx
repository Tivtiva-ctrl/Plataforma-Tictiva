// src/components/ContractualesTab.jsx
import React from "react";

/**
 * Contractuales con el MISMO layout que "Personales":
 * - 1 sola card (ed-card)
 * - Filas label/valor usando ed-kv, ed-kv-row, ed-kv-label, ed-kv-value
 * - Inputs si modoEdicion=true (actualiza "datosContractuales" en el padre)
 */
export default function ContractualesTab({ datos = {}, modoEdicion = false, onChange }) {
  const set = (campo, valor) =>
    onChange && onChange("datosContractuales", { ...datos, [campo]: valor });

  // Toma el primer valor no vacío entre posibles alias
  const pick = (obj, names, fallback = "") => {
    for (const n of names) {
      const v = obj?.[n];
      if (v !== undefined && v !== null && String(v).trim() !== "") return v;
    }
    return fallback;
  };

  const Row = ({ icon, label, name, type = "text", aliases = [] }) => {
    const value = pick(datos, [name, ...aliases], "");
    const show = value || "—";
    return (
      <div className="ed-kv-row">
        <span className="ed-kv-label">
          <span style={{ marginRight: 6 }}>{icon}</span>
          {label}
        </span>

        <span className="ed-kv-value">
          {modoEdicion ? (
            <input
              type={type}
              name={name}
              value={value}
              onChange={(e) => set(name, e.target.value)}
              style={{
                width: "min(360px, 90%)",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                padding: "6px 10px",
                fontSize: 14,
              }}
            />
          ) : (
            show
          )}
        </span>
      </div>
    );
  };

  return (
    <div className="ed-card">
      <h3 className="ed-card-title">Datos Contractuales</h3>

      {/* MISMO patrón que la card de Personales */}
      <div className="ed-kv">
        <Row icon="📂" label="Cargo Actual:"                name="cargoActual"       aliases={["cargo", "puesto"]} />
        <Row icon="📄" label="Tipo de Contrato:"            name="tipoContrato"      aliases={["contratoTipo", "tipo"]} />
        <Row icon="⏱️" label="Jornada / Horas Semanales:"   name="jornada"           aliases={["horasSemanales"]} />
        <Row icon="⏰" label="Horario:"                      name="horario"           aliases={["horarioLaboral"]} />
        <Row icon="📍" label="Sucursal / Lugar de Trabajo:" name="lugarTrabajo"      aliases={["sucursal", "ubicacion"]} />
        <Row icon="🧾" label="Centro de Costo / Área:"      name="centroCosto"       aliases={["area", "centro"]} />
        <Row icon="👤" label="Responsable Directo:"         name="responsable"       aliases={["jefeDirecto", "supervisor"]} />
        <Row icon="📅" label="Fecha de Ingreso:"            name="fechaIngreso"      type="date" aliases={["ingreso"]} />
        <Row icon="📆" label="Duración del Contrato:"       name="duracionContrato"  aliases={["duracion", "plazo"]} />
        <Row icon="💰" label="Sueldo Base:"                 name="sueldoBase"        aliases={["sueldo", "rentaBase"]} />
        <Row icon="🎁" label="Gratificación:"               name="gratificacion"     aliases={["gratificacionTipo"]} />
        <Row icon="🏢" label="Modalidad de Trabajo:"        name="modalidadTrabajo"  aliases={["modalidad", "tipoTrabajo"]} />
        <Row icon="🗂️" label="Anexos Firmados:"            name="anexosFirmados"    aliases={["anexos"]} />
        <Row icon="🖊️" label="Contrato Firmado:"           name="contratoFirmado"   aliases={["contratoFirma", "fechaContrato"]} />
        <Row icon="🔐" label="PIN de Marcación:"            name="pinMarcacion"      aliases={["pin"]} />
        <Row icon="✅" label="Últ. Actualización de Contrato:" name="ultimaActualizacion" type="date" aliases={["ultimaActualizacionContrato","fechaActualizacion"]} />
        <Row icon="📜" label="Licencias / Permisos Activos:" name="licencias"        aliases={["permisosActivos"]} />
        <Row icon="📄" label="Finiquito Firmado:"           name="finiquitoFirmado"  aliases={["finiquito"]} />
      </div>
    </div>
  );
}
