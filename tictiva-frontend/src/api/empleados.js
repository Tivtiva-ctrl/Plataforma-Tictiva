// src/api/empleados.js
import { http } from "./http";

export const EmpleadosAPI = {
  async list() {
    try {
      const data = await http("/empleados");
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  },
};
