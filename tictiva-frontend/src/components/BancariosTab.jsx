// src/components/BancariosTab.jsx
import React from "react";

export default function BancariosTab({ empleado = {}, modoEdicion = false, onChange }) {
  // Origen de datos flexible: datosBancarios | bancarios | plano
  const base =
    empleado.datosBancarios ||
    empleado.bancarios ||
    {};

  const pick = (...keys) => {
    for (const k of keys) {
      const v =
        base[k] ??
        empleado?.datosBancarios?.[k] ??
        empleado?.bancarios?.[k] ??
        empleado?.[k];
      if (v !== undefined && v !== null && String(v) !== "") return v;
    }
    return "";
  };

  const view = {
    banco: pick("banco", "institucion", "institución"),
    tipoCuenta: pick("tipoCuenta", "tipo_cuenta", "tipo"),
    numeroCuenta: pick("numeroCuenta", "nroCuenta", "numCuenta", "cuenta"),
    titular: pick("titular", "titularCuenta", "nombreTitular", "nombre"),
    rutTitular: pick("rutTitular", "rut_titular", "rut"),
    correoPago: pick("correoPago", "emailPago", "correo", "email"),
  };

  const safe = (v, dash = "N/D") => (v || v === 0 ? String(v) : dash);

  const handleChange = (campo, val) => {
    const updated = { ...base, [campo]: val };
    // Guardamos siempre bajo la misma llave para mantener consistencia
    onChange?.("datosBancarios", updated);
  };

  return (
    <div className="ed-card">
      <h3 className="ed-card-title">Datos Bancarios</h3>

      {/* Grid 2 columnas, mismo estilo visual que contractuales */}
      <div className="ed-2col">
        <div className="ed-kv-row">
          <span className="ed-kv-label">Banco:</span>
          {modoEdicion ? (
            <input
              value={view.banco}
              onChange={(e) => handleChange("banco", e.target.value)}
              placeholder="Ej: BancoEstado"
            />
          ) : (
            <span className="ed-kv-value">{safe(view.banco)}</span>
          )}
        </div>

        <div className="ed-kv-row">
          <span className="ed-kv-label">Tipo de Cuenta:</span>
          {modoEdicion ? (
            <select
              value={view.tipoCuenta}
              onChange={(e) => handleChange("tipoCuenta", e.target.value)}
            >
              <option value="">Seleccionar…</option>
              <option>Cuenta Vista</option>
              <option>Cuenta Corriente</option>
              <option>Cuenta de Ahorro</option>
              <option>RUT</option>
            </select>
          ) : (
            <span className="ed-kv-value">{safe(view.tipoCuenta)}</span>
          )}
        </div>

        <div className="ed-kv-row">
          <span className="ed-kv-label">Número de Cuenta:</span>
          {modoEdicion ? (
            <input
              value={view.numeroCuenta}
              onChange={(e) => handleChange("numeroCuenta", e.target.value)}
              placeholder="Ej: 12345678"
            />
          ) : (
            <span className="ed-kv-value">{safe(view.numeroCuenta)}</span>
          )}
        </div>

        <div className="ed-kv-row">
          <span className="ed-kv-label">Titular de la Cuenta:</span>
          {modoEdicion ? (
            <input
              value={view.titular}
              onChange={(e) => handleChange("titular", e.target.value)}
              placeholder="Nombre del titular"
            />
          ) : (
            <span className="ed-kv-value">{safe(view.titular)}</span>
          )}
        </div>

        <div className="ed-kv-row">
          <span className="ed-kv-label">RUT del Titular:</span>
          {modoEdicion ? (
            <input
              value={view.rutTitular}
              onChange={(e) => handleChange("rutTitular", e.target.value)}
              placeholder="Ej: 12.345.678-9"
            />
          ) : (
            <span className="ed-kv-value">{safe(view.rutTitular)}</span>
          )}
        </div>

        <div className="ed-kv-row">
          <span className="ed-kv-label">Correo para Pago (opcional):</span>
          {modoEdicion ? (
            <input
              type="email"
              value={view.correoPago}
              onChange={(e) => handleChange("correoPago", e.target.value)}
              placeholder="para comprobantes/avisos"
            />
          ) : (
            <span className="ed-kv-value">{safe(view.correoPago)}</span>
          )}
        </div>
      </div>

      {/* Nota corta: qué mira la DT */}
      <div className="ed-hint">
        Para fiscalización: basta con que el sistema permita registrar y
        respaldar los datos bancarios del pago de remuneraciones
        (no es documento obligatorio de la carpeta personal, pero es
        crítico para la operación de sueldos).
      </div>

      {/* estilos locales para la grilla 2 columnas */}
      <style>{`
        .ed-2col{
          display:grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px 24px;
        }
        .ed-2col .ed-kv-row{
          border-top:none;        /* evita líneas dentro de la grilla */
          padding:10px 2px;
        }
        .ed-hint{
          margin-top:10px;
          font-size:12px;
          color:#6B7280;
        }
        /* inputs simples para edición coherentes al resto */
        .ed-2col input, .ed-2col select{
          width:100%;
          border:1px solid #E5E7EB;
          border-radius:8px;
          padding:6px 8px;
          font-size:14px;
        }
      `}</style>
    </div>
  );
}
