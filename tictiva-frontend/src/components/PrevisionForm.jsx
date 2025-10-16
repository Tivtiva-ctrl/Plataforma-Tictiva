import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const Field = ({ label, children }) => (
  <label className="block">
    <span className="text-gray-600">{label}</span>
    <div className="mt-1">{children}</div>
  </label>
);

export default function PrevisionForm({ id="prevision-form", employee, onSaved }) {
  const [cat, setCat] = useState({ afp: [], isapre: [], cajas: [], mutual: [] });
  const [form, setForm] = useState({
    salud_tipo: "fonasa",
    fonasa_tramo: "A",
    isapre_id: null,
    isapre_plan_tipo: "UF",
    isapre_plan_valor: null,

    pension_sistema: "afp",
    afp_id: null,
    cot_obligatoria_pct: 10.00,
    sis_pct: null,

    contrato_tipo: "indefinido",
    afc_afiliado: true,
    afc_exento: false,

    caja_id: null,
    tramo_asignacion: "A",
    cargas_familiares: 0,

    mutual_id: null,
    tasa_accidente_pct: null,
    adicional_diferenciada_pct: null,

    trabajo_pesado: false,
    trabajo_pesado_adic_pct: null,

    apv_regimen: null,
    apv_monto: null,
    apv_periodicidad: "mensual",
    deposito_convenido_monto: null,

    fecha_vigencia_desde: new Date().toISOString().slice(0,10),
    fecha_vigencia_hasta: null,
    observaciones: ""
  });

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

  const set = (k, v) => setForm(s => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      tenant_id: employee.tenant_id,
      employee_id: employee.id,
      isapre_id: form.salud_tipo === "isapre" ? form.isapre_id : null,
      fonasa_tramo: form.salud_tipo === "fonasa" ? form.fonasa_tramo : null,
      afp_id: form.pension_sistema === "afp" ? form.afp_id : null,
    };

    const { data, error } = await supabase
      .from("employee_prevision")
      .insert(payload)
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        {/* Columna 1 */}
        <div className="space-y-4">
          <Field label="Salud">
            <select className="ef-input" value={form.salud_tipo} onChange={e=>set("salud_tipo", e.target.value)}>
              <option value="fonasa">Fonasa</option>
              <option value="isapre">Isapre</option>
            </select>
          </Field>

          {form.salud_tipo === "fonasa" ? (
            <Field label="Fonasa · Tramo">
              <select className="ef-input" value={form.fonasa_tramo} onChange={e=>set("fonasa_tramo", e.target.value)}>
                <option>A</option><option>B</option><option>C</option><option>D</option>
              </select>
            </Field>
          ) : (
            <>
              <Field label="Isapre">
                <select className="ef-input" value={form.isapre_id || ""} onChange={e=>set("isapre_id", e.target.value || null)}>
                  <option value="">—</option>
                  {cat.isapre.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Plan · Tipo">
                  <select className="ef-input" value={form.isapre_plan_tipo} onChange={e=>set("isapre_plan_tipo", e.target.value)}>
                    <option>UF</option>
                    <option>%</option>
                    <option>MONTO</option>
                  </select>
                </Field>
                <Field label="Plan · Valor">
                  <input className="ef-input" type="number" step="0.01" value={form.isapre_plan_valor || ""} onChange={e=>set("isapre_plan_valor", e.target.value ? Number(e.target.value) : null)} />
                </Field>
              </div>
            </>
          )}

          <Field label="Caja de Compensación">
            <select className="ef-input" value={form.caja_id || ""} onChange={e=>set("caja_id", e.target.value || null)}>
              <option value="">—</option>
              {cat.cajas.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Asignación Familiar · Tramo">
              <select className="ef-input" value={form.tramo_asignacion || ""} onChange={e=>set("tramo_asignacion", e.target.value || null)}>
                <option>A</option><option>B</option><option>C</option><option>D</option>
              </select>
            </Field>
            <Field label="Cargas Familiares">
              <input className="ef-input" type="number" min="0" value={form.cargas_familiares} onChange={e=>set("cargas_familiares", Number(e.target.value||0))} />
            </Field>
          </div>
        </div>

        {/* Columna 2 */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Sistema Pensión">
              <select className="ef-input" value={form.pension_sistema} onChange={e=>set("pension_sistema", e.target.value)}>
                <option value="afp">AFP</option>
                <option value="ips">IPS</option>
                <option value="capredena">CAPREDENA</option>
                <option value="dipreca">DIPRECA</option>
              </select>
            </Field>

            {form.pension_sistema === "afp" && (
              <Field label="AFP">
                <select className="ef-input" value={form.afp_id || ""} onChange={e=>set("afp_id", e.target.value || null)}>
                  <option value="">—</option>
                  {cat.afp.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
                </select>
              </Field>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Cotización Obligatoria %">
              <input className="ef-input" type="number" step="0.01" value={form.cot_obligatoria_pct ?? ""} onChange={e=>set("cot_obligatoria_pct", e.target.value ? Number(e.target.value) : null)} />
            </Field>
            <Field label="SIS %">
              <input className="ef-input" type="number" step="0.01" value={form.sis_pct ?? ""} onChange={e=>set("sis_pct", e.target.value ? Number(e.target.value) : null)} />
            </Field>
            <Field label="Contrato">
              <select className="ef-input" value={form.contrato_tipo} onChange={e=>set("contrato_tipo", e.target.value)}>
                <option value="indefinido">Indefinido</option>
                <option value="plazo_fijo">Plazo fijo</option>
                <option value="obra_servicio">Obra o faena</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="AFC afiliado">
              <select className="ef-input" value={String(form.afc_afiliado)} onChange={e=>set("afc_afiliado", e.target.value === "true")}>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </Field>
            <Field label="AFC exento">
              <select className="ef-input" value={String(form.afc_exento)} onChange={e=>set("afc_exento", e.target.value === "true")}>
                <option value="false">No</option>
                <option value="true">Sí</option>
              </select>
            </Field>
            <Field label="Mutual">
              <select className="ef-input" value={form.mutual_id || ""} onChange={e=>set("mutual_id", e.target.value || null)}>
                <option value="">—</option>
                {cat.mutual.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Tasa Accidente %">
              <input className="ef-input" type="number" step="0.01" value={form.tasa_accidente_pct ?? ""} onChange={e=>set("tasa_accidente_pct", e.target.value ? Number(e.target.value) : null)} />
            </Field>
            <Field label="Adicional Diferenciada %">
              <input className="ef-input" type="number" step="0.01" value={form.adicional_diferenciada_pct ?? ""} onChange={e=>set("adicional_diferenciada_pct", e.target.value ? Number(e.target.value) : null)} />
            </Field>
            <Field label="Trabajo Pesado">
              <select className="ef-input" value={String(form.trabajo_pesado)} onChange={e=>set("trabajo_pesado", e.target.value === "true")}>
                <option value="false">No</option>
                <option value="true">Sí</option>
              </select>
            </Field>
          </div>

          {form.trabajo_pesado && (
            <Field label="Adic. Trabajo Pesado %">
              <input className="ef-input" type="number" step="0.01" value={form.trabajo_pesado_adic_pct ?? ""} onChange={e=>set("trabajo_pesado_adic_pct", e.target.value ? Number(e.target.value) : null)} />
            </Field>
          )}

          <div className="grid grid-cols-3 gap-3">
            <Field label="APV · Régimen">
              <select className="ef-input" value={form.apv_regimen || ""} onChange={e=>set("apv_regimen", e.target.value || null)}>
                <option value="">—</option>
                <option value="A">A</option>
                <option value="B">B</option>
              </select>
            </Field>
            <Field label="APV · Monto">
              <input className="ef-input" type="number" step="0.01" value={form.apv_monto ?? ""} onChange={e=>set("apv_monto", e.target.value ? Number(e.target.value) : null)} />
            </Field>
            <Field label="Depósito Convenido">
              <input className="ef-input" type="number" step="0.01" value={form.deposito_convenido_monto ?? ""} onChange={e=>set("deposito_convenido_monto", e.target.value ? Number(e.target.value) : null)} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Vigencia · Desde">
              <input className="ef-input" type="date" value={form.fecha_vigencia_desde} onChange={e=>set("fecha_vigencia_desde", e.target.value)} />
            </Field>
            <Field label="Vigencia · Hasta">
              <input className="ef-input" type="date" value={form.fecha_vigencia_hasta || ""} onChange={e=>set("fecha_vigencia_hasta", e.target.value || null)} />
            </Field>
          </div>

          <Field label="Observaciones">
            <textarea className="ef-input" rows={3} value={form.observaciones} onChange={e=>set("observaciones", e.target.value)} />
          </Field>
        </div>
      </div>
    </form>
  );
}
