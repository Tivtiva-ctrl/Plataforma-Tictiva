// src/components/HistorialMovimientos.jsx
import React, { useMemo, useState } from "react";

// Catálogo DT y PLUS
const MOVIMIENTOS_DT = [
  { key: "ingreso", label: "Ingreso", icon: "📥" },
  { key: "cambio_cargo", label: "Cambio de Cargo / Funciones", icon: "🧰" },
  { key: "cambio_jornada", label: "Cambio de Jornada", icon: "🕘" },
  { key: "cambio_remuneracion", label: "Cambio de Remuneración", icon: "💵" },
  { key: "termino_contrato", label: "Término de Contrato", icon: "🛑" },
  { key: "traslado", label: "Traslado de lugar de trabajo", icon: "📍" },
  { key: "suspension", label: "Suspensión de contrato", icon: "⏸️" },
  { key: "reincorporacion", label: "Reincorporación", icon: "▶️" },
  { key: "modificacion_contrato", label: "Modificación de contrato", icon: "✍️" },
  { key: "beneficios_contractuales", label: "Asignación / retiro de beneficios", icon: "🎁" },
];

const MOVIMIENTOS_PLUS = [
  { key: "aumento_desempeno", label: "Aumento de Sueldo por Desempeño", icon: "📈" },
  { key: "reconocimiento", label: "Reconocimiento Interno", icon: "🏅" },
  { key: "capacitacion", label: "Capacitación Finalizada", icon: "🎓" },
  { key: "proyecto_especial", label: "Asignación a Proyectos Especiales", icon: "🚀" },
  { key: "cambio_supervisor", label: "Cambio de Supervisor", icon: "👤" },
  { key: "modalidad_trabajo", label: "Cambio de Modalidad (Remoto/Híbrido)", icon: "💻" },
  { key: "beneficio_extra", label: "Beneficio Extra (ej. seguro, giftcard)", icon: "🎫" },
  { key: "licencia_especial", label: "Licencias especiales", icon: "🍼" },
  { key: "reasignacion_temporal", label: "Reasignación temporal", icon: "🔁" },
  { key: "evaluacion_desempeno", label: "Evaluación de desempeño", icon: "⭐" },
];

const CATALOGO = [...MOVIMIENTOS_DT, ...MOVIMIENTOS_PLUS];

const MOVIMIENTOS_EJEMPLO = [
  {
    id: "m1",
    tipoKey: "ingreso",
    movimiento: "Ingreso",
    descripcion: "Contratación como Desarrollador Junior",
    fechaEfecto: "2024-01-15",
    registradoPor: "RR.HH.",
    documento: { nombre: "Contrato.pdf", url: "#" },
  },
];

const getIcon = (key) => CATALOGO.find((c) => c.key === key)?.icon ?? "📄";
const ddmmyyyy = (iso) => (iso ? iso.split("-").reverse().join("/") : "");

function Modal({ open, onClose, onSave }) {
  const [tipoKey, setTipoKey] = useState("ingreso");
  const [descripcion, setDescripcion] = useState("");
  const [fechaEfecto, setFechaEfecto] = useState("");
  const [registradoPor, setRegistradoPor] = useState("RR.HH.");
  const [docFile, setDocFile] = useState(null);

  const label = useMemo(
    () => CATALOGO.find((c) => c.key === tipoKey)?.label ?? "Movimiento",
    [tipoKey]
  );

  if (!open) return null;

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return setDocFile(null);
    const url = URL.createObjectURL(f);
    setDocFile({ nombre: f.name, url });
  };

  const save = (e) => {
    e.preventDefault();
    const nuevo = {
      id: `m-${Date.now()}`,
      tipoKey,
      movimiento: label,
      descripcion: descripcion?.trim() || label,
      fechaEfecto,
      registradoPor: registradoPor?.trim() || "RR.HH.",
      documento: docFile || null,
    };
    onSave(nuevo);
    setTipoKey("ingreso");
    setDescripcion("");
    setFechaEfecto("");
    setRegistradoPor("RR.HH.");
    setDocFile(null);
    onClose();
  };

  return (
    <>
      <div className="hm-backdrop" onClick={onClose} />
      <div className="hm-modal">
        <div className="hm-modal__header">
          <h3 className="hm-modal__title">Agregar Movimiento</h3>
          <button className="hm-btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
        <form onSubmit={save} className="hm-modal__body">
          <div className="hm-form-row">
            <label className="hm-label">Movimiento</label>
            <select className="hm-input" value={tipoKey} onChange={(e) => setTipoKey(e.target.value)}>
              <optgroup label="DT (Obligatorios)">
                {MOVIMIENTOS_DT.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
              </optgroup>
              <optgroup label="PLUS Tictiva">
                {MOVIMIENTOS_PLUS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
              </optgroup>
            </select>
          </div>

          <div className="hm-form-row">
            <label className="hm-label">Descripción</label>
            <textarea className="hm-input" rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
          </div>

          <div className="hm-form-grid">
            <div className="hm-form-row">
              <label className="hm-label">Fecha de Efecto</label>
              <input type="date" className="hm-input" value={fechaEfecto} onChange={(e) => setFechaEfecto(e.target.value)} required />
            </div>
            <div className="hm-form-row">
              <label className="hm-label">Registrado por</label>
              <input type="text" className="hm-input" value={registradoPor} onChange={(e) => setRegistradoPor(e.target.value)} />
            </div>
          </div>

          <div className="hm-form-row">
            <label className="hm-label">Documento (PDF, opcional)</label>
            <input type="file" className="hm-input" accept="application/pdf" onChange={handleFile} />
            {docFile && (
              <div className="hm-doc-preview">
                <span>📎</span>{" "}
                <a href={docFile.url} target="_blank" rel="noreferrer">{docFile.nombre}</a>
              </div>
            )}
          </div>

          <div className="hm-modal__footer">
            <button type="button" className="hm-btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="hm-btn-primary">Guardar</button>
          </div>
        </form>
      </div>
    </>
  );
}

export default function HistorialMovimientos({ movimientos, onAdd }) {
  const usingExternal = Array.isArray(movimientos);
  const [localMovs, setLocalMovs] = useState(MOVIMIENTOS_EJEMPLO);
  const source = usingExternal ? movimientos : localMovs;

  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroAnio, setFiltroAnio] = useState("todos");
  const [open, setOpen] = useState(false);

  const anios = useMemo(() => {
    const set = new Set(source.map((m) => m.fechaEfecto?.slice(0,4)).filter(Boolean));
    return Array.from(set).sort((a,b) => Number(b) - Number(a));
  }, [source]);

  const list = useMemo(() => {
    return source.filter((m) => {
      const typeOK = filtroTipo === "todos" ? true : m.tipoKey === filtroTipo;
      const yearOK = filtroAnio === "todos" ? true : m.fechaEfecto?.slice(0,4) === String(filtroAnio);
      return typeOK && yearOK;
    });
  }, [source, filtroTipo, filtroAnio]);

  const clearFilters = () => { setFiltroTipo("todos"); setFiltroAnio("todos"); };

  const saveNew = (nuevo) => {
    if (typeof onAdd === "function") {
      onAdd(nuevo); // manda al padre (EmpleadoDetalle) para guardar con el empleado
    } else {
      setLocalMovs((prev) => [nuevo, ...prev]); // fallback local
    }
  };

  return (
    <div className="hm-container">
      {/* Header */}
      <div className="hm-header-card">
        <div className="hm-header-left">
          <div className="hm-header-icon">📜</div>
          <div>
            <h2 className="hm-title">Historial de Movimientos</h2>
            <p className="hm-subtitle">Registro completo de eventos laborales del trabajador</p>
          </div>
        </div>
        <button className="hm-help-btn" title="Incluye exigidos por la DT y PLUS Tictiva.">?</button>
      </div>

      {/* Filtros */}
      <div className="hm-filters">
        <div className="hm-filter-field">
          <label className="hm-filter-label">Tipo de Movimiento</label>
          <select className="hm-input" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="todos">Todos los movimientos</option>
            <optgroup label="DT (Obligatorios)">
              {MOVIMIENTOS_DT.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
            </optgroup>
            <optgroup label="PLUS Tictiva">
              {MOVIMIENTOS_PLUS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
            </optgroup>
          </select>
        </div>

        <div className="hm-filter-field">
          <label className="hm-filter-label">Año</label>
          <select className="hm-input" value={filtroAnio} onChange={(e) => setFiltroAnio(e.target.value)}>
            <option value="todos">Todos los años</option>
            {anios.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="hm-filter-actions">
          <button className="hm-btn-secondary" onClick={clearFilters}>Limpiar Filtros</button>
          <button className="hm-btn-primary" onClick={() => setOpen(true)}>+ Agregar Movimiento</button>
        </div>
      </div>

      {/* Tabla */}
      <div className="hm-table">
        <div className="hm-thead">
          <div className="hm-tr">
            <div className="hm-th">Movimiento</div>
            <div className="hm-th">Descripción</div>
            <div className="hm-th">Fecha de Efecto</div>
            <div className="hm-th">Registrado por</div>
            <div className="hm-th">Documento</div>
          </div>
        </div>
        <div className="hm-tbody">
          {list.length === 0 && <div className="hm-empty">No hay movimientos para los filtros seleccionados.</div>}

          {list.map((m) => (
            <div className="hm-tr hm-row" key={m.id}>
              <div className="hm-td">
                <span className="hm-mov-icon" aria-hidden="true">{getIcon(m.tipoKey)}</span>
                <span className="hm-mov-text">{m.movimiento}</span>
              </div>
              <div className="hm-td hm-td-desc">{m.descripcion}</div>
              <div className="hm-td">{ddmmyyyy(m.fechaEfecto)}</div>
              <div className="hm-td">{m.registradoPor}</div>
              <div className="hm-td">
                {m.documento ? (
                  <a className="hm-link" href={m.documento.url} target="_blank" rel="noreferrer">
                    {m.documento.nombre}
                  </a>
                ) : (
                  <span className="hm-muted">Sin documento</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <Modal open={open} onClose={() => setOpen(false)} onSave={saveNew} />
    </div>
  );
}
