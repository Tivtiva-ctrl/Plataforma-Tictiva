// src/components/ContractualesTab.jsx
import React from "react";

/* ===== Helpers robustos (sin dependencias externas) ===== */
const pickCI = (obj = {}, keys = [], fallback = "—") => {
  const map = Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [String(k).toLowerCase(), v])
  );
  for (const k of keys) {
    const v = map[String(k).toLowerCase()];
    if (v !== undefined && v !== null && String(v) !== "") return v;
  }
  return fallback;
};

const mesesEs = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const fmtFechaLarga = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  return `${String(d.getDate()).padStart(2,"0")} de ${mesesEs[d.getMonth()]} de ${d.getFullYear()}`;
};

const moneyCLP = (n) => {
  const v = Number(n);
  if (!Number.isFinite(v) || v <= 0) return "—";
  try {
    return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(v);
  } catch {
    return `CLP ${Math.round(v).toLocaleString("es-CL")}`;
  }
};

const boolTxt = (v) => {
  const s = String(v ?? "").toLowerCase();
  if (v === true || s === "si" || s === "sí") return "Sí";
  if (v === false || s === "no") return "No";
  return v ?? "—";
};

/* =============== Componente =============== */
export default function ContractualesTab({ datos, modoEdicion, onChange }) {
  const safeDatos = datos || {};

  const handleChange = (campo, valor) => {
    onChange?.("datosContractuales", { ...safeDatos, [campo]: valor });
  };

  // Campos clave (DT) con mapeo flexible de nombres
  const cargoActual       = pickCI(safeDatos, ["cargoactual","cargo"], "—");
  const tipoContrato      = pickCI(safeDatos, ["tipocontrato","tipo contrato"], "Indefinido");
  const jornada           = pickCI(safeDatos, ["jornada"], "Jornada Completa");
  const horasSemanales    = pickCI(safeDatos, ["horassemanales","horas semanales"], "—");
  const lugarTrabajo      = pickCI(safeDatos, ["lugartrabajo","lugar de trabajo","sucursal","centro","oficina"], "—");
  const centroCosto       = pickCI(safeDatos, ["centrocosto","centro de costo","area","área"], "—");
  const responsable       = pickCI(safeDatos, ["responsable","responsable directo","jefe directo"], "—");
  const fechaIngreso      = pickCI(safeDatos, ["fechaingreso","fecha de ingreso"], "");
  const duracion          = pickCI(safeDatos, ["duracion","duración"], tipoContrato?.toLowerCase().includes("plazo") ? "Plazo Fijo" : "Indefinido");
  const sueldoBase        = pickCI(safeDatos, ["sueldobase","sueldo base"], "");
  const gratificacion     = pickCI(safeDatos, ["gratificacion","gratificación"], "Legal");
  const modalidad         = pickCI(safeDatos, ["modalidad","teletrabajo","esquema"], "Presencial");
  const anexosFirmados    = pickCI(safeDatos, ["anexosfirmados","anexos firmados"], "—");
  const contratoFirmado   = pickCI(safeDatos, ["contratofirmado","contrato firmado"], "—");
  const pinMarcacion      = pickCI(safeDatos, ["pinmarcacion","pin marcación","pin"], "Sin PIN");
  const licencias         = pickCI(safeDatos, ["licencias","licencias/permisos activos","permisos activos"], "—");
  const finiquitoFirmado  = pickCI(safeDatos, ["finiquitofirmado","finiquito firmado"], "—");
  const ultimaActual      = pickCI(safeDatos, ["ultimaactualizacion","última actualización","ultima actualizacion"], "");

  return (
    <div className="ed-card">
      <h3 className="ed-card-title">Datos Contractuales</h3>

      <div className="ed-kv">
        {/* Cargo */}
        <div className="ed-kv-row">
          <span className="ed-kv-label">🧾 Cargo Actual:</span>
          <span className="ed-kv-value">
            {modoEdicion ? (
              <input
                value={cargoActual === "—" ? "" : cargoActual}
                onChange={(e) => handleChange("cargoActual", e.target.value)}
              />
            ) : cargoActual}
          </span>
        </div>

        {/* Tipo de contrato */}
        <div className="ed-kv-row">
          <span className="ed-kv-label">📄 Tipo de Contrato:</span>
          <span className="ed-kv-value">
            {modoEdicion ? (
              <input
                value={tipoContrato === "—" ? "" : tipoContrato}
                onChange={(e) => handleChange("tipoContrato", e.target.value)}
              />
            ) : tipoContrato}
          </span>
        </div>

        {/* Jornada / horas */}
        <div className="ed-kv-row">
          <span className="ed-kv-label">⏱ Jornada / Horas Semanales:</span>
          <span className="ed-kv-value">
            {modoEdicion ? (
              <span style={{ display: "inline-flex", gap: 8 }}>
                <input
                  style={{ minWidth: 160 }}
                  value={jornada === "—" ? "" : jornada}
                  onChange={(e) => handleChange("jornada", e.target.value)}
                />
                <input
                  style={{ width: 90 }}
                  type="number"
                  min="0"
                  value={horasSemanales === "—" ? "" : horasSemanales}
                  onChange={(e) => handleChange("horasSemanales", e.target.value)}
                  placeholder="Horas"
                />
              </span>
            ) : (
              <>
                {jornada}
                {horasSemanales !== "—" ? ` · ${horasSemanales} h` : ""}
              </>
            )}
          </span>
        </div>

        {/* Lugar de trabajo */}
        <div className="ed-kv-row">
          <span className="ed-kv-label">📍 Sucursal / Lugar de Trabajo:</span>
          <span className="ed-kv-value">
            {modoEdicion ? (
              <input
                value={lugarTrabajo === "—" ? "" : lugarTrabajo}
                onChange={(e) => handleChange("lugarTrabajo", e.target.value)}
              />
            ) : lugarTrabajo}
          </span>
        </div>

        {/* Centro de costo */}
        <div className="ed-kv-row">
          <span className="ed-kv-label">🏷 Centro de Costo / Área:</span>
          <span className="ed-kv-value">
            {modoEdicion ? (
              <input
                value={centroCosto === "—" ? "" : centroCosto}
                onChange={(e) => handleChange("centroCosto", e.target.value)}
              />
            ) : centroCosto}
          </span>
        </div>

        {/* Responsable */}
        <div className="ed-kv-row">
          <span className="ed-kv-label">👤 Responsable Directo:</span>
          <span className="ed-kv-value">
            {modoEdicion ? (
              <input
                value={responsable === "—" ? "" : responsable}
                onChange={(e) => handleChange("responsable", e.target.value)}
              />
            ) : responsable}
          </span>
        </div>

        {/* Fecha ingreso */}
        <div className="ed-kv-row">
          <span className="ed-kv-label">📅 Fecha de Ingreso:</span>
          <span className="ed-kv-value">
            {modoEdicion ? (
              <input
                type="date"
                value={fechaIngreso || ""}
                onChange={(e) => handleChange("fechaIngreso", e.target.value)}
              />
            ) : fmtFechaLarga(fechaIngreso)}
          </span>
        </div>

        {/* Duración */}
        <div className="ed-kv-row">
          <span className="ed-kv-label">⏳ Duración del Contrato:</span>
          <span className="ed-kv-value">
            {modoEdicion ? (
              <input
                value={duracion === "—" ? "" : duracion}
                onChange={(e) => handleChange("duracion", e.target.value)}
              />
            ) : duracion}
          </span>
        </div>

        {/* Sueldo base */}
        <div className="ed-kv-row">
          <span className="ed-kv-label">💰 Sueldo Base:</span>
          <span className="ed-kv-value">
            {modoEdicion ? (
              <input
                type="number"
                min="0"
                step="1000"
                value={String(sueldoBase).replace(/[^0-9.-]/g, "") || ""}
                onChange={(e) => handleChange("sueldoBase", e.target.value)}
                placeholder="Ej: 800000"
              />
            ) : moneyCLP(sueldoBase)}
          </span>
        </div>

        {/* Gratificación */}
        <div className="ed-kv-row">
          <span className="ed-kv-label">💵 Gratificación:</span>
          <span className="ed-kv-value">
            {modoEdicion ? (
              <input
                value={gratificacion === "—" ? "" : gratificacion}
                onChange={(e) => handleChange("gratificacion", e.target.value)}
              />
            ) : gratificacion}
          </span>
        </div>

        {/* Modalidad */}
        <div className="ed-kv-row">
          <span className="ed-kv-label">🏠 Modalidad de Trabajo:</span>
          <span className="ed-kv-value">
            {modoEdicion ? (
              <input
                value={modalidad === "—" ? "" : modalidad}
                onChange={(e) => handleChange("modalidad", e.target.value)}
              />
            ) : modalidad}
          </span>
        </div>

        {/* Anexos firmados */}
        <div className="ed-kv-row">
          <span className="ed-kv-label">🧰 Anexos Firmados:</span>
          <span className="ed-kv-value">
            {modoEdicion ? (
              <input
                value={anexosFirmados === "—" ? "" : anexosFirmados}
                onChange={(e) => handleChange("anexosFirmados", e.target.value)}
              />
            ) : anexosFirmados}
          </span>
        </div>

        {/* Contrato firmado */}
        <div className="ed-kv-row">
          <span className="ed-kv-label">🖊️ Contrato Firmado:</span>
          <span className="ed-kv-value">
            {modoEdicion ? (
              <select
                value={String(contratoFirmado).toLowerCase()}
                onChange={(e) => handleChange("contratoFirmado", e.target.value)}
              >
                <option value="si">Sí</option>
                <option value="no">No</option>
                <option value="—">—</option>
              </select>
            ) : boolTxt(contratoFirmado)}
          </span>
        </div>

        {/* PIN */}
        <div className="ed-kv-row">
          <span className="ed-kv-label">🔐 PIN Marcación:</span>
          <span className="ed-kv-value">
            {modoEdicion ? (
              <input
                value={pinMarcacion === "—" ? "" : pinMarcacion}
                onChange={(e) => handleChange("pinMarcacion", e.target.value)}
                placeholder="4 dígitos"
              />
            ) : (pinMarcacion || "Sin PIN")}
          </span>
        </div>

        {/* Licencias/Permisos */}
        <div className="ed-kv-row">
          <span className="ed-kv-label">🧾 Licencias / Permisos Activos:</span>
          <span className="ed-kv-value">
            {modoEdicion ? (
              <input
                value={licencias === "—" ? "" : licencias}
                onChange={(e) => handleChange("licencias", e.target.value)}
              />
            ) : licencias}
          </span>
        </div>

        {/* Finiquito firmado */}
        <div className="ed-kv-row">
          <span className="ed-kv-label">📑 Finiquito Firmado:</span>
          <span className="ed-kv-value">
            {modoEdicion ? (
              <select
                value={String(finiquitoFirmado).toLowerCase()}
                onChange={(e) => handleChange("finiquitoFirmado", e.target.value)}
              >
                <option value="si">Sí</option>
                <option value="no">No</option>
                <option value="—">—</option>
              </select>
            ) : boolTxt(finiquitoFirmado)}
          </span>
        </div>

        {/* Última actualización */}
        <div className="ed-kv-row">
          <span className="ed-kv-label">🗂️ Última Actualización de Contrato:</span>
          <span className="ed-kv-value">
            {modoEdicion ? (
              <input
                type="date"
                value={ultimaActual || ""}
                onChange={(e) => handleChange("ultimaActualizacion", e.target.value)}
              />
            ) : fmtFechaLarga(ultimaActual)}
          </span>
        </div>
      </div>
    </div>
  );
}
