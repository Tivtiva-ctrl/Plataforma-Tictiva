// src/pages/ListadoFichas.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useTenant } from "../context/TenantProvider";

export default function ListadoFichas() {
  const navigate = useNavigate();
  const { tenant } = (typeof useTenant === "function" ? useTenant() : { tenant: null });

  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancel = false;

    const load = async () => {
      setLoading(true);
      try {
        // ✅ Si hay tenant, filtramos; si NO hay tenant, traemos todo (evita “0” perpetuo)
        let query = supabase.from("empleados").select("*");
        if (tenant?.id) query = query.eq("empresa_id", tenant.id);

        const { data, error } = await query.order("created_at", { ascending: false });
        if (cancel) return;
        if (error) {
          console.error(error);
          setRows([]);
        } else {
          setRows(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        if (!cancel) {
          console.error(e);
          setRows([]);
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    };

    load();
    return () => { cancel = true; };
  }, [tenant?.id]);

  const filtered = useMemo(() => {
    const term = (q || "").trim().toLowerCase();
    if (!term) return rows;
    return rows.filter((e) => {
      const fullName = `${e.nombres ?? ""} ${e.apellidos ?? ""}`.toLowerCase();
      const rut = String(e.rut ?? "").toLowerCase();
      return fullName.includes(term) || rut.includes(term);
    });
  }, [q, rows]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const activos = filtered.filter((e) => e.estado_laboral === "ACTIVO" || e.activo === true).length;
    const inactivos = filtered.filter((e) => e.estado_laboral === "INACTIVO" || e.activo === false).length;
    const hombres = filtered.filter((e) => (e.genero ?? "").toLowerCase().startsWith("masc") || (e.genero ?? "").toLowerCase().startsWith("homb")).length;
    const mujeres = filtered.filter((e) => (e.genero ?? "").toLowerCase().startsWith("fem") || (e.genero ?? "").toLowerCase().startsWith("muj")).length;
    const otros = total - hombres - mujeres;
    const discapacidad = filtered.filter((e) => e.discapacidad === true).length;
    return { total, activos, inactivos, hombres, mujeres, otros, discapacidad };
  }, [filtered]);

  const goToFicha = (emp) => {
    if (!emp?.id) return;
    navigate(`/rrhh/ficha/${emp.id}`);
  };

  return (
    <div className="w-full">
      {/* Header de sección */}
      <div className="bg-white rounded-2xl shadow-sm mx-4 md:mx-6 my-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <div className="inline-flex items-center gap-2">
              <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">Listado y Fichas</span>
            </div>
            <p className="text-gray-500 mt-2">
              Información de los empleados {tenant?.nombre ? <>para <strong>{tenant.nombre}</strong></> : ""}. Haz clic en el nombre para ver detalles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm">
              Carga Masiva
            </button>
            <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium">
              Crear Empleado
            </button>
          </div>
        </div>

        <div className="mt-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o RUT…"
            className="w-full md:w-96 px-3 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mx-4 md:mx-6 mb-4">
        <Stat label="Total" value={stats.total} />
        <Stat label="Activos" value={stats.activos} />
        <Stat label="Inactivos" value={stats.inactivos} />
        <Stat label="Hombres" value={stats.hombres} />
        <Stat label="Mujeres" value={stats.mujeres} />
        <Stat label="Con Discapacidad" value={stats.discapacidad} />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden mx-4 md:mx-6 mb-8">
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <Th>Foto</Th>
              <Th>Nombre Completo</Th>
              <Th>RUT</Th>
              <Th>Cargo</Th>
              <Th>Estado Laboral</Th>
              <Th className="text-right pr-4">Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">Cargando…</td>
              </tr>
            )}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No encontramos resultados {q ? <>para “{q}”.</> : "."}
                </td>
              </tr>
            )}

            {!loading && filtered.map((e) => (
              <tr key={e.id} className="border-t hover:bg-gray-50 transition-colors">
                <td className="p-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-semibold">
                    {(e.nombres?.[0] ?? "E")}{(e.apellidos?.[0] ?? "")}
                  </div>
                </td>
                <td className="p-3">
                  <button
                    className="text-indigo-600 hover:underline font-medium"
                    onClick={() => goToFicha(e)}
                    title="Ver ficha"
                  >
                    {`${e.nombres ?? ""} ${e.apellidos ?? ""}`.trim() || "Sin nombre"}
                  </button>
                </td>
                <td className="p-3">{e.rut ?? "—"}</td>
                <td className="p-3">{e.cargo ?? "—"}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${e.estado_laboral === "ACTIVO" || e.activo
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"}`}>
                    {e.estado_laboral ?? (e.activo ? "ACTIVO" : "INACTIVO")}
                  </span>
                </td>
                <td className="p-3 text-right pr-4">
                  <button
                    className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm"
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
  );
}

function Th({ children, className = "" }) {
  return (
    <th className={`text-left text-xs font-semibold uppercase tracking-wide px-3 py-3 ${className}`}>
      {children}
    </th>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}
