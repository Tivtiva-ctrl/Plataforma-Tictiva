// src/components/PrevisionTab.jsx
import React from "react";

/**
 * Muestra/edita los datos previsionales y legales del empleado.
 * - Guarda en empleado.datosPrevisionales mediante onChange("datosPrevisionales", {...})
 * - Usa fallbacks del empleado si faltan datos en datosPrevisionales.
 */
export default function PrevisionTab({ empleado = {}, modoEdicion = false, onChange }) {
  const datos = empleado.datosPrevisionales || empleado.prevision || {};

  const pick = (v, ...fallbacks) => {
    if (v !== undefined && v !== null && String(v) !== "") return v;
    for (const f of fallbacks) {
      if (f !== undefined && f !== null && String(f) !== "") return f;
    }
    return "";
  };
  const showND = (v, nd = "N/D") => (v || v === 0 ? String(v) : nd);
  const money = (n) =>
    n || n === 0 ? `$${Number(n).toLocaleString("es-CL")}` : "N/D";

  const view = {
    afp: pick(datos.afp, empleado.afp),
    sistemaSalud: pick(
      datos.sistemaSalud,
      // inferencia simple: si hay isapre => Isapre; si no => Fonasa
      datos.isapre || empleado.isapre ? "Isapre" : datos.sistemaSalud || ""
    ),
    nombreIsapre: pick(datos.nombreIsapre, datos.isapre, empleado.isapre),
    cajaCompensacion: pick(datos.cajaCompensacion, empleado.cajaCompensacion, empleado.caja),
    mutualSeguridad: pick(datos.mutualSeguridad, empleado.mutual, empleado.mutualSeguridad),
    seguroCesantia: pick(datos.seguroCesantia, empleado.seguroCesantia), // "Sí"/"No"
    tramoAsignacion: pick(datos.tramoAsignacion, empleado.tramoAsignacion),
    cargasFamiliares: pick(datos.cargasFamiliares, empleado.cargasFamiliares),
    pensionAlimentosMonto: pick(datos.pensionAlimentosMonto, empleado.pensionAlimentosMonto),
    pensionAlimentosResolucion: pick(datos.pensionAlimentosResolucion, empleado.pensionAlimentosResolucion),
    discapacidadDeclarada: pick(datos.discapacidadDeclarada, empleado.discapacidadDeclarada), // "Sí"/"No"
    apvInstitucion: pick(datos.apvInstitucion, empleado.apvInstitucion),
    apvCuenta: pick(datos.apvCuenta, empleado.apvCuenta),
    tasaAccidenteTrabajo: pick(datos.tasaAccidenteTrabajo, empleado.tasaAccidenteTrabajo), // %
  };

  const setVal = (campo, valor) => {
    onChange?.("datosPrevisionales", { ...datos, [campo]: valor });
  };

  // Pendientes “DT” (campos claves que conviene tener)
  const clavesDT = [
    { k: "afp", label: "AFP" },
    { k: "sistemaSalud", label: "Sistema de Salud" },
    { k: "mutualSeguridad", label: "Mutual de Seguridad" },
    { k: "cajaCompensacion", label: "Caja de Compensación" },
    { k: "seguroCesantia", label: "Seguro de Cesantía (AFC)" },
    { k: "tramoAsignacion", label: "Asignación Familiar (Tramo)" },
  ];
  const faltantesDT = clavesDT.filter(({ k }) => !view[k]);

  return (
    <div className="ed-card">
      <h3 className="ed-card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span aria-hidden>📑</span>
        <span>Datos Previsionales y Legales</span>
      </h3>

      {/* 2 columnas, mismo patrón que Contractuales */}
      <div
        className="datos-grid"
        style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}
      >
        {/* Col 1 */}
        <div className="dato-item">
          <strong>AFP:</strong>{" "}
          {modoEdicion ? (
            <input
              value={view.afp}
              onChange={(e) => setVal("afp", e.target.value)}
              placeholder="Ej: Habitat, Provida…"
            />
          ) : (
            showND(view.afp)
          )}
        </div>

        <div className="dato-item">
          <strong>Sistema de Salud:</strong>{" "}
          {modoEdicion ? (
            <select
              value={view.sistemaSalud || ""}
              onChange={(e) => setVal("sistemaSalud", e.target.value)}
            >
              <option value="">— Seleccionar —</option>
              <option>Fonasa</option>
              <option>Isapre</option>
            </select>
          ) : (
            showND(view.sistemaSalud)
          )}
        </div>

        <div className="dato-item">
          <strong>Nombre Isapre:</strong>{" "}
          {modoEdicion ? (
            <input
              value={view.nombreIsapre}
              onChange={(e) => setVal("nombreIsapre", e.target.value)}
              placeholder="Ej: Colmena, Consalud…"
            />
          ) : (
            // Si sistema es Fonasa y no hay isapre, mostramos N/D
            view.sistemaSalud === "Isapre" ? showND(view.nombreIsapre) : "N/D"
          )}
        </div>

        <div className="dato-item">
          <strong>Caja de Compensación:</strong>{" "}
          {modoEdicion ? (
            <input
              value={view.cajaCompensacion}
              onChange={(e) => setVal("cajaCompensacion", e.target.value)}
              placeholder="Ej: Los Andes, La Araucana…"
            />
          ) : (
            showND(view.cajaCompensacion)
          )}
        </div>

        <div className="dato-item">
          <strong>Mutual de Seguridad:</strong>{" "}
          {modoEdicion ? (
            <input
              value={view.mutualSeguridad}
              onChange={(e) => setVal("mutualSeguridad", e.target.value)}
              placeholder="Ej: ACHS, Mutual CChC, ISL…"
            />
          ) : (
            showND(view.mutualSeguridad)
          )}
        </div>

        <div className="dato-item">
          <strong>Seguro de Cesantía (AFC):</strong>{" "}
          {modoEdicion ? (
            <select
              value={view.seguroCesantia || ""}
              onChange={(e) => setVal("seguroCesantia", e.target.value)}
            >
              <option value="">— Seleccionar —</option>
              <option>Sí</option>
              <option>No</option>
            </select>
          ) : (
            showND(view.seguroCesantia)
          )}
        </div>

        <div className="dato-item">
          <strong>Asignación Familiar (Tramo):</strong>{" "}
          {modoEdicion ? (
            <select
              value={view.tramoAsignacion || ""}
              onChange={(e) => setVal("tramoAsignacion", e.target.value)}
            >
              <option value="">— Seleccionar —</option>
              <option>A</option>
              <option>B</option>
              <option>C</option>
              <option>D</option>
              <option>No Aplica</option>
            </select>
          ) : (
            showND(view.tramoAsignacion)
          )}
        </div>

        <div className="dato-item">
          <strong>Cargas Familiares (N°):</strong>{" "}
          {modoEdicion ? (
            <input
              type="number"
              min="0"
              value={view.cargasFamiliares || ""}
              onChange={(e) => setVal("cargasFamiliares", e.target.value)}
              placeholder="0"
              style={{ width: 120 }}
            />
          ) : (
            showND(view.cargasFamiliares)
          )}
        </div>

        <div className="dato-item">
          <strong>Pensión de Alimentos (Monto):</strong>{" "}
          {modoEdicion ? (
            <input
              type="number"
              min="0"
              step="1000"
              value={view.pensionAlimentosMonto || ""}
              onChange={(e) => setVal("pensionAlimentosMonto", e.target.value)}
              placeholder="Ej: 150000"
            />
          ) : (
            view.pensionAlimentosMonto || view.pensionAlimentosMonto === 0
              ? money(view.pensionAlimentosMonto)
              : "N/D"
          )}
        </div>

        <div className="dato-item">
          <strong>Resolución Pensión:</strong>{" "}
          {modoEdicion ? (
            <input
              value={view.pensionAlimentosResolucion || ""}
              onChange={(e) => setVal("pensionAlimentosResolucion", e.target.value)}
              placeholder="N° o detalle de la resolución"
            />
          ) : (
            showND(view.pensionAlimentosResolucion)
          )}
        </div>

        <div className="dato-item">
          <strong>Discapacidad Declarada:</strong>{" "}
          {modoEdicion ? (
            <select
              value={view.discapacidadDeclarada || ""}
              onChange={(e) => setVal("discapacidadDeclarada", e.target.value)}
            >
              <option value="">— Seleccionar —</option>
              <option>Sí</option>
              <option>No</option>
            </select>
          ) : (
            showND(view.discapacidadDeclarada)
          )}
        </div>

        <div className="dato-item">
          <strong>APV (Institución):</strong>{" "}
          {modoEdicion ? (
            <input
              value={view.apvInstitucion || ""}
              onChange={(e) => setVal("apvInstitucion", e.target.value)}
              placeholder="Opcional"
            />
          ) : (
            showND(view.apvInstitucion)
          )}
        </div>

        <div className="dato-item">
          <strong>APV (Cuenta/Contrato):</strong>{" "}
          {modoEdicion ? (
            <input
              value={view.apvCuenta || ""}
              onChange={(e) => setVal("apvCuenta", e.target.value)}
              placeholder="Opcional"
            />
          ) : (
            showND(view.apvCuenta)
          )}
        </div>

        <div className="dato-item">
          <strong>Tasa Cot. Accidente Trabajo:</strong>{" "}
          {modoEdicion ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <input
                type="number"
                min="0"
                step="0.01"
                value={view.tasaAccidenteTrabajo || ""}
                onChange={(e) => setVal("tasaAccidenteTrabajo", e.target.value)}
                style={{ width: 110 }}
                placeholder="0.93"
              />
              <span>%</span>
            </div>
          ) : (
            view.tasaAccidenteTrabajo ? `${view.tasaAccidenteTrabajo}%` : "N/D"
          )}
        </div>
      </div>

      {/* Pendientes DT */}
      {faltantesDT.length > 0 && (
        <div
          style={{
            marginTop: 10,
            borderTop: "1px solid #F3F4F6",
            paddingTop: 10,
            color: "#6B7280",
            fontSize: 13,
          }}
        >
          <strong style={{ color: "#B45309" }}>Pendientes DT:</strong>{" "}
          {faltantesDT.map((f) => f.label).join(", ")}
        </div>
      )}
    </div>
  );
}
