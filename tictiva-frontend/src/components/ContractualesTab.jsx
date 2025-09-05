// src/components/ContractualesTab.jsx
import React from "react";

/* Helpers */
const pickCI = (obj, keys = [], fallback = undefined) => {
  if (!obj) return fallback;
  const map = Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [String(k).toLowerCase(), v])
  );
  for (const k of keys) {
    const v = map[String(k).toLowerCase()];
    if (v !== undefined && v !== null && String(v) !== "") return v;
  }
  return fallback;
};
const moneyCL = (n) => {
  const num = Number(n);
  if (!Number.isFinite(num)) return "—";
  return `$${num.toLocaleString("es-CL")}`;
};

export default function ContractualesTab({
  datos = {},
  modoEdicion,
  onChange,
  empleado, // opcional, para fallbacks
}) {
  // Vista con fallbacks al empleado si faltan datos en "datos"
  const view = {
    cargoActual: pickCI(datos, ["cargoActual"], empleado?.cargo),
    tipoContrato: pickCI(datos, ["tipoContrato"], "Indefinido"),
    jornada: pickCI(
      datos,
      ["jornada"],
      empleado?.datosContractuales?.jornada,
      "Jornada Completa"
    ),
    horario: pickCI(datos, ["horario"], empleado?.horario),
    lugarTrabajo: pickCI(
      datos,
      ["lugarTrabajo", "sucursal", "oficina", "lugar"],
      empleado?.centro || empleado?.oficina
    ),
    centroCosto: pickCI(datos, ["centroCosto", "area", "área"], empleado?.centroCosto),
    responsable: pickCI(datos, ["responsable", "jefeDirecto"], empleado?.responsable),
    fechaIngreso: pickCI(datos, ["fechaIngreso"], (empleado?.fechaIngreso || "").slice(0, 10)),
    sueldoBase: pickCI(datos, ["sueldoBase", "sueldo"], empleado?.datosContractuales?.sueldoBase),
    pinMarcacion: pickCI(
      datos,
      ["pinMarcacion", "pin"],
      empleado?.credencialesApp?.pin || empleado?.pin
    ),
    ultimaActualizacion: pickCI(datos, ["ultimaActualizacion"]),
    anexosFirmados: pickCI(datos, ["anexosFirmados"]),
    licencias: pickCI(datos, ["licencias", "permisos"]),
    contratoFirmado: pickCI(datos, ["contratoFirmado"]),
    finiquitoFirmado: pickCI(datos, ["finiquitoFirmado"]),
    duracionContrato: pickCI(datos, ["duracionContrato", "duraciónContrato"]),
  };

  const handleChange = (campo, valor) => {
    const next = { ...datos, [campo]: valor };
    onChange?.("datosContractuales", next);
  };

  const V = ({ v, fmt }) => <span className="ed-kv-value">{v ? (fmt ? fmt(v) : v) : "—"}</span>;

  return (
    <div className="ed-card">
      <h3 className="ed-card-title">Datos Contractuales</h3>

      {/* 2 columnas como Personales/Previsión */}
      <div className="ed-kv2">
        {/* Columna izquierda */}
        <div className="ed-kv">
          <div className="ed-kv-row">
            <span className="ed-kv-label">Cargo Actual:</span>
            {modoEdicion ? (
              <input
                value={view.cargoActual || ""}
                onChange={(e) => handleChange("cargoActual", e.target.value)}
              />
            ) : (
              <V v={view.cargoActual} />
            )}
          </div>

          <div className="ed-kv-row">
            <span className="ed-kv-label">Tipo de Contrato:</span>
            {modoEdicion ? (
              <select
                value={view.tipoContrato || ""}
                onChange={(e) => handleChange("tipoContrato", e.target.value)}
              >
                <option value="">—</option>
                <option>Indefinido</option>
                <option>Plazo Fijo</option>
                <option>Honorarios</option>
                <option>Obra o Faena</option>
              </select>
            ) : (
              <V v={view.tipoContrato} />
            )}
          </div>

          <div className="ed-kv-row">
            <span className="ed-kv-label">Jornada:</span>
            {modoEdicion ? (
              <select
                value={view.jornada || ""}
                onChange={(e) => handleChange("jornada", e.target.value)}
              >
                <option value="">—</option>
                <option>Jornada Completa</option>
                <option>Jornada Parcial</option>
                <option>Por Turnos</option>
              </select>
            ) : (
              <V v={view.jornada} />
            )}
          </div>

          <div className="ed-kv-row">
            <span className="ed-kv-label">Horario:</span>
            {modoEdicion ? (
              <input
                value={view.horario || ""}
                onChange={(e) => handleChange("horario", e.target.value)}
                placeholder="Ej: 08:30 - 18:00"
              />
            ) : (
              <V v={view.horario} />
            )}
          </div>

          <div className="ed-kv-row">
            <span className="ed-kv-label">Sucursal / Lugar de Trabajo:</span>
            {modoEdicion ? (
              <input
                value={view.lugarTrabajo || ""}
                onChange={(e) => handleChange("lugarTrabajo", e.target.value)}
                placeholder="Ej: Casa Matriz"
              />
            ) : (
              <V v={view.lugarTrabajo} />
            )}
          </div>

          <div className="ed-kv-row">
            <span className="ed-kv-label">Centro de Costo / Área:</span>
            {modoEdicion ? (
              <input
                value={view.centroCosto || ""}
                onChange={(e) => handleChange("centroCosto", e.target.value)}
                placeholder="Ej: Operaciones"
              />
            ) : (
              <V v={view.centroCosto} />
            )}
          </div>

          <div className="ed-kv-row">
            <span className="ed-kv-label">Responsable Directo:</span>
            {modoEdicion ? (
              <input
                value={view.responsable || ""}
                onChange={(e) => handleChange("responsable", e.target.value)}
                placeholder="Ej: Jefe de Área"
              />
            ) : (
              <V v={view.responsable} />
            )}
          </div>
        </div>

        {/* Columna derecha */}
        <div className="ed-kv">
          <div className="ed-kv-row">
            <span className="ed-kv-label">Fecha de Ingreso:</span>
            {modoEdicion ? (
              <input
                type="date"
                value={view.fechaIngreso || ""}
                onChange={(e) => handleChange("fechaIngreso", e.target.value)}
              />
            ) : (
              <V v={view.fechaIngreso} />
            )}
          </div>

          <div className="ed-kv-row">
            <span className="ed-kv-label">Duración del Contrato:</span>
            {modoEdicion ? (
              <input
                value={view.duracionContrato || ""}
                onChange={(e) => handleChange("duracionContrato", e.target.value)}
                placeholder="Indefinido / 3 meses / Obra..."
              />
            ) : (
              <V v={view.duracionContrato} />
            )}
          </div>

          <div className="ed-kv-row">
            <span className="ed-kv-label">Sueldo Base:</span>
            {modoEdicion ? (
              <input
                type="number"
                min="0"
                step="1000"
                value={view.sueldoBase || ""}
                onChange={(e) => handleChange("sueldoBase", e.target.value)}
                placeholder="Ej: 800000"
              />
            ) : (
              <V v={view.sueldoBase} fmt={moneyCL} />
            )}
          </div>

          <div className="ed-kv-row">
            <span className="ed-kv-label">PIN de Marcación:</span>
            {modoEdicion ? (
              <input
                value={view.pinMarcacion || ""}
                onChange={(e) => handleChange("pinMarcacion", e.target.value)}
                placeholder="Ej: 8421"
              />
            ) : (
              <V v={view.pinMarcacion || "Sin PIN"} />
            )}
          </div>

          <div className="ed-kv-row">
            <span className="ed-kv-label">Últ. Actualización de Contrato:</span>
            {modoEdicion ? (
              <input
                type="date"
                value={view.ultimaActualizacion || ""}
                onChange={(e) => handleChange("ultimaActualizacion", e.target.value)}
              />
            ) : (
              <V v={view.ultimaActualizacion} />
            )}
          </div>

          <div className="ed-kv-row">
            <span className="ed-kv-label">Anexos Firmados:</span>
            {modoEdicion ? (
              <input
                value={view.anexosFirmados || ""}
                onChange={(e) => handleChange("anexosFirmados", e.target.value)}
                placeholder="Pacto HE 2023, Teletrabajo 2024…"
              />
            ) : (
              <V v={view.anexosFirmados} />
            )}
          </div>

          <div className="ed-kv-row">
            <span className="ed-kv-label">Licencias / Permisos:</span>
            {modoEdicion ? (
              <input
                value={view.licencias || ""}
                onChange={(e) => handleChange("licencias", e.target.value)}
              />
            ) : (
              <V v={view.licencias} />
            )}
          </div>

          <div className="ed-kv-row">
            <span className="ed-kv-label">Contrato Firmado:</span>
            {modoEdicion ? (
              <input
                value={view.contratoFirmado || ""}
                onChange={(e) => handleChange("contratoFirmado", e.target.value)}
                placeholder="N° doc/fecha"
              />
            ) : (
              <V v={view.contratoFirmado} />
            )}
          </div>

          <div className="ed-kv-row">
            <span className="ed-kv-label">Finiquito Firmado:</span>
            {modoEdicion ? (
              <input
                value={view.finiquitoFirmado || ""}
                onChange={(e) => handleChange("finiquitoFirmado", e.target.value)}
                placeholder="N° doc/fecha (si aplica)"
              />
            ) : (
              <V v={view.finiquitoFirmado} />
            )}
          </div>
        </div>
      </div>

      {/* CSS local para la grilla (y fallback por si no existe en global) */}
      <style>{`
        .ed-kv2{
          display:grid;
          grid-template-columns:1fr 1fr;
          gap:16px;
        }
        @media (max-width: 800px){
          .ed-kv2{ grid-template-columns:1fr; }
        }
        .ed-kv{display:grid}
        .ed-kv-row{display:flex; justify-content:space-between; gap:12px; padding:10px 2px; border-top:1px solid #F3F4F6}
        .ed-kv-row:first-child{border-top:none}
        .ed-kv-label{color:#6B7280; min-width:220px}
        .ed-kv-value{font-weight:700; color:#111827; text-align:right}
      `}</style>
    </div>
  );
}
