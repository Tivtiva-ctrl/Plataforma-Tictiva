// Hecho por Asistente de Programación de Google
import React, { useEffect, useState } from "react";
// import { useNavigate, useParams, useLocation } from 'react-router-dom'; // <- Descomenta esto en tu app real

// --- mocks para este entorno.
const useParams = () => ({ rut: "12345678-9" });
const useLocation = () => ({ pathname: "/", search: "", hash: "" });
const useNavigate = () => (path) => {
  if (path === -1) {
    alert("Acción: Volver a la página anterior (listado de empleados).");
  } else {
    alert(`Acción: Navegar a la ruta: ${path}.`);
  }
};

// --- mocks date-fns
const parseISO = (iso) => new Date(iso);
const differenceInMinutes = (a, b) => (a.getTime() - b.getTime()) / 60000;

// --- mock de API
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
    datosContractuales: { cargoActual: "Gerente de Operaciones", tipoContrato: "Indefinido", jornada: "Jornada Completa", sueldoBase: 1800000 },
    bancarios: { banco: "Banco de Chile", tipoCuenta: "Cuenta Corriente", numeroCuenta: "1234567890" },
    prevision: { afp: "Capital", sistemaSalud: "Isapre", isapre: "Colmena", cajaCompensacion: "Los Andes", mutual: "ACHS" },
    credencialesApp: { pin: "8421" },
    marcas: [
      { fecha: "2025-09-01", hora: "08:58:00", tipo: "Entrada", estado: "Válida", metodo: "App", ip: "192.168.1.10" },
      { fecha: "2025-09-01", hora: "18:02:00", tipo: "Salida",  estado: "Válida", metodo: "App", ip: "192.168.1.10" },
    ],
    historial: [{ id: 1, fecha: "2024-08-15", hora: "10:00", actor: "V. Mateo", accion: "Anexo de Contrato", categoria: "Contrato", detalle: "Se firma anexo por cambio de cargo a Gerente." }],
    documentos: [{ id: "d1", tipo: "file", nombre: "Reglamento Interno 2025.pdf", mod: "2025-01-10", tam: "1.2 MB" }],
    hojaVida: {
      alertaMedica: "Alergia a la Penicilina",
      emergencia: [
        { nombre: "María Morales", relacion: "Madre", telefono: "+56 9 1234 5678" },
        { nombre: "Pedro Díaz", relacion: "Padre", telefono: "+56 9 8765 4321" },
      ],
      medico: { grupoSanguineo: "O+", alergias: ["Penicilina", "Maní"], condicionesCronicas: ["Asma Leve"] },
      trayectoria: [{ cargo: "Gerente de Operaciones", desde: "2025-07-31", detalle: "Promoción a rol gerencial." }],
      educacion: [{ titulo: "Ingeniería Civil Industrial", institucion: "Universidad de Chile", desde: "2008", hasta: "2013" }],
    }
  }])
};

// ==================================================================
//  Componente "Volver"
// ==================================================================
const VolverAtras = () => {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#3b82f6', fontWeight: '600', marginBottom: '16px', display: 'inline-block', fontSize: '1em' }}>
      &larr; Volver
    </button>
  );
};

// ==================================================================
//  Utilidades
// ==================================================================
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


// ==================================================================
//  Componentes de Pestaña (Tabs)
// ==================================================================

const PersonalesTab = ({ empleado, modoEdicion, onChange }) => {
    const cumpleISO = empleado.fechaNacimiento || empleado.nacimiento || empleado?.personales?.fechaNacimiento;
    const cumpleTxt = cumpleISO ? fmtFechaLarga(cumpleISO).replace(/^0?(\d{1,2}) de /, (_, d) => `${d} de `) : "—";
    const fields = [
      { key: "nombre", label: "Nombre Completo", value: empleado.nombre, type: "text" },
      { key: "rut", label: "Cédula", value: empleado.rut, type: "text", disabled: true },
      { key: "fechaNacimiento", label: "Fecha de Nacimiento", value: cumpleISO ? cumpleISO.slice(0,10) : "", displayValue: cumpleTxt, type: "date" },
      { key: "correo", label: "Email", value: empleado.correo, type: "email" },
      { key: "telefono", label: "Teléfono", value: empleado.telefono, type: "tel" },
      { key: "direccion", label: "Dirección", value: empleado.direccion, type: "text" },
      { key: "estadoCivil", label: "Estado Civil", value: empleado.estadoCivil, type: "text" },
    ];
    return (
      <div className="ed-card">
        <h3 className="ed-card-title">Información Personal</h3>
        <div className="ed-kv">
          {fields.map(f => (
            <div className="ed-kv-row" key={f.key}>
              <span className="ed-kv-label">{f.label}:</span>
              {modoEdicion ? (
                <input type={f.type} value={f.value || ""} onChange={(e) => onChange(f.key, e.target.value)} disabled={f.disabled} style={{textAlign: 'right', border: '1px solid #ddd', borderRadius: '8px', padding: '6px 8px'}}/>
              ) : (
                <span className="ed-kv-value">{f.displayValue || f.value || "—"}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
};

const ContractualesTab = ({ empleado, modoEdicion, onChange }) => {
  const datos = empleado?.datosContractuales || {};
  const handleFieldChange = (field, value) => {
      onChange("datosContractuales", { ...datos, [field]: value });
  };
  const fields = [
      { key: "cargoActual", label: "Cargo Actual" },
      { key: "tipoContrato", label: "Tipo de Contrato" },
      { key: "jornada", label: "Jornada" },
      { key: "sueldoBase", label: "Sueldo Base", type: "number" },
  ];
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
      <style>{`.ed-2col{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px}.ed-2col .ed-kv-row{border-top:none;padding:10px 2px} .ed-2col input {width:100%}`}</style>
    </div>
  );
};

const PrevisionTab = ({ empleado, modoEdicion, onChange }) => {
    const pv = empleado?.prevision || {};
    const handleFieldChange = (field, value) => onChange("prevision", { ...pv, [field]: value });
    const fields = [ { key: "afp", label: "AFP" }, { key: "sistemaSalud", label: "Sistema de Salud" }, { key: "isapre", label: "Nombre Isapre" }, { key: "cajaCompensacion", label: "Caja de Compensación" }, { key: "mutual", label: "Mutual de Seguridad" } ];
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
        <style>{`.ed-2col{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px}.ed-2col .ed-kv-row{border-top:none;padding:10px 2px} .ed-2col input {width:100%}`}</style>
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
        <style>{`.ed-2col{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px}.ed-2col .ed-kv-row{border-top:none;padding:10px 2px} .ed-2col input {width:100%}`}</style>
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
    <div className="ed-card hv-wrap">
      <h3 className="ed-card-title" style={{margin:0}}>Hoja de Vida y Ficha Médica</h3>
      <div className="hv-card">
          <h4 className="hv-title">Alerta Médica</h4>
          {modoEdicion ? (<input type="text" className="hv-input" value={hv.alertaMedica || ""} onChange={(e) => handleHvChange('alertaMedica', e.target.value)}/>) : (<div className="hv-alert">{hv.alertaMedica || "Sin alertas"}</div>)}
      </div>
      <div className="hv-card">
        <h4 className="hv-title">Contactos de Emergencia</h4>
        <div className="hv-grid2">
          {(hv.emergencia || []).slice(0, 2).map((c, idx) => (
            <div key={idx} className="hv-contact">
              {modoEdicion ? (
                <>
                  <input placeholder="Nombre" className="hv-input" value={c.nombre || ""} onChange={e => handleHvChange('nombre', e.target.value, 'emergencia', idx)} />
                  <input placeholder="Relación" className="hv-input" value={c.relacion || ""} onChange={e => handleHvChange('relacion', e.target.value, 'emergencia', idx)} />
                  <input placeholder="Teléfono" className="hv-input" value={c.telefono || ""} onChange={e => handleHvChange('telefono', e.target.value, 'emergencia', idx)} />
                </>
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
      <div className="hv-card">
        <h4 className="hv-title">Ficha Médica</h4>
        <div className="hv-kv-edit">
          <div className="hv-row"><span className="hv-label">Grupo Sanguíneo:</span>{modoEdicion ? <input className="hv-input-right" value={hv.medico?.grupoSanguineo||""} onChange={e=>handleHvChange('grupoSanguineo', e.target.value, 'medico')} /> : <span className="hv-val">{hv.medico?.grupoSanguineo||"N/D"}</span>}</div>
          <div className="hv-row"><span className="hv-label">Alergias (separar por comas):</span>{modoEdicion ? <input className="hv-input-right" value={Array.isArray(hv.medico?.alergias)?hv.medico.alergias.join(", "):""} onChange={e=>handleHvChange('alergias', e.target.value.split(','), 'medico')} /> : <span className="hv-val">{Array.isArray(hv.medico?.alergias)?hv.medico.alergias.join(", "):(hv.medico?.alergias||"N/D")}</span>}</div>
        </div>
      </div>
      <style>{`.hv-card{border:1px solid #E5E7EB;border-radius:12px;padding:12px;margin-top:12px;background:#fff} .hv-title{margin:0 0 8px;font-size:16px;font-weight:800;color:#111827} .hv-grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px} .hv-contact{border:1px solid #F3F4F6;border-radius:10px;padding:10px} .hv-row{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-top:1px solid #F3F4F6} .hv-label{color:#6B7280} .hv-val,.hv-strong{font-weight:700} .hv-muted{color:#6B7280} .hv-input{width:100%;border:1px solid #ddd;border-radius:8px;padding:6px 8px;margin-bottom:4px} .hv-input-right{border:1px solid #ddd;border-radius:8px;padding:6px 8px;text-align:right} .hv-alert{background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:12px} .hv-kv-edit .hv-row{align-items:center}`}</style>
    </div>
  );
}

// --- Componentes de solo lectura ---
const DocumentosTab = ({ empleado }) => ( <div className="ed-card"><h3 className="ed-card-title">Documentos</h3><p>Aquí va la lista de documentos...</p></div> );
const AsistenciaTab = ({ empleado }) => ( <div className="ed-card"><h3 className="ed-card-title">Asistencia</h3><p>Aquí va el registro de asistencia...</p></div> );
const HistorialTab = ({ empleado }) => ( <div className="ed-card"><h3 className="ed-card-title">Historial</h3><p>Aquí va el historial de eventos...</p></div> );


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
      const emp = await EmpleadosAPI.list();
      setEmpleado(emp[0]);
      setOriginal(JSON.parse(JSON.stringify(emp[0]))); // Guardar copia original
    };
    fetchEmpleado();
  }, []);

  const handleChange = (campo, valor) => {
      setEmpleado((prev) => ({ ...prev, [campo]: valor }));
  };
  
  const guardarEmpleado = () => {
      console.log("Guardando:", empleado);
      setOriginal(JSON.parse(JSON.stringify(empleado))); // El nuevo "original" es lo guardado
      setModoEdicion(false);
      alert("¡Cambios guardados!");
  };

  const cancelarEdicion = () => {
      setEmpleado(original); // Restaurar desde la copia original
      setModoEdicion(false);
  };

  if (!empleado) {
    return <div className="ed-wrap">Cargando...</div>;
  }

  const ingresoTxt = empleado.fechaIngreso ? fmtFechaLarga(empleado.fechaIngreso) : "—";
  const antig = antiguedadStr(empleado.fechaIngreso);

  return (
    <div className="ed-wrap">
      <VolverAtras />
      <div className="ed-card ed-head">
        <div className="ed-avatar">{empleado.nombre?.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()}</div>
        <div className="ed-head-main">
          <div className="ed-name-row">
            <h2 className="ed-name">{empleado.nombre}</h2>
            <span className="ed-badge is-ok">{empleado.estado}</span>
          </div>
          <div className="ed-sub">{empleado.cargo}</div>
          <div className="ed-sub light">Miembro desde el {ingresoTxt} ({antig})</div>
        </div>
        {modoEdicion ? (
          <div style={{display: 'flex', gap: '8px'}}>
            <button className="ed-btn" onClick={cancelarEdicion}>Cancelar</button>
            <button className="ed-btn primary" onClick={guardarEmpleado}>Guardar Cambios</button>
          </div>
        ) : (
          <button className="ed-btn" onClick={() => setModoEdicion(true)}>Editar Ficha</button>
        )}
      </div>

      <div className="ed-tabs">
        {["Personales", "Contractuales", "Documentos", "Previsión", "Bancarios", "Asistencia", "Hoja de Vida", "Historial"].map(t => {
          const id = t.toLowerCase().replace(' ', '');
          return (<button key={id} className={`ed-tab ${tabActiva === id ? "is-active" : ""}`} onClick={() => setTabActiva(id)}>{t}</button>);
        })}
      </div>

      <div className="ed-grid">
        <div className="ed-left">
          {tabActiva === "personales" && <PersonalesTab empleado={empleado} modoEdicion={modoEdicion} onChange={handleChange} />}
          {tabActiva === "contractuales" && <ContractualesTab empleado={empleado} modoEdicion={modoEdicion} onChange={handleChange} />}
          {tabActiva === "documentos" && <DocumentosTab empleado={empleado} />}
          {tabActiva === "previsión" && <PrevisionTab empleado={empleado} modoEdicion={modoEdicion} onChange={handleChange} />}
          {tabActiva === "bancarios" && <BancariosTab empleado={empleado} modoEdicion={modoEdicion} onChange={handleChange} />}
          {tabActiva === "asistencia" && <AsistenciaTab empleado={empleado} />}
          {tabActiva === "hojadevida" && <HojaDeVida empleado={empleado} modoEdicion={modoEdicion} onChange={handleChange} />}
          {tabActiva === "historial" && <HistorialTab empleado={empleado} />}
        </div>
        <aside className="ed-right">
          <div className="ed-card"><h4 className="ed-card-title">Información Rápida</h4>...</div>
        </aside>
      </div>

      <style>{`
        body { background: #f9fafb; font-family: Inter, sans-serif; }
        .ed-wrap{padding:16px 16px 32px; max-width: 1200px; margin: auto;}
        .ed-card{background:#fff;border:1px solid #E5E7EB;border-radius:16px;padding:var(--pad-card, 16px);box-shadow:0 1px 3px rgba(0,0,0,.05)}
        .ed-head{display:flex;gap:16px;align-items:center;margin-bottom:12px}
        .ed-avatar{width:64px;height:64px;border-radius:16px;background:#E0E7FF;color:#1E3A8A;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;}
        .ed-head-main{flex:1;min-width:0}
        .ed-name-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
        .ed-name{margin:0;font-size:24px;font-weight:800;color:#111827}
        .ed-badge{font-weight:700;font-size:12px;border-radius:999px;padding:6px 10px;border:1px solid transparent}
        .ed-badge.is-ok{background:#D1FAE5;color:#065F46;border-color:#A7F3D0}
        .ed-sub{color:#374151;margin-top:2px}
        .ed-sub.light{color:#6B7280}
        .ed-btn{background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:8px 12px;cursor:pointer;font-weight:600;}
        .ed-btn.primary{background:#1A56DB;color:#fff;border-color:#1A56DB}
        .ed-tabs{display:flex;gap:8px;margin:12px 0 16px;flex-wrap:wrap;border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;}
        .ed-tab{background:transparent;border:none;border-bottom: 3px solid transparent; border-radius:0; padding:8px 4px;cursor:pointer;color:#374151; font-weight:600;}
        .ed-tab.is-active{border-bottom-color:#1A56DB;color:#1A56DB;font-weight:700}
        .ed-grid{display:grid;grid-template-columns:minmax(0,2fr) minmax(280px,1fr);gap:16px}
        @media (max-width: 980px){ .ed-grid{grid-template-columns:1fr} }
        .ed-left,.ed-right{display:flex; flex-direction: column; gap:16px}
        .ed-card-title{margin:0 0 10px;font-size:18px;color:#111827;font-weight:800}
        .ed-kv-row{display:flex;justify-content:space-between;gap:12px;padding:14px 2px;border-top:1px solid #F3F4F6; align-items: center;}
        .ed-kv-row:first-child{border-top:none}
        .ed-kv-label{color:#6B7280;min-width:220px}
        .ed-kv-value{font-weight:700;color:#111827;text-align:right}
      `}</style>
    </div>
  );
}