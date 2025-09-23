// Quita la / final si viene con slash
export const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

// Construye URL absolutas a tu API
export function api(path) {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!API_BASE) throw new Error("Falta configurar VITE_API_URL");
  return `${API_BASE}${p}`;
}
