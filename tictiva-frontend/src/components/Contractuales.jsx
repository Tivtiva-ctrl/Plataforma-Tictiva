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

export default function ContractualesView({ data, pin }) {
  return (
    <div className="ef-card p20" style={{ marginTop: 12 }}>
      <h3 className="ef-title-sm">Datos Contractuales</h3>

      {!data ? (
        <div className="text-gray-500">Sin datos contractuales</div>
      ) : (
        <div className="ficha-grid">
          <Row label="Cargo Actual" value={show(data.cargo_actual)} />
          <Row label="Tipo de Contrato" value={show(data.tipo_contrato)} />
          <Row label="Fecha de Ingreso" value={fmt(data.fecha_ingreso)} />
          <Row label="Fecha de Término" value={fmt(data.fecha_termino)} />

          <Row label="Jornada de Trabajo" value={show(data.jornada_tipo)} />
          <Row label="Horas Semanales" value={show(data.horas_semanales)} />
          <Row label="Modalidad" value={show(data.modalidad)} />

          <Row label="Sucursal/Lugar de Trabajo" value={show(data.sucursal)} />
          <Row label="Centro de Costo/Área" value={show(data.centro_costo)} />
          <Row label="Responsable Directo" value={show(data.responsable_directo)} />

          <Row label="PIN de Marcación (Tictivapp)" value={show(pin)} />

          <Row label="Contrato Firmado" value={data.contrato_firmado ? "Sí" : "No"} />
          <Row label="Fecha Firma Trabajador" value={fmt(data.fecha_firma_trabajador)} />
          <Row label="Fecha Firma Empleador" value={fmt(data.fecha_firma_empleador)} />

          <Row label="Anexos Firmados" value={data.anexos_firmados ? "Sí" : "No"} />
          <Row label="Últ. Act. Contrato" value={fmt(data.ultima_act_contrato)} />

          <Row label="Finiquito Firmado" value={data.finiquito_firmado ? "Sí" : "No"} />
          <Row label="Fecha Finiquito" value={fmt(data.fecha_finiquito)} />

          <Row label="Sueldo Base ($)" value={show(data.remuneracion_base)} />
          <Row label="Gratificación" value={show(data.gratificacion)} />
          <Row label="Asignación Colación ($)" value={show(data.asignacion_colacion)} />
          <Row label="Asignación Movilización ($)" value={show(data.asignacion_movilizacion)} />

          {/* Plus */}
          <Row label="Teletrabajo: Domicilio" value={show(data.teletrabajo_domicilio)} />
          <Row label="Teletrabajo: Asignación Internet" value={show(data.teletrabajo_internet)} />
          <Row label="Equipos Entregados" value={show(data.equipos_entregados)} />
          <Row label="Ley Karin: Acuse de Recibo" value={fmt(data.ley_karin_acuse_fecha)} />
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="ficha-row">
      {/* mismas clases que Personales */}
      <div className="ficha-label text-gray-500">{label}:</div>
      <div className="ficha-value font-semibold text-gray-900">{value}</div>
    </div>
  );
}
