// Hecho por Asistente de Programación de Google
import React, { useEffect, useState } from "react";

// --- mocks para este entorno. En tu app usa: useParams/useLocation de react-router-dom
const useParams = () => ({ rut: "12345678-9" });
const useLocation = () => ({ pathname: "/", search: "", hash: "" });

// --- mocks date-fns
const parseISO = (iso) => new Date(iso);
const differenceInMinutes = (a, b) => (a.getTime() - b.getTime()) / 60000;

// --- mocks de componentes y API
const VolverAtras = () => (
  <a href="#" style={{ textDecoration: 'none', color: '#3b82f6', fontWeight: '600', marginBottom: '16px', display: 'inline-block' }}>
    &larr; Volver
  </a>
);

const EmpleadosAPI = {
  list: async () => ([{
    id: 1,
    rut: "12.345.678-9",
    nombre: "Juan Díaz Morales",
    cargo: "Gerente de Operaciones",
    estado: "Activo",
    fechaIngreso: "2021-03-02T00:00:00.000Z",
    fechaNacimiento: "1985-04-15T00:00:00.000Z",
    correo: "juan.diaz@empresa.com",
    telefono: "+56 9 8765 4321",
    direccion: "Av. Providencia 1234, Santiago",
    estadoCivil: "Casado(a)",
    horario: "08:30 - 18:00",
    centro: "Casa Matriz",
    datosContractuales: {
      cargoActual: "Gerente de Operaciones",
      tipoContrato: "Indefinido",
      jornada: "Jornada Completa",
      lugarTrabajo: "Casa Matriz",
      responsable: "Claudia R.",
      fechaIngreso: "2021-03-02",
      centroCosto: "Operaciones",
      sueldoBase: 1800000,
      horario: "08:30 - 18:00",
      pinMarcacion: "8421",
      ultimaActualizacion: "2024-12-20",
      anexosFirmados: "Pacto HE 2023; Teletrabajo 2024",
      licencias: "Ninguna",
      contratoFirmado: "Contrato 2021-03-01",
      finiquitoFirmado: ""
    },
    credencialesApp: { pin: "8421" },
    marcas: [
      { fecha: "2025-09-01", hora: "08:58:00", tipo: "Entrada", estado: "Válida", metodo: "App", ip: "192.168.1.10" },
      { fecha: "2025-09-01", hora: "18:02:00", tipo: "Salida",  estado: "Válida", metodo: "App", ip: "192.168.1.10" },
      { fecha: "2025-09-02", hora: "09:12:00", tipo: "Entrada", estado: "Atraso", metodo: "Web", ip: "192.168.1.11" },
      { fecha: "2025-09-02", hora: "18:05:00", tipo: "Salida",  estado: "Válida", metodo: "Web", ip: "192.168.1.11" },
    ],
    historial: [
      { id: 1, fecha: "2024-08-15", hora: "10:00", actor: "V. Mateo", accion: "Anexo de Contrato", categoria: "Contrato", detalle: "Se firma anexo por cambio de cargo a Gerente." },
      { id: 2, fecha: "2023-05-20", hora: "11:30", actor: "Sistema", accion: "Solicitud de Vacaciones", categoria: "Permisos", detalle: "Se aprueban 5 días de vacaciones." },
    ]
  }])
};

const DocumentosTab  = ({ rut }) => <div className="ed-card"><h3 className="ed-card-title">Documentos</h3><p>Contenido de documentos...</p></div>;
const PrevisionTab   = ({ empleado, modoEdicion, onChange }) => <div className="ed-card"><h3 className="ed-card-title">Previsión</h3><p>Contenido de previsión...</p></div>;
const BancariosTab   = ({ empleado, modoEdicion, onChange }) => <div className="ed-card"><h3 className="ed-card-title">Datos Bancarios</h3><p>Contenido de datos bancarios...</p></div>;
const HojaDeVida     = ({ empleado }) => <div className="ed-card"><h3 className="ed-card-title">Hoja de Vida</h3><p>Contenido de hoja de vida...</p></div>;

const ContractualesTab = ({ datos = {}, modoEdicion, onChange, empleado }) => {
  const pick = (v, ...fb) => (v !== undefined && v !== null && String(v) !== "" ? v : fb.find(x => x !== undefined && x !== null && String(x) !== "") || "");
  const safe = (v, dash="—") => (v || v === 0 ? String(v) : dash);
  const view = {
    cargoActual:         pick(datos.cargoActual, empleado?.cargo),
    tipoContrato:        pick(datos.tipoContrato, "Indefinido"),
    jornada:             pick(datos.jornada, empleado?.datosContractuales?.jornada, "Jornada Completa"),
    horario:             pick(datos.horario, empleado?.horario),
    lugarTrabajo:        pick(datos.lugarTrabajo, empleado?.centro, empleado?.oficina),
    centroCosto:         pick(datos.centroCosto, empleado?.area, empleado?.centroCosto),
    responsable:         pick(datos.responsable, empleado?.responsable),
    fechaIngreso:        pick(datos.fechaIngreso, empleado?.fechaIngreso?.slice(0,10)),
    sueldoBase:          pick(datos.sueldoBase, empleado?.datosContractuales?.sueldoBase),
    pinMarcacion:        pick(datos.pinMarcacion, empleado?.credencialesApp?.pin, empleado?.pin),
    ultimaActualizacion: pick(datos.ultimaActualizacion, ""),
    anexosFirmados:      pick(datos.anexosFirmados, ""),
    licencias:           pick(datos.licencias, ""),
    contratoFirmado:     pick(datos.contratoFirmado, ""),
    finiquitoFirmado:    pick(datos.finiquitoFirmado, ""),
  };
  const handleChange = (campo, valor) => onChange?.("datosContractuales", { ...datos, [campo]: valor });

  return (
    <div className="ed-card">
      <h3 className="ed-card-title">Datos Contractuales</h3>
      <div className="ed-2col">
        {[
          ["Cargo Actual", view.cargoActual, "cargoActual", "text"],
          ["Tipo de Contrato", view.tipoContrato, "tipoContrato", "selectContrato"],
          ["Jornada", view.jornada, "jornada", "selectJornada"],
          ["Horario", view.horario, "horario", "text"],
          ["Sucursal / Lugar de Trabajo", view.lugarTrabajo, "lugarTrabajo", "text"],
          ["Centro de Costo / Área", view.centroCosto, "centroCosto", "text"],
          ["Responsable Directo", view.responsable, "responsable", "text"],
          ["Fecha de Ingreso", view.fechaIngreso, "fechaIngreso", "date"],
          ["Sueldo Base", view.sueldoBase ? `$${Number(view.sueldoBase).toLocaleString("es-CL")}` : "", "sueldoBase", "number"],
          ["PIN de Marcación", view.pinMarcacion || "Sin PIN", "pinMarcacion", "text"],
          ["Últ. Actualización de Contrato", view.ultimaActualizacion, "ultimaActualizacion", "date"],
          ["Anexos Firmados", view.anexosFirmados, "anexosFirmados", "text"],
          ["Licencias/Permisos", view.licencias, "licencias", "text"],
          ["Contrato Firmado", view.contratoFirmado, "contratoFirmado", "text"],
          ["Finiquito Firmado", view.finiquitoFirmado, "finiquitoFirmado", "text"],
        ].map(([label, val, key, type], i) => (
          <div className="ed-kv-row" key={i}>
            <span className="ed-kv-label">{label}:</span>
            {modoEdicion ? (
              type === "selectContrato" ? (
                <select value={val} onChange={(e)=>handleChange(key, e.target.value)}>
                  <option>Indefinido</option>
                  <option>Plazo Fijo</option>
                  <option>Honorarios</option>
                  <option>Obra o Faena</option>
                </select>
              ) : type === "selectJornada" ? (
                <select value={val} onChange={(e)=>handleChange(key, e.target.value)}>
                  <option>Jornada Completa</option>
                  <option>Jornada Parcial</option>
                  <option>Por Turnos</option>
                </select>
              ) : (
                <input
                  type={type === "number" ? "number" : type}
                  value={type==="number" ? String(val).replace(/[^\d]/g,"") : val}
                  onChange={(e)=>handleChange(key, e.target.value)}
                />
              )
            ) : (
              <span className="ed-kv-value">{safe(val)}</span>
            )}
          </div>
        ))}
      </div>
      <style>{`
        .ed-2col{
          display:grid; grid-template-columns:1fr 1fr; gap:8px 24px;
        }
        .ed-2col .ed-kv-row{ border-top:none; padding:10px 2px; }
        .ed-2col input, .ed-2col select{
          width:100%; border:1px solid #E5E7EB; border-radius:8px; padding:6px 8px; font-size:14px;
        }
      `}</style>
    </div>
  );
};

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

  const exportResumen = () => alert("Simulación: exportar resumen de asistencia.");
  const exportSemanal = () => alert("Simulación: generar Reporte Semanal PDF para DT.");
  const descargarComprobante = (marca) => alert(`Simulación: descargar comprobante de ${marca.fecha} ${marca.hora}`);

  return (
    <div className="ed-card">
      <div className="asistencia-header">
        <div className="asistencia-title">
          <div className="icono-title" aria-hidden>🕒</div>
          <div>
            <h3 className="ed-card-title" style={{ margin: 0 }}>Resumen de Últimas Marcaciones</h3>
            <p className="ed-sub light" style={{ margin: 0 }}>
              Últimas 10 marcas registradas. Para un historial completo y filtros, usa el botón “Ver Historial Detallado”.
            </p>
          </div>
        </div>
        <div className="asistencia-buttons">
          <button className="ed-btn">Ver Historial Detallado</button>
          <button className="ed-btn" onClick={exportSemanal}>Generar Reporte Semanal (PDF)</button>
          <button className="ed-btn primary" onClick={exportResumen}>⬇ Exportar Resumen (Sim.)</button>
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
            <th>Fecha</th><th>Hora</th><th>Tipo</th><th>Estado</th><th>Método</th><th>IP</th><th>Foto</th><th>Comprobante</th>
          </tr>
        </thead>
        <tbody>
          {(empleado.marcas || []).slice(0, 10).map((m, i) => (
            <tr key={i}>
              <td>{m.fecha}</td>
              <td>{m.hora}</td>
              <td className={`tipo ${(m.tipo || "").toLowerCase()}`}>{m.tipo}</td>
              <td><span className={`estado-badge ${(m.estado || "").toLowerCase()}`}>{m.estado}</span></td>
              <td>{m.metodo}</td>
              <td>{m.ip}</td>
              <td>📷</td>
              <td><button className="ed-btn" onClick={()=>descargarComprobante(m)}>⬇</button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="asistencia-paginacion">Mostrando 10 de {(empleado.marcas || []).length} registros</p>
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

  const API = "http://127.0.0.1:3001";
  const RESOURCE = "empleados";

  const [empleado, setEmpleado] = useState(null);
  const [original, setOriginal] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [tabActiva, setTabActiva] = useState("personales");
  const [modoEdicion, setModoEdicion] = useState(false);

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

  const iniciales =
    empleado.nombre?.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase() || "";
  const activo = (empleado.estado || "").toLowerCase() === "activo";

  const cumpleISO = empleado.fechaNacimiento || empleado.nacimiento || empleado?.personales?.fechaNacimiento;
  const cumpleTxt = cumpleISO ? fmtFechaLarga(cumpleISO).replace(/^0?(\d{1,2}) de /, (_, d) => `${d} de `) : "—";
  const ingresoTxt = empleado.fechaIngreso ? fmtFechaLarga(empleado.fechaIngreso) : "—";
  const antig = antiguedadStr(empleado.fechaIngreso);

  const horario =
    pickCI(empleado, ["horario"], "") ??
    pickCI(empleado?.datosContractuales, ["horario"], "");
  const centro =
    pickCI(empleado, ["centro","oficina"], "") ??
    pickCI(empleado?.datosContractuales, ["centro","oficina"], "");
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

      {/* Grid: en Asistencia pasamos a una sola columna */}
      <div className={`ed-grid ${tabActiva === "asistencia" ? "is-single" : ""}`}>
        <div className="ed-left">
          {tabActiva === "personales" ? (
            <div className="ed-card">
              <h3 className="ed-card-title">Información Personal</h3>
              <div className="ed-kv">
                <div className="ed-kv-row"><span className="ed-kv-label">Nombre Completo:</span><span className="ed-kv-value">{empleado.nombre || "—"}</span></div>
                <div className="ed-kv-row"><span className="ed-kv-label">Cédula:</span><span className="ed-kv-value">{empleado.rut || "—"}</span></div>
                <div className="ed-kv-row"><span className="ed-kv-label">Fecha de Nacimiento:</span><span className="ed-kv-value">{cumpleTxt}</span></div>
                <div className="ed-kv-row"><span className="ed-kv-label">Email:</span><span className="ed-kv-value">{empleado.correo || "—"}</span></div>
                <div className="ed-kv-row"><span className="ed-kv-label">Teléfono:</span><span className="ed-kv-value">{empleado.telefono || "—"}</span></div>
                <div className="ed-kv-row"><span className="ed-kv-label">Dirección:</span><span className="ed-kv-value">{empleado.direccion || "—"}</span></div>
                <div className="ed-kv-row"><span className="ed-kv-label">Estado Civil:</span><span className="ed-kv-value">{empleado.estadoCivil || "—"}</span></div>
              </div>
            </div>
          ) : null}

          {tabActiva === "contractuales" && (
            <ContractualesTab
              datos={empleado.datosContractuales || {}}
              modoEdicion={modoEdicion}
              onChange={handleChange}
              empleado={empleado}
            />
          )}
          {tabActiva === "documentos" && <DocumentosTab rut={empleado.rut} />}
          {tabActiva === "prevision" && <PrevisionTab empleado={empleado} modoEdicion={modoEdicion} onChange={handleChange} />}
          {tabActiva === "bancarios" && <BancariosTab empleado={empleado} modoEdicion={modoEdicion} onChange={handleChange} />}

          {/* === ASISTENCIA: Solo la card de asistencia, sin aside === */}
          {tabActiva === "asistencia" && <AsistenciaTab empleado={empleado} />}

          {tabActiva === "hojaVida" && <HojaDeVida empleado={empleado} />}
          {tabActiva === "historial" && <HistorialTab empleado={empleado} />}
        </div>

        {/* Aside: oculto en Asistencia */}
        {tabActiva !== "asistencia" && (
          <aside className={`ed-right ${tabActiva === "contractuales" ? "is-compact" : ""}`}>
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
        )}
      </div>

      {/* Estilos */}
      <style>{`
        .ed-wrap{padding:16px 16px 32px}
        .ed-card{background:#fff;border:1px solid #E5E7EB;border-radius:16px;padding:var(--pad-card, 16px);box-shadow:0 4px 10px rgba(0,0,0,.04)}
        .ed-head{display:flex;gap:16px;align-items:center;margin-bottom:12px}
        .ed-avatar{width:64px;height:64px;border-radius:16px;background:#E0E7FF;color:#1E3A8A;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;}
        .ed-head-main{flex:1;min-width:0}
        .ed-name-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
        .ed-name{margin:0;font-size:24px;font-weight:800;color:#111827}
        .ed-badge{font-weight:700;font-size:12px;border-radius:999px;padding:6px 10px;border:1px solid transparent}
        .ed-badge.is-ok{background:#D1FAE5;color:#065F46;border-color:#A7F3D0}
        .ed-badge.is-warn{background:#FEF3C7;color:#92400E;border-color:#FDE68A}
        .ed-sub{color:#374151;margin-top:2px}
        .ed-sub.light{color:#6B7280}
        .ed-btn{background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:8px 12px;cursor:pointer;font-weight:600;}
        .ed-btn.primary{background:#1A56DB;color:#fff;border-color:#1A56DB}
        .ed-tabs{display:flex;gap:8px;margin:12px 0 16px;flex-wrap:wrap;border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;}
        .ed-tab{background:transparent;border:none;border-bottom: 3px solid transparent; border-radius:0; padding:8px 4px;cursor:pointer;color:#374151; font-weight:600;}
        .ed-tab.is-active{border-bottom-color:#1A56DB;color:#1A56DB;font-weight:700}

        .ed-grid{display:grid;grid-template-columns:minmax(0,2fr) minmax(280px,1fr);gap:16px}
        .ed-grid.is-single{grid-template-columns:1fr;} /* ← asistencia sin aside */
        @media (max-width: 980px){ .ed-grid{grid-template-columns:1fr} }
        .ed-left{display:flex; flex-direction: column; gap:16px}
        .ed-right{display:flex; flex-direction: column; gap:16px}
        .ed-card-title{margin:0 0 10px;font-size:var(--title-size, 18px);color:#111827;font-weight:800}
        .ed-kv{display:grid}
        .ed-kv-row{display:flex;justify-content:space-between;gap:12px;padding:14px 2px;border-top:1px solid #F3F4F6}
        .ed-kv-row:first-child{border-top:none}
        .ed-kv-label{color:#6B7280;min-width:220px}
        .ed-kv-value{font-weight:700;color:#111827;text-align:right}
        .ed-quick{list-style:none;margin:0;padding:0;display:grid;gap:var(--quick-gap, 12px)}
        .ed-quick li{display:flex;gap:10px;align-items:flex-start}
        .ed-quick-ico{font-size:var(--quick-ico, 20px);line-height:1}
        .ed-quick-label{color:#6B7280; font-size: var(--label-size, 14px);}
        .ed-quick-val{font-weight:700;color:#111827}
        .ed-sep{height:1px;background:#F3F4F6;margin:12px 0}
        .ed-vac{margin-top:6px}
        .ed-vac-row{display:flex;justify-content:space-between;align-items:center}
        .ed-vac-sub{color:#6B7280;font-size:12px;margin-top:4px}
        .ed-metric{margin:var(--metric-gap, 10px) 0}
        .ed-metric-row{display:flex;justify-content:space-between;color:#374151;margin-bottom:6px}
        .ed-metric-num{font-weight:800}
        .ed-bar{height:var(--bar-h, 8px);background:#F3F4F6;border-radius:999px;overflow:hidden}
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

        /* Compacto en Contractuales */
        .ed-right.is-compact .ed-card{ padding:12px; border-radius:12px; }
        .ed-right.is-compact .ed-card-title{ font-size:16px; margin-bottom:8px; }
        .ed-right.is-compact .ed-quick{ gap:8px; }
        .ed-right.is-compact .ed-quick-ico{ font-size:18px; }
        .ed-right.is-compact .ed-quick-label{ font-size:12px; }
        .ed-right.is-compact .ed-quick-val{ font-weight:600; }
        .ed-right.is-compact .ed-sep{ margin:8px 0; }
        .ed-right.is-compact .ed-vac{ margin-top:4px; }
        .ed-right.is-compact .ed-metric{ margin:6px 0; }
        .ed-right.is-compact .ed-metric-row{ font-size:13px; }
        .ed-right.is-compact .ed-bar{ height:6px; }

        /* Asistencia mini estilos */
        .asistencia-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}
        .asistencia-title{display:flex;gap:10px;align-items:flex-start}
        .icono-title{font-size:22px;margin-top:2px}
        .asistencia-buttons{display:flex;gap:8px;flex-wrap:wrap}
        .metricas-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:10px 0 12px}
        @media (max-width: 900px){ .metricas-grid{grid-template-columns:repeat(2,minmax(0,1fr));} }
        .metric-card{display:flex;align-items:center;justify-content:space-between;border:1px solid #E5E7EB;border-radius:12px;padding:10px 12px;background:#fff}
        .metric-label{color:#6B7280;margin:0}
        .metric-value{font-weight:800;margin:0}
        .metric-value.green{color:#059669}
        .metric-value.yellow{color:#D97706}
        .metric-value.blue{color:#2563EB}
        .metric-icon{font-size:18px}
        .asistencia-tabla{width:100%;border-collapse:collapse}
        .asistencia-tabla th,.asistencia-tabla td{border-bottom:1px solid #F3F4F6;padding:10px 8px;text-align:left}
        .estado-badge{display:inline-block;padding:2px 8px;border-radius:999px;font-size:12px;border:1px solid #E5E7EB;color:#374151}
        .estado-badge.atraso{background:#FEF3C7;color:#92400E;border-color:#FDE68A}
        .tipo.entrada{color:#059669;font-weight:700}
        .tipo.salida{color:#7C3AED;font-weight:700}
      `}</style>
    </div>
  );
}
