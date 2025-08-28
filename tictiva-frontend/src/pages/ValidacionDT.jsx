// src/pages/ValidacionDT.jsx
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import HRSubnav from "../components/HRSubnav";
import "./ValidacionDT.css";
import { empleadoTabURL } from "../utils/empleadoLinks";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";

// Helpers
const initials = (name = "") =>
  name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

const statusClass = (s) =>
  s === "ok" ? "vdt-card ok" : s === "warn" ? "vdt-card warn" : "vdt-card danger";

/** Enlace robusto al TAB Documentos de la ficha de un empleado */
const toDocs = (rut) => {
  let candidate = null;
  try {
    candidate = empleadoTabURL?.(rut, "documentos");
  } catch {
    candidate = null;
  }
  if (typeof candidate === "string" && /\/rrhh\/empleado/.test(candidate)) {
    const hasSearch = candidate.includes("?");
    const hasHash = candidate.includes("#");
    const qs = "tab=documentos&open=documentos&active=documentos&auto=1";
    return `${candidate}${hasSearch ? "&" : "?"}${qs}${hasHash ? "" : "#documentos"}`;
  }
  return {
    pathname: `/rrhh/empleado/rut/${encodeURIComponent(rut)}`,
    search: `?tab=documentos&open=documentos&active=documentos&auto=1`,
    hash: "#documentos",
  };
};

/** Enlace directo al módulo Asistencia → Marcas Registradas con el empleado precargado */
const toMarcasRegistradas = (rut, nombre) => ({
  pathname: "/asistencia/marcas",
  search: `?empleado_rut=${encodeURIComponent(rut)}&empleado_nombre=${encodeURIComponent(
    nombre
  )}&auto=1`,
});

export default function ValidacionDT() {
  const [tab, setTab] = useState("panel"); // "panel" | "accesos"
  const [loading] = useState(false);

  // ---- Demo/estado inicial ----
  const [resumen] = useState({
    asistenciaCobertura7d: 0.97,
    marcasConEvidencia: 0.92,
    limitesCasosSemana: 2,
    colacionOk: 0.99,
    docsFaltantes: [
      {
        rut: "12.345.678-9",
        nombre: "Juan Díaz Morales",
        faltan: ["Anexo de Jornada", "Consentimiento Biométrico"],
      },
      {
        rut: "16.789.012-3",
        nombre: "Carlos Rodríguez Vega",
        faltan: ["Consentimiento Biométrico"],
      },
    ],
    backupLast: "Hoy 03:00",
  });

  const [limites] = useState([
    {
      rut: "14.567.890-1",
      nombre: "María Pérez Lagos",
      fecha: "2025-08-12",
      pactada: "09:00–18:00",
      real: "09:01–20:35",
      exceso: "2:35",
      aprobo: "María González",
      obs: "Proyecto X",
    },
    {
      rut: "15.432.109-7",
      nombre: "Luis Soto Parra",
      fecha: "2025-08-13",
      pactada: "09:00–18:00",
      real: "08:58–19:45",
      exceso: "0:45",
      aprobo: "Jefe Área",
      obs: "",
    },
  ]);

  const [auditoria] = useState([
    { id: 1, ts: "2024-07-30 10:15", usuario: "Laura RRHH", accion: "Justificación añadida", recurso: "Juan Díaz Morales", detalle: "Licencia Médica #123", ip: "10.1.2.3", obs: "" },
    { id: 2, ts: "2024-07-29 16:30", usuario: "Roberto AdminEmpresa", accion: "Edición de marca", recurso: "María Pérez Lagos", detalle: "Salida 18:02 → 18:05", ip: "10.1.2.4", obs: "Error en marcaje original." },
    { id: 3, ts: "2024-07-28 09:00", usuario: "Sistema", accion: "Marca automática anulada", recurso: "Luis Soto Parra", detalle: "Detección de duplicado", ip: "-", obs: "" },
  ]);

  // Push-pops
  const [panelDocs, setPanelDocs] = useState(null); // {rut, nombre, faltan[]}
  const [panelLimites, setPanelLimites] = useState(false);

  // Filtros bitácora
  const [q, setQ] = useState("");
  const [fDesde, setFDesde] = useState("");
  const [fHasta, setFHasta] = useState("");

  // Accesos DT (demo)
  const [codes, setCodes] = useState([
    {
      id: "c1",
      code: "VALIDTESTCODE",
      fiscalizador: "Fiscalizador de Prueba Global",
      inicio: "2025-08-16T00:00",
      fin: "2025-08-18T23:59",
      ambito: "Acceso de prueba para todos los datos de Prueba 1",
      creadoPor: "Alicia (SuperAdmin)",
      creadoTs: "2025-08-16 17:54",
    },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [nuevo, setNuevo] = useState({
    nombre: "",
    code: "",
    desde: "",
    hasta: "",
    horaHasta: "23:59",
    ambito: "Acceso completo a los registros de asistencia del período para fiscalización DT.",
  });

  // Estados calculados
  const estadoAsistencia =
    resumen.asistenciaCobertura7d >= 0.9 ? "ok" : resumen.asistenciaCobertura7d >= 0.75 ? "warn" : "danger";
  const estadoTrazabilidad =
    resumen.marcasConEvidencia >= 0.85 ? "ok" : resumen.marcasConEvidencia >= 0.6 ? "warn" : "danger";
  const estadoLimites =
    resumen.limitesCasosSemana >= 3 ? "danger" : resumen.limitesCasosSemana >= 1 ? "warn" : "ok";
  const estadoColacion = resumen.colacionOk >= 0.95 ? "ok" : resumen.colacionOk >= 0.8 ? "warn" : "danger";
  const estadoDocs = (resumen.docsFaltantes?.length || 0) > 0 ? "danger" : "ok";
  const estadoBackups = "ok";

  const auditoriaFiltrada = useMemo(() => {
    return auditoria.filter((a) => {
      const okQ = q ? `${a.usuario} ${a.recurso} ${a.accion}`.toLowerCase().includes(q.toLowerCase()) : true;
      const okDesde = fDesde ? a.ts >= `${fDesde} 00:00` : true;
      const okHasta = fHasta ? a.ts <= `${fHasta} 23:59` : true;
      return okQ && okDesde && okHasta;
    });
  }, [auditoria, q, fDesde, fHasta]);

  const codeStatus = (c) => {
    const now = new Date();
    const start = new Date(c.inicio);
    const end = new Date(c.fin);
    if (now < start) return "Generado";
    if (now > end) return "Expirado";
    return "Activo";
  };
  const statusPill = (s) => (s === "Generado" ? "pill pill-gen" : s === "Activo" ? "pill pill-act" : "pill pill-exp");

  const genCode = () => {
    const r1 = Math.random().toString(36).slice(2, 7).toUpperCase();
    const r2 = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `DT-${r1}${Math.floor(Math.random() * 9)}-${r2}`;
  };

  const crearCodigo = async () => {
    const code = nuevo.code || genCode();
    const item = {
      id: `c-${Date.now()}`,
      code,
      fiscalizador: nuevo.nombre || "Fiscalizador DT",
      inicio: `${nuevo.desde || new Date().toISOString().slice(0, 10)}T00:00`,
      fin: `${nuevo.hasta || new Date().toISOString().slice(0, 10)}T${nuevo.horaHasta || "23:59"}`,
      ambito: nuevo.ambito,
      creadoPor: "Verónica (Admin)",
      creadoTs: new Date().toISOString().slice(0, 16).replace("T", " "),
    };
    setCodes((p) => [item, ...p]);
    setModalOpen(false);
    try {
      await navigator.clipboard?.writeText(item.code);
      alert(`Código ${item.code} creado y copiado al portapapeles`);
    } catch {
      alert(`Código ${item.code} creado`);
    }
  };

  return (
    <div className="vdt-wrap">
      <HRSubnav />

      {/* Tabs internas */}
      <div className="vdt-tabsbar">
        <div className="vdt-tabs">
          <button className={`vdt-tab ${tab === "panel" ? "is-active" : ""}`} onClick={() => setTab("panel")}>
            Panel de Cumplimiento
          </button>
          <button className={`vdt-tab ${tab === "accesos" ? "is-active" : ""}`} onClick={() => setTab("accesos")}>
            Accesos para Fiscalizadores DT
          </button>
        </div>
      </div>

      {tab === "panel" ? (
        <>
          {/* Header */}
          <div className="vdt-hero">
            <div className="vdt-hero-ico">☑️</div>
            <div>
              <h1 className="vdt-title">Validación y Cumplimiento Normativo (DT)</h1>
              <p className="vdt-subtitle">
                Herramientas, checklists y reportes para asegurar la conformidad con los requerimientos de la
                Dirección del Trabajo de Chile.
              </p>
            </div>
          </div>

          {/* Resumen (cards) */}
          <div className="vdt-panel">
            <div className="vdt-panel-head">
              <div className="vdt-panel-ico">🧾</div>
              <div>
                <h2 className="vdt-h2">Panel Resumen de Cumplimiento</h2>
                <p className="vdt-muted">Estado general de los aspectos clave del cumplimiento legal y normativo.</p>
              </div>
              <div className="vdt-panel-actions">
                <button className="vdt-btn" onClick={() => alert("Export demo")}>⬇ Exportar</button>
              </div>
            </div>

            <div className="vdt-grid">
              {/* Registro de Asistencia */}
              <div className={statusClass(estadoAsistencia)} title="OK si ≥90% de jornadas con 2 marcas válidas (7 días).">
                <div className="vdt-card-title">
                  <span>Registro de Asistencia</span>
                  <span className="vdt-state">{estadoAsistencia === "ok" ? "✓" : estadoAsistencia === "warn" ? "ⓘ" : "⚠"}</span>
                </div>
                <p>Sistema de marcación activo y funcional.</p>
                <div className="vdt-card-foot">Cobertura últimos 7 días: {(resumen.asistenciaCobertura7d * 100).toFixed(0)}%</div>
              </div>

              {/* Trazabilidad */}
              <div className={statusClass(estadoTrazabilidad)} title="Porcentaje de marcas con evidencia (foto/GPS) + ediciones auditadas.">
                <div className="vdt-card-title">
                  <span>Trazabilidad de Marcas</span>
                  <span className="vdt-state">{estadoTrazabilidad === "ok" ? "✓" : estadoTrazabilidad === "warn" ? "ⓘ" : "⚠"}</span>
                </div>
                <p>Entradas, salidas y modificaciones registradas.</p>
                <div className="vdt-card-foot">Con evidencia: {(resumen.marcasConEvidencia * 100).toFixed(0)}%</div>
              </div>

              {/* Límites de Jornada */}
              <div className={statusClass(estadoLimites)}>
                <div className="vdt-card-title">
                  <span>Límites de Jornada</span>
                  <span className="vdt-state">{estadoLimites === "ok" ? "✓" : estadoLimites === "warn" ? "ⓘ" : "⚠"}</span>
                </div>
                <p>Revisar casos con posibles horas extra excedidas.</p>
                <div className="vdt-list-mini">
                  {limites.slice(0, 2).map((l) => (
                    <div key={`${l.rut}-${l.fecha}`} className="vdt-mini-item">
                      <span className="vdt-link" onMouseEnter={() => setPanelLimites(true)} onClick={() => setPanelLimites(true)}>
                        {l.nombre} ({l.rut})
                      </span>
                      {/* 👇 Enlace activado: va a Asistencia > Marcas registradas con el empleado precargado */}
                      <Link className="vdt-btn-link" to={toMarcasRegistradas(l.rut, l.nombre)}>
                        +info
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Descansos y Colación */}
              <div className={statusClass(estadoColacion)}>
                <div className="vdt-card-title">
                  <span>Descansos y Colación</span>
                  <span className="vdt-state">{estadoColacion === "ok" ? "✓" : estadoColacion === "warn" ? "ⓘ" : "⚠"}</span>
                </div>
                <p>Gestión de pausas habilitada.</p>
                <div className="vdt-card-foot">Colación ≥30 min: {(resumen.colacionOk * 100).toFixed(0)}%</div>
              </div>

              {/* Documentación Clave Faltante */}
              <div className={statusClass(estadoDocs)}>
                <div className="vdt-card-title">
                  <span>Documentación Clave Faltante</span>
                  <span className="vdt-state">{estadoDocs === "ok" ? "✓" : "⚠"}</span>
                </div>
                <p>Faltan contratos y/o consentimientos biométricos.</p>
                <div className="vdt-list-mini">
                  {(resumen.docsFaltantes || []).slice(0, 2).map((d) => (
                    <div key={d.rut} className="vdt-mini-item">
                      <span className="vdt-link" onMouseEnter={() => setPanelDocs(d)} onClick={() => setPanelDocs(d)}>
                        {d.nombre} ({d.rut})
                      </span>
                      <Link className="vdt-btn-link" to={toDocs(d.rut)}>Ver Ficha</Link>
                    </div>
                  ))}
                </div>
              </div>

              {/* Respaldos */}
              <div className={statusClass(estadoBackups)} title="Backups diarios firmados; retención 5 años.">
                <div className="vdt-card-title">
                  <span>Respaldos Legales</span>
                  <span className="vdt-state">✓</span>
                </div>
                <p>Backups automáticos configurados.</p>
                <div className="vdt-card-foot">Último respaldo: {resumen.backupLast}</div>
              </div>
            </div>

            <div className="vdt-note">
              Los indicadores son orientativos; ver detalles en cada módulo para revisión caso a caso.
            </div>
          </div>

          {/* Auditoría / Bitácora */}
          <div className="vdt-card full">
            <div className="vdt-panel-head">
              <div className="vdt-panel-ico">🕒</div>
              <div>
                <h2 className="vdt-h2">Registro de Auditoría y Bitácora de Modificaciones</h2>
                <p className="vdt-muted">Trazabilidad de ediciones, justificaciones y observaciones en los registros de asistencia.</p>
              </div>
            </div>

            <div className="vdt-filters">
              <input className="vdt-input" placeholder="Buscar (Usuario/Empleado/Acción)" value={q} onChange={(e) => setQ(e.target.value)} />
              <input type="date" className="vdt-input" value={fDesde} onChange={(e) => setFDesde(e.target.value)} />
              <input type="date" className="vdt-input" value={fHasta} onChange={(e) => setFHasta(e.target.value)} />
              <button className="vdt-btn" onClick={() => alert("Export demo")}>⬇ Exportar</button>
            </div>

            <div className="vdt-table">
              <div className="vdt-tr vdt-th">
                <div>Fecha y Hora</div><div>Usuario</div><div>Acción</div><div>Recurso</div><div>Detalle</div><div>IP/Agente</div><div>Observación</div>
              </div>
              {!loading && auditoriaFiltrada.map((a) => (
                <div key={a.id} className="vdt-tr">
                  <div className="vdt-td">{a.ts}</div>
                  <div className="vdt-td">{a.usuario}</div>
                  <div className="vdt-td">{a.accion}</div>
                  <div className="vdt-td">{a.recurso}</div>
                  <div className="vdt-td" title={a.detalle}>{a.detalle}</div>
                  <div className="vdt-td">{a.ip}</div>
                  <div className="vdt-td">{a.obs || "—"}</div>
                </div>
              ))}
              {!loading && auditoriaFiltrada.length === 0 && <div className="vdt-empty">Aún no hay auditorías en este rango.</div>}
            </div>
          </div>

          {/* Push-pop Documentos faltantes */}
          {panelDocs && (
            <>
              <div className="vdt-backdrop" onClick={() => setPanelDocs(null)} />
              <aside className="vdt-sidepanel">
                <div className="vdt-panel-head">
                  <div className="vdt-avatar">{initials(panelDocs.nombre)}</div>
                  <div>
                    <div className="vdt-worker-name">{panelDocs.nombre}</div>
                    <div className="vdt-worker-rut">{panelDocs.rut}</div>
                  </div>
                  <button className="vdt-x" onClick={() => setPanelDocs(null)}>✖</button>
                </div>
                <div className="vdt-panel-body">
                  <h3 className="vdt-h3">Documentos faltantes</h3>
                  <ul className="vdt-ul">
                    {panelDocs.faltan.map((d, i) => (<li key={i}>• {d}</li>))}
                  </ul>
                  <Link className="vdt-btn primary" to={toDocs(panelDocs.rut)}>Ir a Documentos</Link>
                </div>
              </aside>
            </>
          )}

          {/* Push-pop Límites */}
          {panelLimites && (
            <>
              <div className="vdt-backdrop" onClick={() => setPanelLimites(false)} />
              <aside className="vdt-sidepanel">
                <div className="vdt-panel-head">
                  <h3 className="vdt-h3">Límites de Jornada</h3>
                  <button className="vdt-x" onClick={() => setPanelLimites(false)}>✖</button>
                </div>
                <div className="vdt-panel-body">
                  <div className="vdt-filters">
                    <select className="vdt-input" defaultValue="Semana">{["Día", "Semana", "Mes"].map((v) => (<option key={v}>{v}</option>))}</select>
                    <select className="vdt-input" defaultValue="Empleado">{["Empleado", "Puesto", "Centro"].map((v) => (<option key={v}>{v}</option>))}</select>
                  </div>
                  <div className="vdt-table">
                    <div className="vdt-tr vdt-th">
                      <div>Fecha</div><div>Empleado</div><div>Pactada</div><div>Real</div><div>Exceso</div><div>Aprobó HE</div><div>Obs.</div>
                    </div>
                    {limites.map((l, i) => (
                      <div key={i} className="vdt-tr">
                        <div>{l.fecha}</div>
                        <div>{l.nombre}</div>
                        <div>{l.pactada}</div>
                        <div>{l.real}</div>
                        <div><b>+{l.exceso}</b></div>
                        <div>{l.aprobo}</div>
                        <div>{l.obs || "—"}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 12 }}>
                    <Link className="vdt-btn" to={toMarcasRegistradas(limites[0]?.rut, limites[0]?.nombre)}>
                      Ir a Asistencia
                    </Link>
                    <button className="vdt-btn" onClick={() => alert("Export demo")}>⬇ Exportar</button>
                  </div>
                </div>
              </aside>
            </>
          )}
        </>
      ) : (
        // -------- ACCESOS DT ----------
        <>
          <div className="vdt-hero">
            <div className="vdt-hero-ico">🎫</div>
            <div>
              <h1 className="vdt-title">Gestión de Accesos para Fiscalizadores DT</h1>
              <p className="vdt-subtitle">Administra códigos de acceso temporal para fiscalizadores de la Dirección del Trabajo.</p>
            </div>
            <div style={{ marginLeft: "auto" }}>
              <button
                className="vdt-btn primary"
                onClick={() => {
                  setModalOpen(true);
                  setNuevo({ nombre: "", code: genCode(), desde: "", hasta: "", horaHasta: "23:59", ambito: nuevo.ambito });
                }}
              >
                + Generar Nuevo Código
              </button>
            </div>
          </div>

          <div className="vdt-card full">
            <div className="vdt-table">
              <div className="vdt-tr vdt-th">
                <div>Código</div><div>Nombre Fiscalizador</div><div>Vigencia</div><div>Ámbito del Acceso</div><div>Creado Por</div><div>Fecha Creación</div><div>Estado</div><div>Acciones</div>
              </div>
              {codes.map((c) => (
                <div key={c.id} className="vdt-tr">
                  <div className="vdt-td code">{c.code}</div>
                  <div className="vdt-td">{c.fiscalizador}</div>
                  <div className="vdt-td">{c.inicio.replace("T", " ")} — {c.fin.replace("T", " ")}</div>
                  <div className="vdt-td">{c.ambito}</div>
                  <div className="vdt-td">{c.creadoPor}</div>
                  <div className="vdt-td">{c.creadoTs}</div>
                  <div className="vdt-td"><span className={statusPill(codeStatus(c))}>{codeStatus(c)}</span></div>
                  <div className="vdt-td actions">
                    <button className="vdt-icon" title="Copiar" onClick={() => navigator.clipboard?.writeText(c.code)}>📋</button>
                    <button className="vdt-icon" title="Ver" onClick={() => alert(`Código: ${c.code}`)}>👁️</button>
                    <button className="vdt-icon" title="Regenerar" onClick={() => alert("Regenerar (demo)")}>🔁</button>
                    <button className="vdt-icon danger" title="Eliminar" onClick={() => setCodes((p) => p.filter((x) => x.id !== c.id))}>🗑️</button>
                  </div>
                </div>
              ))}
              {codes.length === 0 && <div className="vdt-empty">No hay códigos aún.</div>}
            </div>
          </div>

          {/* Modal crear código */}
          {modalOpen && (
            <>
              <div className="vdt-backdrop" onClick={() => setModalOpen(false)} />
              <div className="vdt-modal">
                <div className="vdt-modal-head">
                  <h3>Generar Nuevo Código de Acceso Fiscalizador DT</h3>
                  <button className="vdt-x" onClick={() => setModalOpen(false)}>✖</button>
                </div>
                <div className="vdt-modal-body">
                  <label className="vdt-label">Nombre del Fiscalizador (Opcional)</label>
                  <input className="vdt-input" placeholder="Ej: Juan Pérez (DT)" value={nuevo.nombre} onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })} />
                  <label className="vdt-label">Código de Acceso Generado</label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <input className="vdt-input" value={nuevo.code} onChange={(e) => setNuevo({ ...nuevo, code: e.target.value.toUpperCase() })} />
                    <button className="vdt-btn" onClick={() => setNuevo({ ...nuevo, code: genCode() })}>Regenerar</button>
                  </div>
                  <div className="vdt-grid-2">
                    <div>
                      <label className="vdt-label">Fecha de Inicio Vigencia*</label>
                      <input type="date" className="vdt-input" value={nuevo.desde} onChange={(e) => setNuevo({ ...nuevo, desde: e.target.value })} />
                    </div>
                    <div>
                      <label className="vdt-label">Fecha de Expiración Vigencia*</label>
                      <input type="date" className="vdt-input" value={nuevo.hasta} onChange={(e) => setNuevo({ ...nuevo, hasta: e.target.value })} />
                    </div>
                  </div>
                  <label className="vdt-label">Hora de Expiración (HH:MM)*</label>
                  <input type="time" className="vdt-input" value={nuevo.horaHasta} onChange={(e) => setNuevo({ ...nuevo, horaHasta: e.target.value })} />
                  <label className="vdt-label">Ámbito del Acceso / Observaciones*</label>
                  <textarea className="vdt-input" rows={3} value={nuevo.ambito} onChange={(e) => setNuevo({ ...nuevo, ambito: e.target.value })} />
                </div>
                <div className="vdt-modal-foot">
                  <button className="vdt-btn" onClick={() => setModalOpen(false)}>Cancelar</button>
                  <button className="vdt-btn primary" onClick={crearCodigo}>Crear Código de Acceso</button>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
