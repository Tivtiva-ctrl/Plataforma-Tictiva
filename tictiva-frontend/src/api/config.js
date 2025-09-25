// src/api/config.js

// Base y clave desde .env (frontend)
export const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:4000").replace(/\/+$/g, "");
export const API_KEY  = import.meta.env.VITE_API_KEY  || "dev-secret-key";

/**
 * Builder de URL (compatibilidad con tu código actual)
 * Ej: api("/admin/empleados") -> "https://.../admin/empleados"
 */
export const api = (path = "") =>
  `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

/**
 * Cliente HTTP con manejo de JSON y API key
 */
async function request(path, { method = "GET", body, headers = {} } = {}) {
  const url = api(path);
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json() : await res.text();

  if (!res.ok) {
    const msg = isJson ? (data?.error || JSON.stringify(data)) : data;
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return data;
}

export const http = {
  get:  (path, opts) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts) => request(path, { ...opts, method: "POST", body }),
};

// default export por conveniencia
export default http;

/**
 * (Opcional) si quieres seguir usando un helper suelto:
 * export async function fetchJSON(path, opts) {
 *   return request(path, opts);
 * }
 */
