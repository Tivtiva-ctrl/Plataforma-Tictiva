import React from "react";

const dash = (v) => (v === null || v === undefined || v === "" ? "—" : v);
const pct  = (v) => (v === null || v === undefined || v === "" ? "—" : `${v}%`);

function Field({ label, value }) {
  return (
    <div className="ef-field">
      <div className="ef-label">{label}</div>
      <div className="ef-value"><strong>{value}</strong></div>
    </div>
  );
}

export default function PrevisionView({ data, catalogs = {} }) {
  if (!data) return <div className="ef-card p20">Sin datos previsionales.</div>;

  const afp    = catalogs.afp?.find(a => a.id === data.afp_id)?.nombre || "—";
  const isapre = catalogs.isapre?.find(a => a.id === data.isapre_id)?.nombre || "—";
  const caja   = catalogs.cajas?.find(a => a.id === data.caja_id)?.nombre || "—";
  const mutual = catalogs.mutual?.find(a => a.id === data.mutual_id)?.nombre || "—";

  const planDesc =
    data.salud_tipo === "isapre"
      ? `${dash(data.isapre_plan_tipo)} ${dash(data.isapre_plan_valor)}`.trim()
      : `Fonasa (Tramo ${dash(data.fonasa_tramo)})`;

  const pensionSistema = data.pension_sistema
    ? String(data.pension_sistema).toUpperCase()
    : "—";

  return (
    <div className="ef-card p20">
      <h3 className="ef-title-sm">Datos Previsionales</h3>

      {/* === MISMO LAYOUT QUE CONTRACTUALES === */}
      <div className="ef-grid-2 mt-4">
        {/* Columna Izquierda */}
        <div className="ef-col space-y-2">
          <Field
            label="Salud:"
            value={data.salud_tipo === "isapre" ? `Isapre ${isapre}` : "Fonasa"}
          />
          <Field label="Plan / Tramo:" value={planDesc} />
          <Field label="Caja Compensación:" value={dash(caja)} />
          <Field
            label="Asignación Familiar:"
            value={`Tramo ${dash(data.tramo_asignacion)} · ${data.cargas_familiares ?? 0} carga(s)`}
          />
          <Field label="Sistema Pensión:" value={pensionSistema} />
          <Field label="AFP:" value={data.pension_sistema === "afp" ? afp : "—"} />
          <Field label="Cotización obligatoria:" value={pct(data.cot_obligatoria_pct)} />
          <Field label="SIS:" value={pct(data.sis_pct)} />
        </div>

        {/* Columna Derecha */}
        <div className="ef-col space-y-2">
          <Field label="Contrato:" value={dash(data.contrato_tipo)} />
          <Field label="AFC afiliado:" value={data.afc_afiliado ? "Sí" : "No"} />
          <Field label="AFC exento:" value={data.afc_exento ? "Sí" : "No"} />
          <Field label="Mutual:" value={dash(mutual)} />
          <Field label="Tasa Accidente:" value={pct(data.tasa_accidente_pct)} />
          <Field label="Adicional Diferenciada:" value={pct(data.adicional_diferenciada_pct)} />
          <Field label="Trabajo Pesado:" value={data.trabajo_pesado ? "Sí" : "No"} />
          <Field label="Adic. Trabajo Pesado:" value={pct(data.trabajo_pesado_adic_pct)} />
          <Field
            label="APV:"
            value={data.apv_regimen ? `Régimen ${data.apv_regimen}` : "—"}
          />
          <Field label="APV Monto:" value={dash(data.apv_monto)} />
          <Field label="Dep. Convenido:" value={dash(data.deposito_convenido_monto)} />
        </div>
      </div>

      <div className="mt-4 text-gray-500">
        Vigencia: <strong>{dash(data.fecha_vigencia_desde)}</strong>
        {data.fecha_vigencia_hasta ? ` a ${data.fecha_vigencia_hasta}` : " (vigente)"}
      </div>

      {data.observaciones && (
        <div className="mt-2">
          <span className="ef-label">Observaciones:</span>{" "}
          <span className="ef-value">{data.observaciones}</span>
        </div>
      )}
    </div>
  );
}
