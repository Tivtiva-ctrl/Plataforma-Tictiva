// src/pages/ListadoFichas.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useTenant } from "../context/TenantProvider";
import "./ListadoFichas.css";

export default function ListadoFichas() {
  const navigate = useNavigate();
  const { tenant } =
    typeof useTenant === "function" ? useTenant() : { tenant: null };

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      setLoading(true);
      try {
        // TABLA correcta: employees (coincide con tu SQL)
        let query = supabase
          .from("employees")
          .select(
            "id, tenant_id, nombre, apellido, rut, cargo, genero, discapacidad, activo, created_at"
          )
          .order("created_at", { ascending: false });

        if (tenant?.id) query = query.eq("tenant_id", tenant.id);

        const { data, error } = await query;
        if (cancel) return;

        if (error) {
          console.error("Supabase error:", error);
          setRows([]);
        } else {
          setRows(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (!cancel) {
          console.error("Excepción cargando employees:", e);
          setRows([]);
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    load();
    return () => {
      cancel = true;
    };
  }, [tenant?.id]);

  const filtered = useMemo(() => {
    const term = (q || "").trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((e) => {
      const full = `${e.nombre ?? ""} ${e.apellido ?? ""}`.toLowerCase();
      const rut = String(e.rut ?? "").toLowerCase();
      return full.includes(term) || rut.includes(term);
    });
  }, [q, rows]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const activos = filtered.filter((e) => e.activo === true).length;
    const inactivos = filtered.filter((e) => e.activo === false).length;
    const hombres =
      filtered.filter((e) => (e.genero ?? "").toUpperCase() === "M").length;
    const mujeres =
      filtered.filter((e) => (e.genero ?? "").toUpperCase() === "F").length;
    const otros = Math.max(0, total - hombres - mujeres);
    const discapacidad = filtered.filter((e) => e.discapacidad === true).length;
    return { total, activos, inactivos, hombres, mujeres, otros, discapacidad };
  }, [filtered]);

  const goToFicha = (emp) => {
    if (!emp?.id) return;
    navigate(`/rrhh/ficha/${emp.id}`);
  };

  // 🔒 Estilos inline para evitar que un CSS global los “aplane”
  const S = {
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
      gap: "12px",
      margin: "0 4px 16px",
    },
    statCard: {
      background: "#ffffff",
      border: "1px solid #e5e7eb",
      borderRadius: "18px",
      boxShadow: "0 6px 18px rgba(16,24,40,.06)",
      padding: "14px",
    },
    statLabel: { fontSize: "13px", color: "#6b7280" },
    statValue: { fontSize: "22px", fontWeight: 700, marginTop: "4px" },
  };

  return (
    <div className="lf-page">
      <div className="lf-wrap">
        {/* Header */}
        <div className="lf-card lf-header">
          <div className="lf-header-left">
            <h2 className="lf-title">Listado de Empleados</h2>
            <p className="lf-sub">
              Información de los empleados{" "}
              {tenant?.name ? (
                <>
                  para <strong>{tenant.name}</strong>
                </>
              ) : (
                ""
              )}
              . Haz clic en el nombre para ver detalles.
            </p>
          </div>

          <div className="lf-actions">
            <button className="lf-btn lf-btn-ghost">Carga Masiva</button>
            <button className="lf-btn lf-btn-primary">Crear Empleado</button>
          </div>

          <div className="lf-search">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre o RUT…"
              className="lf-input"
            />
          </div>
        </div>

        {/* Contadores (forzados con inline styles) */}
        <div className="lf-stats" style={S.statsGrid}>
          <div style={S.statCard}>
            <div style={S.statLabel}>Total</div>
            <div style={S.statValue}>{stats.total}</div>
          </div>
          <div style={S.statCard}>
            <div style={S.statLabel}>Activos</div>
            <div style={S.statValue}>{stats.activos}</div>
          </div>
          <div style={S.statCard}>
            <div style={S.statLabel}>Inactivos</div>
            <div style={S.statValue}>{stats.inactivos}</div>
          </div>
          <div style={S.statCard}>
            <div style={S.statLabel}>Hombres</div>
            <div style={S.statValue}>{stats.hombres}</div>
          </div>
          <div style={S.statCard}>
            <div style={S.statLabel}>Mujeres</div>
            <div style={S.statValue}>{stats.mujeres}</div>
          </div>
          <div style={S.statCard}>
            <div style={S.statLabel}>Con Discapacidad</div>
            <div style={S.statValue}>{stats.discapacidad}</div>
          </div>
        </div>

        {/* Tabla */}
        <div className="lf-card lf-table-wrap">
          <table className="lf-table">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nombre Completo</th>
                <th>RUT</th>
                <th>Cargo</th>
                <th>Estado</th>
                <th className="lf-text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="lf-empty">
                    Cargando…
                  </td>
                </tr>
              )}

              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="lf-empty">
                    No encontramos resultados {q ? <>para “{q}”.</> : "."}
                  </td>
                </tr>
              )}

              {!loading &&
                filtered.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <div className="lf-avatar">
                        {(e.nombre?.[0] ?? "E")}
                        {(e.apellido?.[0] ?? "")}
                      </div>
                    </td>
                    <td>
                      <button className="lf-link" onClick={() => goToFicha(e)}>
                        {`${e.nombre ?? ""} ${e.apellido ?? ""}`.trim() ||
                          "Sin nombre"}
                      </button>
                    </td>
                    <td>{e.rut ?? "—"}</td>
                    <td>{e.cargo ?? "—"}</td>
                    <td>
                      <span
                        className={
                          e.activo
                            ? "lf-badge lf-badge-green"
                            : "lf-badge lf-badge-gray"
                        }
                      >
                        {e.activo ? "ACTIVO" : "INACTIVO"}
                      </span>
                    </td>
                    <td className="lf-text-right">
                      <button
                        className="lf-btn lf-btn-ghost"
                        onClick={() => goToFicha(e)}
                      >
                        👁️ Ver
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
