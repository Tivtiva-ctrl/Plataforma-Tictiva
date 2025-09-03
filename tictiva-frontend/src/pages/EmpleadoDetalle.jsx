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
import { EmpleadosAPI } from "../api"; // ✅ usar la misma capa que ListadoFichas

/* ===========================
   Utils
   =========================== */
const normalizeRut = (r) =>
  (r || "").toString().replace(/\./g, "").replace(/-/g, "").toUpperCase();

const mesesEs = [
  "Enero","Febrero","Marzo","Abril","Mayo","Junio",
  "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];
const fmtFechaLarga = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d)) return "—";
  return `${String(d.getDate()).padStart(2, "0")} de ${mesesEs[d.getMonth()]} de ${d.getFullYear()}`;
};
const antiguedadStr = (desdeISO) => {
  if (!desdeISO) return "";
  const start = new Date(desdeISO);
  const now = new Date();
  if (isNaN(start)) return "";
  const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  const y = Math.floor(months / 12);
  const m = months % 12;
  const aTxt = y === 1 ? "1 año" : `${y} años`;
  const mTxt = m === 1 ? "1 mes" : `${m} meses`;
  return `${aTxt} y ${mTxt}`;
};

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
   Detalle empleado (UI renovada)
   =========================== */
export default function EmpleadoDetalle() {
  const params = useParams();
  const location = useLocation();

  const rawParam = decodeURIComponent(String(params.rut ?? params.id ?? params.param ?? ""));
  const hasParam = rawParam.trim().length > 0;

  const isNumericId = /^\d+$/.test(rawParam);
  const rutParam = hasParam && !isNumericId ? rawParam : undefined;
  const idParam = hasParam && isNumericId ? rawParam : undefined;

  const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";
  const RESOURCE = import.meta.env.VITE_RESOURCE_EMPLEADOS || "empleados";

  const [empleado, setEmpleado] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [tabActiva, setTabActiva] = useState("personales");
  const [modoEdicion, setModoEdicion] = useState(false);

  // Deep-link de pestañas
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

  if (!hasParam) {
    return (
      <div className="ed-wrap">
        <VolverAtras />
        <div style={{ padding: 16, color: "#b45309", background: "#fffbeb", border: "1px solid #f59e0b", borderRadius: 8 }}>
          ⚠️ Falta el parámetro en la URL. Navega a <code>/rrhh/empleado/:id</code> o <code>/rrhh/empleado/:rut</code>.
        </div>
      </div>
    );
  }

  // Carga del empleado: primero desde EmpleadosAPI (localStorage/DB embebida), luego fallbacks HTTP
  useEffect(() => {
    let cancel = false;

    const fetchEmpleado = async () => {
      setNotFound(false);

      // 1) Buscar en la capa centralizada (lo mismo que usa ListadoFichas)
      try {
        const arr = await EmpleadosAPI.list();
        if (Array.isArray(arr) && arr.length) {
          const norm = (v) => normalizeRut(v);
          const byId = idParam ? arr.find((e) => String(e?.id) === String(idParam)) : null;
          const byRut = rutParam ? arr.find((e) => norm(e?.rut) === norm(rutParam)) : null;
          const byEither = !byId && !byRut && rawParam
            ? arr.find((e) => String(e?.id) === String(rawParam) || norm(e?.rut) === norm(rawParam))
            : null;

          const found = byId || byRut || byEither;
          if (found && !cancel) { setEmpleado(found); return; }
        }
      } catch {/* ignore */}

      // 2) Fallbacks HTTP (solo para dev con json-server)
      // por ID directo
      if (idParam) {
        try {
          const r = await fetch(`${API}/${RESOURCE}/${encodeURIComponent(idParam)}`);
          if (r.ok) {
            const emp = await r.json();
            if (emp && !cancel && (emp.id != null || emp.nombre)) { setEmpleado(emp); return; }
          }
        } catch {/* noop */}
      }

      // por RUT (queries)
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
            if (emp && !cancel) { setEmpleado(emp); return; }
          } catch {/* noop */}
        }

        // traer todo y filtrar
        try {
          const rAll = await fetch(`${API}/${RESOURCE}`);
          if (rAll.ok) {
            const arr = await rAll.json();
            const found = (Array.isArray(arr) ? arr : []).find(
              (e) => normalizeRut(e?.rut) === normRut
            );
            if (found && !cancel) { setEmpleado(found); return; }
          }
        } catch {/* noop */}
      }

      // query por id cuando vino como string
      if (!idParam && rawParam) {
        try {
          const r = await fetch(`${API}/${RESOURCE}?id=${encodeURIComponent(rawParam)}`);
          if (r.ok) {
            const arr = await r.json();
            if (Array.isArray(arr) && arr.length > 0 && !cancel) { setEmpleado(arr[0]); return; }
          }
        } catch {/* noop */}
      }

      if (!cancel) setNotFound(true);
    };

    fetchEmpleado();
    return () => { cancel = true; };
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
      <div className="ed-wrap">
        <VolverAtras />
        <div style={{ padding: 16, color: "#6B7280" }}>
          Empleado no encontrado. Verifica el RUT/ID o los datos locales.
        </div>
      </div>
    );
  }

  if (!empleado) {
    return (
      <div className="ed-wrap">
        <VolverAtras />
        <div style={{ padding: 16 }}>Cargando datos del empleado…</div>
      </div>
    );
  }

  const iniciales =
    empleado.nombre?.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() || "";

  const activo = (empleado.estado || "").toLowerCase() === "activo";

  const cumpleISO = empleado.fechaNacimiento || empleado.nacimiento || empleado?.personales?.fechaNacimiento;
  const cumpleTxt = cumpleISO ? fmtFechaLarga(cumpleISO).replace(/^0?(\d{1,2}) de /, (_, d) => `${d} de `) : "—";
  const ingresoTxt = empleado.fechaIngreso ? fmtFechaLarga(empleado.fechaIngreso) : "—";
  const antig = antiguedadStr(empleado.fechaIngreso);

  const selectTab = (tab) => {
    setTabActiva(tab);
    try { window.history.replaceState(null, "", `${location.pathname}#${tab}`); } catch {}
  };

  return (
    <div className="ed-wrap">
      <VolverAtras />

      {/* Encabezado */}
      <div className="ed-card ed-head">
        <div className="ed-avatar">{iniciales}</div>

        <div className="ed-head-main">
          <div className="ed-name-row">
            <h2 className="ed-name">{empleado.nombre || "—"}</h2>
            <span className={`ed-badge ${activo ? "is-ok" : "is-warn"}`}>{empleado.estado || "—"}</span>
          </div>
          <div className="ed-sub">{empleado.cargo || "—"}</div>
          {empleado.fechaIngreso && (
            <div className="ed-sub light">
              Miembro desde el {ingresoTxt} {antig ? `(${antig})` : ""}
            </div>
          )}
        </div>

        {modoEdicion ? (
          <button className="ed-btn primary" onClick={guardarEmpleado}>Guardar Cambios</button>
        ) : (
          <button className="ed-btn" onClick={() => setModoEdicion(true)}>Editar Ficha</button>
        )}
      </div>

      {/* Tabs */}
      <div className="ed-tabs">
        {[
          { id: "personales", label: "Personales" },
          { id: "contractuales", label: "Contractuales" },
          { id: "documentos", label: "Documentos" },
          { id: "asistencia", label: "Asistencia" },
          { id: "hojaVida", label: "Hoja de Vida" },
        ].map((t) => (
          <button
            key={t.id}
            className={`ed-tab ${tabActiva === t.id ? "is-active" : ""}`}
            onClick={() => selectTab(t.id)}
            type="button"
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Grid 2 columnas */}
      <div className="ed-grid">
        <div className="ed-left">
          {tabActiva === "personales" ? (
            <div className="ed-card">
              <h3 className="ed-card-title">Información Personal</h3>
              <div className="ed-kv">
                <div className="ed-kv-row"><span className="ed-kv-label">👤 Nombre Completo:</span><span className="ed-kv-value">{empleado.nombre || "—"}</span></div>
                <div className="ed-kv-row"><span className="ed-kv-label">🪪 Cédula:</span><span className="ed-kv-value">{empleado.rut || "—"}</span></div>
                <div className="ed-kv-row"><span className="ed-kv-label">🎂 Fecha de Nacimiento:</span><span className="ed-kv-value">{cumpleTxt}</span></div>
                <div className="ed-kv-row"><span className="ed-kv-label">✉️ Email:</span><span className="ed-kv-value">{empleado.correo || "—"}</span></div>
                <div className="ed-kv-row"><span className="ed-kv-label">📞 Teléfono:</span><span className="ed-kv-value">{empleado.telefono || "—"}</span></div>
                <div className="ed-kv-row"><span className="ed-kv-label">📍 Dirección:</span><span className="ed-kv-value">{empleado.direccion || "—"}</span></div>
                <div className="ed-kv-row"><span className="ed-kv-label">❤️‍💑 Estado Civil:</span><span className="ed-kv-value">{empleado.estadoCivil || "—"}</span></div>
              </div>
            </div>
          ) : null}

          {tabActiva === "contractuales" && (
            <ContractualesTab
              datos={empleado.datosContractuales || {}}
              modoEdicion={modoEdicion}
              onChange={handleChange}
            />
          )}
          {tabActiva === "documentos" && <DocumentosTab rut={empleado.rut} />}
          {tabActiva === "prevision" && <PrevisionTab empleado={empleado} modoEdicion={modoEdicion} onChange={handleChange} />}
          {tabActiva === "bancarios" && <BancariosTab empleado={empleado} modoEdicion={modoEdicion} onChange={handleChange} />}
          {tabActiva === "asistencia" && <AsistenciaTab empleado={empleado} />}
          {tabActiva === "hojaVida" && <HojaDeVida empleado={empleado} />}
        </div>

        <aside className="ed-right">
          <div className="ed-card">
            <h4 className="ed-card-title">Información Rápida</h4>
            <ul className="ed-quick">
              <li>
                <span className="ed-quick-ico">🎈</span>
                <div>
                  <div className="ed-quick-label">Próximo cumpleaños</div>
                  <div className="ed-quick-val">{cumpleTxt} <span aria-hidden>🎉🎈</span></div>
                </div>
              </li>
              <li>
                <span className="ed-quick-ico">⏰</span>
                <div>
                  <div className="ed-quick-label">Horario</div>
                  <div className="ed-quick-val">{empleado.horario || "08:30 - 18:00"}</div>
                </div>
              </li>
              <li>
                <span className="ed-quick-ico">📌</span>
                <div>
                  <div className="ed-quick-label">Oficina</div>
                  <div className="ed-quick-val">{empleado.centro || "Santiago Centro"}</div>
                </div>
              </li>
            </ul>
          </div>

          <div className="ed-card">
            <h4 className="ed-card-title">Rendimiento</h4>

            <div className="ed-metric">
              <div className="ed-metric-row"><span>Productividad</span><span className="ed-metric-num">92%</span></div>
              <div className="ed-bar"><div className="ed-bar-fill blue" style={{ width: "92%" }} /></div>
            </div>

            <div className="ed-metric">
              <div className="ed-metric-row"><span>Puntualidad</span><span className="ed-metric-num">96%</span></div>
              <div className="ed-bar"><div className="ed-bar-fill green" style={{ width: "96%" }} /></div>
            </div>

            <div className="ed-metric">
              <div className="ed-metric-row"><span>Colaboración</span><span className="ed-metric-num">88%</span></div>
              <div className="ed-bar"><div className="ed-bar-fill purple" style={{ width: "88%" }} /></div>
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        .ed-wrap{padding:16px 16px 32px}
        .ed-card{background:#fff;border:1px solid #E5E7EB;border-radius:16px;padding:16px;box-shadow:0 4px 10px rgba(0,0,0,.04)}
        .ed-head{display:flex;gap:16px;align-items:center;margin-bottom:12px}
        .ed-avatar{width:64px;height:64px;border-radius:16px;background:#E0E7FF;color:#1E3A8A;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:22px}
        .ed-head-main{flex:1;min-width:0}
        .ed-name-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
        .ed-name{margin:0;font-size:24px;font-weight:800;color:#111827}
        .ed-badge{font-weight:700;font-size:12px;border-radius:999px;padding:6px 10px;border:1px solid transparent}
        .ed-badge.is-ok{background:#D1FAE5;color:#065F46;border-color:#A7F3D0}
        .ed-badge.is-warn{background:#FEF3C7;color:#92400E;border-color:#FDE68A}
        .ed-sub{color:#374151;margin-top:2px}
        .ed-sub.light{color:#6B7280}
        .ed-btn{background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:8px 12px;cursor:pointer}
        .ed-btn.primary{background:#1A56DB;color:#fff;border-color:#1A56DB}
        .ed-tabs{display:flex;gap:8px;margin:12px 0 16px;flex-wrap:wrap}
        .ed-tab{background:#fff;border:1px solid #E5E7EB;border-radius:999px;padding:8px 14px;cursor:pointer;color:#374151}
        .ed-tab.is-active{background:#EEF2FF;border-color:#C7D2FE;color:#1E3A8A;font-weight:700}
        .ed-grid{display:grid;grid-template-columns:minmax(0,2fr) minmax(280px,1fr);gap:16px}
        @media (max-width: 980px){ .ed-grid{grid-template-columns:1fr} }
        .ed-left{display:grid;gap:16px}
        .ed-right{display:grid;gap:16px}
        .ed-card-title{margin:0 0 10px;font-size:18px;color:#111827;font-weight:800}
        .ed-kv{display:grid}
        .ed-kv-row{display:flex;justify-content:space-between;gap:12px;padding:14px 2px;border-top:1px solid #F3F4F6}
        .ed-kv-row:first-child{border-top:none}
        .ed-kv-label{color:#6B7280;min-width:220px}
        .ed-kv-value{font-weight:700;color:#111827;text-align:right}
        .ed-quick{list-style:none;margin:0;padding:0;display:grid;gap:12px}
        .ed-quick li{display:flex;gap:10px;align-items:flex-start}
        .ed-quick-ico{font-size:20px;line-height:1}
        .ed-quick-label{color:#6B7280}
        .ed-quick-val{font-weight:700;color:#111827}
        .ed-metric{margin:10px 0}
        .ed-metric-row{display:flex;justify-content:space-between;color:#374151;margin-bottom:6px}
        .ed-metric-num{font-weight:800}
        .ed-bar{height:8px;background:#F3F4F6;border-radius:999px;overflow:hidden}
        .ed-bar-fill{height:100%}
        .ed-bar-fill.blue{background:#3B82F6}
        .ed-bar-fill.green{background:#10B981}
        .ed-bar-fill.purple{background:#8B5CF6}
      `}</style>
    </div>
  );
}
