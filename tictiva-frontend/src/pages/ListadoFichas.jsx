// src/pages/EmpleadoFicha.jsx
import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEmployees } from "../data/useEmployees";

const normRut = (r) => String(r || "").replace(/\./g, "").toUpperCase();

export default function EmpleadoFicha() {
  const { id, rut } = useParams(); // ahora soporta /rrhh/empleado/fichas/:id y /rrhh/empleado/fichas/rut/:rut
  const { state } = useLocation(); // por si navegaste con navigate(path, { state: { empleado } })
  const navigate = useNavigate();
  const { employees } = useEmployees();

  // loading solo si NO tenemos state y aún no llegó employees
  const isLoading = !state?.empleado && employees === undefined;

  const empleado = React.useMemo(() => {
    // 1) Preferir el que viene por state (navegación desde la lista)
    if (state?.empleado) return state.empleado;

    // 2) Si aún no tenemos employees, no podemos resolver
    if (!employees) return null;

    // 3) Resolver por :id
    if (id != null) {
      const byId = employees.find((e) => String(e.id) === String(id));
      if (byId) return byId;
    }

    // 4) Resolver por :rut
    if (rut != null) {
      const r = normRut(rut);
      const byRut = employees.find((e) => normRut(e.rut) === r);
      if (byRut) return byRut;
    }

    return null;
  }, [state, employees, id, rut]);

  if (isLoading) {
    return <div style={{ padding: 24 }}>Cargando ficha...</div>;
  }

  if (!empleado) {
    return (
      <div className="lf-page">
        <div className="lf-card" style={{ padding: 24 }}>
          <button className="lf-btn lf-btnGhost" onClick={() => navigate(-1)}>
            ← Volver
          </button>
          <h1 style={{ marginTop: 16 }}>No se encontró la ficha</h1>
          <p style={{ marginTop: 8 }}>
            {id != null ? `ID solicitado: ${id}` : rut != null ? `RUT solicitado: ${rut}` : ""}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="lf-page">
      <div className="lf-card" style={{ padding: 24 }}>
        <button className="lf-btn lf-btnGhost" onClick={() => navigate(-1)}>
          ← Volver
        </button>

        <h1 style={{ marginTop: 16 }}>
          Ficha de {empleado.nombre} {empleado.apellido}
        </h1>

        <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
          <div><strong>RUT:</strong> {empleado.rut || "—"}</div>
          <div><strong>Cargo:</strong> {empleado.cargo || "—"}</div>
          <div><strong>Estado:</strong> {empleado.activo ? "Activo" : "Inactivo"}</div>
          {/* Agrega aquí las secciones reales de la ficha (contratos, documentos, asistencia, etc.) */}
        </div>
      </div>
    </div>
  );
}
