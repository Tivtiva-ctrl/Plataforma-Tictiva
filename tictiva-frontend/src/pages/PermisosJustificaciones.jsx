// src/pages/PermisosJustificaciones.jsx
import React, { useEffect, useMemo, useState } from "react";
import HRSubnav from "../components/HRSubnav";        // barra de submódulos RR.HH.
import "./PermisosJustificaciones.css";
import { PermisosAPI, EmpleadosAPI } from "../api";   // ✅ capa de API centralizada

/* ───────────────── helpers visuales ──────────────── */
const initials = (name = "") =>
  name.toString().trim().split(/\s+/).map(n => n[0]).join("").slice(0, 2).toUpperCase();

const normEstado = (e = "") => {
  const s = String(e || "").trim().toLowerCase();
  if (s.startsWith("aprob")) return "aprobado";
  if (s.startsWith("rechaz")) return "rechazado";
  if (s === "pend" || s.startsWith("pend")) return "pendiente";
  return s || "pendiente";
};
const labelEstado = (e = "") => {
  const k = normEstado(e);
  if (k === "aprobado") return "Aprobado";
  if (k === "rechazado") return "Rechazado";
  return "Pendiente";
};

const getFechaInicio = (r) => r?.fechaInicio || r?.desde || "";
const getFechaFin    = (r) => r?.fechaFin    || r?.hasta  || "";
const getHoraIni     = (r) => r?.horaInicio  || r?.hora_ini || r?.horaDesde || "";
const getHoraFin     = (r) => r?.horaFin     || r?.hora_fin || r?.horaHasta || "";
const getAdjunto     = (r) => r?.adjunto || r?.adjuntoNombre || "";
const getRut         = (r) => r?.trabajador?.rut || r?.rut || "";
const getNombre      = (r) => r?.trabajador?.nombre || r?.nombre || "";

/* Para el preview del SLA en el modal (la API lo calcula al crear, pero aquí lo mostramos en vivo) */
function computeSlaHoras(fechaISO, horaHHMM) {
  try {
    const end = new Date(`${fechaISO}T${(horaHHMM || "23:59")}:00`);
    const now = new Date();
    return Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60));
  } catch {
    return 0;
  }
}

export default function PermisosJustificaciones() {
  const [tab, setTab] = useState("gestionar"); // gestionar | historial
  const [q, setQ] = useState("");
  const [pendientes, setPendientes] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  // selección (acciones masivas)
  const [selected, setSelected] = useState(new Set());

  // panel lateral “Más info”
  const [panelItem, setPanelItem] = useState(null);

  // modal crear
  const [openCreate, setOpenCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [empleados, setEmpleados] = useState([]);

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    rut: "",
    nombre: "",
    tipo: "Personal",
    desde: today,
    hasta: today,
    horaInicio: "15:00",
    horaFin: "18:00",
    motivo: "",
    adjuntoNombre: ""
  });

  /* ─────────── Carga inicial (desde la capa de API) ─────────── */
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const [pend, hist, emps] = await Promise.all([
          PermisosAPI.listPendientes().catch(() => []),
          PermisosAPI.listHistorial().catch(() => []),
          EmpleadosAPI.list().catch(() => []),
        ]);
        if (!cancel) {
          setPendientes(Array.isArray(pend) ? pend : []);
          setHistorial(Array.isArray(hist) ? hist : []);
          setEmpleados(Array.isArray(emps) ? emps : []);
        }
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  const data = tab === "gestionar" ? pendientes : historial;

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return data;
    return data.filter(r =>
      `${getNombre(r)} ${getRut(r)} ${r?.tipo || ""} ${r?.motivo || ""}`.toLowerCase().includes(t)
    );
  }, [data, q]);

  /* ─────────── KPIs sobre pendientes ─────────── */
  const hoy = new Date().toISOString().slice(0, 10);
  const kpiPend = pendientes.length;
  const kpiHoy = pendientes.filter(r => getFechaFin(r) === hoy).length;
  const kpiAtras = pendientes.filter(r => (r.slaHoras ?? 0) < 0).length;

  const slaClass = (h) =>
    h < 0 ? "pj-sla pj-sla--danger" : h <= 6 ? "pj-sla pj-sla--warn" : "pj-sla";

  /* ─────────── selección ─────────── */
  const toggleOne = (id) => {
    setSelected(prev => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const toggleAllOnPage = (checked) => {
    setSelected(prev => {
      const n = new Set(prev);
      filtered.forEach(r => checked ? n.add(r.id) : n.delete(r.id));
      return n;
    });
  };
  const clearSelection = () => setSelected(new Set());

  /* ─────────── aprobar / rechazar (optimistic UI + API) ─────────── */
  const patchEstado = async (id, estadoKey /* 'aprobado'|'rechazado' */) => {
    const item = pendientes.find(p => p.id === id);
    if (!item) return;

    // Optimistic
    setPendientes(prev => prev.filter(p => p.id !== id));
    setHistorial(prev => [{ ...item, estado: labelEstado(estadoKey) }, ...prev]);

    try {
      // La API recibe "Aprobado"/"Rechazado" (con mayúscula)
      await PermisosAPI.patchEstado(id, labelEstado(estadoKey));
    } catch {
      // rollback
      setHistorial(prev => prev.filter(p => p.id !== id));
      setPendientes(prev => [item, ...prev]);
      alert("No se pudo actualizar el estado.");
    }
  };
  const aprobar = (id) => patchEstado(id, "aprobado");
  const rechazar = (id) => patchEstado(id, "rechazado");
  const approveSelected = () => { selected.forEach(id => aprobar(id)); clearSelection(); };
  const rejectSelected = () => { selected.forEach(id => rechazar(id)); clearSelection(); };

  /* ─────────── Crear permiso manual ─────────── */
  const openCreateModal = () => {
    setForm({
      rut: "",
      nombre: "",
      tipo: "Personal",
      desde: today,
      hasta: today,
      horaInicio: "15:00",
      horaFin: "18:00",
      motivo: "",
      adjuntoNombre: ""
    });
    setOpenCreate(true);
  };

  const onRutChange = (rut) => {
    const emp = empleados.find(e => String(e.rut) === String(rut));
    setForm(f => ({ ...f, rut, nombre: emp?.nombre || f.nombre }));
  };

  const slaPreview = useMemo(
    () => computeSlaHoras(form.hasta, form.horaFin),
    [form.hasta, form.horaFin]
  );

  const saveCreate = async () => {
    if (!form.rut || !form.nombre || !form.desde || !form.hasta) {
      alert("Completa: trabajador, desde, hasta.");
      return;
    }
    setSaving(true);
    try {
      const item = await PermisosAPI.createManual(form);
      setPendientes(prev => [item, ...prev]);
      setOpenCreate(false);
    } catch (e) {
      console.error(e);
      alert("No se pudo crear el permiso. Revisa json-server.");
    } finally {
      setSaving(false);
    }
  };

  const headerChecked =
    filtered.length > 0 && filtered.every(r => selected.has(r.id));

  return (
    <div className="pj-wrap">
      {/* Barra de submódulos RR.HH. */}
      <HRSubnav />

      {/* Barra de tabs + acciones */}
      <div className="pj-tabsbar">
        <div className="pj-tabs">
          <button
            className={`pj-tab ${tab === "gestionar" ? "is-active" : ""}`}
            onClick={() => { setTab("gestionar"); clearSelection(); }}
          >
            Gestionar Solicitudes Pendientes
          </button>
          <button
            className={`pj-tab ${tab === "historial" ? "is-active" : ""}`}
            onClick={() => { setTab("historial"); clearSelection(); }}
          >
            Historial General de Solicitudes
          </button>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            className="pj-input"
            placeholder="Buscar por nombre, rut, motivo…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="pj-btn-primary" onClick={openCreateModal}>
            + Crear Permiso Manual
          </button>
        </div>
      </div>

      {/* Título */}
      <div className="pj-header">
        <div className="pj-header-icon">📄</div>
        <div>
          <h1 className="pj-title">Gestión de Permisos y Justificaciones</h1>
          <p className="pj-subtitle">Revisa y procesa las solicitudes de los colaboradores.</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="pj-card" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div className="pj-worker" style={{ alignItems: "center" }}>
          <div className="pj-avatar" aria-hidden>📅</div>
          <div>
            <div className="pj-title" style={{ fontSize: 18 }}>{kpiPend}</div>
            <div className="pj-subtitle">Pendientes</div>
          </div>
        </div>
        <div className="pj-worker" style={{ alignItems: "center" }}>
          <div className="pj-avatar" aria-hidden>⏰</div>
          <div>
            <div className="pj-title" style={{ fontSize: 18 }}>{kpiHoy}</div>
            <div className="pj-subtitle">Vencen hoy</div>
          </div>
        </div>
        <div className="pj-worker" style={{ alignItems: "center" }}>
          <div className="pj-avatar" aria-hidden>🧾</div>
          <div>
            <div className="pj-title" style={{ fontSize: 18 }}>{kpiAtras}</div>
            <div className="pj-subtitle">Atrasados</div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="pj-card">
        <div className={`pj-table ${tab === "gestionar" ? "pj-table--pend" : "pj-table--hist"}`}>
          {/* Header */}
          <div className="pj-th-row">
            {tab === "gestionar" && (
              <div className="pj-th">
                <input
                  type="checkbox"
                  checked={headerChecked}
                  onChange={(e) => toggleAllOnPage(e.target.checked)}
                />
              </div>
            )}
            <div className="pj-th">Trabajador</div>
            <div className="pj-th">Tipo</div>
            <div className="pj-th">Fechas</div>
            <div className="pj-th">Motivo</div>
            <div className="pj-th">Adjuntos</div>
            {tab === "gestionar" ? (
              <>
                <div className="pj-th">SLA</div>
                <div className="pj-th pj-right">Acciones</div>
              </>
            ) : (
              <>
                <div className="pj-th">Estado</div>
                <div className="pj-th">Resuelto por</div>
              </>
            )}
          </div>

          {/* Body */}
          {loading ? (
            <div className="pj-tr"><div className="pj-muted">Cargando…</div></div>
          ) : filtered.length === 0 ? (
            <div className="pj-tr"><div className="pj-muted">Sin resultados</div></div>
          ) : (
            filtered.map((r) => {
              const isSel = selected.has(r.id);
              const slaCls = slaClass(r.slaHoras ?? 0);

              return (
                <div key={r.id} className={`pj-tr ${isSel ? "is-selected" : ""}`}>
                  {tab === "gestionar" && (
                    <div className="pj-td">
                      <input
                        type="checkbox"
                        checked={isSel}
                        onChange={() => toggleOne(r.id)}
                      />
                    </div>
                  )}

                  {/* Trabajador */}
                  <div className="pj-td">
                    <div className="pj-worker">
                      <div className="pj-avatar" aria-hidden>{initials(getNombre(r))}</div>
                      <div>
                        <div className="pj-worker-name">{getNombre(r) || "—"}</div>
                        <div className="pj-worker-rut">{getRut(r) || "—"}</div>
                      </div>
                    </div>
                  </div>

                  {/* Tipo */}
                  <div className="pj-td">
                    <span className="pj-chip">{r.tipo || "—"}</span>
                  </div>

                  {/* Fechas */}
                  <div className="pj-td">
                    <div className="pj-date-main">{getFechaInicio(r)} — {getFechaFin(r)}</div>
                    <div className="pj-date-sub">
                      {getHoraIni(r) || "—"}{(getHoraIni(r) || getHoraFin(r)) ? " – " : ""}{getHoraFin(r) || ""}
                      <span className="pj-muted"> · Jornada completa</span>
                    </div>
                  </div>

                  {/* Motivo */}
                  <div className="pj-td"><div className="pj-motivo">{r.motivo || "—"}</div></div>

                  {/* Adjuntos */}
                  <div className="pj-td">
                    {getAdjunto(r)
                      ? <a className="pj-link" href="#" onClick={(e)=>e.preventDefault()}>{getAdjunto(r)}</a>
                      : <span className="pj-muted">—</span>}
                  </div>

                  {tab === "gestionar" ? (
                    <>
                      {/* SLA */}
                      <div className="pj-td">
                        <span className={slaCls}>
                          <span className="pj-dot" />
                          {Math.abs(r.slaHoras ?? 0)}h {(r.slaHoras ?? 0) < 0 ? "vencido" : "restantes"}
                        </span>
                      </div>

                      {/* Acciones */}
                      <div className="pj-td pj-right" style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button className="pj-btn-success" onClick={() => aprobar(r.id)}>✓ Aprobar</button>
                        <button className="pj-btn-danger" onClick={() => rechazar(r.id)}>✗ Rechazar</button>
                        <button className="pj-btn-ghost" onClick={() => setPanelItem(r)}>Más info</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="pj-td">
                        <span className={`pj-badge pj-badge--${normEstado(r.estado)}`}>{labelEstado(r.estado)}</span>
                      </div>
                      <div className="pj-td">{r.resueltoPor || <span className="pj-muted">—</span>}</div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bulk bar */}
      {tab === "gestionar" && selected.size > 0 && (
        <div className="pj-bulkbar">
          <div>{selected.size} seleccionados</div>
          <div className="pj-bulk-actions">
            <button className="pj-btn-ghost" onClick={clearSelection}>Limpiar</button>
            <button className="pj-btn-success" onClick={approveSelected}>Aprobar</button>
            <button className="pj-btn-danger" onClick={rejectSelected}>Rechazar</button>
          </div>
        </div>
      )}

      {/* Panel lateral “Más info” */}
      {panelItem && (
        <>
          <div className="pj-backdrop" onClick={() => setPanelItem(null)} />
          <aside className="pj-panel" role="dialog" aria-modal="true">
            <div className="pj-panel-head">
              <strong>Solicitud de {getNombre(panelItem) || "—"}</strong>
              <button className="pj-x" onClick={() => setPanelItem(null)}>✕</button>
            </div>
            <div className="pj-panel-body">
              <div className="pj-block">
                <div className="pj-block-title">Resumen</div>
                <div className="pj-kv"><span>Tipo</span><span>{panelItem.tipo || "—"}</span></div>
                <div className="pj-kv"><span>Fechas</span><span>{getFechaInicio(panelItem)} — {getFechaFin(panelItem)}</span></div>
                <div className="pj-kv"><span>Horario</span><span>{getHoraIni(panelItem) || "—"}{(getHoraIni(panelItem) || getHoraFin(panelItem)) ? " – " : ""}{getHoraFin(panelItem) || ""}</span></div>
                <div className="pj-kv"><span>Motivo</span><span>{panelItem.motivo || "—"}</span></div>
                <div className="pj-kv"><span>Adjunto</span><span>{getAdjunto(panelItem) || "—"}</span></div>
                <div className="pj-kv"><span>Estado</span><span className={`pj-badge pj-badge--${normEstado(panelItem.estado)}`}>{labelEstado(panelItem.estado)}</span></div>
                <div className="pj-kv"><span>SLA</span><span className={slaClass(panelItem.slaHoras ?? 0)}><span className="pj-dot" />{Math.abs(panelItem.slaHoras ?? 0)}h {(panelItem.slaHoras ?? 0) < 0 ? "vencido" : "restantes"}</span></div>
              </div>

              {(panelItem.resueltoPor || panelItem.fechaRevision) && (
                <div className="pj-block">
                  <div className="pj-block-title">Resolución</div>
                  <div className="pj-kv"><span>Resuelto por</span><span>{panelItem.resueltoPor || "—"}</span></div>
                  <div className="pj-kv"><span>Fecha revisión</span><span>{panelItem.fechaRevision || "—"}</span></div>
                </div>
              )}
            </div>
            <div className="pj-panel-foot">
              <button className="pj-btn-ghost" onClick={() => setPanelItem(null)}>Cerrar</button>
              {normEstado(panelItem.estado) === "pendiente" && (
                <>
                  <button className="pj-btn-success" onClick={() => { aprobar(panelItem.id); setPanelItem(null); }}>Aprobar</button>
                  <button className="pj-btn-danger" onClick={() => { rechazar(panelItem.id); setPanelItem(null); }}>Rechazar</button>
                </>
              )}
            </div>
          </aside>
        </>
      )}

      {/* Modal: Crear Permiso Manual */}
      {openCreate && (
        <>
          <div className="pj-backdrop" onClick={() => !saving && setOpenCreate(false)} />
          <div className="pj-modal" role="dialog" aria-modal="true">
            <div className="pj-modal-head">
              <strong>Crear Permiso Manual</strong>
              <button className="pj-x" onClick={() => setOpenCreate(false)}>✕</button>
            </div>
            <div className="pj-modal-body" style={{ display: "grid", gap: 12 }}>
              <div className="pj-field">
                <label className="pj-label">Trabajador</label>
                <select
                  className="pj-input"
                  value={form.rut}
                  onChange={(e) => onRutChange(e.target.value)}
                >
                  <option value="">Selecciona…</option>
                  {empleados.map(emp => (
                    <option key={emp.id} value={emp.rut}>
                      {emp.nombre} — {emp.rut}
                    </option>
                  ))}
                </select>
                {form.nombre && (
                  <div className="pj-muted" style={{ marginTop: 4 }}>
                    Seleccionado: <b>{form.nombre}</b>
                  </div>
                )}
              </div>

              <div className="pj-field">
                <label className="pj-label">Tipo</label>
                <select
                  className="pj-input"
                  value={form.tipo}
                  onChange={(e) => setForm(f => ({ ...f, tipo: e.target.value }))}
                >
                  <option>Personal</option>
                  <option>Médico</option>
                  <option>Administrativo</option>
                  <option>Parental</option>
                  <option>Sindical</option>
                </select>
              </div>

              <div className="pj-field" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="pj-label">Desde</label>
                  <input
                    type="date"
                    className="pj-input"
                    value={form.desde}
                    onChange={(e) => setForm(f => ({ ...f, desde: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="pj-label">Hasta</label>
                  <input
                    type="date"
                    className="pj-input"
                    value={form.hasta}
                    onChange={(e) => setForm(f => ({ ...f, hasta: e.target.value }))}
                  />
                </div>
              </div>

              <div className="pj-field" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label className="pj-label">Hora inicio</label>
                  <input
                    type="time"
                    className="pj-input"
                    value={form.horaInicio}
                    onChange={(e) => setForm(f => ({ ...f, horaInicio: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="pj-label">Hora fin</label>
                  <input
                    type="time"
                    className="pj-input"
                    value={form.horaFin}
                    onChange={(e) => setForm(f => ({ ...f, horaFin: e.target.value }))}
                  />
                </div>
              </div>

              <div className="pj-field">
                <label className="pj-label">Motivo</label>
                <input
                  className="pj-input"
                  placeholder="Describe el motivo…"
                  value={form.motivo}
                  onChange={(e) => setForm(f => ({ ...f, motivo: e.target.value }))}
                />
              </div>

              <div className="pj-field">
                <label className="pj-label">Adjunto (nombre de archivo)</label>
                <input
                  className="pj-input"
                  placeholder="ej: certificado.pdf"
                  value={form.adjuntoNombre}
                  onChange={(e) => setForm(f => ({ ...f, adjuntoNombre: e.target.value }))}
                />
              </div>

              <div className="pj-flag pj-flag--info">
                SLA estimado: <b>{Math.abs(slaPreview)}h</b> {slaPreview < 0 ? "vencido" : "restantes"} al cierre.
              </div>
            </div>
            <div className="pj-modal-foot">
              <button className="pj-btn-ghost" onClick={() => setOpenCreate(false)} disabled={saving}>Cancelar</button>
              <button className="pj-btn-primary" onClick={saveCreate} disabled={saving}>
                {saving ? "Guardando…" : "Crear permiso"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
