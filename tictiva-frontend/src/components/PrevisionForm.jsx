// src/components/PrevisionForm.jsx
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const Row = ({ label, children }) => (
  <div className="ef-row">
    <div className="ef-col-label">{label}</div>
    <div className="ef-col-field">{children}</div>
  </div>
);

// util: convierte "" a null, mantiene 0
const toNullableNumber = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export default function PrevisionForm({ id = "prevision-form", employee, onSaved }) {
  const [cat, setCat] = useState({ afp: [], isapre: [], cajas: [], mutual: [] });

  const [form, setForm] = useState({
    // Salud
    salud_tipo: "fonasa",
    fonasa_tramo: "A",
    isapre_id: null,
    isapre_plan_tipo: "UF",           // 'UF' | 'PORCENTAJE' | 'PESOS'
    isapre_plan_valor: null,

    // Pensión
    pension_sistema: "afp",
    afp_id: null,
    cot_obligatoria_pct: 10.0,
    sis_pct: null,

    // Contrato/AFC
    contrato_tipo: "indefinido",
    afc_afiliado: true,
    afc_exento: false,

    // Caja / Asignación
    caja_id: null,
    tramo_asignacion: "A",
    cargas_familiares: 0,

    // Mutual
    mutual_id: null,
    tasa_accidente_pct: null,
    adicional_diferenciada_pct: null,

    // Trabajo pesado
    trabajo_pesado: false,
    trabajo_pesado_adic_pct: null,

    // APV
    apv_regimen: null,
    apv_monto: null,
    apv_periodicidad: "mensual",
    deposito_convenido_monto: null,

    // Vigencia / Obs
    fecha_vigencia_desde: new Date().toISOString().slice(0, 10),
    fecha_vigencia_hasta: null,
    observaciones: "",
  });

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  // Cargar catálogos
  useEffect(() => {
    (async () => {
      const [afp, isapre, cajas, mutual] = await Promise.all([
        supabase.from("afp_catalog").select("id,nombre").order("nombre"),
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

  // Prefill: cargar employee_prevision (si existe) para este empleado
  useEffect(() => {
    if (!employee?.id) return;
    (async () => {
      const { data, error } = await supabase
        .from("employee_prevision")
        .select("*")
        .eq("employee_id", employee.id)
        .maybeSingle(); // no error si no existe

      if (error) {
        console.error(error);
        return;
      }
      if (data) {
        // normalización mínima a tu forma
        setForm((s) => ({
          ...s,
          ...data,
          // fallback seguros
          salud_tipo: data.salud_tipo ?? s.salud_tipo,
          pension_sistema: data.pension_sistema ?? s.pension_sistema,
          contrato_tipo: data.contrato_tipo ?? s.contrato_tipo,
          tramo_asignacion: data.tramo_asignacion ?? s.tramo_asignacion,
          isapre_plan_tipo: data.isapre_plan_tipo ?? s.isapre_plan_tipo,
          apv_periodicidad: data.apv_periodicidad ?? s.apv_periodicidad,
          fecha_vigencia_desde: data.fecha_vigencia_desde
            ? String(data.fecha_vigencia_desde).slice(0, 10)
            : s.fecha_vigencia_desde,
          fecha_vigencia_hasta: data.fecha_vigencia_hasta
            ? String(data.fecha_vigencia_hasta).slice(0, 10)
            : null,
        }));
      }
    })();
  }, [employee?.id]);

  const submit = async (e) => {
    e.preventDefault();

    // limpieza según elección + tipos
    const payload = {
      tenant_id: employee?.tenant_id ?? null,
      employee_id: employee?.id,

      // Salud
      salud_tipo: form.salud_tipo,
      fonasa_tramo: form.salud_tipo === "fonasa" ? form.fonasa_tramo : null,
      isapre_id: form.salud_tipo === "isapre" ? form.isapre_id : null,
      isapre_plan_tipo: form.salud_tipo === "isapre" ? form.isapre_plan_tipo : null, // 'UF'|'PORCENTAJE'|'PESOS'
      isapre_plan_valor:
        form.salud_tipo === "isapre" ? toNullableNumber(form.isapre_plan_valor) : null,

      // Pensión
      pension_sistema: form.pension_sistema, // 'afp'|'ips'|...
      afp_id: form.pension_sistema === "afp" ? form.afp_id : null,
      cot_obligatoria_pct: toNullableNumber(form.cot_obligatoria_pct),
      sis_pct: toNullableNumber(form.sis_pct),

      // Contrato / AFC
      contrato_tipo: form.contrato_tipo,
      afc_afiliado: !!form.afc_afiliado,
      afc_exento: !!form.afc_exento,

      // Caja / Asignación
      caja_id: form.caja_id || null,
      tramo_asignacion: form.tramo_asignacion || null,
      cargas_familiares: Number(form.cargas_familiares || 0),

      // Mutual
      mutual_id: form.mutual_id || null,
      tasa_accidente_pct: toNullableNumber(form.tasa_accidente_pct),
      adicional_diferenciada_pct: toNullableNumber(form.adicional_diferenciada_pct),

      // Trabajo pesado
      trabajo_pesado: !!form.trabajo_pesado,
      trabajo_pesado_adic_pct: form.trabajo_pesado
        ? toNullableNumber(form.trabajo_pesado_adic_pct)
        : null,

      // APV
      apv_regimen: form.apv_regimen || null,
      apv_monto: toNullableNumber(form.apv_monto),
      apv_periodicidad: form.apv_periodicidad || null,
      deposito_convenido_monto: toNullableNumber(form.deposito_convenido_monto),

      // Vigencia / Obs
      fecha_vigencia_desde: form.fecha_vigencia_desde || null,
      fecha_vigencia_hasta: form.fecha_vigencia_hasta || null,
      observaciones: form.observaciones || "",
    };

    // UPSERT por employee_id (crea si no existe, actualiza si ya hay)
    const { data, error } = await supabase
      .from("employee_prevision")
      .upsert(payload, { onConflict: "employee_id" })
      .select("*")
      .single();

    if (error) {
      alert(error.message);
      return;
    }
    onSaved?.(data);
  };

  return (
    <form id={id} onSubmit={submit} className="ef-card p20">
      <h3 className="ef-title-sm">Previsión</h3>

      {/* GRID 2 COLS COMO CONTRACTUALES */}
      <div className="ef-grid-2 mt12">
        {/* Columna izquierda */}
        <div className="ef-form">
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
          ) : (
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
          )}

          <div className="ef-sep" />

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
        </div>

        {/* Columna derecha */}
        <div className="ef-form">
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

          {form.pension_sistema === "afp" && (
            <Row label="AFP">
              <select
                className="ef-input"
                value={form.afp_id || ""}
                onChange={(e) => set("afp_id", e.target.value || null)}
              >
                <option value="">—</option>
                {cat.afp.map((i) => (
                  <option key={i.id} value={i.id}>{i.nombre}</option>
                ))}
              </select>
            </Row>
          )}

          <div className="flex gap-2">
            <div className="flex-1">
              <Row label="Cotización Obligatoria %">
                <input
                  className="ef-input"
                  type="number"
                  step="0.01"
                  value={form.cot_obligatoria_pct ?? ""}
                  onChange={(e) => set("cot_obligatoria_pct", e.target.value)}
                />
              </Row>
            </div>
            <div className="flex-1">
              <Row label="SIS %">
                <input
                  className="ef-input"
                  type="number"
                  step="0.01"
                  value={form.sis_pct ?? ""}
                  onChange={(e) => set("sis_pct", e.target.value)}
                />
              </Row>
            </div>
          </div>

          <Row label="Contrato">
            <select
              className="ef-input"
              value={form.contrato_tipo}
              onChange={(e) => set("contrato_tipo", e.target.value)}
            >
              <option value="indefinido">Indefinido</option>
              <option value="plazo_fijo">Plazo fijo</option>
              <option value="obra_servicio">Obra o faena</option>
            </select>
          </Row>

          <div className="flex gap-2">
            <div className="flex-1">
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
            </div>
            <div className="flex-1">
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
            </div>
          </div>

          <div className="ef-sep" />

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

          <div className="flex gap-2">
            <div className="flex-1">
              <Row label="Tasa Accidente %">
                <input
                  className="ef-input"
                  type="number"
                  step="0.01"
                  value={form.tasa_accidente_pct ?? ""}
                  onChange={(e) => set("tasa_accidente_pct", e.target.value)}
                />
              </Row>
            </div>
            <div className="flex-1">
              <Row label="Adicional Diferenciada %">
                <input
                  className="ef-input"
                  type="number"
                  step="0.01"
                  value={form.adicional_diferenciada_pct ?? ""}
                  onChange={(e) => set("adicional_diferenciada_pct", e.target.value)}
                />
              </Row>
            </div>
          </div>

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

          {form.trabajo_pesado && (
            <Row label="Adic. Trabajo Pesado %">
              <input
                className="ef-input"
                type="number"
                step="0.01"
                value={form.trabajo_pesado_adic_pct ?? ""}
                onChange={(e) => set("trabajo_pesado_adic_pct", e.target.value)}
              />
            </Row>
          )}

          <div className="ef-sep" />

          <div className="flex gap-2">
            <div className="flex-1">
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
            </div>
            <div className="flex-1">
              <Row label="APV · Monto">
                <input
                  className="ef-input"
                  type="number"
                  step="0.01"
                  value={form.apv_monto ?? ""}
                  onChange={(e) => set("apv_monto", e.target.value)}
                />
              </Row>
            </div>
            <div className="flex-1">
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
          </div>

          <div className="ef-sep" />

          <div className="flex gap-2">
            <div className="flex-1">
              <Row label="Vigencia · Desde">
                <input
                  className="ef-input"
                  type="date"
                  value={form.fecha_vigencia_desde || ""}
                  onChange={(e) => set("fecha_vigencia_desde", e.target.value)}
                />
              </Row>
            </div>
            <div className="flex-1">
              <Row label="Vigencia · Hasta">
                <input
                  className="ef-input"
                  type="date"
                  value={form.fecha_vigencia_hasta || ""}
                  onChange={(e) => set("fecha_vigencia_hasta", e.target.value || null)}
                />
              </Row>
            </div>
          </div>

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
