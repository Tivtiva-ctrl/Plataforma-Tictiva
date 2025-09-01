// src/api/index.js
// API centralizada con:
// - En dev: usa json-server o VITE_API_URL.
// - En prod: si VITE_API_URL apunta a localhost, se ignora y usamos /public/data/db.json.
// - Fallback con persistencia en localStorage (overlay) para que lo creado NO se pierda al refrescar.

const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
const isLocalHost = ["localhost", "127.0.0.1"].includes(host);

const VITE_API = (import.meta.env.VITE_API_URL || "").trim();
const isViteApiLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(VITE_API);

// En dev: usa VITE_API o json-server local.
// En prod: solo usa VITE_API si NO es localhost.
const BASE = isLocalHost ? (VITE_API || "http://127.0.0.1:3001") : (isViteApiLocal ? "" : VITE_API);

// === Overlay localStorage (persistencia en navegador) ===
const LS_KEY = "tictiva_overlay_v1";
// Estructura overlay:
// { empleados: [], permisos: [], permisos_historial: [] }

const readOverlay = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return {
      empleados: Array.isArray(obj.empleados) ? obj.empleados : [],
      permisos: Array.isArray(obj.permisos) ? obj.permisos : [],
      permisos_historial: Array.isArray(obj.permisos_historial) ? obj.permisos_historial : [],
    };
  } catch {
    return { empleados: [], permisos: [], permisos_historial: [] };
  }
};
const writeOverlay = (next) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch {}
};
const pushOverlay = (col, item) => {
  const ov = readOverlay();
  ov[col] = [item, ...ov[col]];
  writeOverlay(ov);
};
const replaceOverlayCollection = (col, arr) => {
  const ov = readOverlay();
  ov[col] = Array.isArray(arr) ? arr : [];
  writeOverlay(ov);
};

// ---------- helpers fetch ----------
const apiGet = async (path) => {
  if (!BASE) return null;
  const url = `${BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  try {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
};

const fetchDb = async () => {
  try {
    const r = await fetch("/data/db.json", { cache: "no-store" });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
};

// ---------- normalizadores ----------
const normalizeEstadoKey = (e = "") => {
  const s = String(e || "").trim().toLowerCase();
  if (s.startsWith("aprob")) return "aprobado";
  if (s.startsWith("rechaz")) return "rechazado";
  if (s.startsWith("pend")) return "pendiente";
  return "pendiente";
};
const labelEstado = (e = "") => {
  const k = normalizeEstadoKey(e);
  if (k === "aprobado") return "Aprobado";
  if (k === "rechazado") return "Rechazado";
  return "Pendiente";
};

const parseHorario = (hor) => {
  if (!hor) return ["", ""];
  const parts = String(hor).split(/[-–—]| a /i).map((s) => s.trim());
  return [parts[0] || "", parts[1] || ""];
};

const computeSlaHoras = (fechaISO, horaHHMM) => {
  try {
    const end = new Date(`${fechaISO}T${(horaHHMM || "23:59")}:00`);
    return Math.round((end.getTime() - Date.now()) / (1000 * 60 * 60));
  } catch {
    return 0;
  }
};

const normalizePermiso = (x = {}) => {
  const fechaInicio = x.fechaInicio || x.desde || x.fechas || "";
  const fechaFin = x.fechaFin || x.hasta || x.fechas || "";
  const [hIniFromHorario, hFinFromHorario] = parseHorario(x.horario);
  const horaInicio = x.horaInicio || x.hora_ini || x.horaDesde || hIniFromHorario || "";
  const horaFin = x.horaFin || x.hora_fin || x.horaHasta || hFinFromHorario || "";
  const slaHoras = Number.isFinite(x.slaHoras) ? x.slaHoras : computeSlaHoras(fechaFin, horaFin);

  return {
    id: x.id ?? `sol-${Date.now()}`,
    tipo: x.tipo || "",
    motivo: x.motivo || "",
    trabajador: {
      rut: x?.trabajador?.rut || x.rut || "",
      nombre: x?.trabajador?.nombre || x.nombre || "",
    },
    fechaInicio,
    fechaFin,
    horaInicio,
    horaFin,
    adjunto: x.adjunto || x.adjuntoNombre || "",
    estado: labelEstado(x.estado),
    resueltoPor: x.resueltoPor || "",
    fechaRevision: x.fechaRevision || "",
    slaHoras,
  };
};

// ---------- APIs ----------
export const PermisosAPI = {
  // Solo pendientes (gestionables)
  async listPendientes() {
    // 1) API remota
    let arr = await apiGet("permisos");

    // 2) Fallback seed + overlay
    if (!Array.isArray(arr)) {
      const seed = await fetchDb();
      const ov = readOverlay();
      const seedPend = Array.isArray(seed?.permisos) ? seed.permisos.map(normalizePermiso) : [];
      const ovPend = ov.permisos.map(normalizePermiso);
      arr = [...ovPend, ...seedPend]; // overlay primero
    } else {
      arr = arr.map(normalizePermiso);
      // mezclar overlay por si también hay creados localmente
      const ov = readOverlay();
      arr = [...ov.permisos.map(normalizePermiso), ...arr];
    }

    return arr.filter((p) => normalizeEstadoKey(p.estado) === "pendiente");
  },

  // Historial (aprobados / rechazados)
  async listHistorial() {
    let arr = await apiGet("permisos_historial");

    if (!Array.isArray(arr)) {
      const seed = await fetchDb();
      const ov = readOverlay();
      const seedHist = Array.isArray(seed?.permisos_historial) ? seed.permisos_historial.map(normalizePermiso) : [];
      const ovHist = ov.permisos_historial.map(normalizePermiso);
      arr = [...ovHist, ...seedHist];
    } else {
      arr = arr.map(normalizePermiso);
      const ov = readOverlay();
      arr = [...ov.permisos_historial.map(normalizePermiso), ...arr];
    }

    return arr;
  },

  // Cambia estado de un permiso pendiente
  async patchEstado(id, estadoLabel /* "Aprobado" | "Rechazado" */) {
    if (BASE) {
      const url = `${BASE.replace(/\/$/, "")}/permisos/${encodeURIComponent(String(id))}`;
      const r = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: estadoLabel }),
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      return await r.json();
    }

    // Sin API → mover en overlay de pendientes → historial
    const ov = readOverlay();
    const idx = ov.permisos.findIndex((p) => String(p.id) === String(id));
    let item;
    if (idx >= 0) {
      item = ov.permisos.splice(idx, 1)[0];
    } else {
      // si no estaba en overlay (podía venir del seed), creamos uno mínimo
      item = { id, estado: "Pendiente" };
    }
    const normalized = normalizePermiso({ ...item, estado: estadoLabel });
    ov.permisos_historial = [normalized, ...ov.permisos_historial];
    writeOverlay(ov);
    return { ok: true, simulated: true };
  },

  // Crear permiso manual
  async createManual(form) {
    const nuevo = {
      id: `sol-${Date.now()}`,
      rut: form.rut,
      nombre: form.nombre,
      tipo: form.tipo,
      desde: form.desde,
      hasta: form.hasta,
      horaInicio: form.horaInicio,
      horaFin: form.horaFin,
      motivo: form.motivo,
      adjuntoNombre: form.adjuntoNombre || null,
      estado: "Pendiente",
      fechaEnvio: new Date().toISOString().slice(0, 16).replace("T", " "),
      slaHoras: computeSlaHoras(form.hasta, form.horaFin),
    };

    if (BASE) {
      const r = await fetch(`${BASE.replace(/\/$/, "")}/permisos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevo),
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const j = await r.json();
      return normalizePermiso(j);
    }

    // Sin API → guardamos en overlay local
    pushOverlay("permisos", nuevo);
    return normalizePermiso(nuevo);
  },
};

export const EmpleadosAPI = {
  async list() {
    let arr = await apiGet("empleados");
    if (!Array.isArray(arr)) {
      const seed = await fetchDb();
      const ov = readOverlay();
      const seedE = Array.isArray(seed?.empleados) ? seed.empleados : [];
      arr = [...ov.empleados, ...seedE]; // overlay primero
    } else {
      const ov = readOverlay();
      arr = [...ov.empleados, ...arr];
    }
    return arr;
  },

  async create(nuevo) {
    if (BASE) {
      const r = await fetch(`${BASE.replace(/\/$/, "")}/empleados`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevo),
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      return await r.json();
    }
    // Sin API → guardamos en overlay local
    pushOverlay("empleados", nuevo);
    return nuevo;
  },
};

export default { PermisosAPI, EmpleadosAPI };
