import React, { useMemo, useState } from "react";
import "./SupervisionIntegral.css";
import AsistenciaSubnav from "../components/AsistenciaSubnav";
import { Link } from "react-router-dom";

// Empleados reales
const EMP = [
  { nombre: "Juan Díaz Morales",     rut: "12.345.678-9", cargo: "Gerente de Operaciones",  instalacion: "Sede Central",          turno: "08:00 - 17:00", estado: "Presente",          justif: "-",           ultima: "08:15" },
  { nombre: "María Pérez Lagos",     rut: "14.567.890-1", cargo: "Analista de Recursos Humanos", instalacion: "Sede Central",     turno: "09:00 - 18:00", estado: "Presente",          justif: "-",           ultima: "09:02" },
  { nombre: "Carlos Rodríguez Vega", rut: "16.789.012-3", cargo: "Desarrollador Senior",     instalacion: "Sede Central",          turno: "09:00 - 18:00", estado: "Retrasado",         justif: "-",           ultima: "09:20 (Entrada)" },
  { nombre: "Ana González Muñoz",    rut: "18.901.234-5", cargo: "Diseñadora UX/UI",         instalacion: "Sucursal Norte",        turno: "09:00 - 18:00", estado: "Ausente",           justif: "Sin Justif.", ultima: "---" },
  { nombre: "Luis Soto Parra",       rut: "15.432.109-7", cargo: "Contador",                  instalacion: "Sucursal Norte",        turno: "08:30 - 17:30", estado: "Presente",          justif: "-",           ultima: "08:33" },
  { nombre: "Raúl Aravena",          rut: "17.555.221-1", cargo: "Full Stack",               instalacion: "Sede Central",          turno: "09:00 - 18:00", estado: "Presente",          justif: "-",           ultima: "08:58" },
  { nombre: "Nicole Castro",         rut: "18.456.789-1", cargo: "Analista QA",              instalacion: "Sede Central",          turno: "09:00 - 18:00", estado: "Retrasado",         justif: "-",           ultima: "09:18 (Entrada)" },
  { nombre: "Gabriel Reyes",         rut: "16.001.234-5", cargo: "Soporte",                  instalacion: "Sucursal Norte",        turno: "07:00 - 16:00", estado: "Jornada Completa",  justif: "N/A",         ultima: "16:02 (Salida)" },
  { nombre: "Victoria Pizarro",      rut: "17.999.111-2", cargo: "Gerente Legal",            instalacion: "Sede Central",          turno: "09:00 - 18:00", estado: "Ausente",           justif: "Sin Justif.", ultima: "---" },
  { nombre: "Francisco Ríos",        rut: "13.222.333-4", cargo: "Ingeniero DevOps",         instalacion: "Sede Central",          turno: "08:00 - 17:00", estado: "Presente",          justif: "-",           ultima: "08:05" }
];

// helpers
const initials = (name="") =>
  name.split(" ").map(p=>p[0]).join("").slice(0,2).toUpperCase();
const isPresente = (e) => e.estado === "Presente" || e.estado === "Jornada Completa";

// parsea "HH:MM - HH:MM"
const parseTurno = (turnoStr = "") => {
  const m = /(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/.exec(turnoStr);
  return { inicio: m ? m[1] : "—", termino: m ? m[2] : "—" };
};

export default function SupervisionIntegral() {
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0,10));
  const [instalacion, setInstalacion] = useState("Todas");
  const [q, setQ] = useState("");

  // estado del push-pop (modal pequeño)
  const [kpiModal, setKpiModal] = useState({ open: false, tipo: null, items: [] });

  // ✅ estado y handlers para "Ver Detalle"
  const [detalleOpen, setDetalleOpen] = useState(false);
  const [detalleData, setDetalleData] = useState(null);

  const openDetalle = (row) => {
    const turnoObj = parseTurno(row.turno);
    const m = /\((Entrada|Salida)\)/i.exec(row.ultima || "");
    const ultimaHora = (row.ultima || "").replace(/\s*\((Entrada|Salida)\)\s*/i, "").trim();
    setDetalleData({
      nombre: row.nombre,
      rut: row.rut,
      cargo: row.cargo,
      instalacion: row.instalacion,
      turno: turnoObj,                       // {inicio, termino}
      estado: row.estado,
      justificacion: row.justif || "—",
      ultimaMarca: row.ultima ? { hora: ultimaHora || "—", tipo: m?.[1] || null } : null,
      marcas: []  // si luego tienes las marcas del día, pásalas aquí
    });
    setDetalleOpen(true);
  };
  const closeDetalle = () => { setDetalleOpen(false); setDetalleData(null); };

  const esperados = EMP.length;
  const presentes = EMP.filter(isPresente).length;
  const ausentes  = EMP.filter(e => e.estado === "Ausente").length;
  const incompletas = 0; // placeholder
  const retrasos = EMP.filter(e => e.estado === "Retrasado").length;
  const salidasAnt = 0;  // placeholder

  const incidenciasVictorIA = useMemo(
    () => EMP.filter(e => e.estado === "Ausente"),
    []
  );

  const listInstalaciones = useMemo(
    () => ["Todas", ...Array.from(new Set(EMP.map(e=>e.instalacion)))],
    []
  );

  const filtrados = useMemo(() => {
    return EMP.filter(e => {
      const okInst = instalacion === "Todas" || e.instalacion === instalacion;
      const okQ = q ? (`${e.nombre} ${e.rut}`.toLowerCase().includes(q.toLowerCase())) : true;
      return okInst && okQ;
    });
  }, [instalacion, q]);

  // abrir "Ver lista" por KPI
  const openKpi = (tipo) => {
    let items = [];
    switch (tipo) {
      case "esperados": items = [...EMP]; break;
      case "presentes": items = EMP.filter(isPresente); break;
      case "ausentes":  items = EMP.filter(e => e.estado === "Ausente"); break;
      case "incompletas": items = []; break;
      case "retrasos": items = EMP.filter(e => e.estado === "Retrasado"); break;
      case "salidas": items = []; break;
      default: items = [];
    }
    setKpiModal({ open: true, tipo, items });
  };
  const closeKpi = () => setKpiModal({ open: false, tipo: null, items: [] });

  const kpiTitle = (t) => ({
    esperados: "Esperados Hoy",
    presentes: "Presentes",
    ausentes: "Ausentes (Sin Justif.)",
    incompletas: "Marcas Incompletas",
    retrasos: "Retrasos",
    salidas: "Salidas Anticipadas",
  }[t] || "Detalle");

  // 👉 arma URL a Marcas Registradas con el colaborador, rango del día actual y la incidencia (estado) mostrada
  const urlMarcasDe = (emp) =>
    `/asistencia/marcas?empleado_rut=${encodeURIComponent(emp.rut)}&empleado_nombre=${encodeURIComponent(emp.nombre)}&from=${fecha}&to=${fecha}&estado=${encodeURIComponent(emp.estado)}&auto=1`;

  return (
    <div className="si-wrap">
      {/* sub-navegación exclusiva de Asistencia */}
      <AsistenciaSubnav />

      {/* BLOQUE 1: VictorIA */}
      <section className="si-card">
        <header className="si-head">
          <h2 className="si-title si-title--ia">🧠 Análisis y Alertas de VictorIA</h2>
          <p className="si-sub">Resumen inteligente y detección de incidencias para el día seleccionado.</p>
        </header>

        {/* KPIs */}
        <div className="si-kpis">
          <KPI icon="👥" value={esperados} label="Esperados Hoy" accent="blue" onOpen={() => openKpi("esperados")} />
          <KPI icon="✅" value={presentes} label="Presentes" accent="green" onOpen={() => openKpi("presentes")} />
          <KPI icon="❌" value={ausentes} label="Ausentes (Sin Justif.)" accent="red" onOpen={() => openKpi("ausentes")} />
          <KPI icon="⚠️" value={incompletas} label="Marcas Incompletas" accent="amber" onOpen={() => openKpi("incompletas")} />
          <KPI icon="⏰" value={retrasos} label="Retrasos" accent="orange" onOpen={() => openKpi("retrasos")} />
          <KPI icon="⏳" value={salidasAnt} label="Salidas Anticipadas" accent="gray" onOpen={() => openKpi("salidas")} />
        </div>

        {/* Tabla incidencias VictorIA */}
        <div className="si-table-block">
          <div className="si-table-caption si-table-caption--ia">🚨 Incidencias Detectadas por VictorIA</div>
          <table className="si-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Incidencia</th>
                <th>Última Marca</th>
                <th className="si-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {incidenciasVictorIA.map((e) => (
                <tr key={e.rut}>
                  <td>
                    <div className="si-worker">
                      <div className="si-avatar">{initials(e.nombre)}</div>

                      <div className="si-popwrap">
                        {/* Click → detalle de marcas con la misma incidencia */}
                        <Link className="si-worker-name si-link" to={urlMarcasDe(e)}>
                          {e.nombre}
                        </Link>
                        <div className="si-worker-rut">{e.rut}</div>

                        {/* Popover en hover */}
                        <div className="si-pop">
                          <div className="si-pop-row">
                            <span className="si-pop-k">Estado</span>
                            <span className={
                              e.estado === "Ausente" ? "si-badge si-badge--danger" :
                              e.estado === "Jornada Completa" || e.estado === "Presente" ? "si-badge si-badge--success" :
                              "si-badge"
                            }>
                              {e.estado}
                            </span>
                          </div>
                          <div className="si-pop-row">
                            <span className="si-pop-k">Última marca</span>
                            <span className="si-pop-v">{e.ultima || "---"}</span>
                          </div>
                          <div className="si-pop-row">
                            <span className="si-pop-k">Turno</span>
                            <span className="si-pop-v">{e.turno || "—"}</span>
                          </div>
                          <div className="si-pop-row">
                            <span className="si-pop-k">Instalación</span>
                            <span className="si-pop-v">{e.instalacion || "—"}</span>
                          </div>
                          <div className="si-pop-cta">
                            <Link className="si-pop-link" to={urlMarcasDe(e)}>
                              Ver detalle completo →
                            </Link>
                          </div>
                          <div className="si-pop-arrow" />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td><span className="si-badge si-badge--danger">Ausente</span></td>
                  <td>{e.ultima}</td>
                  <td className="si-right">
                    <button className="si-btn si-btn--alt">Marcar Revisada</button>
                  </td>
                </tr>
              ))}
              {incidenciasVictorIA.length === 0 && (
                <tr><td colSpan={4} className="si-empty">Sin incidencias 🎉</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* BLOQUE 2: Panel General del Día */}
      <section className="si-card">
        <header className="si-head">
          <h2 className="si-title">👥 Panel General de Colaboradores del Día</h2>
          <p className="si-sub">Vista general de la asistencia y estado de los colaboradores para el día seleccionado.</p>
        </header>

        {/* Filtros */}
        <div className="si-filters">
          <div className="si-field">
            <label className="si-label">Fecha</label>
            <input type="date" className="si-input" value={fecha} onChange={e=>setFecha(e.target.value)} />
          </div>
          <div className="si-field">
            <label className="si-label">Instalación</label>
            <select className="si-input" value={instalacion} onChange={e=>setInstalacion(e.target.value)}>
              {listInstalaciones.map(opt => <option key={opt}>{opt}</option>)}
            </select>
          </div>
          <div className="si-field si-field--grow">
            <label className="si-label">Buscar</label>
            <input className="si-input" placeholder="Nombre o RUT..." value={q} onChange={e=>setQ(e.target.value)} />
          </div>
        </div>

        {/* Tabla general */}
        <div className="si-table-block">
          <table className="si-table">
            <thead>
              <tr>
                <th>Foto</th>
                <th>Nombre</th>
                <th>RUT</th>
                <th>Instalación</th>
                <th>Cargo</th>
                <th>Turno Asignado</th>
                <th>Estado Actual</th>
                <th>Justificación</th>
                <th>Última Marca</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((e) => (
                <tr key={e.rut}>
                  <td><div className="si-avatar">{initials(e.nombre)}</div></td>
                  <td className="si-link">{e.nombre}</td>
                  <td>{e.rut}</td>
                  <td>{e.instalacion}</td>
                  <td>{e.cargo}</td>
                  <td>{e.turno}</td>
                  <td>
                    <span className={
                      e.estado === "Ausente" ? "si-badge si-badge--danger" :
                      e.estado === "Jornada Completa" || e.estado === "Presente" ? "si-badge si-badge--success" :
                      "si-badge"
                    }>
                      {e.estado}
                    </span>
                  </td>
                  <td>
                    <span className={e.justif === "Sin Justif." ? "si-chip si-chip--danger" : "si-chip si-chip--ok"}>
                      {e.justif}
                    </span>
                  </td>
                  <td>{e.ultima}</td>
                  <td>
                    {/* 🔔 activar Ver Detalle */}
                    <button className="si-btn" onClick={() => openDetalle(e)}>Ver Detalle</button>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={10} className="si-empty">Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* BLOQUE 3: Análisis Predictivo */}
      <section className="si-card si-card--gradient">
        <header className="si-head si-head--light">
          <h2 className="si-title si-title--light">✨ Análisis Predictivo de Ausentismo</h2>
          <p className="si-sub si-sub--light">Inteligencia artificial avanzada para prevenir problemas de asistencia.</p>
        </header>

        <div className="si-grid-2">
          <div className="si-panel">
            <div className="si-panel-title">🪩 Riesgo de Ausentismo</div>
            <ul className="si-risk">
              <li><span>Área Comercial</span><strong>30%</strong></li>
              <li><span>Administración</span><strong>15%</strong></li>
              <li><span>Técnicos</span><strong>25%</strong></li>
              <li><span>Gerencia</span><strong>10%</strong></li>
            </ul>
          </div>

          <div className="si-panel">
            <div className="si-panel-title">🧠 Recomendaciones VictorIA</div>
            <div className="si-suggestion si-suggestion--warn">
              ⚠️ <strong>Alerta Crítica</strong> — Área Comercial con 30% de riesgo de ausentismo este viernes. Considerar refuerzos.
            </div>
            <div className="si-suggestion si-suggestion--info">
              📊 <strong>Patrón Detectado</strong> — 3 colaboradores con retrasos consecutivos, riesgo alto de ausentismo próximo.
            </div>
            <div className="si-suggestion si-suggestion--idea">
              💡 <strong>Sugerencia</strong> — Implementar reunión de seguimiento con equipo comercial antes del viernes.
            </div>
          </div>
        </div>
      </section>

      {/* Modal KPI (push-pop) */}
      {kpiModal.open && (
        <>
          <div className="si-modal-backdrop" onClick={closeKpi} />
          <div className="si-modal">
            <div className="si-modal-head">
              <div className="si-modal-title">{kpiTitle(kpiModal.tipo)}</div>
              <button className="si-x" onClick={closeKpi}>✖</button>
            </div>
            <div className="si-modal-body">
              {kpiModal.items.length === 0 ? (
                <div className="si-empty">Sin registros para mostrar</div>
              ) : (
                <table className="si-table si-table--compact">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>RUT</th>
                      <th>Estado</th>
                      <th>Última Marca</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kpiModal.items.map((e) => (
                      <tr key={e.rut}>
                        <td className="si-link">{e.nombre}</td>
                        <td>{e.rut}</td>
                        <td>
                          <span className={
                            e.estado === "Ausente" ? "si-badge si-badge--danger" :
                            e.estado === "Jornada Completa" || e.estado === "Presente" ? "si-badge si-badge--success" :
                            "si-badge"
                          }>
                            {e.estado}
                          </span>
                        </td>
                        <td>{e.ultima}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="si-modal-foot">
              <button className="si-btn" onClick={closeKpi}>Cerrar</button>
            </div>
          </div>
        </>
      )}

      {/* 🔍 Modal de Detalle (Ver Detalle) */}
      <DetalleAsistenciaModal
        open={detalleOpen}
        onClose={closeDetalle}
        data={detalleData}
        urlMarcasDe={urlMarcasDe}
      />
    </div>
  );
}

/* KPI Card (presentación sobria) */
function KPI({ icon, value, label, accent, onOpen }) {
  const handleClick = (e) => {
    e.preventDefault();
    onOpen && onOpen();
  };

  return (
    <div className="si-kpi">
      <div className={`si-kpi-icon si-kpi-icon--${accent}`}>{icon}</div>
      <div className={`si-kpi-value si-kpi-value--${accent}`}>{value}</div>
      <div className="si-kpi-label">{label}</div>
      <a href="#" className="si-kpi-link" onClick={handleClick}>
        Ver lista
      </a>
    </div>
  );
}

/* 📋 Modal de detalle de asistencia (reusa estilos de si-modal) */
function DetalleAsistenciaModal({ open, onClose, data, urlMarcasDe }) {
  if (!open || !data) return null;

  const statusClass =
    data.estado === "Ausente"
      ? "si-badge si-badge--danger"
      : (data.estado === "Jornada Completa" || data.estado === "Presente")
      ? "si-badge si-badge--success"
      : "si-badge";

  return (
    <>
      <div className="si-modal-backdrop" onClick={onClose} />
      <div className="si-modal">
        <div className="si-modal-head">
          <div className="si-modal-title" style={{display:"flex", alignItems:"center", gap:10}}>
            <div className="si-avatar">{initials(data.nombre)}</div>
            <div>
              <div>{data.nombre}</div>
              <small style={{color:"#64748b"}}>{data.rut} • {data.cargo} • {data.instalacion}</small>
            </div>
          </div>
          <span className={statusClass}>{data.estado}</span>
          <button className="si-x" onClick={onClose}>✖</button>
        </div>

        <div className="si-modal-body">
          <div className="si-grid-2">
            <div>
              <div className="si-label">Turno asignado</div>
              <div>{data.turno?.inicio} - {data.turno?.termino}</div>
            </div>
            <div>
              <div className="si-label">Justificación</div>
              <div>{data.justificacion || "—"}</div>
            </div>
            <div>
              <div className="si-label">Última marca</div>
              <div>
                {data.ultimaMarca
                  ? (<><strong>{data.ultimaMarca.hora}</strong> <span style={{color:"#64748b"}}>({data.ultimaMarca.tipo || "—"})</span></>)
                  : "—"}
              </div>
            </div>
          </div>

          <div className="si-table-block" style={{marginTop:12}}>
            <div className="si-table-caption">Marcas del día</div>
            {Array.isArray(data.marcas) && data.marcas.length > 0 ? (
              <table className="si-table si-table--compact">
                <thead>
                  <tr><th>Hora</th><th>Tipo</th><th>Lugar</th><th>Mapa</th></tr>
                </thead>
                <tbody>
                  {data.marcas.map((m, i)=>(
                    <tr key={i}>
                      <td><strong>{m.hora || "—"}</strong></td>
                      <td>{m.tipo || "—"}</td>
                      <td style={{color:"#64748b"}}>{m.lugar || "—"}</td>
                      <td>
                        {(m.lat && m.lng) ? (
                          <a
                            href={`https://maps.google.com/?q=${m.lat},${m.lng}`}
                            target="_blank" rel="noreferrer" className="si-link"
                          >
                            Ver mapa
                          </a>
                        ) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="si-empty">Sin marcas registradas.</div>
            )}
          </div>
        </div>

        <div className="si-modal-foot" style={{display:"flex", gap:8}}>
          <Link className="si-btn si-btn--alt" to={urlMarcasDe(data)}>
            Ver marcas del día
          </Link>
          <button className="si-btn" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </>
  );
}
