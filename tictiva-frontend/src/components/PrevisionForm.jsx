import React from "react";

const label = { color: "#6B7280" };
const dash = (v) => (v === null || v === undefined || v === "" ? "—" : v);
const pct = (v) => (v === null || v === undefined || v === "" ? "—" : `${v}%`);

function Row({ k, v }) {
  return (
    <div className="flex items-start justify-between gap-3 py-1">
      <span style={label}>{k}</span>
      <strong className="text-gray-900">{v}</strong>
    </div>
  );
}

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

  const pensionSistema = data.pension_sistema
    ? String(data.pension_sistema).toUpperCase()
    : "—";

  return (
    <div className="ef-card p20">
      <h3 className="ef-title-sm">Datos Previsionales</h3>

      {/* Igual a Contractuales: grid 2 columnas, filas homogéneas */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-[15px] leading-6">
        {/* Columna 1 */}
        <div className="space-y-1.5">
          <Row
            k="Salud:"
            v={data.salud_tipo === "isapre" ? `Isapre ${isapre}` : "Fonasa"}
          />
          <Row k="Plan / Tramo:" v={planDesc} />
          <Row k="Caja Compensación:" v={dash(caja)} />
          <Row
            k="Asignación Familiar:"
            v={`Tramo ${dash(data.tramo_asignacion)} · ${data.cargas_familiares ?? 0} carga(s)`}
          />
          <Row k="Sistema Pensión:" v={pensionSistema} />
          <Row k="AFP:" v={data.pension_sistema === "afp" ? afp : "—"} />
          <Row k="Cotización obligatoria:" v={pct(data.cot_obligatoria_pct)} />
          <Row k="SIS:" v={pct(data.sis_pct)} />
        </div>

        {/* Columna 2 */}
        <div className="space-y-1.5">
          <Row k="Contrato:" v={dash(data.contrato_tipo)} />
          <Row k="AFC afiliado:" v={data.afc_afiliado ? "Sí" : "No"} />
          <Row k="AFC exento:" v={data.afc_exento ? "Sí" : "No"} />
          <Row k="Mutual:" v={dash(mutual)} />
          <Row k="Tasa Accidente:" v={pct(data.tasa_accidente_pct)} />
          <Row k="Adicional Diferenciada:" v={pct(data.adicional_diferenciada_pct)} />
          <Row k="Trabajo Pesado:" v={data.trabajo_pesado ? "Sí" : "No"} />
          <Row k="Adic. Trabajo Pesado:" v={pct(data.trabajo_pesado_adic_pct)} />
          <Row
            k="APV:"
            v={data.apv_regimen ? `Régimen ${data.apv_regimen}` : "—"}
          />
          <Row k="APV Monto:" v={dash(data.apv_monto)} />
          <Row k="Dep. Convenido:" v={dash(data.deposito_convenido_monto)} />
        </div>
      </div>

      <div className="mt-4 text-gray-500">
        Vigencia: <strong>{dash(data.fecha_vigencia_desde)}</strong>
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
