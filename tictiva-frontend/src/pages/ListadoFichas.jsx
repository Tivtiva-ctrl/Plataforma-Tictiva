import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ListadoFichas.css";

/** ===== Dummy data de ejemplo (cámbialo por tu fetch) ===== */
const EMPLEADOS = [
  { id: 1, nombre: "Eva", apellido: "Green", rut: "11.111.111-1", cargo: "Tester Lead", genero: "F", discapacidad: false, activo: true },
  { id: 2, nombre: "Juan", apellido: "Pérez", rut: "22.222.222-2", cargo: "Automation Tester", genero: "M", discapacidad: false, activo: true },
  { id: 3, nombre: "Ana", apellido: "Temporal (P1)", rut: "10.101.101-0", cargo: "Asistente Bodega", genero: "F", discapacidad: false, activo: true },
  { id: 4, nombre: "Carlos", apellido: "Ventas", rut: "12.121.212-1", cargo: "Ejecutivo Ventas", genero: "M", discapacidad: false, activo: true },
  { id: 5, nombre: "Felipe", apellido: "Gómez", rut: "13.131.313-3", cargo: "Analista", genero: "M", discapacidad: true, activo: true },
  { id: 6, nombre: "Rocío", apellido: "Silva", rut: "14.141.414-4", cargo: "Generalista RRHH", genero: "F", discapacidad: false, activo: false },
  { id: 7, nombre: "Alex", apellido: "Roldán", rut: "15.151.515-5", cargo: "Back Office", genero: "O", discapacidad: false, activo: true },
  { id: 8, nombre: "Marta", apellido: "Suárez", rut: "16.161.616-6", cargo: "Supervisora", genero: "F", discapacidad: false, activo: true },
  { id: 9, nombre: "Tomás", apellido: "Ibarra", rut: "17.171.717-7", cargo: "Operaciones", genero: "M", discapacidad: false, activo: false },
];

/** Utilidades */
const norm = (s) =>
  (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const fullName = (e) => `${e.nombre} ${e.apellido}`.trim();

const initials = (e) => {
  const n = `${e.nombre || ""} ${e.apellido || ""}`.trim();
  const [a = "", b = ""] = n.split(/\s+/);
  return `${a[0] || ""}${b[0] || ""}`.toUpperCase();
};

export default function ListadoFichas() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const lista = useMemo(() => {
    const nq = norm(q);
    if (!nq) return EMPLEADOS;
    return EMPLEADOS.filter((e) =>
      [fullName(e), e.rut, e.cargo].some((f) => norm(f).includes(nq))
    );
  }, [q]);

  const KPIS = useMemo(() => {
    const total = EMPLEADOS.length;
    const activos = EMPLEADOS.filter((e) => e.activo).length;
    const inactivos = total - activos;
    const hombres = EMPLEADOS.filter((e) => e.genero === "M").length;
    const mujeres = EMPLEADOS.filter((e) => e.genero === "F").length;
    const otros = EMPLEADOS.filter((e) => e.genero === "O").length;
    const disc = EMPLEADOS.filter((e) => e.discapacidad).length;
    return [
      { key: "total", label: "Total", value: total },
      { key: "activos", label: "Activos", value: activos },
      { key: "inactivos", label: "Inactivos", value: inactivos },
      { key: "hombres", label: "Hombres", value: hombres },
      { key: "mujeres", label: "Mujeres", value: mujeres },
      { key: "otros", label: "Otros", value: otros },
      { key: "disc", label: "Con Discapacidad", value: disc },
    ];
  }, []);

  return (
    <div className="listadoPage lf-page">
      {/* Tabs superiores (mismo estilo claro del dashboard) */}
      <nav className="lf-tabs tabsBar">
        <div className="tabsInner">
          <button className="lf-tab is-active">Listado y Fichas</button>
          <button className="lf-tab" disabled>Permisos y Justificaciones</button>
          <button className="lf-tab" disabled>Validación DT</button>
          <button className="lf-tab" disabled>Gestión de Turnos</button>
        </div>
      </nav>

      <section className="lf-card lf-header listHead">
        <div className="lf-headerLeft">
          <h1 className="lf-title">Listado de Empleados - Prueba 1</h1>
          <p className="lf-sub">
            Información de los empleados para <strong>Prueba Uno SpA</strong>. Haz clic en el nombre para ver detalles.
          </p>
        </div>
        <div className="lf-headerRight">
          <button type="button" className="lf-btn lf-btnGhost">Carga Masiva</button>
          <button
            type="button"
            className="lf-btn lf-btnPrimary"
            onClick={() => console.log("Crear Empleado")}
          >
            Crear Empleado
          </button>
        </div>

        <div className="lf-searchWrap searchRow">
          <input
            className="lf-search searchInput"
            placeholder="Buscar por nombre o RUT…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </section>

      {/* KPIs / Resumen */}
      <section className="lf-card lf-kpis kpiBar">
        {KPIS.map((k) => (
          <div key={k.key} className="lf-kpi kpiCard">
            <div className="lf-kpiValue">{k.value}</div>
            <div className="lf-kpiLabel">{k.label}</div>
          </div>
        ))}
      </section>

      {/* Tabla */}
      <section className="lf-card lf-tableWrap tableCard">
        <table className="lf-table">
          <thead>
            <tr>
              <th style={{ width: 72 }}>Foto</th>
              <th>Nombre Completo</th>
              <th>RUT</th>
              <th>Cargo</th>
              <th>Estado Laboral</th>
              <th style={{ width: 140 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {lista.map((e) => (
              <tr key={e.id}>
                <td>
                  <div className="lf-avatar">{initials(e)}</div>
                </td>
                <td>
                  <button
                    type="button"
                    className="lf-linkBtn"
                    onClick={() => console.log("Abrir ficha de", fullName(e))}
                    title="Ver detalles"
                  >
                    {fullName(e)}
                  </button>
                </td>
                <td>{e.rut}</td>
                <td>{e.cargo}</td>
                <td>
                  <span className={`lf-chip ${e.activo ? "ok" : "off"}`}>
                    {e.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td>
                  <button
                    type="button"
                    className="lf-btn lf-btnGhost"
                    onClick={() => console.log("Ver detalles de", fullName(e))}
                  >
                    Ver Detalles
                  </button>
                </td>
              </tr>
            ))}

            {lista.length === 0 && (
              <tr>
                <td colSpan="6" className="lf-empty">
                  No encontramos resultados para “{q}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
