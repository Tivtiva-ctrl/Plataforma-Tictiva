// src/pages/ListadoFichas.jsx
import React, { useMemo, useState } from "react";
import { supabase } from "../lib/supabase";                  // para inserts
import { useEmployees } from "../data/useEmployees";         // datos por tenant
import { useTenant } from "../context/TenantProvider";       // tenant activo
import { useNavigate } from "react-router-dom";
import "./ListadoFichas.css";

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

  // ⬇️ Datos reales por tenant
  const { employees } = useEmployees();
  const { tenant } = useTenant();

  // Lista filtrada (igual que antes, pero con employees del hook)
  const lista = useMemo(() => {
    const nq = norm(q);
    if (!nq) return employees || [];
    return (employees || []).filter((e) =>
      [fullName(e), e.rut, e.cargo].some((f) => norm(f).includes(nq))
    );
  }, [q, employees]);

  // KPIs desde employees
  const KPIS = useMemo(() => {
    const arr = employees || [];
    const total = arr.length;
    const activos = arr.filter((e) => e.activo).length;
    const inactivos = total - activos;
    const hombres = arr.filter((e) => e.genero === "M").length;
    const mujeres = arr.filter((e) => e.genero === "F").length;
    const otros = arr.filter((e) => e.genero === "O").length;
    const disc = arr.filter((e) => e.discapacidad).length;
    return [
      { key: "total", label: "Total", value: total },
      { key: "activos", label: "Activos", value: activos },
      { key: "inactivos", label: "Inactivos", value: inactivos },
      { key: "hombres", label: "Hombres", value: hombres },
      { key: "mujeres", label: "Mujeres", value: mujeres },
      { key: "otros", label: "Otros", value: otros },
      { key: "disc", label: "Con Discapacidad", value: disc },
    ];
  }, [employees]);

  // Crear empleado con tenant_id
  async function handleCrearEmpleado() {
    if (!tenant?.id) return;
    const nuevo = {
      nombre: "Nuevo",
      apellido: "Empleado",
      rut: "00.000.000-0",
      cargo: "Sin cargo",
      genero: "O",
      discapacidad: false,
      activo: true,
      tenant_id: tenant.id, // CLAVE
    };
    const { error } = await supabase.from("employees").insert(nuevo);
    if (error) {
      console.error(error);
      alert("No se pudo crear el empleado.");
    } else {
      // refresco simple para ver el nuevo registro; puedes reemplazar por refetch en tu hook
      window.location.reload();
    }
  }

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
          <h1 className="lf-title">Listado de Empleados</h1>
          <p className="lf-sub">
            Información de los empleados para <strong>{tenant?.name || "—"}</strong>. Haz clic en el nombre para ver detalles.
          </p>
        </div>
        <div className="lf-headerRight">
          <button type="button" className="lf-btn lf-btnGhost">Carga Masiva</button>
          <button
            type="button"
            className="lf-btn lf-btnPrimary"
            onClick={handleCrearEmpleado}
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
