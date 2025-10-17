import React from "react";

const dash = (v) => (v === null || v === undefined || v === "" ? "—" : v);
const pct  = (v) => (v === null || v === undefined || v === "" ? "—" : `${v}%`);

function Row({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-gray-100 last:border-b-0">
      <span className="text-gray-500">{label}</span>
      <strong className="text-gray-900">{value}</strong>
    </div>
  );
}

export default function PrevisionView({ data = {}, catalogs = {} }) {
  // Catálogos
  const afp    = catalogs.afp?.find(a => a.id === data.afp_id)?.nombre || "—";
  const isapre = catalogs.isapre?.find(a => a.id === data.isapre_id)?.nombre || "—";
  const caja   = catalogs.cajas?.find(a => a.id === data.caja_id)?.nombre || "—";
  const mutual = catalogs.mutual?.find(a => a.id === data.mutual_id)?.nombre || "—";

  // Derivados
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

      {/* IGUAL QUE CONTRACTUALES: tabla en dos columnas */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-8 text-[15px] leading-6">
        {/* Columna izquierda */}
        <div>
          <Row label="Salud:" value={data.salud_tipo === "isapre" ? `Isapre ${isapre}` : "Fonasa"} />
          <Row label="Plan / Tramo:" value={planDesc} />
          <Row label="Caja Compensación:" value={dash(caja)} />
          <Row
            label="Asignación Familiar:"
            value={`Tramo ${dash(data.tramo_asignacion)} · ${data.cargas_familiares ?? 0} carga(s)`}
          />
          <Row label="Sistema Pensión:" value={pensionSistema} />
          <Row label="AFP:" value={data.pension_sistema === "afp" ? afp : "—"} />
          <Row label="Cotización obligatoria:" value={pct(data.cot_obligatoria_pct)} />
          <Row label="SIS:" value={pct(data.sis_pct)} />
        </div>

        {/* Columna derecha */}
        <div>
          <Row label="Contrato:" value={dash(data.contrato_tipo)} />
          <Row label="AFC afiliado:" value={data.afc_afiliado ? "Sí" : "No"} />
          <Row label="AFC exento:" value={data.afc_exento ? "Sí" : "No"} />
          <Row label="Mutual:" value={dash(mutual)} />
          <Row label="Tasa Accidente:" value={pct(data.tasa_accidente_pct)} />
          <Row label="Adicional Diferenciada:" value={pct(data.adicional_diferenciada_pct)} />
          <Row label="Trabajo Pesado:" value={data.trabajo_pesado ? "Sí" : "No"} />
          <Row label="Adic. Trabajo Pesado:" value={pct(data.trabajo_pesado_adic_pct)} />
          <Row label="APV:" value={data.apv_regimen ? `Régimen ${data.apv_regimen}` : "—"} />
          <Row label="APV Monto:" value={dash(data.apv_monto)} />
          <Row label="Dep. Convenido:" value={dash(data.deposito_convenido_monto)} />
        </div>
      </div>

      <div className="mt-4 text-gray-500">
        Vigencia: <strong>{dash(data.fecha_vigencia_desde)}</strong>
        {data.fecha_vigencia_hasta ? ` a ${data.fecha_vigencia_hasta}` : " (vigente)"}
      </div>

      {data.observaciones && (
        <div className="mt-2">
          <span className="text-gray-500">Observaciones:</span>{" "}
          <span>{data.observaciones}</span>
        </div>
      )}
    </div>
  );
}
