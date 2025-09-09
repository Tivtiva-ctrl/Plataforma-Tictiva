// Hecho por Asistente de Programación de Google
import React, { useEffect, useState } from "react";
// import { useNavigate, useParams, useLocation } from 'react-router-dom';

// --- Mocks para el entorno de desarrollo ---
const useParams = () => ({ rut: "12345678-9" });
const useLocation = () => ({ pathname: "/", search: "", hash: "" });
const useNavigate = () => (path) => {
  if (path === -1) {
    alert("Acción: Volver a la página anterior.");
  } else {
    alert(`Acción: Navegar a la ruta: ${path}.`);
  }
};
const EmpleadosAPI = {
  list: async () => ([{
    id: 1, rut: "12.345.678-9", nombre: "Juan Díaz Morales", cargo: "Gerente de Operaciones", estado: "Activo", fechaIngreso: "2021-03-02T00:00:00.000Z", fechaNacimiento: "1985-04-15T00:00:00.000Z", correo: "juan.diaz@empresa.com", telefono: "+56 9 8765 4321", direccion: "Av. Providencia 1234, Santiago", estadoCivil: "Casado(a)",
    datosContractuales: { cargoActual: "Gerente de Operaciones", tipoContrato: "Indefinido", jornada: "Jornada Completa", sueldoBase: 1800000 },
    bancarios: { banco: "Banco de Chile", tipoCuenta: "Cuenta Corriente", numeroCuenta: "1234567890" },
    prevision: { afp: "Capital", sistemaSalud: "Isapre", isapre: "Colmena", cajaCompensacion: "Los Andes", mutual: "ACHS" },
    hojaVida: {
      alertaMedica: "Alergia a la Penicilina",
      emergencia: [{ nombre: "María Morales", relacion: "Madre", telefono: "+56 9 1234 5678" }, { nombre: "Pedro Díaz", relacion: "Padre", telefono: "+56 9 8765 4321" }],
      medico: { grupoSanguineo: "O+", alergias: ["Penicilina", "Maní"], condicionesCronicas: ["Asma Leve"] },
    }
  }])
};

// --- Componentes y Utilidades ---
const VolverAtras = () => {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(-1)} className="volver-btn">
      &larr; Volver
    </button>
  );
};

const mesesEs = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const fmtFechaLarga = (iso) => !iso ? "—" : new Date(iso).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' });
const antiguedadStr = (desdeISO) => {
    if (!desdeISO) return "";
    const start = new Date(desdeISO);
    const now = new Date();
    const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    const y = Math.floor(months / 12);
    const m = months % 12;
    if (y < 0) return "";
    const aTxt = y === 1 ? "1 año" : `${y} años`;
    const mTxt = m === 1 ? "1 mes" : `${m} meses`;
    return `${aTxt} y ${mTxt}`;
};

// --- Componentes de Pestañas (Tabs) ---
const PersonalesTab = ({ empleado, modoEdicion, onChange }) => {
    const cumpleISO = empleado.fechaNacimiento || "";
    const fields = [
      { key: "nombre", label: "Nombre Completo", type: "text" },
      { key: "rut", label: "Cédula", type: "text", disabled: true },
      { key: "fechaNacimiento", label: "Fecha de Nacimiento", type: "date" },
      { key: "correo", label: "Email", type: "email" },
      { key: "telefono", label: "Teléfono", type: "tel" },
      { key: "direccion", label: "Dirección", type: "text" },
      { key: "estadoCivil", label: "Estado Civil", type: "text" },
    ];
    return (
      <div className="ed-card">
        <h3 className="ed-card-title">Información Personal</h3>
        <div className="ed-kv">
          {fields.map(f => (
            <div className="ed-kv-row" key={f.key}>
              <span className="ed-kv-label">{f.label}:</span>
              {modoEdicion ? (
                <input type={f.type} value={f.key === 'fechaNacimiento' ? cumpleISO.slice(0,10) : (empleado[f.key] || "")} onChange={(e) => onChange(f.key, e.target.value)} disabled={f.disabled} />
              ) : (
                <span className="ed-kv-value">{f.key === 'fechaNacimiento' ? fmtFechaLarga(cumpleISO) : (empleado[f.key] || "—")}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
};
const ContractualesTab = ({ empleado, modoEdicion, onChange }) => {
  const datos = empleado?.datosContractuales || {};
  const handleFieldChange = (field, value) => onChange("datosContractuales", { ...datos, [field]: value });
  const fields = [{ key: "cargoActual", label: "Cargo Actual" }, { key: "tipoContrato", label: "Tipo de Contrato" }, { key: "jornada", label: "Jornada" }, { key: "sueldoBase", label: "Sueldo Base", type: "number" }];
  return (
    <div className="ed-card">
      <h3 className="ed-card-title">Datos Contractuales</h3>
      <div className="ed-2col">
        {fields.map(f => (
          <div className="ed-kv-row" key={f.key}>
            <span className="ed-kv-label">{f.label}:</span>
            {modoEdicion ? (
              <input type={f.type || "text"} value={datos[f.key] || ""} onChange={(e) => handleFieldChange(f.key, e.target.value)} />
            ) : (
              <span className="ed-kv-value">{f.key === 'sueldoBase' && datos[f.key] ? `$${Number(datos[f.key]).toLocaleString('es-CL')}` : (datos[f.key] || "N/D")}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
const PrevisionTab = ({ empleado, modoEdicion, onChange }) => {
    const pv = empleado?.prevision || {};
    const handleFieldChange = (field, value) => onChange("prevision", { ...pv, [field]: value });
    const fields = [ { key: "afp", label: "AFP" }, { key: "sistemaSalud", label: "Sistema de Salud" }, { key: "isapre", label: "Nombre Isapre" }];
    return (
      <div className="ed-card">
        <h3 className="ed-card-title">Datos Previsionales</h3>
        <div className="ed-2col">
            {fields.map(f => (
                <div className="ed-kv-row" key={f.key}>
                    <span className="ed-kv-label">{f.label}:</span>
                    {modoEdicion ? ( <input type="text" value={pv[f.key] || ""} onChange={(e) => handleFieldChange(f.key, e.target.value)} /> ) : ( <span className="ed-kv-value">{pv[f.key] || "N/D"}</span> )}
                </div>
            ))}
        </div>
      </div>
    );
};
const BancariosTab = ({ empleado, modoEdicion, onChange }) => {
    const b = empleado?.bancarios || {};
    const handleFieldChange = (field, value) => onChange("bancarios", { ...b, [field]: value });
    const fields = [ { key: "banco", label: "Banco" }, { key: "tipoCuenta", label: "Tipo de Cuenta" }, { key: "numeroCuenta", label: "Número de Cuenta" } ];
    return (
      <div className="ed-card">
        <h3 className="ed-card-title">Datos Bancarios</h3>
        <div className="ed-2col">
          {fields.map(f => (
            <div className="ed-kv-row" key={f.key}>
              <span className="ed-kv-label">{f.label}:</span>
              {modoEdicion ? ( <input type="text" value={b[f.key] || ""} onChange={(e) => handleFieldChange(f.key, e.target.value)} /> ) : ( <span className="ed-kv-value">{b[f.key] || "N/D"}</span> )}
            </div>
          ))}
        </div>
      </div>
    );
};
function HojaDeVida({ empleado, modoEdicion, onChange }) {
  const hv = empleado?.hojaVida || {};
  const handleHvChange = (field, value, section = null, index = -1) => {
    const newHv = JSON.parse(JSON.stringify(hv));
    if (section) {
        if (index > -1) { newHv[section][index][field] = value; }
        else { newHv[section][field] = value; }
    } else { newHv[field] = value; }
    onChange('hojaVida', newHv);
  };
  return (
    <div className="ed-card">
      <h3 className="ed-card-title">Hoja de Vida y Ficha Médica</h3>
      <div className="hv-card">
          <h4 className="hv-title">Alerta Médica</h4>
          {modoEdicion ? (<input type="text" value={hv.alertaMedica || ""} onChange={(e) => handleHvChange('alertaMedica', e.target.value)}/>) : (<div className="hv-alert">{hv.alertaMedica || "Sin alertas"}</div>)}
      </div>
      <div className="hv-card">
        <h4 className="hv-title">Contactos de Emergencia</h4>
        <div className="hv-grid2">
          {(hv.emergencia || []).slice(0, 2).map((c, idx) => (
            <div key={idx} className="hv-contact">
              {modoEdicion ? (
                <div className="form-stack">
                  <input placeholder="Nombre" value={c.nombre || ""} onChange={e => handleHvChange('nombre', e.target.value, 'emergencia', idx)} />
                  <input placeholder="Relación" value={c.relacion || ""} onChange={e => handleHvChange('relacion', e.target.value, 'emergencia', idx)} />
                  <input placeholder="Teléfono" value={c.telefono || ""} onChange={e => handleHvChange('telefono', e.target.value, 'emergencia', idx)} />
                </div>
              ) : (
                <>
                  <div className="hv-strong">{c.nombre || "N/D"}</div>
                  <div className="hv-muted">{c.relacion || ""}</div>
                  <div className="hv-row"><span className="hv-label">Teléfono:</span><span className="hv-val">{c.telefono || "—"}</span></div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
const DocumentosTab = () => ( <div className="ed-card"><h3 className="ed-card-title">Documentos</h3><p className="placeholder-text">El listado de documentos aparecerá aquí.</p></div> );
const AsistenciaTab = () => ( <div className="ed-card"><h3 className="ed-card-title">Asistencia</h3><p className="placeholder-text">El registro de asistencia aparecerá aquí.</p></div> );
const HistorialTab = () => ( <div className="ed-card"><h3 className="ed-card-title">Historial</h3><p className="placeholder-text">El historial de eventos aparecerá aquí.</p></div> );


// ==================================================================
//  Componente Principal
// ==================================================================
export default function EmpleadoDetalle() {
  const [empleado, setEmpleado] = useState(null);
  const [original, setOriginal] = useState(null);
  const [tabActiva, setTabActiva] = useState("personales");
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => {
    const fetchEmpleado = async () => {
      const empList = await EmpleadosAPI.list();
      setEmpleado(empList[0]);
      setOriginal(JSON.parse(JSON.stringify(empList[0])));
    };
    fetchEmpleado();
  }, []);

  const handleChange = (campo, valor) => setEmpleado((prev) => ({ ...prev, [campo]: valor }));
  const guardarEmpleado = () => {
      setOriginal(JSON.parse(JSON.stringify(empleado)));
      setModoEdicion(false);
      alert("¡Cambios guardados!");
  };
  const cancelarEdicion = () => {
      setEmpleado(original);
      setModoEdicion(false);
  };

  if (!empleado) return <div className="ed-wrap">Cargando...</div>;

  return (
    <div className="ed-wrap">
      <VolverAtras />
      <div className="ed-card ed-head">
        <div className="ed-avatar">{empleado.nombre?.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}</div>
        <div className="ed-head-main">
          <h2 className="ed-name">{empleado.nombre}</h2>
          <span className="ed-badge is-ok">{empleado.estado}</span>
          <p className="ed-sub">{empleado.cargo}</p>
          <p className="ed-sub light">Miembro desde el {fmtFechaLarga(empleado.fechaIngreso)} ({antiguedadStr(empleado.fechaIngreso)})</p>
        </div>
        <div className="header-actions">
        {modoEdicion ? (
          <>
            <button className="ed-btn" onClick={cancelarEdicion}>Cancelar</button>
            <button className="ed-btn primary" onClick={guardarEmpleado}>Guardar Cambios</button>
          </>
        ) : (
          <button className="ed-btn" onClick={() => setModoEdicion(true)}>Editar Ficha</button>
        )}
        </div>
      </div>

      <div className="ed-tabs">
        {[ "Personales", "Contractuales", "Documentos", "Previsión", "Bancarios", "Asistencia", "Hoja de Vida", "Historial" ].map(t => {
          const id = t.toLowerCase().replace(/\s+/g, '').replace('ó','o');
          return (<button key={id} className={`ed-tab ${tabActiva === id ? "is-active" : ""}`} onClick={() => setTabActiva(id)}>{t}</button>);
        })}
      </div>

      <div className="ed-grid">
        <div className="ed-left">
          {tabActiva === "personales" && <PersonalesTab empleado={empleado} modoEdicion={modoEdicion} onChange={handleChange} />}
          {tabActiva === "contractuales" && <ContractualesTab empleado={empleado} modoEdicion={modoEdicion} onChange={handleChange} />}
          {tabActiva === "documentos" && <DocumentosTab />}
          {tabActiva === "previsión" && <PrevisionTab empleado={empleado} modoEdicion={modoEdicion} onChange={handleChange} />}
          {tabActiva === "bancarios" && <BancariosTab empleado={empleado} modoEdicion={modoEdicion} onChange={handleChange} />}
          {tabActiva === "asistencia" && <AsistenciaTab />}
          {tabActiva === "hojadevida" && <HojaDeVida empleado={empleado} modoEdicion={modoEdicion} onChange={handleChange} />}
          {tabActiva === "historial" && <HistorialTab />}
        </div>
        <aside className="ed-right">
          <div className="ed-card"><h4 className="ed-card-title">Información Rápida</h4><p className="placeholder-text">Resumen...</p></div>
        </aside>
      </div>

      {/* ================================================================== */}
      {/* ✅ CSS CORREGIDO Y CENTRALIZADO                                   */}
      {/* ================================================================== */}
      <style>{`
        :root { --brand-color: #1A56DB; --border-color: #E5E7EB; --text-light: #6B7280; --text-dark: #111827; }
        body { background: #f9fafb; font-family: Inter, system-ui, sans-serif; color: var(--text-dark); }
        .ed-wrap { padding: 1rem; max-width: 1200px; margin: auto; }
        .ed-card { background: #fff; border: 1px solid var(--border-color); border-radius: 1rem; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,.05); }
        .ed-head { display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem; }
        .ed-avatar { width: 64px; height: 64px; border-radius: 1rem; background: #E0E7FF; color: #1E3A8A; font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; flex-shrink: 0; }
        .ed-head-main { flex: 1; }
        .ed-head-main > * { margin: 0 0 0.25rem; }
        .ed-name { font-size: 1.5rem; font-weight: 800; display: inline-block; margin-right: 0.5rem; }
        .ed-badge { font-weight: 700; font-size: 0.75rem; border-radius: 999px; padding: 0.25rem 0.75rem; display: inline-block; vertical-align: middle; }
        .ed-badge.is-ok { background: #D1FAE5; color: #065F46; border: 1px solid #A7F3D0; }
        .ed-sub { color: var(--text-dark); }
        .ed-sub.light { color: var(--text-light); }
        .header-actions { display: flex; gap: 0.5rem; }
        .volver-btn { background: none; border: none; padding: 0; cursor: pointer; color: var(--brand-color); font-weight: 600; margin-bottom: 1rem; font-size: 1rem; }
        .ed-btn { background: #fff; border: 1px solid var(--border-color); border-radius: 0.5rem; padding: 0.5rem 0.75rem; cursor: pointer; font-weight: 600; }
        .ed-btn.primary { background: var(--brand-color); color: #fff; border-color: var(--brand-color); }
        .ed-tabs { display: flex; gap: 0.5rem; margin: 0 0 1rem; flex-wrap: wrap; border-bottom: 1px solid var(--border-color); }
        .ed-tab { background: transparent; border: none; border-bottom: 3px solid transparent; border-radius: 0; padding: 0.5rem 0.25rem; cursor: pointer; color: var(--text-light); font-weight: 600; }
        .ed-tab.is-active { border-bottom-color: var(--brand-color); color: var(--brand-color); }
        .ed-grid { display: grid; grid-template-columns: minmax(0, 2.5fr) minmax(280px, 1fr); gap: 1rem; }
        @media (max-width: 980px) { .ed-grid { grid-template-columns: 1fr; } }
        .ed-left, .ed-right { display: flex; flex-direction: column; gap: 1rem; }
        .ed-card-title { margin: 0 0 1rem; font-size: 1.125rem; font-weight: 800; }
        
        /* --- ESTILOS PARA FILAS Y FORMULARIOS --- */
        .ed-kv-row { display: flex; justify-content: space-between; gap: 1rem; padding: 0.8rem 0; border-top: 1px solid #F3F4F6; align-items: center; }
        .ed-kv-row:first-child { border-top: none; }
        .ed-kv-label { color: var(--text-light); flex-shrink: 0; }
        .ed-kv-value { font-weight: 600; text-align: right; }
        .ed-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem 1.5rem; }
        .ed-2col .ed-kv-row { padding: 0.5rem 0; }
        .placeholder-text { color: var(--text-light); }

        /* --- ESTILOS PARA INPUTS (MODO EDICIÓN) --- */
        input[type="text"], input[type="email"], input[type="tel"], input[type="date"], input[type="number"] {
            border: 1px solid #D1D5DB;
            border-radius: 0.5rem;
            padding: 0.5rem 0.75rem;
            font-size: 1rem;
            font-family: inherit;
            width: 100%;
            box-sizing: border-box;
        }
        .ed-kv-row input { text-align: right; width: auto; flex-grow: 1; max-width: 300px; }
        .ed-2col input { text-align: left; }
        
        /* --- ESTILOS PARA HOJA DE VIDA --- */
        .hv-card { border: 1px solid var(--border-color); border-radius: 0.75rem; padding: 1rem; margin-top: 1rem; }
        .hv-title { margin: 0 0 0.5rem; font-size: 1rem; font-weight: 700; }
        .hv-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .hv-contact { border: 1px solid #F3F4F6; border-radius: 0.5rem; padding: 1rem; }
        .hv-row { display: flex; justify-content: space-between; gap: 1rem; padding: 0.5rem 0; border-top: 1px solid #F3F4F6; }
        .hv-row:first-child { border-top: none; }
        .hv-label { color: var(--text-light); }
        .hv-val, .hv-strong { font-weight: 600; }
        .hv-muted { color: var(--text-light); font-size: 0.9rem; }
        .hv-alert { background: #FFFBEB; border: 1px solid #FDE68A; border-radius: 0.75rem; padding: 1rem; }
        .form-stack input { margin-bottom: 0.5rem; }
        .form-stack input:last-child { margin-bottom: 0; }
      `}</style>
    </div>
  );
}