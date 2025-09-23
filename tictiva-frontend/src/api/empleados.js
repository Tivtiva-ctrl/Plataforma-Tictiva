// src/api/empleados.js
import { api } from "./config";

/** Cliente simple para empleados */
export const EmpleadosAPI = {
  async listar(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const url = api(`/empleados${qs ? `?${qs}` : ""}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  async detalle(id) {
    const res = await fetch(api(`/empleados/${id}`));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
};
