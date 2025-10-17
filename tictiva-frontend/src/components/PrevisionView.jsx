// src/components/PrevisionView.jsx
import React from "react";

const dash = (v) => (v === null || v === undefined || v === "" ? "—" : v);

export default function PrevisionView({ data = {}, catalogs = {} }) {
  const afp    = catalogs.afp?.find(a => a.id === data.afp_id)?.nombre || "—";
  const isapre = catalogs.isapre?.find(a => a.id === data.isapre_id)?.nombre || "—";
  const caja   = catalogs.cajas?.find(a => a.id === data.caja_id)?.nombre || "—";
  const mutual = catalogs.mutual?.find(a => a.id === data.mutual_id)?.nombre || "—";

  const planDesc = data.salud_tipo === "isapre"
    ? `${dash(data.isapre_plan_tipo)} ${dash(data.isapre_plan_valor)}`
    : `Fonasa (Tramo ${dash(data.fonasa_tramo)})`;

  const pensionSistema = data.pension_sistema
    ? String(data.pension_sistema).toUpperCase()
    : "—";

  const pct = (v) => (v === null || v === undefined || v === "" ? "—" : `${v}%`);

  return (
    <div className="ef-card p20">
      <h3 className="ef-title-sm">Datos Previsionales</h3>

      {/* MISMA MAQUETA QUE CONTRACTUALES: ef-grid-2 + ef-pairs/ef-pair/ef-k/ef-v */}
      <div className="ef-grid-2 mt12">
        {/* Columna izquierda */}
        <div className="ef-pairs">
          <div className="ef-pair">
            <div className="ef-k">Salud:</div>
            <div className="ef-v"><strong>{data.salud_tipo === "isapre" ? `Isapre ${isapre}` : "Fonasa"}</strong></div>
          </div>

          <div className="ef-pair">
            <div className="ef-k">Plan / Tramo:</div>
            <div className="ef-v"><strong>{planDesc}</strong></div>
          </div>

          <div className="ef-pair">
            <div className="ef-k">Caja Compensación:</div>
            <div className="ef-v"><strong>{dash(caja)}</strong></div>
          </div>

          <div className="ef-pair">
            <div className="ef-k">Asignación Familiar:</div>
            <div className="ef-v">
              <strong>Tramo {dash(data.tramo_asignacion)} · {data.cargas_familiares ?? 0} carga(s)</strong>
            </div>
          </div>

          <div className="ef-pair">
            <div className="ef-k">Sistema Pensión:</div>
            <div className="ef-v"><strong>{pensionSistema}</strong></div>
          </div>

          <div className="ef-pair">
            <div className="ef-k">AFP:</div>
            <div className="ef-v"><strong>{data.pension_sistema === "afp" ? afp : "—"}</strong></div>
          </div>

          <div className="ef-pair">
            <div className="ef-k">Cotización obligatoria:</div>
            <div className="ef-v"><strong>{pct(data.cot_obligatoria_pct)}</strong></div>
          </div>

          <div className="ef-pair">
            <div className="ef-k">SIS:</div>
            <div className="ef-v"><strong>{pct(data.sis_pct)}</strong></div>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="ef-pairs">
          <div className="ef-pair">
            <div className="ef-k">Contrato:</div>
            <div className="ef-v"><strong>{dash(data.contrato_tipo)}</strong></div>
          </div>

          <div className="ef-pair">
            <div className="ef-k">AFC afiliado:</div>
            <div className="ef-v"><strong>{data.afc_afiliado ? "Sí" : "No"}</strong></div>
          </div>

          <div className="ef-pair">
            <div className="ef-k">AFC exento:</div>
            <div className="ef-v"><strong>{data.afc_exento ? "Sí" : "No"}</strong></div>
          </div>

          <div className="ef-pair">
            <div className="ef-k">Mutual:</div>
            <div className="ef-v"><strong>{dash(mutual)}</strong></div>
          </div>

          <div className="ef-pair">
            <div className="ef-k">Tasa Accidente:</div>
            <div className="ef-v"><strong>{pct(data.tasa_accidente_pct)}</strong></div>
          </div>

          <div className="ef-pair">
            <div className="ef-k">Adicional Diferenciada:</div>
            <div className="ef-v"><strong>{pct(data.adicional_diferenciada_pct)}</strong></div>
          </div>

          <div className="ef-pair">
            <div className="ef-k">Trabajo Pesado:</div>
            <div className="ef-v"><strong>{data.trabajo_pesado ? "Sí" : "No"}</strong></div>
          </div>

          <div className="ef-pair">
            <div className="ef-k">Adic. Trabajo Pesado:</div>
            <div className="ef-v"><strong>{pct(data.trabajo_pesado_adic_pct)}</strong></div>
          </div>

          <div className="ef-pair">
            <div className="ef-k">APV:</div>
            <div className="ef-v"><strong>{data.apv_regimen ? `Régimen ${data.apv_regimen}` : "—"}</strong></div>
          </div>

          <div className="ef-pair">
            <div className="ef-k">APV Monto:</div>
            <div className="ef-v"><strong>{dash(data.apv_monto)}</strong></div>
          </div>

          <div className="ef-pair">
            <div className="ef-k">Dep. Convenido:</div>
            <div className="ef-v"><strong>{dash(data.deposito_convenido_monto)}</strong></div>
          </div>
        </div>
      </div>

      <div className="mt12 text-gray-500">
        Vigencia: <strong>{dash(data.fecha_vigencia_desde)}</strong>
        {data.fecha_vigencia_hasta ? ` a ${data.fecha_vigencia_hasta}` : " (vigente)"}
      </div>

      {data.observaciones && (
        <div className="mt8">
          <span className="text-gray-500">Observaciones:</span> {data.observaciones}
        </div>
      )}
    </div>
  );
}
