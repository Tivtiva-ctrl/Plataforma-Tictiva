// src/pages/ListadoFichas.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HRSubnav from "../components/HRSubnav";
import "./ListadoFichas.css";
import { api } from "../api/config";
import { EmpleadosAPI } from "../api/empleados"; // ✅ IMPORT NECESARIO

// Ejemplo:
async function cargarFichas() {
  try {
    const res = await fetch(api("/fichas"));   // <-- en vez de /fichas o http://127.0.0.1:3001/fichas
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    // setState(data) ...
  } catch (err) {
    console.error(err);
    alert("No se pudo conectar al backend. Revisa VITE_API_URL en Vercel.");
  }
}

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

// ... (El resto de tus funciones helper como 'esHombre', 'parseCSV', etc.)

/* ===== COMPONENTE PRINCIPAL ===== */
export default function ListadoFichas() {
  const navigate = useNavigate();
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true); // Inicia en true, ¡correcto!
  const [q, setQ] = useState("");
  const [kpiFilter, setKpiFilter] = useState("todos");
  const fileRef = useRef(null);
  
  // --- Lógica para Cargar Datos ---
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const data = await EmpleadosAPI.listar(); // ✅ antes era EmpleadosAPI.list()
        if (!cancel) setEmpleados(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("No se pudo cargar empleados", e);
        if (!cancel) setEmpleados([]);
      } finally {
        if (!cancel) setLoading(false);
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
    // ... (tu lógica de switch para kpiFilter)
    return listBySearch; // Ejemplo simplificado
  }, [listBySearch, kpiFilter]);

  // --- KPIs y Modal (tu código) ---
  const total = empleados.length;
  const [open, setOpen] = useState(false);

  // --- RENDERIZADO ---
  return (
    <div className="dashboard-bg" style={{ padding: 16 }}>
      <HRSubnav />

      {/* Encabezado + acciones */}
      {/* ... */}

      {/* KPIs (clicables) */}
      {/* ... */}

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

        {/* Filas */}
        {loading ? (
          <div style={{ padding: 16, color: "#6B7280" }}>Cargando…</div>
        ) : listFiltered.length === 0 ? (
          <div style={{ padding: 16, color: "#6B7280" }}>Sin resultados</div>
        ) : (
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
          {/* ... */}
        </>
      )}

      {/* Estilos en línea que tenías */}
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
