import React from "react";

const label = { color: "#6B7280" };

export default function PrevisionView({ data, catalogs = {} }) {
  if (!data) return <div className="ef-card p20">Sin datos previsionales.</div>;
  const afp = catalogs.afp?.find(a => a.id === data.afp_id)?.nombre || "—";
  const isapre = catalogs.isapre?.find(a => a.id === data.isapre_id)?.nombre || "—";
  const caja = catalogs.cajas?.find(a => a.id === data.caja_id)?.nombre || "—";
  const mutual = catalogs.mutual?.find(a => a.id === data.mutual_id)?.nombre || "—";

  const planDesc = data.salud_tipo === "isapre"
    ? `${data.isapre_plan_tipo || "—"} ${data.isapre_plan_valor ?? ""}`.trim()
    : `Fonasa (Tramo ${data.fonasa_tramo || "—"})`;

  return (
    <div className="ef-card p20">
      <h3 className="ef-title-sm">Datos Previsionales</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <div>
          <div><span style={label}>Salud:</span> <strong>{data.salud_tipo === "isapre" ? `Isapre ${isapre}` : "Fonasa"}</strong></div>
          <div><span style={label}>Plan / Tramo:</span> <strong>{planDesc}</strong></div>
          <div><span style={label}>Caja Compensación:</span> <strong>{caja}</strong></div>
          <div><span style={label}>Asignación Familiar:</span> <strong>Tramo {data.tramo_asignacion || "—"} · {data.cargas_familiares ?? 0} carga(s)</strong></div>
        </div>

        <div>
          <div><span style={label}>Sistema Pensión:</span> <strong>{data.pension_sistema?.toUpperCase()}</strong></div>
          <div><span style={label}>AFP:</span> <strong>{data.pension_sistema === "afp" ? afp : "—"}</strong></div>
          <div><span style={label}>Cotización obligatoria:</span> <strong>{data.cot_obligatoria_pct ?? "—"}%</strong></div>
          <div><span style={label}>SIS:</span> <strong>{data.sis_pct ?? "—"}%</strong></div>
        </div>

        <div>
          <div><span style={label}>Contrato:</span> <strong>{data.contrato_tipo}</strong></div>
          <div><span style={label}>AFC afiliado:</span> <strong>{data.afc_afiliado ? "Sí" : "No"}</strong></div>
          <div><span style={label}>AFC exento:</span> <strong>{data.afc_exento ? "Sí" : "No"}</strong></div>
        </div>

        <div>
          <div><span style={label}>Mutual:</span> <strong>{mutual}</strong></div>
          <div><span style={label}>Tasa Accidente:</span> <strong>{data.tasa_accidente_pct ?? "—"}%</strong></div>
          <div><span style={label}>Adicional Diferenciada:</span> <strong>{data.adicional_diferenciada_pct ?? "—"}%</strong></div>
        </div>

        <div>
          <div><span style={label}>Trabajo Pesado:</span> <strong>{data.trabajo_pesado ? "Sí" : "No"}</strong></div>
          <div><span style={label}>Adic. Trabajo Pesado:</span> <strong>{data.trabajo_pesado_adic_pct ?? "—"}%</strong></div>
        </div>

        <div>
          <div><span style={label}>APV:</span> <strong>{data.apv_regimen ? `Régimen ${data.apv_regimen}` : "—"}</strong></div>
          <div><span style={label}>APV Monto:</span> <strong>{data.apv_monto ?? "—"}</strong></div>
          <div><span style={label}>Dep. Convenido:</span> <strong>{data.deposito_convenido_monto ?? "—"}</strong></div>
        </div>
      </div>

      <div className="mt-4 text-gray-500">
        Vigencia: <strong>{data.fecha_vigencia_desde}</strong>{data.fecha_vigencia_hasta ? ` a ${data.fecha_vigencia_hasta}` : " (vigente)"}
      </div>
      {data.observaciones && <div className="mt-2"><span style={label}>Observaciones:</span> {data.observaciones}</div>}
    </div>
  );
}
