import React from "react";

const label = { color: "#6B7280" };
const dash = (v) => (v === null || v === undefined || v === "" ? "—" : v);

export default function PrevisionView({ data, catalogs = {} }) {
  if (!data) return <div className="ef-card p20">Sin datos previsionales.</div>;

  const afp = catalogs.afp?.find(a => a.id === data.afp_id)?.nombre || "—";
  const isapre = catalogs.isapre?.find(a => a.id === data.isapre_id)?.nombre || "—";
  const caja = catalogs.cajas?.find(a => a.id === data.caja_id)?.nombre || "—";
  const mutual = catalogs.mutual?.find(a => a.id === data.mutual_id)?.nombre || "—";

  const planDesc =
    data.salud_tipo === "isapre"
      ? `${dash(data.isapre_plan_tipo)} ${dash(data.isapre_plan_valor)}`.trim()
      : `Fonasa (Tramo ${dash(data.fonasa_tramo)})`;

  const pensionSistema = (data.pension_sistema ? String(data.pension_sistema).toUpperCase() : "—");

  return (
    <div className="ef-card p20">
      <h3 className="ef-title-sm">Datos Previsionales</h3>

      {/* GRID tipo "Contractuales": dos columnas responsivas */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Columna izquierda */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <span style={label}>Salud:</span>
            <strong>{data.salud_tipo === "isapre" ? `Isapre ${isapre}` : "Fonasa"}</strong>
          </div>

          <div className="flex items-start justify-between gap-3">
            <span style={label}>Plan / Tramo:</span>
            <strong>{planDesc}</strong>
          </div>

          <div className="flex items-start justify-between gap-3">
            <span style={label}>Caja Compensación:</span>
            <strong>{dash(caja)}</strong>
          </div>

          <div className="flex items-start justify-between gap-3">
            <span style={label}>Asignación Familiar:</span>
            <strong>
              Tramo {dash(data.tramo_asignacion)} · {data.cargas_familiares ?? 0} carga(s)
            </strong>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <span style={label}>Sistema Pensión:</span>
            <strong>{pensionSistema}</strong>
          </div>

          <div className="flex items-start justify-between gap-3">
            <span style={label}>AFP:</span>
            <strong>{data.pension_sistema === "afp" ? afp : "—"}</strong>
          </div>

          <div className="flex items-start justify-between gap-3">
            <span style={label}>Cotización obligatoria:</span>
            <strong>{data.cot_obligatoria_pct != null ? `${data.cot_obligatoria_pct}%` : "—"}</strong>
          </div>

          <div className="flex items-start justify-between gap-3">
            <span style={label}>SIS:</span>
            <strong>{data.sis_pct != null ? `${data.sis_pct}%` : "—"}</strong>
          </div>
        </div>

        {/* Fila inferior izquierda */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <span style={label}>Contrato:</span>
            <strong>{dash(data.contrato_tipo)}</strong>
          </div>

          <div className="flex items-start justify-between gap-3">
            <span style={label}>AFC afiliado:</span>
            <strong>{data.afc_afiliado ? "Sí" : "No"}</strong>
          </div>

          <div className="flex items-start justify-between gap-3">
            <span style={label}>AFC exento:</span>
            <strong>{data.afc_exento ? "Sí" : "No"}</strong>
          </div>
        </div>

        {/* Fila inferior derecha */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <span style={label}>Mutual:</span>
            <strong>{dash(mutual)}</strong>
          </div>

          <div className="flex items-start justify-between gap-3">
            <span style={label}>Tasa Accidente:</span>
            <strong>{data.tasa_accidente_pct != null ? `${data.tasa_accidente_pct}%` : "—"}</strong>
          </div>

          <div className="flex items-start justify-between gap-3">
            <span style={label}>Adicional Diferenciada:</span>
            <strong>{data.adicional_diferenciada_pct != null ? `${data.adicional_diferenciada_pct}%` : "—"}</strong>
          </div>
        </div>

        {/* Trabajo pesado / APV (ocupan ambas columnas en mobile y se alinean como contractuales) */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <span style={label}>Trabajo Pesado:</span>
            <strong>{data.trabajo_pesado ? "Sí" : "No"}</strong>
          </div>

          <div className="flex items-start justify-between gap-3">
            <span style={label}>Adic. Trabajo Pesado:</span>
            <strong>{data.trabajo_pesado_adic_pct != null ? `${data.trabajo_pesado_adic_pct}%` : "—"}</strong>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <span style={label}>APV:</span>
            <strong>{data.apv_regimen ? `Régimen ${data.apv_regimen}` : "—"}</strong>
          </div>

          <div className="flex items-start justify-between gap-3">
            <span style={label}>APV Monto:</span>
            <strong>{dash(data.apv_monto)}</strong>
          </div>

          <div className="flex items-start justify-between gap-3">
            <span style={label}>Dep. Convenido:</span>
            <strong>{dash(data.deposito_convenido_monto)}</strong>
          </div>
        </div>
      </div>

      <div className="mt-4 text-gray-500">
        Vigencia:{" "}
        <strong>{dash(data.fecha_vigencia_desde)}</strong>
        {data.fecha_vigencia_hasta ? ` a ${data.fecha_vigencia_hasta}` : " (vigente)"}
      </div>

      {data.observaciones && (
        <div className="mt-2">
          <span style={label}>Observaciones:</span> {data.observaciones}
        </div>
      )}
    </div>
  );
}
