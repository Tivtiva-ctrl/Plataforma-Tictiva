import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const toYMD = (d) => {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "";
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const da = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
};

export default function ContractualesForm({ employee, isEditing, onSaved, id = "contractuales-form" }) {
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    cargo_actual: "",
    tipo_contrato: "",
    fecha_ingreso: "",
    fecha_termino: "",
    jornada_tipo: "",
    horas_semanales: "",
    modalidad: "",
    sucursal: "",
    centro_costo: "",
    responsable_directo: "",
    contrato_firmado: false,
    fecha_firma_trabajador: "",
    fecha_firma_empleador: "",
    anexos_firmados: false,
    ultima_act_contrato: "",
    finiquito_firmado: false,
    fecha_finiquito: "",
    remuneracion_base: "",
    gratificacion: "",
    asignacion_colacion: "",
    asignacion_movilizacion: "",
    // plus
    teletrabajo_domicilio: "",
    teletrabajo_internet: "",
    equipos_entregados: "",
    ley_karin_acuse_fecha: "",
  });
  const [pin, setPin] = useState(""); // solo lectura

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      const [{ data: c }, { data: e }] = await Promise.all([
        supabase.from("employee_contracts")
          .select("*").eq("employee_id", employee.id).eq("estado", "vigente").limit(1).maybeSingle(),
        supabase.from("employees").select("pin_marcacion").eq("id", employee.id).single()
      ]);

      if (!cancel) {
        if (c) {
          setForm({
            cargo_actual: c.cargo_actual || "",
            tipo_contrato: c.tipo_contrato || "",
            fecha_ingreso: toYMD(c.fecha_ingreso) || "",
            fecha_termino: toYMD(c.fecha_termino) || "",
            jornada_tipo: c.jornada_tipo || "",
            horas_semanales: c.horas_semanales ?? "",
            modalidad: c.modalidad || "",
            sucursal: c.sucursal || "",
            centro_costo: c.centro_costo || "",
            responsable_directo: c.responsable_directo || "",
            contrato_firmado: !!c.contrato_firmado,
            fecha_firma_trabajador: toYMD(c.fecha_firma_trabajador) || "",
            fecha_firma_empleador: toYMD(c.fecha_firma_empleador) || "",
            anexos_firmados: !!c.anexos_firmados,
            ultima_act_contrato: toYMD(c.ultima_act_contrato) || "",
            finiquito_firmado: !!c.finiquito_firmado,
            fecha_finiquito: toYMD(c.fecha_finiquito) || "",
            remuneracion_base: c.remuneracion_base ?? "",
            gratificacion: c.gratificacion || "",
            asignacion_colacion: c.asignacion_colacion ?? "",
            asignacion_movilizacion: c.asignacion_movilizacion ?? "",
            teletrabajo_domicilio: c.teletrabajo_domicilio || "",
            teletrabajo_internet: c.teletrabajo_internet || "",
            equipos_entregados: c.equipos_entregados || "",
            ley_karin_acuse_fecha: toYMD(c.ley_karin_acuse_fecha) || "",
          });
        }
        setPin(e?.pin_marcacion || "");
        setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, [employee.id]);

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      employee_id: employee.id,
      estado: "vigente",
      cargo_actual: form.cargo_actual || null,
      tipo_contrato: form.tipo_contrato || null,
      fecha_ingreso: form.fecha_ingreso || null,
      fecha_termino: form.fecha_termino || null,
      jornada_tipo: form.jornada_tipo || null,
      horas_semanales: form.horas_semanales === "" ? null : Number(form.horas_semanales),
      modalidad: form.modalidad || null,
      sucursal: form.sucursal || null,
      centro_costo: form.centro_costo || null,
      responsable_directo: form.responsable_directo || null,
      contrato_firmado: !!form.contrato_firmado,
      fecha_firma_trabajador: form.fecha_firma_trabajador || null,
      fecha_firma_empleador: form.fecha_firma_empleador || null,
      anexos_firmados: !!form.anexos_firmados,
      ultima_act_contrato: form.ultima_act_contrato || null,
      finiquito_firmado: !!form.finiquito_firmado,
      fecha_finiquito: form.fecha_finiquito || null,
      remuneracion_base: form.remuneracion_base === "" ? null : Number(form.remuneracion_base),
      gratificacion: form.gratificacion || null,
      asignacion_colacion: form.asignacion_colacion === "" ? null : Number(form.asignacion_colacion),
      asignacion_movilizacion: form.asignacion_movilizacion === "" ? null : Number(form.asignacion_movilizacion),
      teletrabajo_domicilio: form.teletrabajo_domicilio || null,
      teletrabajo_internet: form.teletrabajo_internet || null,
      equipos_entregados: form.equipos_entregados || null,
      ley_karin_acuse_fecha: form.ley_karin_acuse_fecha || null,
    };

    // upsert 1 contrato vigente por empleado
    const { data, error } = await supabase
      .from("employee_contracts")
      .upsert(payload, { onConflict: "employee_id,estado" })
      .select("*")
      .single();

    if (error) { console.error(error); alert(error.message || "No se pudo guardar"); return; }
    onSaved?.(data);
  };

  if (loading) return <div className="card p-4">Cargando…</div>;

  return (
    <form id={id} onSubmit={handleSubmit} className="card grandes" style={{ marginTop: 12 }}>
      <h2>Datos Contractuales</h2>

      <div className="form-grid">
        <Field label="Cargo Actual">
          <input value={form.cargo_actual} onChange={(e)=>setField("cargo_actual", e.target.value)} disabled={!isEditing} />
        </Field>
        <Field label="Tipo de Contrato">
          <select value={form.tipo_contrato} onChange={(e)=>setField("tipo_contrato", e.target.value)} disabled={!isEditing}>
            <option value="">— Selecciona —</option>
            <option>Indefinido</option>
            <option>Plazo Fijo</option>
            <option>Por Obra</option>
          </select>
        </Field>

        <Field label="Fecha de Ingreso">
          <input type="date" value={form.fecha_ingreso} onChange={(e)=>setField("fecha_ingreso", e.target.value)} disabled={!isEditing} />
        </Field>
        <Field label="Fecha de Término">
          <input type="date" value={form.fecha_termino} onChange={(e)=>setField("fecha_termino", e.target.value)} disabled={!isEditing} />
        </Field>

        <Field label="Jornada de Trabajo">
          <select value={form.jornada_tipo} onChange={(e)=>setField("jornada_tipo", e.target.value)} disabled={!isEditing}>
            <option value="">— Selecciona —</option>
            <option>Completa</option>
            <option>Parcial</option>
            <option>Artículo 22</option>
          </select>
        </Field>
        <Field label="Horas Semanales">
          <input type="number" min="0" value={form.horas_semanales ?? ""} onChange={(e)=>setField("horas_semanales", e.target.value)} disabled={!isEditing} />
        </Field>

        <Field label="Modalidad">
          <select value={form.modalidad} onChange={(e)=>setField("modalidad", e.target.value)} disabled={!isEditing}>
            <option value="">— Selecciona —</option>
            <option>Presencial</option>
            <option>Teletrabajo</option>
            <option>Mixta</option>
          </select>
        </Field>
        <Field label="Sucursal/Lugar de Trabajo">
          <input value={form.sucursal} onChange={(e)=>setField("sucursal", e.target.value)} disabled={!isEditing} />
        </Field>

        <Field label="Centro de Costo/Área">
          <input value={form.centro_costo} onChange={(e)=>setField("centro_costo", e.target.value)} disabled={!isEditing} />
        </Field>
        <Field label="Responsable Directo">
          <input value={form.responsable_directo} onChange={(e)=>setField("responsable_directo", e.target.value)} disabled={!isEditing} />
        </Field>

        <Field label="PIN de Marcación (Tictivapp)">
          <input value={pin} disabled readOnly />
        </Field>

        <Field label="Contrato Firmado">
          <input type="checkbox" checked={!!form.contrato_firmado} onChange={(e)=>setField("contrato_firmado", e.target.checked)} disabled={!isEditing} />
        </Field>
        <Field label="Fecha Firma Trabajador">
          <input type="date" value={form.fecha_firma_trabajador} onChange={(e)=>setField("fecha_firma_trabajador", e.target.value)} disabled={!isEditing} />
        </Field>
        <Field label="Fecha Firma Empleador">
          <input type="date" value={form.fecha_firma_empleador} onChange={(e)=>setField("fecha_firma_empleador", e.target.value)} disabled={!isEditing} />
        </Field>
        <Field label="Anexos Firmados">
          <input type="checkbox" checked={!!form.anexos_firmados} onChange={(e)=>setField("anexos_firmados", e.target.checked)} disabled={!isEditing} />
        </Field>
        <Field label="Últ. Act. Contrato">
          <input type="date" value={form.ultima_act_contrato} onChange={(e)=>setField("ultima_act_contrato", e.target.value)} disabled={!isEditing} />
        </Field>

        <Field label="Finiquito Firmado">
          <input type="checkbox" checked={!!form.finiquito_firmado} onChange={(e)=>setField("finiquito_firmado", e.target.checked)} disabled={!isEditing} />
        </Field>
        <Field label="Fecha Finiquito">
          <input type="date" value={form.fecha_finiquito} onChange={(e)=>setField("fecha_finiquito", e.target.value)} disabled={!isEditing} />
        </Field>

        <Field label="Sueldo Base ($)">
          <input type="number" min="0" value={form.remuneracion_base ?? ""} onChange={(e)=>setField("remuneracion_base", e.target.value)} disabled={!isEditing} />
        </Field>
        <Field label="Gratificación">
          <select value={form.gratificacion} onChange={(e)=>setField("gratificacion", e.target.value)} disabled={!isEditing}>
            <option value="">— Selecciona —</option>
            <option>Legal</option>
            <option>Proporcional</option>
            <option>No aplica</option>
          </select>
        </Field>
        <Field label="Asignación Colación ($)">
          <input type="number" min="0" value={form.asignacion_colacion ?? ""} onChange={(e)=>setField("asignacion_colacion", e.target.value)} disabled={!isEditing} />
        </Field>
        <Field label="Asignación Movilización ($)">
          <input type="number" min="0" value={form.asignacion_movilizacion ?? ""} onChange={(e)=>setField("asignacion_movilizacion", e.target.value)} disabled={!isEditing} />
        </Field>

        {/* PLUS teletrabajo / Ley Karin */}
        <Field label="Teletrabajo: Domicilio">
          <input value={form.teletrabajo_domicilio} onChange={(e)=>setField("teletrabajo_domicilio", e.target.value)} disabled={!isEditing} />
        </Field>
        <Field label="Teletrabajo: Asignación Internet">
          <input value={form.teletrabajo_internet} onChange={(e)=>setField("teletrabajo_internet", e.target.value)} disabled={!isEditing} />
        </Field>
        <Field label="Equipos Entregados">
          <input value={form.equipos_entregados} onChange={(e)=>setField("equipos_entregados", e.target.value)} disabled={!isEditing} />
        </Field>
        <Field label="Ley Karin: Acuse de Recibo (fecha)">
          <input type="date" value={form.ley_karin_acuse_fecha} onChange={(e)=>setField("ley_karin_acuse_fecha", e.target.value)} disabled={!isEditing} />
        </Field>
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <div className="form-field">
      <label>{label}</label>
      {children}
    </div>
  );
}
