// src/api/empleados.js
import { fetchJSON } from "./config";

export const EmpleadosAPI = {
  async list() {
    // Intenta /empleados y si no existe, cae a /fichas
    try {
      return await fetchJSON("/empleados");
    } catch (e1) {
      try {
        return await fetchJSON("/fichas");
      } catch (e2) {
        console.warn("No hay /empleados ni /fichas, devolviendo []");
        return [];
      }
    }
  },

  async getById(id) {
    try {
      return await fetchJSON(`/empleados/${encodeURIComponent(id)}`);
    } catch {
      return null;
    }
  },

  async searchByRut(rut) {
    try {
      const q = encodeURIComponent(rut);
      const data = await fetchJSON(`/empleados?rut=${q}`);
      return Array.isArray(data) ? data[0] : data;
    } catch {
      return null;
    }
  },
};
