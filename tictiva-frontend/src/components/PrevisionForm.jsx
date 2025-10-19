// src/components/PrevisionForm.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const Row = ({ label, children }) => (
  <div className="ef-row">
    <div className="ef-col-label">{label}</div>
    <div className="ef-col-field">{children}</div>
  </div>
);

const toNullableNumber = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export default function PrevisionForm({ id = "prevision-form", employee, onSaved }) {
  const [cat, setCat] = useState({ afp: [], isapre: [], cajas: [], mutual: [] });

  // Comisión AFP (solo UI)
  const [afpComision, setAfpComision] = useState(null);

  const [form, setForm] = useState({
    // *** Requisito NOT NULL en DB ***
    contrato_tipo: "indefinido",

    // Salud
    salud_tipo: "fonasa",
    fonasa_tramo: "A",
    isapre_id: null,
    isapre_plan_tipo: "UF",          // 'UF' | 'PORCENTAJE' | 'PESOS'
    isapre_plan_valor: null,

    // Pensión
    pension_sistema: "afp",          // 'afp' | 'ips' | 'capredena' | 'dipreca'
    afp_id: null,
    cot_obligatoria_pct: 10.0,
    sis_pct: null,

    // Caja / Asignación / AFC
    caja_id: null,
    tramo_asignacion: "A",
    cargas_familiares: 0,
    afc_afiliado: true,
    afc_exento: false,

    // Mutual
    mutual_id: null,
    tasa_accidente_pct: null,
    adicional_diferenciada_pct: null,

    // Trabajo pesado
    trabajo_pesado: false,
    trabajo_pesado_adic_pct: null,

    // APV
    apv_regimen: null,               // 'A' | 'B' | null
    apv_monto: null,
    apv_periodicidad: "mensual",
    deposito_convenido_monto: null,

    // Observaciones
    observaciones: "",
  });

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  // Catálogos
  useEffect(() => {
    (async () => {
      const [afp, isapre, cajas, mutual] = await Promise.all([
        // 👇 Traemos también la comisión AFP
        supabase.from("afp_catalog").select("id,nombre,comision_pct").order("nombre"),
        supabase.from("isapre_catalog").select("id,nombre").order("nombre"),
        supabase.from("caja_compensacion_catalog").select("id,nombre").order("nombre"),
        supabase.from("mutual_catalog").select("id,nombre").order("nombre"),
      ]);
      setCat({
        afp: afp.data || [],
        isapre: isapre.data || [],
        cajas: cajas.data || [],
        mutual: mutual.data || [],
      });
    })();
  }, []);

  // Prefill
  useEffect(() => {
    if (!employee?.id) return;
    (async () => {
      const { data, error } = await supabase
        .from("employee_prevision")
        .select("*")
        .eq("employee_id", employee.id)
        .maybeSingle();

      if (error) { console.error(error); return; }
      if (data) {
        setForm((s) => ({
          ...s,
          ...data,
          // conservar defaults cuando vienen null
          contrato_tipo: data.contrato_tipo ?? s.contrato_tipo,
          isapre_plan_tipo: data.isapre_plan_tipo ?? s.isapre_plan_tipo,
          apv_periodicidad: data.apv_periodicidad ?? s.apv_periodicidad,
        }));
      }
    })();
  }, [employee?.id]);

  // Sincroniza comisión si hay AFP pre-cargada y ya tenemos cat.afp
  useEffect(() => {
    if (form.afp_id && cat.afp?.length) {
      const sel = cat.afp.find(x => String(x.id) === String(form.afp_id));
      setAfpComision(sel?.comision_pct ?? null);
    }
  }, [form.afp_id, cat.afp]);

  // Guardar
  const submit = async (e) => {
    e.preventDefault();

    const payload = {
      tenant_id: employee?.tenant_id ?? null,
      employee_id: employee?.id,

      // *** NOT NULL obligatorio en DB ***
      contrato_tipo: form.contrato_tipo || "indefinido",

      // Salud
      salud_tipo: form.salud_tipo,
      fonasa_tramo: form.salud_tipo === "fonasa" ? form.fonasa_tramo : null,
      isapre_id: form.salud_tipo === "isapre" ? form.isapre_id : null,
      isapre_plan_tipo: form.salud_tipo === "isapre" ? form.isapre_plan_tipo : null,
      isapre_plan_valor:
        form.salud_tipo === "isapre" ? toNullableNumber(form.isapre_plan_valor) : null,

      // Pensión
      pension_sistema: form.pension_sistema,
      afp_id: form.pension_sistema === "afp" ? form.afp_id : null,
      cot_obligatoria_pct: toNullableNumber(form.cot_obligatoria_pct),
      sis_pct: toNullableNumber(form.sis_pct),

      // Caja / Asig. / AFC
      caja_id: form.caja_id || null,
      tramo_asignacion: form.tramo_asignacion || null,
      cargas_familiares: Number(form.cargas_familiares || 0),
      afc_afiliado: !!form.afc_afiliado,
      afc_exento: !!form.afc_exento,

      // Mutual
      mutual_id: form.mutual_id || null,
      tasa_accidente_pct: toNullableNumber(form.tasa_accidente_pct),
      adicional_diferenciada_pct: toNullableNumber(form.adicional_diferenciada_pct),

      // Trabajo pesado
      trabajo_pesado: !!form.trabajo_pesado,
      trabajo_pesado_adic_pct: toNullableNumber(
        form.trabajo_pesado ? form.trabajo_pesado_adic_pct : null
      ),

      // APV
      apv_regimen: form.apv_regimen || null,
      apv_monto: toNullableNumber(form.apv_monto),
      apv_periodicidad: form.apv_periodicidad || null,
      deposito_convenido_monto: toNullableNumber(form.deposito_convenido_monto),

      // Observaciones
      observaciones: form.observaciones || "",
    };

    const { data, error } = await supabase
      .from("employee_prevision")
      .upsert(payload, { onConflict: "tenant_id,employee_id" })
      .select("*")
      .single();

    if (error) { alert(error.message); return; }
    onSaved?.(data);
  };

  // Campos de Isapre (cuando corresponde)
  const IsapreFields = form.salud_tipo === "isapre" && (
    <>
      <Row label="Isapre">
        <select
          className="ef-input"
          value={form.isapre_id || ""}
          onChange={(e) => set("isapre_id", e.target.value || null)}
        >
          <option value="">—</option>
          {cat.isapre.map((i) => (
            <option key={i.id} value={i.id}>{i.nombre}</option>
          ))}
        </select>
      </Row>
      <Row label="Plan (Tipo / Valor)">
        <div className="flex gap-2">
          <select
            className="ef-input"
            style={{ flex: 1 }}
            value={form.isapre_plan_tipo}
            onChange={(e) => set("isapre_plan_tipo", e.target.value)}
          >
            <option value="UF">UF</option>
            <option value="PORCENTAJE">Porcentaje</option>
            <option value="PESOS">Pesos</option>
          </select>
          <input
            className="ef-input"
            style={{ flex: 1 }}
            type="number"
            step="0.01"
            value={form.isapre_plan_valor ?? ""}
            onChange={(e) => set("isapre_plan_valor", e.target.value)}
          />
        </div>
      </Row>
    </>
  );

  // Cálculo de “tasa previsional total” (solo para mostrar)
  const tasaTotal = (
    Number(form.cot_obligatoria_pct || 0) +
    Number(afpComision || 0) +
    Number(form.sis_pct || 0)
  );

  return (
    <form id={id} onSubmit={submit} className="ef-card p20">
      <h3 className="ef-title-sm">Previsión</h3>

      <div className="ef-grid-2 mt12">
        {/* ===================== Columna Izquierda ===================== */}
        <div className="ef-form">
          {/* BLOQUE A (5 filas) */}
          <Row label="Salud">
            <select
              className="ef-input"
              value={form.salud_tipo}
              onChange={(e) => set("salud_tipo", e.target.value)}
            >
              <option value="fonasa">Fonasa</option>
              <option value="isapre">Isapre</option>
            </select>
          </Row>

          {form.salud_tipo === "fonasa" ? (
            <Row label="Fonasa · Tramo">
              <select
                className="ef-input"
                value={form.fonasa_tramo}
                onChange={(e) => set("fonasa_tramo", e.target.value)}
              >
                <option>A</option><option>B</option><option>C</option><option>D</option>
              </select>
            </Row>
          ) : IsapreFields}

          <Row label="Caja de Compensación">
            <select
              className="ef-input"
              value={form.caja_id || ""}
              onChange={(e) => set("caja_id", e.target.value || null)}
            >
              <option value="">—</option>
              {cat.cajas.map((i) => (
                <option key={i.id} value={i.id}>{i.nombre}</option>
              ))}
            </select>
          </Row>

          <Row label="Asignación Familiar · Tramo">
            <select
              className="ef-input"
              value={form.tramo_asignacion || ""}
              onChange={(e) => set("tramo_asignacion", e.target.value || null)}
            >
              <option>A</option><option>B</option><option>C</option><option>D</option>
            </select>
          </Row>

          <Row label="Cargas Familiares">
            <input
              className="ef-input"
              type="number"
              min="0"
              value={form.cargas_familiares}
              onChange={(e) => set("cargas_familiares", Number(e.target.value || 0))}
            />
          </Row>

          <div className="ef-sep" />

          {/* BLOQUE B (4 filas) */}
          <Row label="AFC afiliado">
            <select
              className="ef-input"
              value={String(form.afc_afiliado)}
              onChange={(e) => set("afc_afiliado", e.target.value === "true")}
            >
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </Row>

          <Row label="AFC exento">
            <select
              className="ef-input"
              value={String(form.afc_exento)}
              onChange={(e) => set("afc_exento", e.target.value === "true")}
            >
              <option value="false">No</option>
              <option value="true">Sí</option>
            </select>
          </Row>

          <Row label="Trabajo Pesado">
            <select
              className="ef-input"
              value={String(form.trabajo_pesado)}
              onChange={(e) => set("trabajo_pesado", e.target.value === "true")}
            >
              <option value="false">No</option>
              <option value="true">Sí</option>
            </select>
          </Row>

          <Row label="Adic. Trabajo Pesado %">
            <input
              className="ef-input"
              type="number"
              step="0.01"
              value={form.trabajo_pesado_adic_pct ?? ""}
              onChange={(e) => set("trabajo_pesado_adic_pct", e.target.value)}
              disabled={!form.trabajo_pesado}
            />
          </Row>

          <div className="ef-sep" />

          {/* BLOQUE C (1 fila) */}
          <Row label="Depósito Convenido">
            <input
              className="ef-input"
              type="number"
              step="0.01"
              value={form.deposito_convenido_monto ?? ""}
              onChange={(e) => set("deposito_convenido_monto", e.target.value)}
            />
          </Row>
        </div>

        {/* ===================== Columna Derecha ===================== */}
        <div className="ef-form">
          {/* BLOQUE A (5 filas) */}
          <Row label="Sistema Pensión">
            <select
              className="ef-input"
              value={form.pension_sistema}
              onChange={(e) => set("pension_sistema", e.target.value)}
            >
              <option value="afp">AFP</option>
              <option value="ips">IPS</option>
              <option value="capredena">CAPREDENA</option>
              <option value="dipreca">DIPRECA</option>
            </select>
          </Row>

          <Row label="AFP">
            <div>
              <select
                className="ef-input"
                value={form.afp_id || ""}
                onChange={(e) => {
                  const val = e.target.value || null;
                  set("afp_id", val);
                  const sel = cat.afp.find(x => String(x.id) === String(val));
                  setAfpComision(sel?.comision_pct ?? null);
                }}
                disabled={form.pension_sistema !== "afp"}
              >
                <option value="">—</option>
                {cat.afp.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nombre}
                  </option>
                ))}
              </select>

              {/* Info auxiliar: NO suma filas, mantiene alineación */}
              <div style={{ marginTop: 6, fontSize: 12, color: "#6b7280" }}>
                {afpComision != null ? (
                  <>
                    Comisión AFP: <strong>{Number(afpComision).toFixed(2)}%</strong>
                    {" · "}
                    Tasa previsional total:{" "}
                    <strong>{tasaTotal.toFixed(2)}%</strong>
                  </>
                ) : (
                  <span>Seleccioná una AFP para ver comisión y tasa total.</span>
                )}
              </div>
            </div>
          </Row>

          <Row label="Cotización Obligatoria %">
            <input
              className="ef-input"
              type="number"
              step="0.01"
              value={form.cot_obligatoria_pct ?? ""}
              onChange={(e) => set("cot_obligatoria_pct", e.target.value)}
            />
          </Row>

          <Row label="SIS %">
            <input
              className="ef-input"
              type="number"
              step="0.01"
              value={form.sis_pct ?? ""}
              onChange={(e) => set("sis_pct", e.target.value)}
            />
          </Row>

          <Row label="Mutual">
            <select
              className="ef-input"
              value={form.mutual_id || ""}
              onChange={(e) => set("mutual_id", e.target.value || null)}
            >
              <option value="">—</option>
              {cat.mutual.map((i) => (
                <option key={i.id} value={i.id}>{i.nombre}</option>
              ))}
            </select>
          </Row>

          <div className="ef-sep" />

          {/* BLOQUE B (4 filas) */}
          <Row label="Tasa Accidente %">
            <input
              className="ef-input"
              type="number"
              step="0.01"
              value={form.tasa_accidente_pct ?? ""}
              onChange={(e) => set("tasa_accidente_pct", e.target.value)}
            />
          </Row>

          <Row label="Adicional Diferenciada %">
            <input
              className="ef-input"
              type="number"
              step="0.01"
              value={form.adicional_diferenciada_pct ?? ""}
              onChange={(e) => set("adicional_diferenciada_pct", e.target.value)}
            />
          </Row>

          <Row label="APV · Régimen">
            <select
              className="ef-input"
              value={form.apv_regimen || ""}
              onChange={(e) => set("apv_regimen", e.target.value || null)}
            >
              <option value="">—</option>
              <option value="A">A</option>
              <option value="B">B</option>
            </select>
          </Row>

          <Row label="APV · Monto">
            <input
              className="ef-input"
              type="number"
              step="0.01"
              value={form.apv_monto ?? ""}
              onChange={(e) => set("apv_monto", e.target.value)}
            />
          </Row>

          <div className="ef-sep" />

          {/* BLOQUE C (1 fila) */}
          <Row label="Observaciones">
            <textarea
              className="ef-input"
              rows={3}
              value={form.observaciones}
              onChange={(e) => set("observaciones", e.target.value)}
            />
          </Row>
        </div>
      </div>
    </form>
  );
}
