// src/services/empleados.js
const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";
const RESOURCE = import.meta.env.VITE_RESOURCE_EMPLEADOS || "empleados";

const normalizeRut = (r="") => r.replace(/\./g,"").replace(/-/g,"").toUpperCase();

async function http(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// LISTADO (con paginación opcional)
export async function listarEmpleados({ page=1, limit=50, sort="nombre", order="asc" } = {}) {
  const url = `${API}/${RESOURCE}?_page=${page}&_limit=${limit}&_sort=${sort}&_order=${order}`;
  return http(url);
}

// DETALLE: acepta id o rut
export async function obtenerEmpleado({ id, rut }) {
  // por id directo
  if (id) {
    try {
      return await http(`${API}/${RESOURCE}/${encodeURIComponent(id)}`);
    } catch {}
  }
  // por rut en varias formas
  if (rut) {
    const raw = rut.trim();
    const norm = normalizeRut(raw);
    const tries = [
      `${API}/${RESOURCE}?rut=${encodeURIComponent(raw)}`,
      `${API}/${RESOURCE}?rut_like=${encodeURIComponent(raw)}`,
      `${API}/${RESOURCE}?rut=${encodeURIComponent(norm)}`,
      `${API}/${RESOURCE}?rut_like=${encodeURIComponent(norm)}`,
    ];
    for (const u of tries) {
      try {
        const data = await http(u);
        if (Array.isArray(data) ? data[0] : data) return Array.isArray(data) ? data[0] : data;
      } catch {}
    }
    // fallback traer todos
    try {
      const all = await http(`${API}/${RESOURCE}`);
      return all.find(e => normalizeRut(e?.rut) === norm) || null;
    } catch {}
  }
  return null;
}

// UPDATE (PUT completo)
export async function guardarEmpleado(empleado) {
  const id = empleado.id ?? encodeURIComponent(empleado.rut);
  return http(`${API}/${RESOURCE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(empleado),
  });
}
