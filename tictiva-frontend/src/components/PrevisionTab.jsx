// src/components/PrevisionTab.jsx
import React from "react";

/** Helper para tomar claves con nombre flexible (case-insensitive) */
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

export default function PrevisionTab({ empleado, modoEdicion, onChange }) {
  // Fuente de datos flexible: empleado.prevision | empleado.datosPrevisionales
  const base =
    empleado?.prevision ||
    empleado?.datosPrevisionales ||
    empleado?.datosPrevision ||
    {};

  // Construimos la vista con fallbacks al empleado si existen
  const view = {
    afp: pickCI(base, ["afp", "afpNombre"], ""),
    sistemaSalud: pickCI(base, ["sistemaSalud", "salud", "fonasaIsapre"], ""),
    nombreIsapre: pickCI(base, ["nombreIsapre", "isapre"], ""),
    planSalud: pickCI(base, ["planSalud", "planIsapre"], ""),
    cajaCompensacion: pickCI(base, ["cajaCompensacion", "caja"], ""),
    mutualSeguridad: pickCI(base, ["mutualSeguridad", "mutual"], ""),
    afc: pickCI(base, ["seguroCesantia", "afc"], ""),
    cargasFamiliaresN: pickCI(base, ["cargasFamiliares", "cargasFamiliaresN"], ""),
    asignacionFamiliarTramo: pickCI(base, ["asignacionFamiliarTramo", "tramoAsignacion"], ""),
    pensionAlimentosMonto: pickCI(base, ["pensionAlimentosMonto"], ""),
    discapacidad: pickCI(base, ["discapacidad", "discapacidadDeclarada"], ""),
    resolucionPension: pickCI(base, ["resolucionPension"], ""),
    apvInstitucion: pickCI(base, ["apvInstitucion"], ""),
    apvCuentaContrato: pickCI(base, ["apvCuentaContrato", "apvCuenta"], ""),
    tasaAccidenteTrabajo: pickCI(base, ["tasaAccidenteTrabajo", "tasaAccidente"], ""),
  };

  const handleChange = (campo, valor) => {
    const next = { ...(empleado?.prevision || empleado?.datosPrevisionales || {}), [campo]: valor };
    // Puedes guardar en "prevision" o "datosPrevisionales"; dejamos "prevision"
    onChange?.("prevision", next);
  };

  // Calculamos pendientes básicos para DT (campos clave que conviene tener)
  const faltantes = [];
  if (!view.sistemaSalud) faltantes.push("Sistema de Salud");
  if (!view.mutualSeguridad) faltantes.push("Mutual de Seguridad");
  if (!view.cajaCompensacion) faltantes.push("Caja de Compensación");
  if (!view.afc) faltantes.push("Seguro de Cesantía (AFC)");
  if (!view.asignacionFamiliarTramo) faltantes.push("Asignación Familiar (Tramo)");

  const V = ({ v, fmt }) => <span className="ed-kv-value">{v ? (fmt ? fmt(v) : v) : "N/D"}</span>;

  return (
    <div className="ed-card">
      <h3 className="ed-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span aria-hidden>🧾</span>
        <span>Datos Previsionales y Legales</span>
      </h3>

      {/* Grid 2 columnas, reutiliza el estilo de Personales/Contractuales */}
      <div className="ed-kv2">
        {/* Columna izquierda */}
        <div className="ed-kv">
          <div className="ed-kv-row">
            <span className="ed-kv-label">AFP:</span>
            {modoEdicion ? (
              <input
                value={view.afp}
                onChange={(e) => handleChange("afp", e.target.value)}
              />
            ) : (
              <V v={view.afp} />
            )}
          </div>

          <div className="ed-kv-row">
            <span className="ed-kv-label">Nombre Isapre:</span>
            {modoEdicion ? (
              <input
                value={view.nombreIsapre}
                onChange={(e) => handleChange("nombreIsapre", e.target.value)}
                placeholder="Si es ISAPRE"
              />
            ) : (
              <V v={view.nombreIsapre} />
            )}
          </div>

          <div className="ed-kv-row">
            <span className="ed-kv-label">Mutual de Seguridad:</span>
            {modoEdicion ? (
              <input
                value={view.mutualSeguridad}
                onChange={(e) => handleChange("mutualSeguridad", e.target.value)}
                placeholder="ACHS / IST / MUTUAL"
              />
            ) : (
              <V v={view.mutualSeguridad} />
            )}
          </div>

          <div className="ed-kv-row">
            <span className="ed-kv-label">Asignación Familiar (Tramo):</span>
            {modoEdicion ? (
              <input
                value={view.asignacionFamiliarTramo}
                onChange={(e) => handleChange("asignacionFamiliarTramo", e.target.value)}
              />
            ) : (
              <V v={view.asignacionFamiliarTramo} />
            )}
          </div>

          <div className="ed-kv-row">
            <span className="ed-kv-label">Pensión de Alimentos (Monto):</span>
            {modoEdicion ? (
              <input
                type="number"
                min="0"
                step="1000"
                value={view.pensionAlimentosMonto}
                onChange={(e) => handleChange("pensionAlimentosMonto", e.target.value)}
              />
            ) : (
              <V v={view.pensionAlimentosMonto} fmt={moneyCL} />
            )}
          </div>

          <div className="ed-kv-row">
            <span className="ed-kv-label">Discapacidad Declarada:</span>
            {modoEdicion ? (
              <select
                value={String(view.discapacidad || "")}
                onChange={(e) => handleChange("discapacidad", e.target.value)}
              >
                <option value="">—</option>
                <option>SI</option>
                <option>NO</option>
              </select>
            ) : (
              <V v={view.discapacidad} />
            )}
          </div>
        </div>

        {/* Columna derecha */}
        <div className="ed-kv">
          <div className="ed-kv-row">
            <span className="ed-kv-label">Sistema de Salud:</span>
            {modoEdicion ? (
              <select
                value={view.sistemaSalud}
                onChange={(e) => handleChange("sistemaSalud", e.target.value)}
              >
                <option value="">—</option>
                <option value="FONASA">FONASA</option>
                <option value="ISAPRE">ISAPRE</option>
              </select>
            ) : (
              <V v={view.sistemaSalud} />
            )}
          </div>

          <div className="ed-kv-row">
            <span className="ed-kv-label">Caja de Compensación:</span>
            {modoEdicion ? (
              <input
                value={view.cajaCompensacion}
                onChange={(e) => handleChange("cajaCompensacion", e.target.value)}
              />
            ) : (
              <V v={view.cajaCompensacion} />
            )}
          </div>

          <div className="ed-kv-row">
            <span className="ed-kv-label">Seguro de Cesantía (AFC):</span>
            {modoEdicion ? (
              <select
                value={view.afc}
                onChange={(e) => handleChange("afc", e.target.value)}
              >
                <option value="">—</option>
                <option value="AFILIADO">AFILIADO</option>
                <option value="NO AFILIADO">NO AFILIADO</option>
              </select>
            ) : (
              <V v={view.afc} />
            )}
          </div>

          <div className="ed-kv-row">
            <span className="ed-kv-label">Cargas Familiares (Nº):</span>
            {modoEdicion ? (
              <input
                type="number"
                min="0"
                value={view.cargasFamiliaresN}
                onChange={(e) => handleChange("cargasFamiliares", e.target.value)}
              />
            ) : (
              <V v={view.cargasFamiliaresN} />
            )}
          </div>

          <div className="ed-kv-row">
            <span className="ed-kv-label">Resolución Pensión:</span>
            {modoEdicion ? (
              <input
                value={view.resolucionPension}
                onChange={(e) => handleChange("resolucionPension", e.target.value)}
                placeholder="N° / fecha (si aplica)"
              />
            ) : (
              <V v={view.resolucionPension} />
            )}
          </div>

          <div className="ed-kv-row">
            <span className="ed-kv-label">APV (Institución):</span>
            {modoEdicion ? (
              <input
                value={view.apvInstitucion}
                onChange={(e) => handleChange("apvInstitucion", e.target.value)}
              />
            ) : (
              <V v={view.apvInstitucion} />
            )}
          </div>

          <div className="ed-kv-row">
            <span className="ed-kv-label">APV (Cuenta/Contrato):</span>
            {modoEdicion ? (
              <input
                value={view.apvCuentaContrato}
                onChange={(e) => handleChange("apvCuentaContrato", e.target.value)}
              />
            ) : (
              <V v={view.apvCuentaContrato} />
            )}
          </div>

          <div className="ed-kv-row">
            <span className="ed-kv-label">Tasa Cot. Accidente Trabajo:</span>
            {modoEdicion ? (
              <input
                value={view.tasaAccidenteTrabajo}
                onChange={(e) => handleChange("tasaAccidenteTrabajo", e.target.value)}
                placeholder="Ej: 0.93%"
              />
            ) : (
              <V v={view.tasaAccidenteTrabajo} />
            )}
          </div>
        </div>
      </div>

      {/* Pie con pendientes DT */}
      <div className="prev-pendientes">
        <b>Pendientes DT:</b>{" "}
        {faltantes.length ? faltantes.join(", ") : "Sin pendientes."}
      </div>

      {/* CSS local para la grilla de 2 columnas (reutiliza ed-kv-row global) */}
      <style>{`
        .ed-kv2{
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap:16px;
        }
        @media (max-width: 800px){
          .ed-kv2{ grid-template-columns: 1fr; }
        }
        .prev-pendientes{
          margin-top:10px;
          padding:10px 12px;
          border-top:1px solid #F3F4F6;
          color:#6B7280;
          font-size:12px;
        }
        /* Si en tu proyecto no existe .ed-kv-row (de Personales),
           se ve así: */
        .ed-kv{display:grid}
        .ed-kv-row{display:flex; justify-content:space-between; gap:12px; padding:10px 2px; border-top:1px solid #F3F4F6}
        .ed-kv-row:first-child{border-top:none}
        .ed-kv-label{color:#6B7280; min-width:220px}
        .ed-kv-value{font-weight:700; color:#111827; text-align:right}
      `}</style>
    </div>
  );
}
