// src/components/PrevisionView.jsx
import React from "react";

const dash = (v) => (v === null || v === undefined || v === "" ? "—" : v);
const pct  = (v) => (v === null || v === undefined || v === "" ? "—" : `${v}%`);

function Row({ k, v }) {
  return (
    <div className="pv-row">
      <div className="pv-k">{k}</div>
      <div className="pv-v"><strong>{v}</strong></div>
    </div>
  );
}

export default function PrevisionView({ data = {}, catalogs = {} }) {
  const afp    = catalogs.afp?.find(a => a.id === data.afp_id)?.nombre || "—";
  const isapre = catalogs.isapre?.find(a => a.id === data.isapre_id)?.nombre || "—";
  const caja   = catalogs.cajas?.find(a => a.id === data.caja_id)?.nombre || "—";
  const mutual = catalogs.mutual?.find(a => a.id === data.mutual_id)?.nombre || "—";

  // Mostrar símbolo según tipo de plan (UF / % / $)
  const tipoSimbolo = { UF: "UF", PORCENTAJE: "%", PESOS: "$" }[data.isapre_plan_tipo] || data.isapre_plan_tipo;
  const planDesc =
    data.salud_tipo === "isapre"
      ? `${dash(tipoSimbolo)} ${dash(data.isapre_plan_valor)}`.trim()
      : `Fonasa (Tramo ${dash(data.fonasa_tramo)})`;

  const pensionSistema = data.pension_sistema
    ? String(data.pension_sistema).toUpperCase()
    : "—";

  return (
    <div className="ef-card p20 pv-view">
      <h3 className="ef-title-sm">Datos Previsionales</h3>

      <div className="pv-grid">
        {/* Columna izquierda */}
        <div>
          <Row k="Salud:" v={data.salud_tipo === "isapre" ? `Isapre ${isapre}` : "Fonasa"} />
          <Row k="Plan / Tramo:" v={planDesc} />
          <Row k="Caja Compensación:" v={dash(caja)} />
          <Row k="Asignación Familiar:" v={`Tramo ${dash(data.tramo_asignacion)} · ${data.cargas_familiares ?? 0} carga(s)`} />
          <Row k="Sistema Pensión:" v={pensionSistema} />
          <Row k="AFP:" v={data.pension_sistema === "afp" ? afp : "—"} />
          <Row k="Cotización obligatoria:" v={pct(data.cot_obligatoria_pct)} />
          <Row k="SIS:" v={pct(data.sis_pct)} />
        </div>

        {/* Columna derecha */}
        <div>
          {/* 🔻 Eliminado: Contrato */}
          <Row k="AFC afiliado:" v={data.afc_afiliado ? "Sí" : "No"} />
          <Row k="AFC exento:" v={data.afc_exento ? "Sí" : "No"} />
          <Row k="Mutual:" v={dash(mutual)} />
          <Row k="Tasa Accidente:" v={pct(data.tasa_accidente_pct)} />
          <Row k="Adicional Diferenciada:" v={pct(data.adicional_diferenciada_pct)} />
          <Row k="Trabajo Pesado:" v={data.trabajo_pesado ? "Sí" : "No"} />
          <Row k="Adic. Trabajo Pesado:" v={pct(data.trabajo_pesado_adic_pct)} />
          <Row k="APV:" v={data.apv_regimen ? `Régimen ${data.apv_regimen}` : "—"} />
          <Row k="APV Monto:" v={dash(data.apv_monto)} />
          <Row k="Dep. Convenido:" v={dash(data.deposito_convenido_monto)} />
          {/* Observaciones al final de la 2ª columna */}
          {data.observaciones ? <Row k="Observaciones:" v={data.observaciones} /> : null}
        </div>
      </div>

      {/* 🔻 Eliminado: bloque 'Vigencia ...' y pv-obs suelto */}

      <style>{`
        .pv-view {
          font-size: 15px;
          line-height: 1.6;
        }
        .pv-grid{
          display:grid;
          grid-template-columns: 1fr;
          gap: 24px;
          margin-top: 12px;
        }
        @media (min-width: 768px){
          .pv-grid{ grid-template-columns: 1fr 1fr; }
        }
        .pv-row{
          display:grid;
          grid-template-columns: 52% 48%;
          align-items:start;
          padding: 8px 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .pv-row:last-child{ border-bottom:none; }
        .pv-k{
          color:#6b7280;
          padding-right: 12px;
        }
        .pv-v{
          color:#111827;
          text-align:left;
        }
      `}</style>
    </div>
  );
}
