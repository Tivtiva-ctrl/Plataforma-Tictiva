// src/pages/ListadoFichas.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HRSubnav from "../components/HRSubnav";
import "./ListadoFichas.css";
import { EmpleadosAPI } from "../api";

// --- Helpers (sin cambios, tu código original) ---
const initials = (name = "") =>
  name.toString().split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const pathDetalleEmpleado = (emp) => {
  const id = emp?.id;
  const rut = emp?.rut;
  if (id != null && id !== "") return `/rrhh/empleado/${encodeURIComponent(String(id))}`;
  if (rut) return `/rrhh/empleado/rut/${encodeURIComponent(String(rut))}`;
  return "/rrhh/fichas";
};

// ... (El resto de tus funciones helper como 'esHombre', 'parseCSV', etc. son muy completas y no necesitan cambios)

/* ===== COMPONENTE PRINCIPAL ===== */
export default function ListadoFichas() {
  const navigate = useNavigate();
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true); // Inicia en true, ¡correcto!
  const [q, setQ] = useState("");
  const [kpiFilter, setKpiFilter] = useState("todos");
  const fileRef = useRef(null);
  
  // (Aquí irían todas tus funciones helper como esHombre, parseCSV, etc. Las omito por brevedad pero deben estar aquí)


  // --- Lógica para Cargar Datos (sin cambios, tu código original) ---
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const data = await EmpleadosAPI.list();
        if (!cancel) setEmpleados(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("No se pudo cargar empleados", e);
        if (!cancel) setEmpleados([]);
      } finally {
        if (!cancel) setLoading(false); // Cuando termina, loading es false. ¡Perfecto!
      }
    })();
    return () => { cancel = true; };
  }, []);

  // --- Lógica de Filtros (sin cambios, tu código original) ---
  const listBySearch = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return empleados;
    return empleados.filter((e) =>
      `${e?.nombre || ""} ${e?.rut || ""}`.toLowerCase().includes(t)
    );
  }, [empleados, q]);

  const listFiltered = useMemo(() => {
    // ... (tu lógica de switch para kpiFilter no necesita cambios)
    return listBySearch; // Ejemplo simplificado
  }, [listBySearch, kpiFilter]);

  // --- KPIs y Lógica del Modal (Todo tu código para el modal y carga masiva va aquí, sin cambios)
  const total = empleados.length;
  // ... resto de tus cálculos de KPIs ...
  const [open, setOpen] = useState(false);
  // ... resto de tu lógica para el modal y carga masiva ...

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <div className="dashboard-bg" style={{ padding: 16 }}>
      <HRSubnav />

      {/* Encabezado + acciones */}
      {/* ... (tu JSX para el encabezado y botones no necesita cambios) ... */}

      {/* KPIs (clicables) */}
      {/* ... (tu JSX para los KPIs no necesita cambios) ... */}

      {/* Tabla de Empleados */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* Header tabla */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "100px 1.6fr 1fr 1.4fr 0.8fr 1fr",
            gap: 8,
            padding: "12px 16px",
            fontWeight: 700,
            color: "#374151",
            background: "#F9FAFB",
            borderBottom: "1px solid #E5E7EB",
          }}
        >
          <div>FOTO</div>
          <div>NOMBRE COMPLETO</div>
          <div>RUT</div>
          <div>CARGO</div>
          <div>ESTADO</div>
          <div>ACCIONES</div>
        </div>

        {/* --- AQUÍ ESTÁ LA SOLUCIÓN QUE YA TENÍAS IMPLEMENTADA --- */}
        {/* Filas */}
        {loading ? (
          // Si 'loading' es true, muestra este mensaje
          <div style={{ padding: 16, color: "#6B7280" }}>Cargando…</div>
        ) : listFiltered.length === 0 ? (
          // Si ya no está cargando y no hay resultados, muestra este mensaje
          <div style={{ padding: 16, color: "#6B7280" }}>Sin resultados</div>
        ) : (
          // Si ya no está cargando y hay resultados, muestra la lista
          listFiltered.map((e) => {
            const key = e?.id ?? e?.rut;
            const activo = (e?.estado || "").toLowerCase() === "activo";
            const hrefDetalle = pathDetalleEmpleado(e);

            return (
              <div
                key={key}
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1.6fr 1fr 1.4fr 0.8fr 1fr",
                  gap: 8,
                  padding: "14px 16px",
                  borderTop: "1px solid #E5E7EB",
                  alignItems: "center",
                }}
              >
                <div>
                  <div style={{ width: 40, height: 40, borderRadius: 999, background: "#E5EDFF", color: "#1E3A8A", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>
                    {initials(e?.nombre)}
                  </div>
                </div>
                <div>
                  <Link to={hrefDetalle} style={{ color: "#1A56DB", textDecoration: "none", fontWeight: 700 }}>
                    {e?.nombre || "—"}
                  </Link>
                </div>
                <div style={{ color: "#6B7280" }}>{e?.rut || "—"}</div>
                <div>{e?.cargo || "—"}</div>
                <div>
                  <span style={{ padding: "6px 10px", borderRadius: 999, fontWeight: 700, fontSize: 12, color: activo ? "#065F46" : "#92400E", background: activo ? "#D1FAE5" : "#FEF3C7", border: `1px solid ${activo ? "#A7F3D0" : "#FDE68A"}` }}>
                    {e?.estado || "—"}
                  </span>
                </div>
                <div>
                  <Link to={hrefDetalle} style={{ color: "#1A56DB", textDecoration: "none" }}>
                     Ver Detalles
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tu modal para crear empleado (no necesita cambios) */}
      {open && (
        <>
          {/* ... (Todo el JSX de tu modal va aquí) ... */}
        </>
      )}

      {/* Los estilos en línea que tenías (no necesitan cambios) */}
      <style>{`
        .vdt-input{ background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:10px 12px;outline:none;}
        .vdt-input:focus{border-color:#C7D2FE;box-shadow:0 0 0 4px rgba(26,86,219,.10);}
        .vdt-label{font-size:12px;color:#6B7280}
        .vdt-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .vdt-btn{background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:8px 12px;cursor:pointer}
        .vdt-btn:hover{background:#F9FAFB}
        .vdt-btn.primary{background:#1A56DB;color:#fff;border-color:#1A56DB}
      `}</style>
    </div>
  );
}