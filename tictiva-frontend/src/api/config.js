// src/api/config.js
export const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/g, "");
export const api = (path = "") =>
  `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

/** Helper para pedir JSON con manejo de error HTTP */
export async function fetchJSON(path, opts) {
  const res = await fetch(api(path), opts);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
