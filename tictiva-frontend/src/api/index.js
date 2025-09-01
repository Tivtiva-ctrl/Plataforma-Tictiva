// src/api/index.js
// Capa API centralizada con fallback a /public/data/db.json
// En producción se IGNORA cualquier VITE_API_URL que apunte a localhost/127.0.0.1

const host =
  typeof window !== "undefined" ? window.location.hostname : "localhost";

const isLocalHost = ["localhost", "127.0.0.1"].includes(host);

const VITE_API = (import.meta.env.VITE_API_URL || "").trim();
const isViteApiLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(
  VITE_API
);

// Si estoy en dev → uso VITE_API o json-server local.
// Si estoy en prod → solo uso VITE_API si NO es localhost.
const BASE = isLocalHost
  ? (VITE_API || "http://127.0.0.1:3001")
  : (isViteApiLocal ? "" : VITE_API);

// Debug solo en dev
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.log("[API] host:", host, "VITE_API:", VITE_API, "BASE usado:", BASE || "(fallback)");
}

// ---------- helpers ----------
const apiGet = async (path) => {
  if (!BASE) return null; // en prod sin API válida: no llamamos a red
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
  const parts = String(hor)
    .split(/[-–—]| a /i)
    .map((s) => s.trim());
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
  async listPendientes() {
    let arr = await apiGet("permisos");
    if (!Array.isArray(arr)) {
      const db = await fetchDb();
      arr = db?.permisos || [];
    }
    arr = arr.map(normalizePermiso);
    return arr.filter((p) => normalizeEstadoKey(p.estado) === "pendiente");
  },

  async listHistorial() {
    let arr = await apiGet("permisos_historial");
    if (!Array.isArray(arr)) {
      const db = await fetchDb();
      arr = db?.permisos_historial || [];
    }
    return arr.map(normalizePermiso);
  },

  async patchEstado(id, estadoLabel /* "Aprobado" | "Rechazado" */) {
    if (!BASE) return { ok: true, simulated: true }; // en prod sin API: simulamos OK
    const url = `${BASE.replace(/\/$/, "")}/permisos/${encodeURIComponent(String(id))}`;
    const r = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: estadoLabel }),
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    return await r.json();
  },

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

    if (!BASE) return normalizePermiso(nuevo); // en prod sin API: devolvemos normalizado

    const r = await fetch(`${BASE.replace(/\/$/, "")}/permisos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevo),
    });
    if (!r.ok) throw new Error("HTTP " + r.status);
    const j = await r.json();
    return normalizePermiso(j);
  },
};

export const EmpleadosAPI = {
  async list() {
    let arr = await apiGet("empleados");
    if (!Array.isArray(arr)) {
      const db = await fetchDb();
      arr = db?.empleados || [];
    }
    return arr;
  },
};

export default { PermisosAPI, EmpleadosAPI };
