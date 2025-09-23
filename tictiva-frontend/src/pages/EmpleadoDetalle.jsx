// src/pages/EmpleadoDetalle.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import DocumentosTab from "../components/DocumentosTab.jsx";

/* =========================== Utils de fecha/texto (FIX TZ) =========================== */
const mesesEs = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const pad2 = (n) => String(n).padStart(2, "0");

/** Extrae Y-M-D de cualquier string ISO (evita corrimiento por UTC) */
const pickYMD = (val) => {
  const s = String(val || "");
  const m = s.match(/(\d{4})-(\d{2})-(\d{2})/);
  return m ? { y: +m[1], m: +m[2], d: +m[3] } : null;
};

/** Formato “DD de Mes de YYYY” */
const fmtFechaLarga = (val) => {
  if (!val) return "—";
  const ymd = pickYMD(val);
  if (ymd) return `${pad2(ymd.d)} de ${mesesEs[ymd.m - 1]} de ${ymd.y}`;
  const d = new Date(val);
  if (isNaN(d)) return "—";
  return `${pad2(d.getDate())} de ${mesesEs[d.getMonth()]} de ${d.getFullYear()}`;
};

/** Para <input type="date">: si viene YYYY-MM-DD, devolver tal cual */
const toDateInput = (val) => {
  if (!val) return "";
  const ymd = pickYMD(val);
  if (ymd) return `${ymd.y}-${pad2(ymd.m)}-${pad2(ymd.d)}`;
  const d = new Date(val);
  return isNaN(d) ? "" : `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};
const fromDateInput = (val) => (val ? `${val}` : "");

/** Fechas locales para registrar en historial (evita UTC) */
const ymdLocal = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const hmLocal  = (d) => `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;

/** Mocks ligeros de date-fns usados en AsistenciaTab */
const parseISO = (iso) => new Date(iso);
const differenceInMinutes = (a, b) => (a.getTime() - b.getTime()) / 60000;

/* =========================== Persistencia (localStorage) =========================== */
const LS_KEY = "tictiva.empleados.v1";
const normalizeRut = (r) => (r || "").toString().replace(/\./g, "").replace(/-/g, "").toUpperCase();
const empKeyFrom = (ref) => {
  if (!ref) return "";
  if (typeof ref === "string") return ref;
  if (ref.id != null) return `id:${String(ref.id)}`;
  if (ref.rut) return `rut:${normalizeRut(ref.rut)}`;
  return "";
};
const lsRead = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}"); } catch { return {}; } };
const lsWrite = (map) => { try { localStorage.setItem(LS_KEY, JSON.stringify(map)); } catch {} };
const lsGetByKey = (key) => (key ? lsRead()[key] : undefined);
const lsSaveEmp = (emp) => {
  if (!emp) return;
  const map = lsRead();
  const byId = emp.id != null ? `id:${String(emp.id)}` : "";
  const byRut = emp.rut ? `rut:${normalizeRut(emp.rut)}` : "";
  if (byId) map[byId] = emp;
  if (byRut) map[byRut] = emp;
  lsWrite(map);
};

/* =========================== Mock API =========================== */
const EmpleadosAPI = {
  list: async () => ([
    {
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
      prevision: {
        afp: "Habitat",
        sistemaSalud: "Isapre",
        isapre: "Colmena",
        cajaCompensacion: "Los Andes",
        mutual: "ACHS",
        afc: "Sí",
        tramo: "B",
        cargas: "2",
        pensionAlimentos: "",
        resolucionPension: "",
        apvInstitucion: "",
        apvCuenta: "",
        tasaAccidente: "0.95%"
      },
      bancarios: {
        banco: "BancoEstado",
        tipoCuenta: "CuentaRUT",
        numeroCuenta: "12345678",
        titular: "Juan Díaz Morales",
        rutTitular: "12.345.678-9"
      },
      marcas: [
        { fecha: "2025-09-01", hora: "08:58:00", tipo: "Entrada", estado: "Válida", metodo: "App", ip: "192.168.1.10" },
        { fecha: "2025-09-01", hora: "18:02:00", tipo: "Salida",  estado: "Válida", metodo: "App", ip: "192.168.1.10" },
        { fecha: "2025-09-02", hora: "09:12:00", tipo: "Entrada", estado: "Atraso", metodo: "Web", ip: "192.168.1.11" },
        { fecha: "2025-09-02", hora: "18:05:00", tipo: "Salida",  estado: "Válida", metodo: "Web", ip: "192.168.1.11" },
      ],
      historial: [
        { id: 1, fecha: "2024-08-15", hora: "10:00", actor: "V. Mateo", accion: "Anexo de Contrato", categoria: "Contrato", detalle: "Se firma anexo por cambio de cargo a Gerente." },
        { id: 2, fecha: "2023-05-20", hora: "11:30", actor: "Sistema", accion: "Solicitud de Vacaciones", categoria: "Permisos", detalle: "Se aprueban 5 días de vacaciones." },
      ],
      documentos: [
        { id: "f1", tipo: "folder", nombre: "Certificados", mod: "2025-07-30", tam: "" },
        { id: "f2", tipo: "folder", nombre: "Contratos", mod: "2025-08-15", tam: "" },
        { id: "f3", tipo: "folder", nombre: "Liquidaciones de Sueldo", mod: "2025-09-01", tam: "" },
        { id: "d1", tipo: "file",   nombre: "Política de Teletrabajo.docx", mod: "2025-06-22", tam: "256 KB" },
        { id: "d2", tipo: "file",   nombre: "Reglamento Interno 2025.pdf", mod: "2025-01-10", tam: "1.2 MB" },
      ],
      hojaVida: {
        alertaMedica: "Alergia a la Penicilina",
        emergencia: [
          { nombre: "María Morales", relacion: "Madre", telefono: "+56 9 1234 5678" },
          { nombre: "Pedro Díaz", relacion: "Padre", telefono: "+56 9 8765 4321" },
        ],
        medico: {
          grupoSanguineo: "O+",
          aceptaTransfusion: true,
          alergias: ["Penicilina", "Maní"],
          condicionesCronicas: ["Asma Leve"],
          medicamentos: "Salbutamol (Inhalador) solo en caso de crisis.",
          observaciones: "Ninguna observación adicional."
        },
        trayectoria: [
          { cargo: "Gerente de Operaciones", desde: "2025-07-31", detalle: "Promoción a rol gerencial." },
          { cargo: "Jefe de Operaciones", desde: "2024-01-14", detalle: "Asume liderazgo de nuevo equipo." },
          { cargo: "Analista de Operaciones Semi-Senior", desde: "2022-08-31", detalle: "Promoción por desempeño." },
          { cargo: "Analista de Operaciones Jr.", desde: "2021-02-28", detalle: "Ingreso a la compañía." },
        ],
        educacion: [
          { titulo: "Ingeniería Civil Industrial", institucion: "Universidad de Chile", desde: "2008", hasta: "2013" },
          { titulo: "Enseñanza Media", institucion: "Liceo Nacional", desde: "2004", hasta: "2007" },
        ],
        experiencia: [
          { cargo: "Jefe de Proyectos", empresa: "Empresa B", desde: "2015", hasta: "2021", descripcion: "Gestión de proyectos de implementación de software." },
          { cargo: "Analista de Procesos", empresa: "Empresa C", desde: "2013", hasta: "2015", descripcion: "" },
        ]
      }
    }
  ]),
};

/* =========================== Utils de negocio =========================== */
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
const antiguedadStr = (desdeISO) => {
  if (!desdeISO) return "";
  const start = new Date(desdeISO);
  const now = new Date();
  if (isNaN(start)) return "";
  const months = monthsBetween(start, now);
  const y = Math.floor(months / 12);
  const m = months % 12;
  const aTxt = y === 1 ? "1 año" : `${y} años`;
  const mTxt = m === 1 ? "1 mes" : `${m} meses`;
  return `${aTxt} y ${mTxt}`;
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

/* ===== Chile: Regiones y Comunas ===== */
const COMUNAS_POR_REGION = {
  "Arica y Parinacota": ["Arica","Camarones","Putre","General Lagos"],
  "Tarapacá": ["Iquique","Alto Hospicio","Pozo Almonte","Camiña","Colchane","Huara","Pica"],
  "Antofagasta": ["Antofagasta","Mejillones","Sierra Gorda","Taltal","Calama","Ollagüe","San Pedro de Atacama","Tocopilla","María Elena"],
  "Atacama": ["Copiapó","Caldera","Tierra Amarilla","Chañaral","Diego de Almagro","Vallenar","Freirina","Huasco","Alto del Carmen"],
  "Coquimbo": ["La Serena","Coquimbo","Andacollo","La Higuera","Paihuano","Vicuña","Ovalle","Combarbalá","Monte Patria","Punitaqui","Río Hurtado","Illapel","Canela","Los Vilos","Salamanca"],
  "Valparaíso": ["Valparaíso","Viña del Mar","Concón","Quintero","Puchuncaví","Casablanca","Juan Fernández","San Antonio","Cartagena","El Tabo","El Quisco","Algarrobo","Santo Domingo","San Felipe","Llaillay","Catemu","Panquehue","Putaendo","Santa María","Los Andes","Calle Larga","Rinconada","San Esteban","Quillota","La Cruz","La Calera","Hijuelas","Nogales","Limache","Olmué","Quilpué","Villa Alemana","Petorca","La Ligua","Cabildo","Papudo","Zapallar","Isla de Pascua"],
  "Metropolitana de Santiago": ["Santiago","Cerrillos","Cerro Navia","Conchalí","El Bosque","Estación Central","Huechuraba","Independencia","La Cisterna","La Florida","La Granja","La Pintana","La Reina","Las Condes","Lo Barnechea","Lo Espejo","Lo Prado","Macul","Maipú","Ñuñoa","Pedro Aguirre Cerda","Peñalolén","Providencia","Pudahuel","Quilicura","Quinta Normal","Recoleta","Renca","San Joaquín","San Miguel","San Ramón","Vitacura","Puente Alto","Pirque","San José de Maipo","Colina","Lampa","Tiltil","San Bernardo","Buin","Paine","Calera de Tango","Melipilla","Alhué","Curacaví","María Pinto","San Pedro","Talagante","El Monte","Isla de Maipo","Padre Hurtado","Peñaflor"],
  "Libertador General Bernardo O'Higgins": [
    "Rancagua","Codegua","Coínco","Coltauco","Doñihue","Graneros","Las Cabras","Machalí","Malloa","San Francisco de Mostazal","Olivar","Peumo","Pichidegua","Quinta de Tilcoco","Rengo","Requínoa","San Vicente",
    "San Fernando","Chimbarongo","Nancagua","Placilla","Santa Cruz","Lolol","Palmilla","Peralillo","Chépica","Pumanque",
    "Pichilemu","La Estrella","Litueche","Marchigüe","Navidad","Paredones"
  ],
  "Maule": [
    "Talca","San Clemente","Pelarco","Pencahue","Maule","San Rafael","Río Claro","Curepto","Constitución","Empedrado",
    "Curicó","Teno","Romeral","Rauco","Sagrada Familia","Molina","Hualañé","Vichuquén",
    "Linares","San Javier","Yerbas Buenas","Colbún","Longaví","Parral","Retiro","Villa Alegre",
    "Cauquenes","Chanco","Pelluhue"
  ],
  "Ñuble": ["Chillán","Chillán Viejo","Pinto","El Carmen","Pemuco","San Ignacio","Yungay","Quillón","Bulnes","San Carlos","Ñiquén","San Fabián","Coihueco","San Nicolás","Coelemu","Trehuaco","Ránquil","Portezuelo","Quirihue","Ninhue","Cobquecura"],
  "Biobío": [
    "Concepción","Talcahuano","Hualpén","San Pedro de la Paz","Chiguayante","Penco","Tomé","Coronel","Lota","Santa Juana","Hualqui","Florida",
    "Los Ángeles","Mulchén","Nacimiento","Negrete","Quilaco","Quilleco","San Rosendo","Santa Bárbara","Tucapel","Cabrero","Yumbel","Alto Biobío","Antuco","Laja",
    "Arauco","Curanilahue","Lebu","Los Álamos","Cañete","Contulmo","Tirúa"
  ],
  "La Araucanía": [
    "Temuco","Carahue","Cholchol","Cunco","Curarrehue","Freire","Galvarino","Gorbea","Lautaro","Loncoche","Melipeuco","Nueva Imperial","Padre Las Casas","Perquenco","Pitrufquén","Pucón","Saavedra","Teodoro Schmidt","Toltén","Vilcún","Villarrica",
    "Angol","Collipulli","Curacautín","Ercilla","Lonquimay","Los Sauces","Lumaco","Purén","Renaico","Traiguén","Victoria"
  ],
  "Los Ríos": ["Valdivia","Corral","Lanco","Los Lagos","Máfil","Mariquina","Paillaco","Panguipulli","La Unión","Futrono","Lago Ranco","Río Bueno"],
  "Los Lagos": [
    "Puerto Montt","Puerto Varas","Llanquihue","Frutillar","Los Muermos","Maullín","Cochamó","Calbuco","Fresia",
    "Osorno","San Juan de la Costa","Puerto Octay","Puyehue","Río Negro","Purranque","San Pablo",
    "Castro","Ancud","Quellón","Quemchi","Dalcahue","Curaco de Vélez","Puqueldón","Queilén","Chonchi","Quinchao",
    "Chaitén","Futaleufú","Hualaihué","Palena"
  ],
  "Aysén del General Carlos Ibáñez del Campo": ["Coyhaique","Aysén","Cisnes","Guaitecas","Cochrane","O'Higgins","Tortel","Chile Chico","Río Ibáñez","Lago Verde"],
  "Magallanes y de la Antártica Chilena": ["Punta Arenas","Laguna Blanca","Río Verde","San Gregorio","Natales","Torres del Paine","Porvenir","Primavera","Timaukel","Cabo de Hornos","Antártica"],
};
const REGIONES = Object.keys(COMUNAS_POR_REGION);

/* =================== UI: Volver =================== */
const VolverAtras = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      style={{
        textDecoration: "none",
        color: "#3b82f6",
        fontWeight: "600",
        marginBottom: "16px",
        display: "inline-block",
        background: "none",
        border: "none",
        padding: "0",
        cursor: "pointer",
        fontSize: "1em",
      }}
    >
      &larr; Volver
    </button>
  );
};

/* =================== TABS ===================== */
// -------------------- Contractuales (editable) -----------------
const ContractualesTab = ({ datos = {}, modoEdicion, onChange, empleado }) => {
  const pick = (v, ...fb) => (v !== undefined && v !== null && String(v) !== "" ? v : fb.find(x => x !== undefined && x !== null && String(x) !== "") || "");
  const safe = (v, dash = "—") => (v || v === 0 ? String(v) : dash);
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
        .ed-2col{ display:grid; grid-template-columns:1fr 1fr; gap:8px 24px;}
        .ed-2col .ed-kv-row{ border-top:none; padding:10px 2px; }
        .ed-2col input, .ed-2col select{ width:100%; border:1px solid #E5E7EB; border-radius:8px; padding:6px 8px; font-size:14px; }
      `}</style>
    </div>
  );
};

// -------------------- Previsión (editable) ---------------------
const PrevisionTab = ({ empleado, modoEdicion, onChange }) => {
  const pv = empleado?.prevision || {};
  const setPv = (k, v) => onChange?.("prevision", { ...pv, [k]: v });

  const row = (l, key, type="text") => (
    <div className="ed-kv-row" key={key}>
      <span className="ed-kv-label">{l}:</span>
      {modoEdicion ? (
        <input
          type={type}
          value={pv[key] ?? ""}
          onChange={(e)=>setPv(key, e.target.value)}
          style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 8px', fontSize:14}}
        />
      ) : (
        <span className="ed-kv-value">{pv[key] || "N/D"}</span>
      )}
    </div>
  );

  return (
    <div className="ed-card">
      <h3 className="ed-card-title">Datos Previsionales y Legales</h3>
      <div className="ed-2col">
        {row("AFP","afp")}
        {row("Sistema de Salud","sistemaSalud")}
        {row("Nombre Isapre","isapre")}
        {row("Caja de Compensación","cajaCompensacion")}
        {row("Mutual de Seguridad","mutual")}
        {row("Seguro de Cesantía (AFC)","afc")}
        {row("Asignación Familiar (Tramo)","tramo")}
        {row("Cargas Familiares (N°)","cargas","number")}
        {row("Pensión de Alimentos (Monto)","pensionAlimentos")}
        {row("Resolución Pensión","resolucionPension")}
        {row("APV (Institución)","apvInstitucion")}
        {row("APV (Cuenta/Contrato)","apvCuenta")}
        {row("Tasa Cot. Accidente Trabajo","tasaAccidente")}
      </div>
      <style>{`.ed-2col{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px}.ed-2col .ed-kv-row{border-top:none;padding:10px 2px}`}</style>
    </div>
  );
};

// -------------------- Bancarios (editable) ---------------------
const BancariosTab = ({ empleado, modoEdicion, onChange }) => {
  const b = empleado?.bancarios || {};
  const setB = (k, v) => onChange?.("bancarios", { ...b, [k]: v });

  const row = (l, key, type="text") => (
    <div className="ed-kv-row" key={key}>
      <span className="ed-kv-label">{l}:</span>
      {modoEdicion ? (
        <input
          type={type}
          value={b[key] ?? ""}
          onChange={(e)=>setB(key, e.target.value)}
          style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 8px', fontSize:14}}
        />
      ) : (
        <span className="ed-kv-value">{b[key] || "N/D"}</span>
      )}
    </div>
  );
  return (
    <div className="ed-card">
      <h3 className="ed-card-title">Datos Bancarios</h3>
      <div className="ed-2col">
        {row("Banco", "banco")}
        {row("Tipo de Cuenta", "tipoCuenta")}
        {row("Número de Cuenta", "numeroCuenta")}
        {row("Titular de la Cuenta", "titular")}
        {row("RUT Titular", "rutTitular")}
      </div>
      <style>{`.ed-2col{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px}.ed-2col .ed-kv-row{border-top:none;padding:10px 2px}`}</style>
    </div>
  );
};

// -------------------- Hoja de Vida (editable) ---------------------
function HojaDeVida({ empleado, modoEdicion, onChange }) {
  const hv = empleado?.hojaVida || {};
  const emergencia  = Array.isArray(hv.emergencia)  ? hv.emergencia  : [];
  const md          = hv.medico || {};
  const trayectoria = Array.isArray(hv.trayectoria) ? hv.trayectoria : [];
  const educacion   = Array.isArray(hv.educacion)   ? hv.educacion   : [];
  const experiencia = Array.isArray(hv.experiencia) ? hv.experiencia : [];

  const setHv  = (k, v)             => onChange?.("hojaVida", { ...hv, [k]: v });
  const setMed = (k, v)             => setHv("medico", { ...(hv.medico || {}), [k]: v });
  const setEmerg = (idx, k, v)      => { const arr = [...(emergencia.length ? emergencia : [{}, {}])]; arr[idx] = { ...(arr[idx] || {}), [k]: v }; setHv("emergencia", arr); };
  const addItem = (key, empty)      => setHv(key, [ ...(Array.isArray(hv[key]) ? hv[key] : []), empty ]);
  const delItem = (key, idx)        => { const arr = [...(Array.isArray(hv[key]) ? hv[key] : [])]; arr.splice(idx, 1); setHv(key, arr); };
  const updItem = (key, idx, f, v)  => { const arr = [...(Array.isArray(hv[key]) ? hv[key] : [])]; arr[idx] = { ...(arr[idx] || {}), [f]: v }; setHv(key, arr); };

  const imprimir = () => {
    const html = `
      <html><head><meta charset="utf-8" />
      <title>Hoja de Vida - ${empleado?.nombre || ""}</title>
      <style>
        body{font-family: Inter, Arial; margin:24px; color:#111827}
        h1{margin:0 0 6px;font-size:22px}
        .sub{color:#6B7280;margin-bottom:14px}
        .card{border:1px solid #E5E7EB;border-radius:12px;padding:12px;margin-top:12px}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .row{padding:10px 0;border-top:1px solid #F3F4F6}
        .row:first-child{border-top:none}
        .lbl{color:#6B7280}
        .val{font-weight:700}
        ul.tl{list-style:none;margin:0;padding:0}
        li.tl-it{border-left:2px solid #E5E7EB;padding:8px 12px;margin-left:6px}
        .muted{color:#6B7280}
      </style></head>
      <body>
        <h1>Hoja de Vida</h1>
        <div class="sub">${empleado?.nombre || "—"} · RUT ${empleado?.rut || "—"}</div>

        ${hv.alertaMedica ? `<div class="card" style="background:#FFFBEB;border-color:#FDE68A"><b>Alerta Médica:</b> ${hv.alertaMedica}</div>`:""}

        <div class="card">
          <h3>Contactos de Emergencia</h3>
          <div class="grid2">
            ${(emergencia.length?emergencia:[{nombre:"N/D",relacion:"",telefono:""}]).slice(0,2).map(c=>`
              <div class="card" style="margin:0">
                <div class="val">${c.nombre||"N/D"}</div>
                <div class="muted">${c.relacion||""}</div>
                <div class="row"><span class="lbl">Teléfono: </span><span class="val">${c.telefono||"—"}</span></div>
              </div>`).join("")}
          </div>
        </div>

        <div class="card">
          <h3>Ficha Médica</h3>
          <div class="grid2">
            <div class="row"><span class="lbl">Grupo Sanguíneo: </span><span class="val">${md.grupoSanguineo||"N/D"}</span></div>
            <div class="row"><span class="lbl">Acepta Transfusión: </span><span class="val">${md.aceptaTransfusion? "Sí":"No"}</span></div>
          </div>
          <div class="row"><span class="lbl">Alergias: </span><span class="val">${Array.isArray(md.alergias)?md.alergias.join(", "): (md.alergias||"N/D")}</span></div>
          <div class="row"><span class="lbl">Condiciones Crónicas: </span><span class="val">${Array.isArray(md.condicionesCronicas)?md.condicionesCronicas.join(", "): (md.condicionesCronicas||"N/D")}</span></div>
          <div class="row"><span class="lbl">Medicamentos Habituales: </span><span class="val">${md.medicamentos||"N/D"}</span></div>
          <div class="row"><span class="lbl">Observaciones: </span><span class="val">${md.observaciones||"N/D"}</span></div>
        </div>

        <div class="card">
          <h3>Trayectoria en la Empresa</h3>
          <ul class="tl">
            ${(trayectoria.length?trayectoria:[{cargo:"N/D",desde:"",detalle:""}]).map(t=>`<li class="tl-it"><div class="val">${t.cargo}</div><div class="muted">Desde el ${t.desde||"—"}</div><div>${t.detalle||""}</div></li>`).join("")}
          </ul>
        </div>

        <div class="card">
          <h3>Educación y Formación</h3>
          <ul class="tl">
            ${(educacion.length?educacion:[{titulo:"N/D",institucion:"",desde:"",hasta:""}]).map(e=>`<li class="tl-it"><div class="val">${e.titulo}</div><div>${e.institucion||""}</div><div class="muted">${e.desde||"—"} - ${e.hasta||"—"}</div></li>`).join("")}
          </ul>
        </div>

        <div class="card">
          <h3>Experiencia Laboral Previa</h3>
          <ul class="tl">
            ${(experiencia.length?experiencia:[{cargo:"N/D",empresa:"",desde:"",hasta:"",descripcion:""}]).map(x=>`<li class="tl-it"><div class="val">${x.cargo}</div><div>${x.empresa||""}</div><div class="muted">${x.desde||"—"} - ${x.hasta||"—"}</div><div>${x.descripcion||""}</div></li>`).join("")}
          </ul>
        </div>

        <script>window.onload = () => setTimeout(() => window.print(), 150);</script>
      </body></html>`;
    const w = window.open("", "_blank");
    w.document.open(); w.document.write(html); w.document.close();
  };

  return (
    <div className="ed-card hv-wrap">
      <div className="hv-head">
        <div>
          <h3 className="ed-card-title" style={{margin:0}}>Hoja de Vida y Ficha Médica</h3>
          <div className="ed-sub light" style={{marginTop:2}}>Información integral del colaborador</div>
        </div>
        <button className="ed-btn" onClick={imprimir}>Imprimir / Exportar</button>
      </div>

      {/* Alerta médica */}
      {hv.alertaMedica && (
        <div className="hv-alert">
          <b>Alerta Médica Importante</b>
          <div>{hv.alertaMedica}</div>
        </div>
      )}
      {modoEdicion && (
        <div className="hv-card">
          <h4 className="hv-title">Editar Alerta Médica</h4>
          <input
            type="text"
            value={hv.alertaMedica ?? ""}
            onChange={(e)=>setHv("alertaMedica", e.target.value)}
            style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:10, padding:'8px'}}
          />
        </div>
      )}

      {/* Emergencia */}
      <div className="hv-card">
        <h4 className="hv-title">Contactos de Emergencia</h4>
        <div className="hv-grid2">
          {[0,1].map((i)=>(
            <div key={i} className="hv-contact">
              {modoEdicion ? (
                <>
                  <div className="hv-row"><span className="hv-label">Nombre:</span><input className="hv-val" value={emergencia[i]?.nombre||""}    onChange={(e)=>setEmerg(i,"nombre",e.target.value)} /></div>
                  <div className="hv-row"><span className="hv-label">Relación:</span><input className="hv-val" value={emergencia[i]?.relacion||""}  onChange={(e)=>setEmerg(i,"relacion",e.target.value)} /></div>
                  <div className="hv-row"><span className="hv-label">Teléfono:</span><input className="hv-val" value={emergencia[i]?.telefono||""} onChange={(e)=>setEmerg(i,"telefono",e.target.value)} /></div>
                </>
              ) : (
                <>
                  <div className="hv-strong">{emergencia[i]?.nombre||"N/D"}</div>
                  <div className="hv-muted">{emergencia[i]?.relacion||""}</div>
                  <div className="hv-row"><span className="hv-label">Teléfono:</span><span className="hv-val">{emergencia[i]?.telefono||"—"}</span></div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ficha Médica */}
      <div className="hv-card">
        <h4 className="hv-title">Ficha Médica</h4>
        <div className="hv-grid2">
          <div className="hv-row"><span className="hv-label">Grupo Sanguíneo:</span>
            {modoEdicion
              ? <input className="hv-val" value={md.grupoSanguineo||""} onChange={(e)=>setMed("grupoSanguineo", e.target.value)} />
              : <span className="hv-val">{md.grupoSanguineo||"N/D"}</span>}
          </div>
          <div className="hv-row"><span className="hv-label">Acepta Transfusión:</span>
            {modoEdicion
              ? <select value={md.aceptaTransfusion ? "si":"no"} onChange={(e)=>setMed("aceptaTransfusion", e.target.value==="si")}><option value="si">Sí</option><option value="no">No</option></select>
              : <span className="hv-val">{md.aceptaTransfusion? "Sí":"No"}</span>}
          </div>
        </div>
        <div className="hv-row"><span className="hv-label">Alergias:</span>
          {modoEdicion
            ? <input className="hv-val" value={Array.isArray(md.alergias)?md.alergias.join(", "):(md.alergias||"")} onChange={(e)=>setMed("alergias", e.target.value.split(",").map(s=>s.trim()).filter(Boolean))} />
            : <span className="hv-val">{Array.isArray(md.alergias)?md.alergias.join(", "):(md.alergias||"N/D")}</span>}
        </div>
        <div className="hv-row"><span className="hv-label">Condiciones Crónicas:</span>
          {modoEdicion
            ? <input className="hv-val" value={Array.isArray(md.condicionesCronicas)?md.condicionesCronicas.join(", "):(md.condicionesCronicas||"")} onChange={(e)=>setMed("condicionesCronicas", e.target.value.split(",").map(s=>s.trim()).filter(Boolean))} />
            : <span className="hv-val">{Array.isArray(md.condicionesCronicas)?md.condicionesCronicas.join(", "):(md.condicionesCronicas||"N/D")}</span>}
        </div>
        <div className="hv-row"><span className="hv-label">Medicamentos Habituales:</span>
          {modoEdicion
            ? <input className="hv-val" value={md.medicamentos||""} onChange={(e)=>setMed("medicamentos", e.target.value)} />
            : <span className="hv-val">{md.medicamentos || "N/D"}</span>}
        </div>
        <div className="hv-row"><span className="hv-label">Observaciones:</span>
          {modoEdicion
            ? <input className="hv-val" value={md.observaciones||""} onChange={(e)=>setMed("observaciones", e.target.value)} />
            : <span className="hv-val">{md.observaciones||"N/D"}</span>}
        </div>
      </div>

      {/* Trayectoria */}
      <div className="hv-card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h4 className="hv-title">Trayectoria en la Empresa</h4>
          {modoEdicion && <button className="ed-btn" onClick={()=>addItem("trayectoria",{cargo:"",desde:"",detalle:""})}>+ Agregar cargo</button>}
        </div>
        <ul className="hv-tl">
          {(trayectoria.length?trayectoria:[{cargo:"N/D",desde:"",detalle:""}]).map((t,i)=>(
            <li key={i} className="hv-tl-it">
              {modoEdicion ? (
                <>
                  <div className="hv-row"><span className="hv-label">Cargo:</span><input className="hv-val" value={t.cargo||""} onChange={(e)=>updItem("trayectoria", i, "cargo", e.target.value)} /></div>
                  <div className="hv-row"><span className="hv-label">Desde:</span><input className="hv-val" type="date" value={t.desde||""} onChange={(e)=>updItem("trayectoria", i, "desde", e.target.value)} /></div>
                  <div className="hv-row"><span className="hv-label">Detalle:</span><input className="hv-val" value={t.detalle||""} onChange={(e)=>updItem("trayectoria", i, "detalle", e.target.value)} /></div>
                  <div style={{textAlign:'right'}}><button className="ed-btn" onClick={()=>delItem("trayectoria", i)}>Eliminar</button></div>
                </>
              ) : (
                <>
                  <div className="hv-strong">{t.cargo}</div>
                  <div className="hv-muted">Desde el {t.desde||"—"}</div>
                  {t.detalle ? <div>{t.detalle}</div> : null}
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Educación */}
      <div className="hv-card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h4 className="hv-title">Educación y Formación</h4>
          {modoEdicion && <button className="ed-btn" onClick={()=>addItem("educacion",{titulo:"",institucion:"",desde:"",hasta:""})}>+ Agregar estudio</button>}
        </div>
        <ul className="hv-tl">
          {(educacion.length?educacion:[{titulo:"N/D",institucion:"",desde:"",hasta:""}]).map((e,i)=>(
            <li key={i} className="hv-tl-it">
              {modoEdicion ? (
                <>
                  <div className="hv-row"><span className="hv-label">Título:</span><input className="hv-val" value={e.titulo||""} onChange={(ev)=>updItem("educacion", i, "titulo", ev.target.value)} /></div>
                  <div className="hv-row"><span className="hv-label">Institución:</span><input className="hv-val" value={e.institucion||""} onChange={(ev)=>updItem("educacion", i, "institucion", ev.target.value)} /></div>
                  <div className="hv-row"><span className="hv-label">Desde:</span><input className="hv-val" value={e.desde||""} onChange={(ev)=>updItem("educacion", i, "desde", ev.target.value)} /></div>
                  <div className="hv-row"><span className="hv-label">Hasta:</span><input className="hv-val" value={e.hasta||""} onChange={(ev)=>updItem("educacion", i, "hasta", ev.target.value)} /></div>
                  <div style={{textAlign:'right'}}><button className="ed-btn" onClick={()=>delItem("educacion", i)}>Eliminar</button></div>
                </>
              ) : (
                <>
                  <div className="hv-strong">{e.titulo}</div>
                  <div>{e.institucion||""}</div>
                  <div className="hv-muted">{e.desde||"—"} - {e.hasta||"—"}</div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Experiencia */}
      <div className="hv-card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h4 className="hv-title">Experiencia Laboral Previa</h4>
          {modoEdicion && <button className="ed-btn" onClick={()=>addItem("experiencia",{cargo:"",empresa:"",desde:"",hasta:"",descripcion:""})}>+ Agregar experiencia</button>}
        </div>
        <ul className="hv-tl">
          {(experiencia.length?experiencia:[{cargo:"N/D",empresa:"",desde:"",hasta:"",descripcion:""}]).map((x,i)=>(
            <li key={i} className="hv-tl-it">
              {modoEdicion ? (
                <>
                  <div className="hv-row"><span className="hv-label">Cargo:</span><input className="hv-val" value={x.cargo||""} onChange={(ev)=>updItem("experiencia", i, "cargo", ev.target.value)} /></div>
                  <div className="hv-row"><span className="hv-label">Empresa:</span><input className="hv-val" value={x.empresa||""} onChange={(ev)=>updItem("experiencia", i, "empresa", ev.target.value)} /></div>
                  <div className="hv-row"><span className="hv-label">Desde:</span><input className="hv-val" value={x.desde||""} onChange={(ev)=>updItem("experiencia", i, "desde", ev.target.value)} /></div>
                  <div className="hv-row"><span className="hv-label">Hasta:</span><input className="hv-val" value={x.hasta||""} onChange={(ev)=>updItem("experiencia", i, "hasta", ev.target.value)} /></div>
                  <div className="hv-row"><span className="hv-label">Descripción:</span><input className="hv-val" value={x.descripcion||""} onChange={(ev)=>updItem("experiencia", i, "descripcion", ev.target.value)} /></div>
                  <div style={{textAlign:'right'}}><button className="ed-btn" onClick={()=>delItem("experiencia", i)}>Eliminar</button></div>
                </>
              ) : (
                <>
                  <div className="hv-strong">{x.cargo}</div>
                  <div>{x.empresa||""}</div>
                  <div className="hv-muted">{x.desde||"—"} - {x.hasta||"—"}</div>
                  {x.descripcion ? <div>{x.descripcion}</div> : null}
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      <style>{`
        .hv-card input, .hv-card select{
          width:100%; border:1px solid #E5E7EB; border-radius:8px; padding:6px 8px; font-size:14px;
        }
      `}</style>
    </div>
  );
}

/* ===================== Tab: Asistencia (NO editable) ====================== */
function AsistenciaTab({ empleado }) {
  const [metricas, setMetricas] = useState({ horasTrabajadas: 0, porcentajeAsistencia: 0, atrasosMes: 0, horasExtra: 0 });
  const marcas = Array.isArray(empleado?.marcas) ? empleado.marcas : [];

  useEffect(() => {
    if (!marcas.length) return;
    let horas = 0, atrasos = 0;
    const diasAsistidos = new Set();

    marcas.forEach((marca) => {
      diasAsistidos.add(marca.fecha);
      if ((marca.estado || "").toLowerCase() === "atraso") atrasos++;
      if ((marca.tipo || "").toLowerCase() === "entrada") {
        const salida = marcas.find((m) => m.fecha === marca.fecha && (m.tipo || "").toLowerCase() === "salida");
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
  }, [empleado]); // suficiente para mock

  const getWeekRange = (d = new Date()) => {
    const day = d.getDay();
    const diffToMon = (day + 6) % 7;
    const lunes = new Date(d); lunes.setDate(d.getDate() - diffToMon);
    const domingo = new Date(lunes); domingo.setDate(lunes.getDate() + 6);
    const f = (x) => ymdLocal(x);
    return { lunes: f(lunes), domingo: f(domingo) };
  };

  const exportResumenCSV = () => {
    const head = ["Fecha","Hora","Tipo","Estado","Método","IP"];
    const rows = marcas.slice(0, 50).map(m => [m.fecha, m.hora, m.tipo, m.estado, m.metodo, m.ip]);
    const meta = [
      ["Resumen de Asistencia"],
      ["Horas Trabajadas (Mes)", metricas.horasTrabajadas],
      ["Asistencia %", metricas.porcentajeAsistencia],
      ["Atrasos (Mes)", metricas.atrasosMes],
      ["Horas Extra", metricas.horasExtra],
      [""]
    ];
    const csv = [...meta, head, ...rows].map(r => r.map(v => `"${String(v ?? "").replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `asistencia-resumen-${empleado?.rut || empleado?.id || "empleado"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const { lunes, domingo } = getWeekRange(new Date());
  const dataSemana = marcas.filter(m => m.fecha >= lunes && m.fecha <= domingo);

  const descargarComprobante = (m) => {
    const html = `
      <html><head><meta charset="utf-8" />
      <title>Comprobante de Marcación</title>
      <style>
        body{font-family: Inter, Arial; margin:20px; color:#111827}
        h2{margin:0 0 8px}
        .box{border:1px solid #E5E7EB; border-radius:8px; padding:12px}
        .row{display:flex; gap:12px}
        .row > div{flex:1}
        .muted{color:#6B7280; font-size:12px; margin-top:10px}
      </style></head>
      <body>
        <h2>Comprobante de Marcación</h2>
        <div class="box">
          <div class="row"><div><b>Empleado</b><br/>${empleado?.nombre || "—"}</div><div><b>RUT</b><br/>${empleado?.rut || "—"}</div></div>
          <div class="row"><div><b>Fecha</b><br/>${m.fecha}</div><div><b>Hora</b><br/>${m.hora}</div></div>
          <div class="row"><div><b>Tipo</b><br/>${m.tipo}</div><div><b>Estado</b><br/>${m.estado}</div></div>
          <div class="row"><div><b>Método</b><br/>${m.metodo || "—"}</div><div><b>IP</b><br/>${m.ip || "—"}</div></div>
        </div>
        <div class="muted">Documento generado el ${new Date().toLocaleString()}</div>
        <script>window.onload = () => setTimeout(() => window.print(), 150);</script>
      </body></html>`;
    const w = window.open("", "_blank");
    w.document.open(); w.document.write(html); w.document.close();
  };

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
          <button className="ed-btn" onClick={()=>window.alert("Abrir historial en otra vista (mock)")}>Ver Historial Detallado</button>
          <button className="ed-btn" onClick={exportResumenCSV}>⬇ Exportar Resumen</button>
        </div>
      </div>

      <table className="asistencia-tabla">
        <thead>
          <tr>
            <th>Fecha</th><th>Hora</th><th>Tipo</th><th>Estado</th><th>Método</th><th>IP</th><th>Foto</th><th>Comprobante</th>
          </tr>
        </thead>
        <tbody>
          {marcas.slice(0, 10).map((m, i) => (
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
      <p className="asistencia-paginacion">Mostrando 10 de {marcas.length} registros</p>
    </div>
  );
}

/* ===================== Tab: Historial (DT, NO editable) ==================== */
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
  const idParam  = hasParam &&  isNumericId ? rawParam : undefined;

  // ✅ listo para Vercel: usa /api en prod y VITE_API_BASE en dev/preview si quieres
  const API = (import.meta?.env?.VITE_API_BASE) || "/api";
  const RESOURCE = "empleados";

  const [empleado, setEmpleado] = useState(null);
  const [original, setOriginal] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [tabActiva, setTabActiva] = useState("personales");
  const [modoEdicion, setModoEdicion] = useState(false);

  // Deep-link
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

  // Si se cambia a Asistencia o Historial, salimos de edición automáticamente
  useEffect(() => {
    if (["asistencia","historial"].includes(tabActiva) && modoEdicion) {
      setModoEdicion(false);
    }
  }, [tabActiva, modoEdicion]);

  // Carga del empleado (prioriza localStorage, luego mock y/o API)
  useEffect(() => {
    let cancel = false;

    const getCachedFirst = () => {
      const keyGuess = idParam
        ? `id:${String(idParam)}`
        : rutParam
        ? `rut:${normalizeRut(rutParam)}`
        : "";
      const cached = lsGetByKey(keyGuess);
      if (cached && !cancel) {
        setEmpleado(cached);
        setOriginal(JSON.parse(JSON.stringify(cached)));
        return true;
      }
      return false;
    };

    const fetchEmpleado = async () => {
      setNotFound(false);

      // 1) Intento directo localStorage por clave
      if (getCachedFirst()) return;

      // 2) Mock local
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
          if (found && !cancel) {
            const lsOverride = lsGetByKey(empKeyFrom(found)) || (found.rut && lsGetByKey(`rut:${normalizeRut(found.rut)}`)) || (found.id != null && lsGetByKey(`id:${String(found.id)}`));
            const finalEmp = lsOverride || found;
            setEmpleado(finalEmp);
            setOriginal(JSON.parse(JSON.stringify(finalEmp)));
            return;
          }
        }
      } catch { /* ignore */ }

      // 3) API por ID
      if (idParam) {
        try {
          const r = await fetch(`${API}/${RESOURCE}/${encodeURIComponent(idParam)}`);
          if (r.ok) {
            const emp = await r.json();
            if (emp && !cancel && (emp.id != null || emp.nombre)) {
              const lsOverride = lsGetByKey(empKeyFrom(emp)) || (emp.rut && lsGetByKey(`rut:${normalizeRut(emp.rut)}`));
              const finalEmp = lsOverride || emp;
              setEmpleado(finalEmp);
              setOriginal(JSON.parse(JSON.stringify(finalEmp)));
              return;
            }
          }
        } catch { /* noop */ }
      }

      // 4) API por RUT
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
              const lsOverride = lsGetByKey(empKeyFrom(emp)) || (emp.rut && lsGetByKey(`rut:${normalizeRut(emp.rut)}`));
              const finalEmp = lsOverride || emp;
              setEmpleado(finalEmp);
              setOriginal(JSON.parse(JSON.stringify(finalEmp)));
              return;
            }
          } catch { /* noop */ }
        }
        try {
          const rAll = await fetch(`${API}/${RESOURCE}`);
          if (rAll.ok) {
            const arr = await rAll.json();
            const found = (Array.isArray(arr) ? arr : []).find((e) => normalizeRut(e?.rut) === normRut);
            if (found && !cancel) {
              const lsOverride = lsGetByKey(empKeyFrom(found)) || (found.rut && lsGetByKey(`rut:${normalizeRut(found.rut)}`));
              const finalEmp = lsOverride || found;
              setEmpleado(finalEmp);
              setOriginal(JSON.parse(JSON.stringify(finalEmp)));
              return;
            }
          }
        } catch { /* noop */ }
      }

      // 5) Último intento: API por parámetro genérico
      if (!idParam && rawParam) {
        try {
          const r = await fetch(`${API}/${RESOURCE}?id=${encodeURIComponent(rawParam)}`);
          if (r.ok) {
            const arr = await r.json();
            if (Array.isArray(arr) && arr.length > 0 && !cancel) {
              const emp = arr[0];
              const lsOverride = lsGetByKey(empKeyFrom(emp)) || (emp.rut && lsGetByKey(`rut:${normalizeRut(emp.rut)}`));
              const finalEmp = lsOverride || emp;
              setEmpleado(finalEmp);
              setOriginal(JSON.parse(JSON.stringify(finalEmp)));
              return;
            }
          }
        } catch { /* noop */ }
      }

      if (!cancel) setNotFound(true);
    };

    fetchEmpleado();
    return () => { cancel = true; };
  }, [rutParam, idParam, rawParam, API, RESOURCE]);

  const handleChange = (campo, valor) => setEmpleado((prev) => ({ ...prev, [campo]: valor }));

  // ===== Helper: registrarMovimiento (persiste en LS y API) =====
  const registrarMovimiento = async (empSnapshot, {
    accion,
    categoria = "General",
    detalle = "",
    actor = "Sistema",
  }) => {
    if (!empSnapshot) return;
    const now = new Date();
    const item = {
      id: Date.now(),
      fecha: ymdLocal(now),
      hora: hmLocal(now),
      actor, accion, categoria, detalle,
    };
    const updated = {
      ...empSnapshot,
      historial: [...(empSnapshot.historial || []), item],
    };

    lsSaveEmp(updated);
    setEmpleado(updated);

    try {
      const id = updated.id ?? encodeURIComponent(updated.rut);
      await fetch(`${API}/${RESOURCE}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.warn("No se pudo persistir en API (se mantiene en localStorage):", e);
    }
  };

  // Utilitario: tamaño legible
  const humanSize = (bytes) => {
    const units = ["B","KB","MB","GB"];
    let i = 0; let n = Number(bytes) || 0;
    while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
    const fixed = n >= 10 || i === 0 ? 0 : 1;
    return `${n.toFixed(fixed)} ${units[i]}`;
  };

  // Acciones Documentos
  const onNuevaCarpeta = async (nombreDesdeUI) => {
    if (!empleado) return;
    const nombre = (nombreDesdeUI ?? window.prompt("Nombre de la nueva carpeta") ?? "").trim();
    if (!nombre) return;
    const hoy = ymdLocal(new Date());
    const nueva = { id: `f_${Date.now()}`, tipo: "folder", nombre, mod: hoy, tam: "" };
    const empAfter = { ...empleado, documentos: [...(empleado.documentos || []), nueva] };
    await registrarMovimiento(empAfter, {
      accion: "Creación de carpeta",
      categoria: "Documentos",
      detalle: `Se creó la carpeta “${nombre}”`,
      actor: "Usuario",
    });
    alert("Carpeta creada.");
  };

  const onSubirArchivo = async (fileFromUI, parentId = null) => {
    if (!empleado) return;
    let file = fileFromUI;
    if (!file) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg";
      const p = new Promise((resolve) => { input.onchange = (e) => resolve(e.target.files?.[0] || null); });
      input.click();
      file = await p;
      if (!file) return;
    }

    const hoy = ymdLocal(new Date());
    const url = URL.createObjectURL(file); // para previsualizar
    const nuevo = {
      id: `d_${Date.now()}`,
      tipo: "file",
      nombre: file.name,
      mod: hoy,
      tam: humanSize(file.size),
      parentId: parentId || "",
      mime: file.type || "",
      url,
    };

    const empAfter = { ...empleado, documentos: [...(empleado.documentos || []), nuevo] };

    await registrarMovimiento(empAfter, {
      accion: "Subida de archivo",
      categoria: "Documentos",
      detalle: `Se subió “${file.name}”${parentId ? ` a la carpeta ${parentId}` : ""}`,
      actor: "Usuario",
    });

    alert("Archivo agregado (mock).");
  };

  const onDeleteDoc = async (id) => {
    if (!empleado) return;
    const lista = Array.isArray(empleado.documentos) ? empleado.documentos : [];
    const eliminado = lista.find(x => x.id === id);
    const empAfter = { ...empleado, documentos: lista.filter(x => x.id !== id) };

    await registrarMovimiento(empAfter, {
      accion: "Eliminación",
      categoria: "Documentos",
      detalle: eliminado ? `Se eliminó “${eliminado.nombre}”` : `Se eliminó item ${id}`,
      actor: "Usuario",
    });
    alert("Eliminado.");
  };

  const onRenameDoc = async (id, nuevoNombre) => {
    if (!empleado) return;
    const hoy = ymdLocal(new Date());
    const lista = Array.isArray(empleado.documentos) ? empleado.documentos : [];
    const empAfter = {
      ...empleado,
      documentos: lista.map(x => x.id === id ? { ...x, nombre: nuevoNombre, mod: hoy } : x)
    };

    await registrarMovimiento(empAfter, {
      accion: "Renombrado",
      categoria: "Documentos",
      detalle: `Nuevo nombre: “${nuevoNombre}”`,
      actor: "Usuario",
    });
    alert("Nombre actualizado.");
  };

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

      const now = new Date();
      const nuevaEntrada = {
        id: Date.now(),
        fecha: ymdLocal(now),
        hora: hmLocal(now),
        actor: "Sistema",
        accion: "Actualización de ficha",
        categoria: "Ficha",
        detalle: diffs.length ? `Campos modificados: ${diffs.join(", ")}` : "Sin cambios detectados",
      };

      const payload = { ...empleado, historial: [...(Array.isArray(empleado.historial) ? empleado.historial : []), nuevaEntrada] };

      lsSaveEmp(payload);

      try {
        const id = payload.id ?? encodeURIComponent(payload.rut);
        const url = `${API}/${RESOURCE}/${id}`;
        await fetch(url, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      } catch (e) {
        console.warn("No se pudo guardar en API. Guardado local OK.", e);
      }

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
  const centro   = pickCI(empleado, ["centro","oficina"], "") ?? pickCI(empleado?.datosContractuales, ["centro","oficina"], "");
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

        {/* Botón Editar / Guardar (bloqueado en Asistencia/Historial) */}
        {modoEdicion ? (
          <button className="ed-btn primary" onClick={guardarEmpleado}>Guardar Cambios</button>
        ) : (
          <button
            className="ed-btn primary"
            onClick={() => setModoEdicion(true)}
            disabled={["asistencia", "historial"].includes(tabActiva)}
            title={["asistencia", "historial"].includes(tabActiva) ? "Esta sección no es editable" : ""}
            style={{
              opacity: ["asistencia", "historial"].includes(tabActiva) ? 0.5 : 1,
              cursor: ["asistencia", "historial"].includes(tabActiva) ? "not-allowed" : "pointer"
            }}
          >
            Editar Ficha
          </button>
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

      {/* Grid: en Asistencia una sola columna */}
      <div className={`ed-grid ${tabActiva === "asistencia" ? "is-single" : ""}`}>
        <div className="ed-left">
          {tabActiva === "personales" && (
            <div className="ed-card">
              <h3 className="ed-card-title">Información Personal</h3>
              <div className="ed-kv">
                {[
                  ["Nombre Completo","nombre","text", empleado.nombre || ""],
                  ["Cédula","rut","text", empleado.rut || ""],
                  ["Fecha de Nacimiento","fechaNacimiento","date", toDateInput(cumpleISO)],
                  ["Email","correo","email", empleado.correo || ""],
                  ["Teléfono","telefono","text", empleado.telefono || ""],
                  ["Dirección","direccion","text", empleado.direccion || ""],
                  ["Estado Civil","estadoCivil","text", empleado.estadoCivil || ""],
                ].map(([label, key, type, val]) => (
                  <div className="ed-kv-row" key={key}>
                    <span className="ed-kv-label">{label}:</span>
                    {modoEdicion ? (
                      <input
                        type={type}
                        value={val}
                        onChange={(e)=>handleChange(key, type==="date" ? fromDateInput(e.target.value) : e.target.value)}
                        style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 8px', fontSize:14}}
                      />
                    ) : (
                      <span className="ed-kv-value">
                        {key==="fechaNacimiento" ? (cumpleTxt) : (val || "—")}
                      </span>
                    )}
                  </div>
                ))}

                {/* Región */}
                <div className="ed-kv-row">
                  <span className="ed-kv-label">Región:</span>
                  {modoEdicion ? (
                    <select
                      value={empleado.region ?? ""}
                      onChange={(e) => {
                        const nuevaRegion = e.target.value;
                        handleChange("region", nuevaRegion);
                        handleChange("comuna", ""); // reset comuna al cambiar región
                      }}
                      style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 8px', fontSize:14}}
                    >
                      <option value="">Seleccione…</option>
                      {REGIONES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="ed-kv-value">{empleado.region || "—"}</span>
                  )}
                </div>

                {/* Comuna */}
                <div className="ed-kv-row">
                  <span className="ed-kv-label">Comuna:</span>
                  {modoEdicion ? (
                    <select
                      value={empleado.comuna ?? ""}
                      onChange={(e)=>handleChange("comuna", e.target.value)}
                      disabled={!empleado.region}
                      style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 8px', fontSize:14}}
                    >
                      <option value="">{empleado.region ? "Seleccione…" : "Elige región primero"}</option>
                      {(COMUNAS_POR_REGION[empleado.region] || []).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="ed-kv-value">{empleado.comuna || "—"}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {tabActiva === "contractuales" && (
            <ContractualesTab
              datos={empleado.datosContractuales || {}}
              modoEdicion={modoEdicion}
              onChange={handleChange}
              empleado={empleado}
            />
          )}

          {tabActiva === "documentos" && (
            <DocumentosTab
              empleado={empleado}
              onNuevaCarpeta={onNuevaCarpeta}
              onSubirArchivo={onSubirArchivo}
              onDelete={onDeleteDoc}
              onRename={onRenameDoc}
            />
          )}

          {tabActiva === "prevision" && <PrevisionTab empleado={empleado} modoEdicion={modoEdicion} onChange={handleChange} />}

          {tabActiva === "bancarios" && <BancariosTab empleado={empleado} modoEdicion={modoEdicion} onChange={handleChange} />}

          {tabActiva === "asistencia" && <AsistenciaTab empleado={empleado} />}

          {tabActiva === "hojaVida" && <HojaDeVida empleado={empleado} modoEdicion={modoEdicion} onChange={handleChange} />}

          {tabActiva === "historial" && <HistorialTab empleado={empleado} />}
        </div>

        {tabActiva !== "asistencia" && (
          <aside className={`ed-right ${tabActiva === "contractuales" ? "is-compact" : ""}`}>
            <div className="ed-card">
              <h4 className="ed-card-title">Información Rápida</h4>
              <ul className="ed-quick">
                <li>
                  <div>
                    <div className="ed-quick-label">🎈 Próximo cumpleaños</div>
                    <div className="ed-quick-val">{cumpleTxt}</div>
                  </div>
                </li>
                <li>
                  <div>
                    <div className="ed-quick-label">⏰ Horario</div>
                    <div className="ed-quick-val">{horario || "08:30 - 18:00"}</div>
                  </div>
                </li>
                <li>
                  <div>
                    <div className="ed-quick-label">📍 Oficina</div>
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

      {/* Estilos base */}
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
        .ed-grid.is-single{grid-template-columns:1fr;}
        @media (max-width: 980px){ .ed-grid{grid-template-columns:1fr} }
        .ed-left{display:flex; flex-direction: column; gap:16px}
        .ed-right{display:flex; flex-direction: column; gap:16px}
        .ed-card-title{margin:0 0 10px;font-size:var(--title-size, 18px);color:#111827;font-weight:800}
        .ed-kv{display:grid}
        .ed-kv-row{display:flex;justify-content:space-between;gap:12px;padding:14px 2px;border-top:1px solid #F3F4F6}
        .ed-kv-row:first-child{border-top:none}
        .ed-kv-label{color:#6B7280;min-width:220px}
        .ed-kv-value{font-weight:700;color:#111827;text-align:right}
        .ed-quick{list-style:none;margin:0;padding:0;display:grid;gap:12px}
        .ed-quick-label{color:#6B7280; font-size: 14px;}
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

        /* Asistencia */
        .asistencia-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}
        .asistencia-title{display:flex;gap:10px;align-items:flex-start}
        .icono-title{font-size:22px;margin-top:2px}
        .asistencia-buttons{display:flex;gap:8px;flex-wrap:wrap}
        .asistencia-tabla{width:100%;border-collapse:collapse}
        .asistencia-tabla th,.asistencia-tabla td{border-bottom:1px solid #F3F4F6;padding:10px 8px;text-align:left}
        .estado-badge{display:inline-block;padding:2px 8px;border-radius:999px;font-size:12px;border:1px solid #E5E7EB;color:#374151}
        .estado-badge.atraso{background:#FEF3C7;color:#92400E;border-color:#FDE68A}
        .tipo.entrada{color:#059669;font-weight:700}
        .tipo.salida{color:#7C3AED;font-weight:700}

         /* Hoja de Vida */
        .hv-wrap{--pad-card:16px}
        .hv-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
        .hv-alert{background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:12px;margin-bottom:12px}
        .hv-card{border:1px solid #E5E7EB;border-radius:12px;padding:12px;margin-top:12px;background:#fff}
        .hv-title{margin:0 0 8px;font-size:16px;font-weight:800;color:#111827}
        .hv-grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        @media (max-width: 860px){ .hv-grid2{grid-template-columns:1fr} }
        .hv-contact{border:1px solid #F3F4F6;border-radius:10px;padding:10px}
        .hv-row{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-top:1px solid #F3F4F6}
        .hv-row:first-child{border-top:none}
        .hv-label{color:#6B7280}
        .hv-val{font-weight:700}
        .hv-strong{font-weight:800}
        .hv-muted{color:#6B7280}
        .hv-tl{list-style:none;margin:0;padding:0}
        .hv-tl-it{border-left:2px solid #E5E7EB;margin-left:8px;padding:8px 12px}
      `}</style>
    </div>
  );
}
