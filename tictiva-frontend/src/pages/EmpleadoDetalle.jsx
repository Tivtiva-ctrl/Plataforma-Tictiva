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
import { EmpleadosAPI } from "../api";

/* =========================== Utils =========================== */
const normalizeRut = (r) =>
  (r || "").toString().replace(/\./g, "").replace(/-/g, "").toUpperCase();

const mesesEs = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

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

const pickCI = (obj, keys = [], fallback = undefined) => {
  if (!obj) return fallback;
  const map = Object.fromEntries(Object.entries(obj).map(([k, v]) => [String(k).toLowerCase(), v]));
  for (const k of keys) {
    const v = map[String(k).toLowerCase()];
    if (v !== undefined && v !== null && String(v) !== "") return v;
  }
  return fallback;
};
const round1 = (n) => Math.round((Number(n) || 0) * 10) / 10;
const monthsBetween = (a, b) => {
  let m = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) m -= 1;
  return Math.max(0, m);
};

/** Vacaciones: 1.25 d/mes; parcial → 0.5; progresivos: >=10 años, +1 cada 3 */
const computeVacaciones = (empleado) => {
  const ingreso = empleado?.fechaIngreso ? new Date(empleado.fechaIngreso) : null;
  if (!ingreso || isNaN(ingreso)) {
    return { devengadas: 0, tomadas: 0, saldo: 0, detalle: "Sin fecha de ingreso", progresivos: 0, months: 0, jornada: "" };
  }
  const now = new Date();
  const months = monthsBetween(ingreso, now);

  const jornada =
    pickCI(empleado, ["jornada"], undefined) ??
    pickCI(empleado?.datosContractuales, ["jornada"], "Jornada Completa");

  const factor = (typeof jornada === "string" && jornada.toLowerCase().includes("parcial")) ? 0.5 : 1;
  const devBase = months * 1.25 * factor;

  const prevYears = Number(pickCI(empleado, ["aniosPrevios","añosPrevios"], 0)) || 0;
  const totalYears = Math.floor(months / 12) + prevYears;
  let progresivos = 0;
  if (totalYears >= 10) progresivos = Math.floor((totalYears - 10) / 3);

  const tomadas =
    Number(
      pickCI(empleado, ["vacacionesTomadas","diasVacTomados","vacaciones_tomadas"], 0) ??
      pickCI(empleado?.vacaciones, ["tomadas"], 0)
    ) || 0;

  const devengadas = round1(devBase + progresivos);
  return { devengadas, tomadas: round1(tomadas), saldo: round1(devengadas - tomadas), jornada: jornada || "", months, progresivos };
};

/* ======================= Tab: Asistencia ====================== */
function AsistenciaTab({ empleado }) {
  const [metricas, setMetricas] = useState({ horasTrabajadas: 0, porcentajeAsistencia: 0, atrasosMes: 0, horasExtra: 0 });

  useEffect(() => {
    if (!empleado?.marcas) return;
    let horas = 0, atrasos = 0;
    const diasAsistidos = new Set();

    empleado.marcas.forEach((marca) => {
      diasAsistidos.add(marca.fecha);
      if ((marca.estado || "").toLowerCase() === "atraso") atrasos++;
      if ((marca.tipo || "").toLowerCase() === "entrada") {
        const salida = empleado.marcas.find((m) => m.fecha === marca.fecha && (m.tipo || "").toLowerCase() === "salida");
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
            <p>Últimas 10 marcas registradas. Para un historial completo y filtros, usa el botón &quot;Ver Historial Detallado&quot;.</p>
          </div>
        </div>
        <div className="asistencia-buttons">
          <button className="btn-detalle">📊 Ver Historial Detallado</button>
          <button className="btn-exportar">⬇ Exportar Resumen (Sim.)</button>
        </div>
      </div>

      <div className="metricas-grid">
        <div className="metric-card"><div className="metric-info"><p className="metric-label">Horas Trabajadas (Mes)</p><p className="metric-value">{metricas.horasTrabajadas}h</p></div><div className="metric-icon">🕑</div></div>
        <div className="metric-card"><div className="metric-info"><p className="metric-label">Asistencia</p><p className="metric-value green">{metricas.porcentajeAsistencia}%</p></div><div className="metric-icon">📅</div></div>
        <div className="metric-card"><div className="metric-info"><p className="metric-label">Atrasos (Mes)</p><p className="metric-value yellow">{metricas.atrasosMes}</p></div><div className="metric-icon">⚠️</div></div>
        <div className="metric-card"><div className="metric-info"><p className="metric-label">Horas Extra</p><p className="metric-value blue">{metricas.horasExtra}h</p></div><div className="metric-icon">➕</div></div>
      </div>

      <table className="asistencia-tabla">
        <thead><tr><th>Fecha</th><th>Hora</th><th>Tipo</th><th>Estado</th><th>Método</th><th>IP</th><th>Foto</th></tr></thead>
        <tbody>
          {empleado.marcas?.slice(0, 10).map((marca, index) => (
            <tr key={index}>
              <td>{marca.fecha}</td><td>{marca.hora}</td>
              <td className={`tipo ${(marca.tipo || "").toLowerCase()}`}>{marca.tipo}</td>
              <td><span className={`estado-badge ${(marca.estado || "").toLowerCase()}`}>{marca.estado}</span></td>
              <td>{marca.metodo}</td><td>{marca.ip}</td><td>📷</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="asistencia-paginacion">Mostrando 10 de 45 registros</p>
    </div>
  );
}

/* ===================== Tab: Historial (DT) ==================== */
function HistorialTab({ empleado }) {
  const base = [
    ...(Array.isArray(empleado?.historial) ? empleado.historial : []),
    ...(Array.isArray(empleado?.movimientos) ? empleado.movimientos : []),
    ...(Array.isArray(empleado?._audit) ? empleado._audit : []),
  ];

  if (!base.length && empleado?.fechaIngreso) {
    base.push({ id: "seed-ingreso", fecha: empleado.fechaIngreso, hora: "09:00", actor: "Sistema", accion: "Ingreso a la empresa", detalle: `Fecha de ingreso registrada (${fmtFechaLarga(empleado.fechaIngreso)})`, categoria: "Contrato" });
  }

  const items = [...base].sort((a, b) => {
    const ta = new Date(`${a.fecha || a.timestamp || a.fechaHora || ""}T${a.hora || "00:00"}`).getTime();
    const tb = new Date(`${b.fecha || b.timestamp || b.fechaHora || ""}T${b.hora || "00:00"}`).getTime();
    return tb - ta;
  });

  const exportCSV = () => {
    const headers = ["fecha","hora","actor","accion","categoria","detalle"];
    const rows = items.map(i => [i.fecha || "", i.hora || "", i.actor || "", i.accion || "", i.categoria || "", (i.detalle || "").toString().replace(/\n/g, " ")]);
    const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `historial-${(empleado?.rut || empleado?.id || "empleado")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="htl-wrap ed-card">
      <div className="htl-head">
        <div>
          <h3 className="ed-card-title" style={{ margin: 0 }}>Historial del Empleado</h3>
          <div className="htl-sub">Bitácora de eventos requerida por la Dirección del Trabajo (DT).</div>
        </div>
        <button type="button" className="ed-btn" onClick={exportCSV}>⬇ Exportar CSV</button>
      </div>

      {items.length === 0 ? (
        <div style={{ color:"#6B7280" }}>Aún no hay movimientos registrados.</div>
      ) : (
        <ul className="htl-list">
          {items.map((it, idx) => (
            <li key={it.id || idx} className="htl-item">
              <div className="htl-time">
                <div className="htl-date">{it.fecha ? fmtFechaLarga(it.fecha) : "—"}</div>
                <div className="htl-hour">{it.hora || "—"}</div>
              </div>
              <div className="htl-dot" />
              <div className="htl-body">
                <div className="htl-row1">
                  <span className="htl-accion">{it.accion || "Evento"}</span>
                  {it.categoria ? <span className="htl-cat">{it.categoria}</span> : null}
                </div>
                <div className="htl-det">{it.detalle || "—"}</div>
                <div className="htl-foot">Por <b>{it.actor || "Sistema"}</b></div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ================== Detalle empleado (UI) ===================== */
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
  const [original, setOriginal] = useState(null);
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
      historial: "historial",
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

  // Carga del empleado
  useEffect(() => {
    let cancel = false;

    const fetchEmpleado = async () => {
      setNotFound(false);

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
          if (found && !cancel) { setEmpleado(found); setOriginal(JSON.parse(JSON.stringify(found))); return; }
        }
      } catch {/* ignore */}

      if (idParam) {
        try {
          const r = await fetch(`${API}/${RESOURCE}/${encodeURIComponent(idParam)}`);
          if (r.ok) {
            const emp = await r.json();
            if (emp && !cancel && (emp.id != null || emp.nombre)) { setEmpleado(emp); setOriginal(JSON.parse(JSON.stringify(emp))); return; }
          }
        } catch {/* noop */}
      }

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
            if (emp && !cancel) { setEmpleado(emp); setOriginal(JSON.parse(JSON.stringify(emp))); return; }
          } catch {/* noop */}
        }
        try {
          const rAll = await fetch(`${API}/${RESOURCE}`);
          if (rAll.ok) {
            const arr = await rAll.json();
            const found = (Array.isArray(arr) ? arr : []).find((e) => normalizeRut(e?.rut) === normRut);
            if (found && !cancel) { setEmpleado(found); setOriginal(JSON.parse(JSON.stringify(found))); return; }
          }
        } catch {/* noop */}
      }

      if (!idParam && rawParam) {
        try {
          const r = await fetch(`${API}/${RESOURCE}?id=${encodeURIComponent(rawParam)}`);
          if (r.ok) {
            const arr = await r.json();
            if (Array.isArray(arr) && arr.length > 0 && !cancel) { setEmpleado(arr[0]); setOriginal(JSON.parse(JSON.stringify(arr[0]))); return; }
          }
        } catch {/* noop */}
      }

      if (!cancel) setNotFound(true);
    };

    fetchEmpleado();
    return () => { cancel = true; };
  }, [rutParam, idParam, rawParam, API, RESOURCE]);

  const handleChange = (campo, valor) => setEmpleado((prev) => ({ ...prev, [campo]: valor }));

  const guardarEmpleado = async () => {
    if (!empleado) return;
    try {
      const diffs = [];
      const keys = new Set([...Object.keys(original || {}), ...Object.keys(empleado || {})]);
      keys.forEach((k) => {
        const a = JSON.stringify(original?.[k]);
        const b = JSON.stringify(empleado?.[k]);
        if (a !== b) diffs.push(k);
      });

      const nuevaEntrada = {
        id: Date.now(),
        fecha: new Date().toISOString().slice(0,10),
        hora: new Date().toTimeString().slice(0,5),
        actor: "Sistema",
        accion: "Actualización de ficha",
        categoria: "Ficha",
        detalle: diffs.length ? `Campos modificados: ${diffs.join(", ")}` : "Sin cambios detectados",
      };

      const payload = { ...empleado, historial: [...(Array.isArray(empleado.historial) ? empleado.historial : []), nuevaEntrada] };
      const id = payload.id ?? encodeURIComponent(payload.rut);
      const url = `${API}/${RESOURCE}/${id}`;
      await fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

      setEmpleado(payload);
      setOriginal(JSON.parse(JSON.stringify(payload)));
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
        <div style={{ padding: 16, color: "#6B7280" }}>Empleado no encontrado. Verifica el RUT/ID o los datos locales.</div>
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

  const iniciales = empleado.nombre?.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() || "";
  const activo = (empleado.estado || "").toLowerCase() === "activo";

  const cumpleISO = empleado.fechaNacimiento || empleado.nacimiento || empleado?.personales?.fechaNacimiento;
  const cumpleTxt = cumpleISO ? fmtFechaLarga(cumpleISO).replace(/^0?(\d{1,2}) de /, (_, d) => `${d} de `) : "—";
  const ingresoTxt = empleado.fechaIngreso ? fmtFechaLarga(empleado.fechaIngreso) : "—";
  const antig = antiguedadStr(empleado.fechaIngreso);

  const horario = pickCI(empleado, ["horario"], "") ?? pickCI(empleado?.datosContractuales, ["horario"], "");
  const centro = pickCI(empleado, ["centro","oficina"], "") ?? pickCI(empleado?.datosContractuales, ["centro","oficina"], "");
  const vac = computeVacaciones(empleado);

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
          {empleado.fechaIngreso && (<div className="ed-sub light">Miembro desde el {ingresoTxt} {antig ? `(${antig})` : ""}</div>)}
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
          { id: "prevision", label: "Previsión" },
          { id: "bancarios", label: "Bancarios" },
          { id: "asistencia", label: "Asistencia" },
          { id: "hojaVida", label: "Hoja de Vida" },
          { id: "historial", label: "Historial" },
        ].map((t) => (
          <button key={t.id} className={`ed-tab ${tabActiva === t.id ? "is-active" : ""}`} onClick={() => selectTab(t.id)} type="button">
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
            <ContractualesTab datos={empleado.datosContractuales || {}} modoEdicion={modoEdicion} onChange={handleChange} />
          )}
          {tabActiva === "documentos" && <DocumentosTab rut={empleado.rut} />}
          {tabActiva === "prevision" && <PrevisionTab empleado={empleado} modoEdicion={modoEdicion} onChange={handleChange} />}
          {tabActiva === "bancarios" && <BancariosTab empleado={empleado} modoEdicion={modoEdicion} onChange={handleChange} />}
          {tabActiva === "asistencia" && <AsistenciaTab empleado={empleado} />}
          {tabActiva === "hojaVida" && <HojaDeVida empleado={empleado} />}
          {tabActiva === "historial" && <HistorialTab empleado={empleado} />}
        </div>

        {/* Compacta SOLO en Contractuales con variables + !important */}
        <aside
          className={`ed-right ${tabActiva === "contractuales" ? "is-compact" : ""}`}
          style={
            tabActiva === "contractuales"
              ? {
                  ["--pad-card"]: "12px",
                  ["--title-size"]: "16px",
                  ["--quick-gap"]: "8px",
                  ["--quick-ico"]: "18px",
                  ["--label-size"]: "12px",
                  ["--bar-h"]: "6px",
                  ["--metric-gap"]: "6px",
                }
              : undefined
          }
        >
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
                  <div className="ed-quick-val">{horario || "08:30 - 18:00"}</div>
                </div>
              </li>
              <li>
                <span className="ed-quick-ico">📌</span>
                <div>
                  <div className="ed-quick-label">Oficina</div>
                  <div className="ed-quick-val">{centro || "Santiago Centro"}</div>
                </div>
              </li>
            </ul>

            <div className="ed-sep" />

            <h4 className="ed-card-title" style={{marginTop:8}}>Vacaciones</h4>
            <div className="ed-vac">
              <div className="ed-vac-row"><span>Saldo</span><b>{vac.saldo} días</b></div>
              <div className="ed-vac-sub">Devengadas: {vac.devengadas} · Tomadas: {vac.tomadas}</div>
              {vac.progresivos > 0 && (<div className="ed-vac-sub">Incluye {vac.progresivos} día(s) progresivo(s)</div>)}
              {vac.jornada ? <div className="ed-vac-sub">Jornada: {vac.jornada}</div> : null}
            </div>
          </div>

          <div className="ed-card">
            <h4 className="ed-card-title">Rendimiento</h4>
            <div className="ed-metric"><div className="ed-metric-row"><span>Productividad</span><span className="ed-metric-num">92%</span></div><div className="ed-bar"><div className="ed-bar-fill blue" style={{ width: "92%" }} /></div></div>
            <div className="ed-metric"><div className="ed-metric-row"><span>Puntualidad</span><span className="ed-metric-num">96%</span></div><div className="ed-bar"><div className="ed-bar-fill green" style={{ width: "96%" }} /></div></div>
            <div className="ed-metric"><div className="ed-metric-row"><span>Colaboración</span><span className="ed-metric-num">88%</span></div><div className="ed-bar"><div className="ed-bar-fill purple" style={{ width: "88%" }} /></div></div>
          </div>
        </aside>
      </div>

      {/* Estilos mínimos embebidos */}
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
        .ed-sep{height:1px;background:#F3F4F6;margin:12px 0}
        .ed-vac{margin-top:6px}
        .ed-vac-row{display:flex;justify-content:space-between;align-items:center}
        .ed-vac-sub{color:#6B7280;font-size:12px;margin-top:4px}
        .ed-metric{margin:10px 0}
        .ed-metric-row{display:flex;justify-content:space-between;color:#374151;margin-bottom:6px}
        .ed-metric-num{font-weight:800}
        .ed-bar{height:8px;background:#F3F4F6;border-radius:999px;overflow:hidden}
        .ed-bar-fill{height:100%}
        .ed-bar-fill.blue{background:#3B82F6}
        .ed-bar-fill.green{background:#10B981}
        .ed-bar-fill.purple{background:#8B5CF6}

        /* Historial */
        .htl-wrap{padding:12px}
        .htl-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
        .htl-sub{color:#6B7280;margin-top:4px}
        .htl-list{list-style:none;margin:0;padding:0;position:relative}
        .htl-item{display:grid;grid-template-columns:140px 24px 1fr;gap:8px;padding:10px 0;border-top:1px solid #F3F4F6}
        .htl-item:first-child{border-top:none}
        .htl-time{color:#6B7280}
        .htl-date{font-weight:700;color:#374151}
        .htl-hour{font-size:12px}
        .htl-dot{width:10px;height:10px;border-radius:999px;background:#3B82F6;margin:auto}
        .htl-row1{display:flex;gap:8px;align-items:center;margin-bottom:4px}
        .htl-accion{font-weight:800;color:#111827}
        .htl-cat{background:#EEF2FF;color:#1E3A8A;border:1px solid #C7D2FE;padding:2px 8px;border-radius:999px;font-size:12px}
        .htl-det{color:#374151}
        .htl-foot{color:#6B7280;font-size:12px;margin-top:4px}

        /* ===== Variables + overrides para compactar SOLO en Contractuales ===== */
        .ed-right{
          --pad-card: 16px;
          --title-size: 18px;
          --quick-gap: 12px;
          --quick-ico: 20px;
          --label-size: 14px;
          --bar-h: 8px;
          --metric-gap: 10px;
        }
        .ed-right .ed-card{ padding: var(--pad-card) !important; }
        .ed-right .ed-card-title{ font-size: var(--title-size) !important; margin:0 0 8px; }
        .ed-right .ed-quick{ gap: var(--quick-gap) !important; }
        .ed-right .ed-quick-ico{ font-size: var(--quick-ico) !important; }
        .ed-right .ed-quick-label{ font-size: var(--label-size) !important; }
        .ed-right .ed-metric{ margin: var(--metric-gap) 0 !important; }
        .ed-right .ed-bar{ height: var(--bar-h) !important; }

        .ed-right.is-compact{
          --pad-card: 12px;
          --title-size: 16px;
          --quick-gap: 8px;
          --quick-ico: 18px;
          --label-size: 12px;
          --bar-h: 6px;
          --metric-gap: 6px;
        }
      `}</style>
    </div>
  );
}
