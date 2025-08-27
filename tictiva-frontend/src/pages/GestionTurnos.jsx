// src/pages/GestionTurnos.jsx
import React, { useMemo, useState, useEffect } from "react";
import "./GestionTurnos.css";
import AsistenciaSubnav from "../components/AsistenciaSubnav";

const initials = (name = "") =>
  name.trim().split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase();

const EMPLEADOS = [
  { id: "e1", nombre: "Juan Díaz Morales", rut: "12.345.678-9", cargo: "Gerente de Operaciones", estado: "Activo" },
  { id: "e2", nombre: "María Pérez Lagos", rut: "14.567.890-1", cargo: "Analista de Recursos Humanos", estado: "Activo" },
  { id: "e3", nombre: "Carlos Rodríguez Vega", rut: "16.789.012-3", cargo: "Desarrollador Senior", estado: "Activo" },
  { id: "e4", nombre: "Ana González Muñoz", rut: "18.901.234-5", cargo: "Diseñadora UX/UI", estado: "Inactivo" },
  { id: "e5", nombre: "Luis Soto Parra", rut: "15.432.109-7", cargo: "Contador", estado: "Activo" },
  { id: "e6", nombre: "Raúl Aravena", rut: "17.555.221-1", cargo: "Full Stack", estado: "Activo" },
  { id: "e7", nombre: "Nicole Castro", rut: "18.456.789-1", cargo: "Analista QA", estado: "Activo" },
  { id: "e8", nombre: "Gabriel Reyes", rut: "16.001.234-5", cargo: "Soporte", estado: "Activo" },
  { id: "e9", nombre: "Victoria Pizarro", rut: "17.999.111-2", cargo: "Gerente Legal", estado: "Inactivo" },
  { id: "e10", nombre: "Francisco Ríos", rut: "13.222.333-4", cargo: "Ingeniero DevOps", estado: "Activo" },
];

const TURNOS_INICIALES = [
  { id: "t1", nombre: "Jornada Flexible Admin", inicio: "08:00", termino: "19:00", duracionMin: 10 * 60, tipo: "Flexible",
    dias: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"] },
  { id: "t2", nombre: "Turno Noche Guardia", inicio: "22:00", termino: "06:00", duracionMin: 7 * 60 + 15, tipo: "Rotativo",
    dias: ["Lunes", "Martes", "Miércoles", "Jueves", "Domingo"] },
];

const PUESTOS_INICIALES = [
  { id: "p1", nombre: "Kiosko Mall Arauco (Tictiva)", ubicacion: "Mall Arauco Maipú, Local K-10, Maipú",
    gps: { lat: -33.4925, lng: -70.7706 }, radioM: 50, area: "Ventas" },
  { id: "p2", nombre: "Sede Viña del Mar (Tictiva)", ubicacion: "Av. Marina 567, Viña del Mar, Viña del Mar",
    gps: { lat: -33.0246, lng: -71.5520 }, radioM: 150, area: "Ventas" },
];

// Utils tiempo
const hhmmToMin = (hhmm) => {
  const [h, m] = (hhmm || "00:00").split(":").map(n => parseInt(n, 10));
  return h * 60 + m;
};
const minToHHMM = (min) => {
  const m = ((min % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return String(h).padStart(2, "0") + ":" + String(mm).padStart(2, "0");
};
const haySolapamiento = (aInicio, aFin, bInicio, bFin) => {
  const norm = (ini, fin) => (fin < ini ? [[ini, 24 * 60], [0, fin]] : [[ini, fin]]);
  const A = norm(aInicio, aFin);
  const B = norm(bInicio, bFin);
  return A.some(([ai, af]) => B.some(([bi, bf]) => Math.max(ai, bi) < Math.min(af, bf)));
};

// Utils RUT (Chile)
const cleanRut = (rut) => (rut || "").toString().toUpperCase().replace(/[^0-9K]/g, "");
const calcDv = (rutNumStr) => {
  let suma = 0, mul = 2;
  for (let i = rutNumStr.length - 1; i >= 0; i--) {
    suma += parseInt(rutNumStr[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const res = 11 - (suma % 11);
  return res === 11 ? "0" : res === 10 ? "K" : String(res);
};
const normalizeRut = (rutInput) => {
  const r = cleanRut(rutInput);
  if (!r) return "";
  const body = r.slice(0, -1);
  const dv = r.slice(-1);
  return `${parseInt(body || "0", 10)}-${dv}`;
};
const isRutValid = (rutInput) => {
  const r = cleanRut(rutInput);
  if (!r || r.length < 2) return false;
  const body = r.slice(0, -1);
  const dv = r.slice(-1);
  return calcDv(body) === dv;
};

// Parser CSV básico con soporte de comillas y separador , o ;
const parseCSV = (text) => {
  const lines = text.replace(/\r/g, "").split("\n").filter(l => l.trim().length);
  if (!lines.length) return [];
  const sepGuess = (lines[0].match(/;/g) || []).length >= (lines[0].match(/,/g) || []).length ? ";" : ",";
  const parseLine = (line) => {
    const out = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === sepGuess && !inQ) {
        out.push(cur); cur = "";
      } else cur += ch;
    }
    out.push(cur);
    return out.map(s => s.trim());
  };
  const headers = parseLine(lines[0]).map(h => h.toLowerCase());
  return lines.slice(1).map(l => {
    const cols = parseLine(l);
    const row = {};
    headers.forEach((h, i) => row[h] = cols[i] ?? "");
    return row;
  });
};

export default function GestionTurnos() {
  const [turnos, setTurnos] = useState(TURNOS_INICIALES);
  const [puestos, setPuestos] = useState(PUESTOS_INICIALES);

  // Modales crear/editar
  const [showTurnoModal, setShowTurnoModal] = useState(false);
  const [turnoModalMode, setTurnoModalMode] = useState("create");
  const [editingTurnoId, setEditingTurnoId] = useState(null);
  const [nuevoTurno, setNuevoTurno] = useState({ nombre: "", inicio: "", termino: "", tipo: "Fijo", dias: "" });

  const [showPuestoModal, setShowPuestoModal] = useState(false);
  const [puestoModalMode, setPuestoModalMode] = useState("create");
  const [editingPuestoId, setEditingPuestoId] = useState(null);
  const [nuevoPuesto, setNuevoPuesto] = useState({ nombre: "", ubicacion: "", lat: "", lng: "", radioM: "", area: "" });

  // Toast
  const [toast, setToast] = useState({ open: false, text: "" });
  const showToast = (text) => {
    setToast({ open: true, text });
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => setToast({ open: false, text: "" }), 2200);
  };

  // Asignaciones (seed demo con useEffect)
  const [asignaciones, setAsignaciones] = useState([]);
  useEffect(() => {
    setAsignaciones([
      { id: "a2", empleadoId: EMPLEADOS[0].id, turnoId: "t1", puestoId: "p1", diasDescripcion: "Lunes a Viernes", activo: true },
      { id: "a3", empleadoId: EMPLEADOS[1].id, turnoId: "t2", puestoId: "p2", diasDescripcion: "Lunes, Martes, Miércoles, Jueves, Domingo", activo: true },
    ]);
  }, []);

  const [filtro, setFiltro] = useState("");

  // Form asignación individual
  const [qEmpleado, setQEmpleado] = useState("");
  const [selEmpleadoId, setSelEmpleadoId] = useState("");
  const [selTurnoId, setSelTurnoId] = useState("");
  const [selPuestoId, setSelPuestoId] = useState("");
  const [diasAplicables, setDiasAplicables] = useState("Lunes a Viernes");

  // Edición en línea de asignaciones
  const [editId, setEditId] = useState(null);
  const [editTurnoId, setEditTurnoId] = useState("");
  const [editPuestoId, setEditPuestoId] = useState("");
  const [editDias, setEditDias] = useState("");

  const empleadosFiltrados = useMemo(() => {
    const q = qEmpleado.trim().toLowerCase();
    if (!q) return EMPLEADOS;
    return EMPLEADOS.filter(e =>
      e.nombre.toLowerCase().includes(q) ||
      e.rut.toLowerCase().includes(q) ||
      e.cargo.toLowerCase().includes(q)
    );
  }, [qEmpleado]);

  // Validaciones
  const validarSolapamiento = (empleadoId, turnoId, ignorarAsignacionId = null) => {
    const tNuevo = turnos.find(t => t.id === turnoId);
    if (!tNuevo) return null;
    const nuevoIni = hhmmToMin(tNuevo.inicio);
    const nuevoFin = hhmmToMin(tNuevo.termino);

    const delEmpleado = asignaciones.filter(a =>
      a.empleadoId === empleadoId && a.id !== ignorarAsignacionId
    );
    const conflictos = delEmpleado.map(a => {
      const t = turnos.find(tt => tt.id === a.turnoId);
      if (!t) return null;
      const ini = hhmmToMin(t.inicio);
      const fin = hhmmToMin(t.termino);
      return haySolapamiento(nuevoIni, nuevoFin, ini, fin) ? t.nombre : null;
    }).filter(Boolean);
    return conflictos.length ? conflictos : null;
  };

  const validarGeocerca = (puestoId) => {
    const p = puestos.find(pp => pp.id === puestoId);
    if (!p) return "Puesto no encontrado.";
    if (!p.gps || typeof p.gps.lat !== "number" || typeof p.gps.lng !== "number")
      return "Puesto sin coordenadas GPS.";
    if (!p.radioM || p.radioM <= 0) return "Radio de geocerca inválido.";
    return null;
  };

  const handleAsignar = () => {
    if (!selEmpleadoId || !selTurnoId || !selPuestoId) {
      alert("Completa empleado, turno y puesto.");
      return;
    }
    const conf = validarSolapamiento(selEmpleadoId, selTurnoId);
    if (conf) alert(`⚠️ El nuevo turno se solapa con: ${conf.join(", ")}.`);
    const geoErr = validarGeocerca(selPuestoId);
    if (geoErr) alert(`⚠️ Geocerca: ${geoErr}`);

    const id = "a_" + Math.random().toString(36).slice(2, 9);
    setAsignaciones(prev => [...prev, {
      id, empleadoId: selEmpleadoId, turnoId: selTurnoId, puestoId: selPuestoId,
      diasDescripcion: diasAplicables, activo: true,
    }]);
    setSelEmpleadoId(""); setSelTurnoId(""); setSelPuestoId("");
    setDiasAplicables("Lunes a Viernes"); setQEmpleado("");
  };

  const exportCSV = () => {
    const header = ["Colaborador","RUT","Turno","Horario","Puesto","Ubicación","Días","Estado"];
    const rows = asignaciones.map(a => {
      const emp = EMPLEADOS.find(e => e.id === a.empleadoId) || {};
      const t = turnos.find(x => x.id === a.turnoId) || {};
      const p = puestos.find(x => x.id === a.puestoId) || {};
      const horario = (a.customInicio && a.customTermino)
        ? `${a.customInicio} - ${a.customTermino}`
        : (t.inicio && t.termino ? `${t.inicio} - ${t.termino}` : "");
      return [
        emp.nombre || "", emp.rut || "", t.nombre || "",
        horario, p.nombre || "", p.ubicacion || "", a.diasDescripcion || "",
        a.activo ? "Activo" : "Inactivo",
      ];
    });
    const csv = [header, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n") + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "asignaciones_tictiva.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const asignacionesFiltradas = useMemo(() => {
    const q = filtro.trim().toLowerCase();
    if (!q) return asignaciones;
    return asignaciones.filter(a => {
      const emp = EMPLEADOS.find(e => e.id === a.empleadoId) || {};
      const t = turnos.find(x => x.id === a.turnoId) || {};
      const p = puestos.find(x => x.id === a.puestoId) || {};
      return (
        (emp.nombre || "").toLowerCase().includes(q) ||
        (emp.rut || "").toLowerCase().includes(q) ||
        (t.nombre || "").toLowerCase().includes(q) ||
        (p.nombre || "").toLowerCase().includes(q) ||
        (a.diasDescripcion || "").toLowerCase().includes(q)
      );
    });
  }, [filtro, asignaciones, turnos, puestos]);

  // Acciones de fila en asignaciones
  const startEdit = (a) => { setEditId(a.id); setEditTurnoId(a.turnoId); setEditPuestoId(a.puestoId); setEditDias(a.diasDescripcion || ""); };
  const cancelEdit = () => { setEditId(null); setEditTurnoId(""); setEditPuestoId(""); setEditDias(""); };
  const saveEdit = (id) => {
    const a = asignaciones.find(x => x.id === id);
    if (!a) return;
    if (!editTurnoId || !editPuestoId) { alert("Selecciona turno y puesto."); return; }
    const conf = validarSolapamiento(a.empleadoId, editTurnoId, id); if (conf) alert(`⚠️ El turno editado se solapa con: ${conf.join(", ")}`);
    const geoErr = validarGeocerca(editPuestoId); if (geoErr) alert(`⚠️ Geocerca: ${geoErr}`);
    setAsignaciones(prev => prev.map(row => row.id === id ? { ...row, turnoId: editTurnoId, puestoId: editPuestoId, diasDescripcion: editDias } : row));
    cancelEdit();
  };
  const deleteRow = (id) => { if (!confirm("¿Eliminar esta asignación?")) return; setAsignaciones(prev => prev.filter(x => x.id !== id)); };
  const toggleActivo = (id) => { setAsignaciones(prev => prev.map(a => a.id === id ? { ...a, activo: !a.activo } : a)); };

  // Turnos: crear/editar/duplicar/eliminar
  const openCreateTurno = () => { setTurnoModalMode("create"); setEditingTurnoId(null); setNuevoTurno({ nombre: "", inicio: "", termino: "", tipo: "Fijo", dias: "" }); setShowTurnoModal(true); };
  const openEditTurno = (t) => { setTurnoModalMode("edit"); setEditingTurnoId(t.id); setNuevoTurno({ nombre: t.nombre, inicio: t.inicio, termino: t.termino, tipo: t.tipo || "Fijo", dias: (t.dias || []).join(", ") }); setShowTurnoModal(true); };
  const duplicateTurno = (t) => { const copy = { ...t, id: "t_" + Date.now(), nombre: `${t.nombre} (copia)` }; setTurnos(prev => [...prev, copy]); showToast("✅ Turno duplicado"); };
  const deleteTurno = (id) => {
    const used = asignaciones.filter(a => a.turnoId === id);
    if (used.length) { alert(`No puedes eliminar este turno: está asignado a ${used.length} colaborador(es).`); return; }
    if (!confirm("¿Eliminar este turno definitivamente?")) return;
    setTurnos(prev => prev.filter(t => t.id !== id));
  };
  const handleGuardarTurno = () => {
    if (!nuevoTurno.nombre || !nuevoTurno.inicio || !nuevoTurno.termino) { alert("Completa nombre, inicio y término."); return; }
    const start = hhmmToMin(nuevoTurno.inicio);
    const end = hhmmToMin(nuevoTurno.termino);
    const duracion = (end - start + 1440) % 1440;
    if (turnoModalMode === "edit" && editingTurnoId) {
      setTurnos(prev => prev.map(t => t.id === editingTurnoId ? {
        ...t, nombre: nuevoTurno.nombre, inicio: nuevoTurno.inicio, termino: nuevoTurno.termino,
        duracionMin: duracion, tipo: nuevoTurno.tipo, dias: (nuevoTurno.dias || "").split(",").map(d => d.trim()).filter(Boolean),
      } : t));
      showToast("✅ Turno actualizado");
    } else {
      setTurnos(prev => [...prev, {
        id: "t_" + Date.now(), nombre: nuevoTurno.nombre, inicio: nuevoTurno.inicio, termino: nuevoTurno.termino,
        duracionMin: duracion, tipo: nuevoTurno.tipo, dias: (nuevoTurno.dias || "").split(",").map(d => d.trim()).filter(Boolean),
      }]);
      showToast("✅ Turno creado");
    }
    setShowTurnoModal(false);
  };

  // Puestos: crear/editar/eliminar
  const openCreatePuesto = () => { setPuestoModalMode("create"); setEditingPuestoId(null); setNuevoPuesto({ nombre: "", ubicacion: "", lat: "", lng: "", radioM: "", area: "" }); setShowPuestoModal(true); };
  const openEditPuesto = (p) => { setPuestoModalMode("edit"); setEditingPuestoId(p.id); setNuevoPuesto({ nombre: p.nombre, ubicacion: p.ubicacion, lat: String(p.gps?.lat ?? ""), lng: String(p.gps?.lng ?? ""), radioM: String(p.radioM ?? ""), area: p.area || "" }); setShowPuestoModal(true); };
  const deletePuesto = (id) => {
    const used = asignaciones.filter(a => a.puestoId === id);
    if (used.length) { alert(`No puedes eliminar este puesto: está asignado a ${used.length} colaborador(es).`); return; }
    if (!confirm("¿Eliminar este puesto definitivamente?")) return;
    setPuestos(prev => prev.filter(p => p.id !== id));
  };
  const handleGuardarPuesto = () => {
    if (!nuevoPuesto.nombre || !nuevoPuesto.ubicacion) { alert("Completa nombre y ubicación."); return; }
    const payload = {
      nombre: nuevoPuesto.nombre,
      ubicacion: nuevoPuesto.ubicacion,
      gps: { lat: parseFloat(nuevoPuesto.lat) || 0, lng: parseFloat(nuevoPuesto.lng) || 0 },
      radioM: parseInt(nuevoPuesto.radioM) || 50,
      area: nuevoPuesto.area || "General",
    };
    if (puestoModalMode === "edit" && editingPuestoId) {
      setPuestos(prev => prev.map(p => p.id === editingPuestoId ? { ...p, ...payload } : p));
      showToast("✅ Puesto actualizado");
    } else {
      setPuestos(prev => [...prev, { id: "p_" + Date.now(), ...payload }]);
      showToast("✅ Puesto creado");
    }
    setShowPuestoModal(false);
  };

  // ——— PUSH-UP: Asignación MASIVA por Excel/CSV ———
  const [showMassModal, setShowMassModal] = useState(false);
  const [importRows, setImportRows] = useState([]);   // filas parseadas
  const [previewRows, setPreviewRows] = useState([]); // primeras 10
  const [importResult, setImportResult] = useState(null); // {ok:[], warn:[]}
  const openMassModal = () => { setShowMassModal(true); setImportRows([]); setPreviewRows([]); setImportResult(null); };
  const closeMassModal = () => setShowMassModal(false);

  const descargarPlantillaCSV = () => {
    // Usamos ; como separador para que los días puedan llevar comas sin romper
    const header = ["RUT","Turno","Puesto","Dias","Inicio","Termino"];
    const ejemplos = [
      [EMPLEADOS[0]?.rut || "12.345.678-9", turnos[0]?.nombre || "Turno A", puestos[0]?.nombre || "Puesto A", "Lunes a Viernes", turnos[0]?.inicio || "08:00", turnos[0]?.termino || "17:00"],
      [EMPLEADOS[1]?.rut || "14.567.890-1", turnos[1]?.nombre || "Turno B", puestos[1]?.nombre || "Puesto B", "Lunes, Martes, Miércoles, Jueves, Domingo", "", ""],
      ["13.222.333-4", turnos[0]?.nombre || "Turno A", puestos[0]?.nombre || "Puesto A", "Sábado/Domingo", "09:00", "15:00"],
    ];
    const csv = [header.join(";"), ...ejemplos.map(r => r.map(v => `"${String(v ?? "").replace(/"/g,'""')}"`).join(";"))].join("\n") + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "plantilla_asignaciones_tictiva.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // Lector de archivo con import dinámico + límites defensivos
  const leerArchivo = async (file) => {
    setImportRows([]); setPreviewRows([]); setImportResult(null);
    if (!file) return;

    // Límites para evitar archivos muy grandes o con demasiadas filas
    const MAX_BYTES = 2 * 1024 * 1024; // 2MB
    const MAX_ROWS = 2000;

    if (file.size > MAX_BYTES) {
      alert("El archivo es grande (>2MB). Sube un archivo más pequeño o usa CSV.");
      return;
    }

    const isXlsx = /\.xlsx?$/i.test(file.name) || /sheet/i.test(file.type);

    if (isXlsx) {
      let XLSX = null;
      try {
        const mod = await import(/* @vite-ignore */ "xlsx");
        XLSX = mod?.default ?? mod;
      } catch {
        alert("Para leer .xlsx instala la librería 'xlsx' (npm i xlsx) o sube el archivo como CSV.");
        return; // NO intentar parsear binario como texto
      }
      try {
        const buf = await file.arrayBuffer();
        const wb = XLSX.read(buf, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
        let rows = json.map(r => {
          const obj = {};
          Object.keys(r).forEach(k => obj[k.toLowerCase()] = r[k]);
          return obj;
        });
        if (rows.length > MAX_ROWS) {
          alert(`Demasiadas filas (${rows.length}). Se limitará a ${MAX_ROWS}.`);
          rows = rows.slice(0, MAX_ROWS);
        }
        setImportRows(rows);
        setPreviewRows(rows.slice(0, 10));
        return;
      } catch (e) {
        console.error(e);
        alert("No pudimos leer el .xlsx. Revisa el archivo o usa CSV.");
        return;
      }
    }

    // CSV como fallback
    try {
      const text = await file.text();
      let rows = parseCSV(text);
      if (rows.length > MAX_ROWS) {
        alert(`Demasiadas filas (${rows.length}). Se limitará a ${MAX_ROWS}.`);
        rows = rows.slice(0, MAX_ROWS);
      }
      setImportRows(rows);
      setPreviewRows(rows.slice(0, 10));
    } catch (e) {
      console.error(e);
      alert("No pudimos leer el CSV. Revisa el formato.");
    }
  };

  const descargarObservaciones = (warn) => {
    const header = ["RUT","Motivo"];
    const rows = (warn || []).map(w => [w.rut || "", w.motivo || ""]);
    const csv = [header.join(";"), ...rows.map(r => r.map(v => `"${String(v ?? "").replace(/"/g,'""')}"`).join(";"))].join("\n") + "\n";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "observaciones_importacion.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const procesarImportacion = () => {
    if (!importRows.length) { alert("Primero sube un archivo con datos."); return; }

    const ok = []; const warn = [];

    importRows.forEach((row, idx) => {
      const get = (k) => row[k] ?? row[k.toLowerCase()] ?? "";
      const rutRaw = get("rut") || get("r.u.t");
      if (!rutRaw) { warn.push({ rut: "", motivo: `Fila ${idx + 2}: Falta RUT` }); return; }
      if (!isRutValid(rutRaw)) { warn.push({ rut: rutRaw, motivo: `RUT inválido` }); return; }
      const rutN = normalizeRut(rutRaw);
      const emp = EMPLEADOS.find(e => normalizeRut(e.rut) === rutN);
      if (!emp) { warn.push({ rut: rutRaw, motivo: `Empleado no encontrado` }); return; }

      const turnoName = (get("turno") || "").toString().trim().toLowerCase();
      const puestoName = (get("puesto") || "").toString().trim().toLowerCase();
      if (!turnoName || !puestoName) { warn.push({ rut: rutRaw, motivo: "Falta Turno o Puesto" }); return; }

      const turnoSel = turnos.find(t => t.nombre.toLowerCase() === turnoName);
      const puestoSel = puestos.find(p => p.nombre.toLowerCase() === puestoName);
      if (!turnoSel) { warn.push({ rut: rutRaw, motivo: `Turno no encontrado: ${turnoName}` }); return; }
      if (!puestoSel) { warn.push({ rut: rutRaw, motivo: `Puesto no encontrado: ${puestoName}` }); return; }

      const dias = (get("dias") || get("días") || "Lunes a Viernes").toString();
      const iniTxt = (get("inicio") || "").toString().trim();
      const finTxt = (get("termino") || get("término") || "").toString().trim();

      const conf = validarSolapamiento(emp.id, turnoSel.id);
      const geoErr = validarGeocerca(puestoSel.id);
      if (conf || geoErr) {
        warn.push({ rut: rutRaw, motivo: `${conf ? `Solapa con: ${conf.join(", ")}` : ""}${conf && geoErr ? " · " : ""}${geoErr || ""}` });
        return;
      }

      // Calcular horario final
      let customInicio = "", customTermino = "";
      if (iniTxt || finTxt) {
        const baseIni = iniTxt ? hhmmToMin(iniTxt) : hhmmToMin(turnoSel.inicio);
        const baseDur = (turnoSel.duracionMin ?? ((hhmmToMin(turnoSel.termino) - hhmmToMin(turnoSel.inicio) + 1440) % 1440)) || 0;
        const tmpIni = iniTxt ? baseIni : (finTxt ? (hhmmToMin(finTxt) - baseDur) : baseIni);
        const tmpFin = finTxt ? hhmmToMin(finTxt) : (tmpIni + baseDur);
        customInicio = minToHHMM(tmpIni);
        customTermino = minToHHMM(tmpFin);
      }

      ok.push({
        id: "a_" + Math.random().toString(36).slice(2, 9),
        empleadoId: emp.id,
        turnoId: turnoSel.id,
        puestoId: puestoSel.id,
        diasDescripcion: dias,
        activo: true,
        ...(customInicio && customTermino ? { customInicio, customTermino } : {})
      });
    });

    if (ok.length) setAsignaciones(prev => [...prev, ...ok]);
    setImportResult({ ok, warn });
    showToast(`✅ Importación: ${ok.length} creadas, ${warn.length} observaciones`);
  };

  return (
    <div className="gt-container">
      <AsistenciaSubnav />

      <div className="gt-header card">
        <div className="gt-header-icon">🗓️</div>
        <div className="gt-header-texts">
          <h1 className="gt-title">Asistencia · Gestión de Turnos y Puestos</h1>
          <p className="gt-subtitle">Define turnos, gestiona puestos y asigna colaboradores de forma individual o masiva.</p>
        </div>
      </div>

      {/* Turnos */}
      <section className="card">
        <div className="sec-header">
          <div className="sec-title"><span className="sec-ico">🕒</span> Turnos y Jornadas Definidos</div>
          <button className="btn btn-primary" onClick={openCreateTurno}>⊕ Crear Nuevo Turno</button>
        </div>
        <table className="tictiva-table">
          <thead>
            <tr>
              <th>Nombre del Turno</th>
              <th>Horario</th>
              <th>Duración</th>
              <th>Tipo Jornada</th>
              <th>Días Aplicables</th>
              <th className="col-acciones">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {turnos.map((t) => (
              <tr key={t.id}>
                <td>{t.nombre}</td>
                <td>{t.inicio} - {t.termino}</td>
                <td>{Math.floor(t.duracionMin / 60)}h {t.duracionMin % 60}m</td>
                <td><span className="badge">{t.tipo}</span></td>
                <td>{t.dias.join(", ")}</td>
                <td className="acciones">
                  <button className="icon-btn" title="Editar" onClick={() => openEditTurno(t)}>✏️</button>
                  <button className="icon-btn" title="Duplicar" onClick={() => duplicateTurno(t)}>📄</button>
                  <button className="icon-btn danger" title="Eliminar" onClick={() => deleteTurno(t.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Puestos */}
      <section className="card">
        <div className="sec-header">
          <div className="sec-title"><span className="sec-ico">📍</span> Puestos de Trabajo Disponibles</div>
          <button className="btn btn-primary" onClick={openCreatePuesto}>⊕ Crear Nuevo Puesto</button>
        </div>
        <table className="tictiva-table">
          <thead>
            <tr>
              <th>Nombre del Puesto</th>
              <th>Ubicación</th>
              <th>Coordenadas GPS</th>
              <th>Radio (m)</th>
              <th>Área/Dpto.</th>
              <th className="col-acciones">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {puestos.map((p) => (
              <tr key={p.id}>
                <td>{p.nombre}</td>
                <td>{p.ubicacion}</td>
                <td>{p.gps.lat.toFixed(4)}, {p.gps.lng.toFixed(4)}</td>
                <td>{p.radioM}</td>
                <td>Ej: {p.area}</td>
                <td className="acciones">
                  <button className="icon-btn" title="Editar" onClick={() => openEditPuesto(p)}>✏️</button>
                  <button className="icon-btn danger" title="Eliminar" onClick={() => deletePuesto(p.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Asignación Individual */}
      <section className="card">
        <div className="sec-title"><span className="sec-ico">👤</span> Asignación Individual de Turnos y Puestos</div>
        <p className="sec-help">Busca un colaborador y asígnale un turno y puesto para días específicos.</p>

        <div className="grid">
          <div className="grid-col">
            <label className="lbl">Buscar Colaborador (Nombre/RUT)</label>
            <input className="inp" placeholder="Escribe para buscar…" value={qEmpleado} onChange={(e) => setQEmpleado(e.target.value)} />
            <div className="choices">
              {empleadosFiltrados.slice(0, 6).map((e) => (
                <button key={e.id}
                  className={`choice ${selEmpleadoId === e.id ? "active" : ""}`}
                  onClick={() => setSelEmpleadoId(e.id)} title={e.cargo}>
                  <span className="avatar" aria-hidden>{initials(e.nombre)}</span>
                  <span className="choice-text">
                    <b>{e.nombre}</b>
                    <small>{e.rut} • {e.cargo}</small>
                  </span>
                  <span className={`estado ${e.estado === "Activo" ? "ok" : "off"}`}>{e.estado}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid-col">
            <label className="lbl">Seleccionar Turno</label>
            <select className="inp" value={selTurnoId} onChange={(e) => setSelTurnoId(e.target.value)}>
              <option value="">Elegir turno…</option>
              {turnos.map((t) => <option key={t.id} value={t.id}>{t.nombre} ({t.inicio}-{t.termino})</option>)}
            </select>

            <label className="lbl">Seleccionar Puesto</label>
            <select className="inp" value={selPuestoId} onChange={(e) => setSelPuestoId(e.target.value)}>
              <option value="">Elegir puesto…</option>
              {puestos.map((p) => <option key={p.id} value={p.id}>{p.nombre} · {p.radioM}m</option>)}
            </select>

            <label className="lbl">Días Aplicables (Descripción)</label>
            <input className="inp" value={diasAplicables} onChange={(e) => setDiasAplicables(e.target.value)} />

            <button className="btn btn-primary mt" onClick={handleAsignar}>Asignar</button>
          </div>
        </div>
      </section>

      {/* Asignación Masiva (por archivo) */}
      <section className="card">
        <div className="sec-header">
          <div className="sec-title"><span className="sec-ico">👥</span> Asignación Masiva de Turnos</div>
          <button className="btn btn-outline" onClick={openMassModal}>▶ Iniciar Asignación Masiva</button>
        </div>
        <p className="sec-help">Sube Excel/CSV con columnas: <b>RUT; Turno; Puesto; Dias; Inicio; Termino</b>. “Inicio” y “Término” son opcionales.</p>
      </section>

      {/* Vista de Asignaciones */}
      <section className="card">
        <div className="sec-header">
          <div className="sec-title"><span className="sec-ico">📋</span> Vista de Asignaciones Actuales</div>
          <div className="sec-actions">
            <input className="inp small" placeholder="Filtrar asignaciones…" value={filtro} onChange={(e) => setFiltro(e.target.value)} />
            <button className="btn btn-outline" onClick={exportCSV}>⬇️ Exportar CSV</button>
          </div>
        </div>

        <table className="tictiva-table">
          <thead>
            <tr>
              <th>Colaborador</th>
              <th>Turno Asignado</th>
              <th>Puesto</th>
              <th>Días Aplicables (Info)</th>
              <th>Estado</th>
              <th className="col-acciones">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {asignacionesFiltradas.map((a) => {
              const emp = EMPLEADOS.find(e => e.id === a.empleadoId) || {};
              const tSel = turnos.find(x => x.id === a.turnoId) || {};
              const pSel = puestos.find(x => x.id === a.puestoId) || {};

              if (editId === a.id) {
                return (
                  <tr key={a.id}>
                    <td>{emp.nombre || "—"}</td>
                    <td>
                      <select className="inp" value={editTurnoId} onChange={(e) => setEditTurnoId(e.target.value)}>
                        <option value="">Elegir turno…</option>
                        {turnos.map(t => <option key={t.id} value={t.id}>{t.nombre} ({t.inicio}-{t.termino})</option>)}
                      </select>
                    </td>
                    <td>
                      <select className="inp" value={editPuestoId} onChange={(e) => setEditPuestoId(e.target.value)}>
                        <option value="">Elegir puesto…</option>
                        {puestos.map(p => <option key={p.id} value={p.id}>{p.nombre} · {p.radioM}m</option>)}
                      </select>
                    </td>
                    <td><input className="inp" value={editDias} onChange={(e) => setEditDias(e.target.value)} /></td>
                    <td><span className={`pill ${a.activo ? "ok" : "off"}`}>{a.activo ? "Activo" : "Inactivo"}</span></td>
                    <td className="acciones">
                      <button className="icon-btn" title="Guardar" onClick={() => saveEdit(a.id)}>💾</button>
                      <button className="icon-btn" title="Cancelar" onClick={cancelEdit}>↩️</button>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={a.id}>
                  <td>{emp.nombre || "—"}</td>
                  <td>
                    {tSel.nombre || "—"}
                    {a.customInicio && a.customTermino && (
                      <small style={{ color: "#64748b", marginLeft: 6 }}>
                        ({a.customInicio}-{a.customTermino})
                      </small>
                    )}
                  </td>
                  <td>{pSel.nombre || "—"}</td>
                  <td>{a.diasDescripcion}</td>
                  <td>
                    <span
                      className={`pill clickable ${a.activo ? "ok" : "off"}`}
                      title="Click para alternar estado"
                      onClick={() => toggleActivo(a.id)}
                    >
                      {a.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="acciones">
                    <button className="icon-btn" title="Editar" onClick={() => startEdit(a)}>✏️</button>
                    <button className="icon-btn danger" title="Eliminar" onClick={() => deleteRow(a.id)}>🗑️</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* === PUSH-UP: Turno (crear/editar) === */}
      {showTurnoModal && (
        <div className="pushup-overlay" onClick={() => setShowTurnoModal(false)}>
          <div className="pushup-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{turnoModalMode === "edit" ? "Editar Turno" : "Nuevo Turno"}</h2>
            <input className="inp" placeholder="Nombre" value={nuevoTurno.nombre} onChange={(e) => setNuevoTurno({ ...nuevoTurno, nombre: e.target.value })} />
            <label>Inicio</label>
            <input type="time" className="inp" value={nuevoTurno.inicio} onChange={(e) => setNuevoTurno({ ...nuevoTurno, inicio: e.target.value })} />
            <label>Término</label>
            <input type="time" className="inp" value={nuevoTurno.termino} onChange={(e) => setNuevoTurno({ ...nuevoTurno, termino: e.target.value })} />
            <label>Tipo</label>
            <select className="inp" value={nuevoTurno.tipo} onChange={(e) => setNuevoTurno({ ...nuevoTurno, tipo: e.target.value })}>
              <option>Fijo</option><option>Flexible</option><option>Rotativo</option>
            </select>
            <label>Días (separados por coma)</label>
            <input className="inp" value={nuevoTurno.dias} onChange={(e) => setNuevoTurno({ ...nuevoTurno, dias: e.target.value })} />
            <div className="pushup-actions">
              <button className="btn btn-outline" onClick={() => setShowTurnoModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleGuardarTurno}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* === PUSH-UP: Puesto (crear/editar) === */}
      {showPuestoModal && (
        <div className="pushup-overlay" onClick={() => setShowPuestoModal(false)}>
          <div className="pushup-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{puestoModalMode === "edit" ? "Editar Puesto" : "Nuevo Puesto"}</h2>
            <input className="inp" placeholder="Nombre" value={nuevoPuesto.nombre} onChange={(e) => setNuevoPuesto({ ...nuevoPuesto, nombre: e.target.value })} />
            <input className="inp" placeholder="Ubicación" value={nuevoPuesto.ubicacion} onChange={(e) => setNuevoPuesto({ ...nuevoPuesto, ubicacion: e.target.value })} />
            <input className="inp" placeholder="Latitud" value={nuevoPuesto.lat} onChange={(e) => setNuevoPuesto({ ...nuevoPuesto, lat: e.target.value })} />
            <input className="inp" placeholder="Longitud" value={nuevoPuesto.lng} onChange={(e) => setNuevoPuesto({ ...nuevoPuesto, lng: e.target.value })} />
            <input className="inp" placeholder="Radio (m)" value={nuevoPuesto.radioM} onChange={(e) => setNuevoPuesto({ ...nuevoPuesto, radioM: e.target.value })} />
            <input className="inp" placeholder="Área/Dpto." value={nuevoPuesto.area} onChange={(e) => setNuevoPuesto({ ...nuevoPuesto, area: e.target.value })} />
            <div className="pushup-actions">
              <button className="btn btn-outline" onClick={() => setShowPuestoModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleGuardarPuesto}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* === PUSH-UP: Importación Masiva === */}
      {showMassModal && (
        <div className="pushup-overlay" onClick={closeMassModal}>
          <div className="pushup-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Asignación Masiva (Excel/CSV)</h2>
            <p className="sec-help" style={{marginTop:-6}}>
              Columnas: <b>RUT; Turno; Puesto; Dias; Inicio; Termino</b>. El separador recomendado es <b>;</b>.
            </p>
            <div style={{display:"flex", gap:8, marginBottom:10}}>
              <button className="btn btn-outline" onClick={descargarPlantillaCSV}>⬇️ Descargar plantilla</button>
              <label className="btn btn-primary" style={{cursor:"pointer"}}>
                ⬆️ Subir archivo
                <input
                  type="file"
                  accept=".csv,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.xlsx"
                  style={{display:"none"}}
                  onChange={(e)=>leerArchivo(e.target.files?.[0])}
                />
              </label>
            </div>

            {previewRows.length > 0 && (
              <div className="card" style={{maxHeight:220, overflow:"auto", marginBottom:10}}>
                <table className="tictiva-table">
                  <thead><tr>{Object.keys(previewRows[0]).map((k,i)=><th key={i}>{k}</th>)}</tr></thead>
                  <tbody>
                    {previewRows.map((r,ri)=>(
                      <tr key={ri}>{Object.keys(previewRows[0]).map((k,ci)=><td key={ci}>{String(r[k] ?? "")}</td>)}</tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pushup-actions">
              <button className="btn btn-outline" onClick={closeMassModal}>Cancelar</button>
              <button className="btn btn-primary" disabled={!importRows.length} onClick={procesarImportacion}>Procesar e Importar</button>
            </div>

            {importResult && (
              <div className="card" style={{marginTop:10}}>
                <p><b>Resultado:</b> {importResult.ok.length} creadas · {importResult.warn.length} observaciones</p>
                {!!importResult.warn.length && (
                  <>
                    <ul className="warn-list" style={{maxHeight:140, overflow:"auto", marginTop:8}}>
                      {importResult.warn.map((w,i)=><li key={i}><b>{w.rut}</b> — {w.motivo}</li>)}
                    </ul>
                    <div className="pushup-actions">
                      <button className="btn btn-outline" onClick={()=>descargarObservaciones(importResult.warn)}>⬇️ Descargar observaciones</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.open && <div className="tt-toast">{toast.text}</div>}
    </div>
  );
}
