// src/api/permisos.js
import { http } from "./http";

// Normalizador robusto (acepta formato “plano” y “híbrido”)
export function normalizePermiso(row) {
  if (!row) return null;

  if (row.rut && row.nombre) {
    let horaInicio = "", horaFin = "";
    if (typeof row.horario === "string" && row.horario.includes("–")) {
      const [hi, hf] = row.horario.split("–").map(s => s.trim());
      horaInicio = hi || ""; horaFin = hf || "";
    }
    const fecha = row.desde || row.hasta || row.fechas || "";
    return {
      id: row.id ?? String(Date.now()),
      trabajador: { nombre: row.nombre, rut: row.rut },
      tipo: row.tipo || "Personal",
      fechaInicio: row.desde || fecha || "",
      horaInicio,
      fechaFin: row.hasta || fecha || "",
      horaFin,
      motivo: row.motivo || "",
      adjunto: row.adjuntoNombre || row.adjunto || null,
      estado: String(row.estado || "pendiente").toLowerCase(),
      slaHoras: Number.isFinite(Number(row.slaHoras)) ? Number(row.slaHoras) : 0,
      fechaEnvio: row.fechaEnvio || null,
      resueltoPor: row.resueltoPor || null,
      fechaRevision: row.fechaRevision || null,
      _raw: row,
    };
  }

  if (row.trabajador) {
    return {
      id: row.id ?? String(Date.now()),
      trabajador: row.trabajador,
      tipo: row.tipo || "Personal",
      fechaInicio: row.fechaInicio || row.desde || "",
      horaInicio: row.horaInicio || "",
      fechaFin: row.fechaFin || row.hasta || "",
      horaFin: row.horaFin || "",
      motivo: row.motivo || "",
      adjunto: row.adjunto || row.adjuntoNombre || null,
      estado: String(row.estado || "pendiente").toLowerCase(),
      slaHoras: Number.isFinite(Number(row.slaHoras)) ? Number(row.slaHoras) : 0,
      fechaEnvio: row.fechaEnvio || null,
      resueltoPor: row.resueltoPor || null,
      fechaRevision: row.fechaRevision || null,
      _raw: row,
    };
  }

  return null;
}

export const PermisosAPI = {
  async listPendientes() {
    try {
      const data = await http("/permisos");
      return (Array.isArray(data) ? data : []).map(normalizePermiso).filter(Boolean)
        .map(p => ({ ...p, estado: "pendiente" }));
    } catch {
      return [];
    }
  },

  async listHistorial() {
    try {
      const data = await http("/permisos_historial");
      return (Array.isArray(data) ? data : []).map(normalizePermiso).filter(Boolean)
        .map(p => ({ ...p, estado: String(p.estado).toLowerCase() }));
    } catch {
      return [];
    }
  },

  async patchEstado(id, estado) {
    // json-server: PATCH sobre /permisos/:id (pendientes)
    return http(`/permisos/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: { estado: estado[0].toUpperCase() + estado.slice(1) }, // "Aprobado"/"Rechazado"
    });
  },

  async createManual(form) {
    // Construye versión “plana” compatible con tu db.json
    const payload = {
      id: `sol-${Date.now()}`,
      rut: form.rut,
      nombre: form.nombre,
      tipo: form.tipo,
      desde: form.desde,
      hasta: form.hasta,
      horario: `${form.horaInicio || ""} – ${form.horaFin || ""}`,
      motivo: form.motivo || "",
      adjuntoNombre: form.adjuntoNombre || null,
      estado: "Pendiente",
      fechaEnvio: new Date().toISOString().slice(0, 16).replace("T", " "),
      slaHoras: computeSlaHoras(form.hasta, form.horaFin),
    };
    await http("/permisos", { method: "POST", body: payload });
    const norm = normalizePermiso(payload);
    return { ...norm, estado: "pendiente" };
  },
};

function computeSlaHoras(fechaISO, horaHHMM) {
  try {
    const end = new Date(`${fechaISO}T${(horaHHMM || "23:59")}:00`);
    const now = new Date();
    return Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60));
  } catch { return 0; }
}
