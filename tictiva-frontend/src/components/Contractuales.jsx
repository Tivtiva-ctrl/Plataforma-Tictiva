// src/components/Contractuales.jsx
import React from "react";

const show = (v) => (v === null || v === undefined || v === "" ? "—" : v);
const fmt = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date)) return "—";
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

// estilos inline (independiente del CSS del proyecto)
const rowBase = {
  display: "grid",
  gridTemplateColumns: "40% 60%",
  alignItems: "center",
  gap: "8px",
  padding: "12px 0",
  borderTop: "1px solid #f3f4f6",
};
const labelStyle = { color: "#6b7280", fontWeight: 500, lineHeight: 1.4 };
const valueStyle = { color: "#111827", fontWeight: 600, lineHeight: 1.4, wordBreak: "break-word" };

function Row({ label, value, first = false }) {
  return (
    <div style={{ ...rowBase, borderTop: first ? "0" : rowBase.borderTop }}>
      <div style={labelStyle}>{label}:</div>
      <div style={valueStyle}>{value}</div>
    </div>
  );
}

export default function ContractualesView({ data, pin }) {
  if (!data) {
    return (
      <div className="ef-card p20" style={{ marginTop: 12 }}>
        <h3 className="ef-title-sm">Datos Contractuales</h3>
        <div style={{ color: "#6b7280" }}>Sin datos contractuales</div>
      </div>
    );
  }

  // 🔽 definimos todos los ítems en el orden deseado
  const items = [
    { label: "Cargo Actual", value: show(data.cargo_actual) },
    { label: "Tipo de Contrato", value: show(data.tipo_contrato) },
    { label: "Fecha de Ingreso", value: fmt(data.fecha_ingreso) },
    { label: "Fecha de Término", value: fmt(data.fecha_termino) },
    { label: "Jornada de Trabajo", value: show(data.jornada_tipo) },
    { label: "Horas Semanales", value: show(data.horas_semanales) },
    { label: "Modalidad", value: show(data.modalidad) },
    { label: "Sucursal/Lugar de Trabajo", value: show(data.sucursal) },
    { label: "Centro de Costo/Área", value: show(data.centro_costo) },
    { label: "Responsable Directo", value: show(data.responsable_directo) },
    { label: "PIN de Marcación (Tictivapp)", value: show(pin) },
    { label: "Contrato Firmado", value: data.contrato_firmado ? "Sí" : "No" },
    { label: "Fecha Firma Trabajador", value: fmt(data.fecha_firma_trabajador) },
    { label: "Fecha Firma Empleador", value: fmt(data.fecha_firma_empleador) },
    { label: "Anexos Firmados", value: data.anexos_firmados ? "Sí" : "No" },
    { label: "Últ. Act. Contrato", value: fmt(data.ultima_act_contrato) },
    { label: "Finiquito Firmado", value: data.finiquito_firmado ? "Sí" : "No" },
    { label: "Fecha Finiquito", value: fmt(data.fecha_finiquito) },
    { label: "Sueldo Base ($)", value: show(data.remuneracion_base) },
    { label: "Gratificación", value: show(data.gratificacion) },
    { label: "Asignación Colación ($)", value: show(data.asignacion_colacion) },
    { label: "Asignación Movilización ($)", value: show(data.asignacion_movilizacion) },
    { label: "Teletrabajo: Domicilio", value: show(data.teletrabajo_domicilio) },
    { label: "Teletrabajo: Asignación Internet", value: show(data.teletrabajo_internet) },
    { label: "Equipos Entregados", value: show(data.equipos_entregados) },
    { label: "Ley Karin: Acuse de Recibo", value: fmt(data.ley_karin_acuse_fecha) },
  ];

  // 🔪 partimos en dos columnas equilibradas
  const mid = Math.ceil(items.length / 2);
  const left = items.slice(0, mid);
  const right = items.slice(mid);

  // contenedor 2 columnas (en móviles podrías dejarlo así o
  // si quieres 1 columna en mobile, te paso luego un CSS mínimo)
  const grid2 = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
    marginTop: 4,
  };

  return (
    <div className="ef-card p20" style={{ marginTop: 12 }}>
      <h3 className="ef-title-sm">Datos Contractuales</h3>

      <div style={grid2}>
        <div>
          {left.map((it, i) => (
            <Row key={it.label} label={it.label} value={it.value} first={i === 0} />
          ))}
        </div>
        <div>
          {right.map((it, i) => (
            <Row key={it.label} label={it.label} value={it.value} first={i === 0} />
          ))}
        </div>
      </div>
    </div>
  );
}
