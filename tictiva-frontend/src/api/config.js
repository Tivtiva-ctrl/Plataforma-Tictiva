export const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:4000").replace(/\/+$/g, "");
export const API_KEY  = import.meta.env.VITE_API_KEY  || "dev-secret-key";

export const api = (path = "") =>
  `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const url = api(path);
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json", "x-api-key": API_KEY, ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const ct = res.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const data = isJson ? await res.json() : await res.text();
  if (!res.ok) throw new Error(isJson ? (data?.error || JSON.stringify(data)) : data);
  return data;
}

export const http = {
  get:  (p, o) => request(p, { ...o, method: "GET" }),
  post: (p, b, o) => request(p, { ...o, method: "POST", body: b }),
};

export default http;
