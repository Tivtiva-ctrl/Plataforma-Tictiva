// src/pages/EmpleadoDetalle.jsx
import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { differenceInMinutes, parseISO } from "date-fns";
import "./EmpleadoDetalle.css";
import VolverAtras from "../components/VolverAtras";
import PersonalesTab from "../components/PersonalesTab";
import ContractualesTab from "../components/ContractualesTab";
import DocumentosTab from "../components/DocumentosTab";
import PrevisionTab from "../components/PrevisionTab";
import BancariosTab from "../components/BancariosTab";
import HojaDeVida from "../components/HojaDeVida";

/* ===========================
   Utils
   =========================== */
const normalizeRut = (r) =>
  (r || "").toString().replace(/\./g, "").replace(/-/g, "").toUpperCase();

/* ===========================
   Tab: Asistencia (resumen)
   =========================== */
function AsistenciaTab({ empleado }) {
  const [metricas, setMetricas] = useState({
    horasTrabajadas: 0,
    porcentajeAsistencia: 0,
    atrasosMes: 0,
    horasExtra: 0,
  });

  useEffect(() => {
    if (!empleado?.marcas) return;

    let horas = 0;
    let atrasos = 0;
    const diasAsistidos = new Set();

    empleado.marcas.forEach((marca) => {
      diasAsistidos.add(marca.fecha);
      if ((marca.estado || "").toLowerCase() === "atraso") atrasos++;

      if ((marca.tipo || "").toLowerCase() === "entrada") {
        const salida = empleado.marcas.find(
          (m) => m.fecha === marca.fecha && (m.tipo || "").toLowerCase() === "salida"
        );
        if (salida) {
          const inicio = parseISO(`${marca.fecha}T${marca.hora}`);
          const fin = parseISO(`${salida.fecha}T${salida.hora}`);
          horas += differenceInMinutes(fin, inicio) / 60;
        }
      }
    });

    const porcentaje = (diasAsistidos.size / 22) * 100;

    setMetricas({
      horasTrabajadas: Number.isFinite(horas) ? horas.toFixed(1) : 0,
      porcentajeAsistencia: Number.isFinite(porcentaje) ? porcentaje.toFixed(0) : 0,
      atrasosMes: atrasos,
      horasExtra: 0,
    });
  }, [empleado]);

  return (
    <div className="asistencia-container">
      <div className="asistencia-header">
        <div className="asistencia-title">
          <span className="icono-title">🕒</span>
          <div>
            <h2>Resumen de Últimas Marcaciones</h2>
            <p>
              Últimas 10 marcas registradas. Para un historial completo y filtros, usa
              el botón &quot;Ver Historial Detallado&quot;.
            </p>
          </div>
        </div>
        <div className="asistencia-buttons">
          <button className="btn-detalle">📊 Ver Historial Detallado</button>
          <button className="btn-exportar">⬇ Exportar Resumen (Sim.)</button>
        </div>
      </div>

      <div className="metricas-grid">
        <div className="metric-card">
          <div className="metric-info">
            <p className="metric-label">Horas Trabajadas (Mes)</p>
            <p className="metric-value">{metricas.horasTrabajadas}h</p>
          </div>
          <div className="metric-icon">🕑</div>
        </div>
        <div className="metric-card">
          <div className="metric-info">
            <p className="metric-label">Asistencia</p>
            <p className="metric-value green">{metricas.porcentajeAsistencia}%</p>
          </div>
          <div className="metric-icon">📅</div>
        </div>
        <div className="metric-card">
          <div className="metric-info">
            <p className="metric-label">Atrasos (Mes)</p>
            <p className="metric-value yellow">{metricas.atrasosMes}</p>
          </div>
          <div className="metric-icon">⚠️</div>
        </div>
        <div className="metric-card">
          <div className="metric-info">
            <p className="metric-label">Horas Extra</p>
            <p className="metric-value blue">{metricas.horasExtra}h</p>
          </div>
          <div className="metric-icon">➕</div>
        </div>
      </div>

      <table className="asistencia-tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Método</th>
            <th>IP</th>
            <th>Foto</th>
          </tr>
        </thead>
        <tbody>
          {empleado.marcas?.slice(0, 10).map((marca, index) => (
            <tr key={index}>
              <td>{marca.fecha}</td>
              <td>{marca.hora}</td>
              <td className={`tipo ${(marca.tipo || "").toLowerCase()}`}>{marca.tipo}</td>
              <td>
                <span className={`estado-badge ${(marca.estado || "").toLowerCase()}`}>
                  {marca.estado}
                </span>
              </td>
              <td>{marca.metodo}</td>
              <td>{marca.ip}</td>
              <td>📷</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="asistencia-paginacion">Mostrando 10 de 45 registros</p>
    </div>
  );
}

/* ===========================
   Detalle empleado
   =========================== */
export default function EmpleadoDetalle() {
  // Puede venir :rut o :id en la URL
  const params = useParams();
  const location = useLocation();

  // 1) Toma el valor crudo del parámetro
  const rawParam = decodeURIComponent(String(params.rut ?? params.id ?? params.param ?? ""));
  const hasParam = rawParam.trim().length > 0;

  // 2) Deriva si es numérico (id) o no (rut)
  const isNumericId = /^\d+$/.test(rawParam);
  const rutParam = hasParam && !isNumericId ? rawParam : undefined;
  const idParam = hasParam && isNumericId ? rawParam : undefined;

  // 3) ENV
  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";
  const RESOURCE = import.meta.env.VITE_RESOURCE_EMPLEADOS || "empleados";

  // 4) DEBUG (ya con todo declarado)
  // eslint-disable-next-line no-console
  console.log("[ED] PARAMS", { params, rawParam, idParam, rutParam });
  // eslint-disable-next-line no-console
  console.log("[ED] ENV", { API, RESOURCE });

  const [empleado, setEmpleado] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [tabActiva, setTabActiva] = useState("personales");
  const [modoEdicion, setModoEdicion] = useState(false);

  // Deep-link de pestañas: #documentos o ?tab=documentos
  useEffect(() => {
    const hash = (location.hash || "").replace("#", "").toLowerCase();
    const q = (new URLSearchParams(location.search).get("tab") || "").toLowerCase();
    const wanted = hash || q;
    const map = {
      personales: "personales",
      contractuales: "contractuales",
      documentos: "documentos",
      docs: "documentos",
      prevision: "prevision",
      bancarios: "bancarios",
      asistencia: "asistencia",
      hojavida: "hojaVida",
      "hoja-vida": "hojaVida",
    };
    if (map[wanted]) setTabActiva(map[wanted]);
  }, [location]);

  // Si NO hay parámetro en la URL, no intentamos fetchear y avisamos elegante
  if (!hasParam) {
    return (
      <div className="detalle-container">
        <VolverAtras />
        <div style={{ padding: 16, color: "#b45309", background: "#fffbeb", border: "1px solid #f59e0b", borderRadius: 8 }}>
          ⚠️ Falta el parámetro en la URL. Navega a <code>/rrhh/empleado/:id</code> o <code>/rrhh/empleado/:rut</code>.
        </div>
      </div>
    );
  }

  // Carga del empleado por id O por rut
  useEffect(() => {
    let cancel = false;

    const fetchEmpleado = async () => {
      setNotFound(false);

      // Intento por ID directo (/empleados/:id)
      if (idParam) {
        try {
          const r = await fetch(`${API}/${RESOURCE}/${encodeURIComponent(idParam)}`);
          if (r.ok) {
            const emp = await r.json();
            if (emp && !cancel && (emp.id != null || emp.nombre)) {
              setEmpleado(emp);
              return;
            }
          }
        } catch {
          /* noop */
        }
      }

      // Intentos por RUT (query)
      if (rutParam) {
        const normRut = normalizeRut(rutParam);
        const urls = [
          `${API}/${RESOURCE}?rut=${encodeURIComponent(rutParam)}`,
          `${API}/${RESOURCE}?rut_like=${encodeURIComponent(rutParam)}`,
          `${API}/${RESOURCE}?rut=${encodeURIComponent(normRut)}`,
          `${API}/${RESOURCE}?rut_like=${encodeURIComponent(normRut)}`,
        ];
        for (const url of urls) {
          try {
            const r = await fetch(url);
            if (!r.ok) continue;
            const data = await r.json();
            const emp = Array.isArray(data) ? data[0] : data;
            if (emp && !cancel) {
              setEmpleado(emp);
              return;
            }
          } catch {
            /* noop */
          }
        }

        // Fallback: traer todo y filtrar por RUT normalizado
        try {
          const rAll = await fetch(`${API}/${RESOURCE}`);
          if (rAll.ok) {
            const arr = await rAll.json();
            const found = (Array.isArray(arr) ? arr : []).find(
              (e) => normalizeRut(e?.rut) === normRut
            );
            if (found && !cancel) {
              setEmpleado(found);
              return;
            }
          }
        } catch {
          /* noop */
        }
      }

      // Último intento: query por id cuando vino como string
      if (!idParam && rawParam) {
        try {
          const r = await fetch(`${API}/${RESOURCE}?id=${encodeURIComponent(rawParam)}`);
          if (r.ok) {
            const arr = await r.json();
            if (Array.isArray(arr) && arr.length > 0 && !cancel) {
              setEmpleado(arr[0]);
              return;
            }
          }
        } catch {
          /* noop */
        }
      }

      if (!cancel) setNotFound(true);
    };

    fetchEmpleado();
    return () => {
      cancel = true;
    };
  }, [rutParam, idParam, rawParam, API, RESOURCE]);

  const handleChange = (campo, valor) => {
    setEmpleado((prev) => ({ ...prev, [campo]: valor }));
  };

  const guardarEmpleado = async () => {
    if (!empleado) return;
    try {
      const id = empleado.id ?? encodeURIComponent(empleado.rut);
      const url = `${API}/${RESOURCE}/${id}`;
      await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(empleado),
      });
      alert("Cambios guardados correctamente");
      setModoEdicion(false);
    } catch (error) {
      console.error("Error al guardar empleado:", error);
      alert("Error al guardar cambios");
    }
  };

  if (notFound) {
    return (
      <div className="detalle-container">
        <VolverAtras />
        <div style={{ padding: 16, color: "#6B7280" }}>
          Empleado no encontrado. Verifica el RUT/ID o el json-server.
        </div>
      </div>
    );
  }

  if (!empleado) {
    return (
      <div className="detalle-container">
        <VolverAtras />
        <div style={{ padding: 16 }}>Cargando datos del empleado…</div>
      </div>
    );
  }

  const iniciales =
    empleado.nombre
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase() || "";

  // Helper para actualizar hash al cambiar de tab (opcional)
  const selectTab = (tab) => {
    setTabActiva(tab);
    try {
      const newUrl = `${location.pathname}#${tab}`;
      window.history.replaceState(null, "", newUrl);
    } catch {}
  };

  return (
    <div className="detalle-container">
      <VolverAtras />

      {/* Encabezado */}
      <div className="detalle-card-principal">
        <div className="avatar-iniciales">{iniciales}</div>

        <div className="detalle-info-principal">
          <h2 className="nombre-empleado">{empleado.nombre}</h2>
          <p className="cargo-empleado">{empleado.cargo}</p>

          <div className="badges-header">
            <span className="badge-activo">{empleado.estado}</span>
            {empleado.fechaIngreso && (
              <span className="badge-ingreso">Desde {empleado.fechaIngreso}</span>
            )}
            <span className="badge-antiguedad">2 años y 9 meses</span>
          </div>

          <p className="rut-subtle">RUT: {empleado.rut || "—"}</p>
        </div>

        {modoEdicion ? (
          <button className="btn-guardar" onClick={guardarEmpleado}>
            Guardar Cambios
          </button>
        ) : (
          <button className="btn-editar" onClick={() => setModoEdicion(true)}>
            Editar Ficha
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="detalle-tabs">
        {[
          "personales",
          "contractuales",
          "documentos",
          "prevision",
          "bancarios",
          "asistencia",
          "hojaVida",
        ].map((tab) => (
          <button
            key={tab}
            className={tabActiva === tab ? "tab-activa" : ""}
            onClick={() => selectTab(tab)}
          >
            {tab === "hojaVida" ? "Hoja de Vida" : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Contenido por pestaña */}
      {tabActiva === "personales" && (
        <PersonalesTab empleado={empleado} modoEdicion={modoEdicion} onChange={handleChange} />
      )}

      {tabActiva === "contractuales" && (
        <ContractualesTab
          datos={empleado.datosContractuales || {}}
          modoEdicion={modoEdicion}
          onChange={handleChange}
        />
      )}

      {tabActiva === "documentos" && <DocumentosTab rut={empleado.rut} />}

      {tabActiva === "prevision" && (
        <PrevisionTab empleado={empleado} modoEdicion={modoEdicion} onChange={handleChange} />
      )}

      {tabActiva === "bancarios" && (
        <BancariosTab empleado={empleado} modoEdicion={modoEdicion} onChange={handleChange} />
      )}

      {tabActiva === "asistencia" && <AsistenciaTab empleado={empleado} />}

      {tabActiva === "hojaVida" && <HojaDeVida empleado={empleado} />}
    </div>
  );
}
