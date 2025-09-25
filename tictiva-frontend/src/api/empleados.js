// src/services/empleados.js
import { api } from "../api/client";

// Export default con las funciones esperadas por tu UI
const empleados = {
  async listar() {
    // GET /admin/empleados
    return api.get("/admin/empleados");
  },

  async crear({ rut, nombre, cargo = "", estado = "Activo", fechaIngreso = "", area = "" }) {
    return api.post("/admin/empleados", { rut, nombre, cargo, estado, fechaIngreso, area });
  },

  async regenerarCodigo(id) {
    return api.post(`/admin/empleados/${id}/regenerar-codigo`);
  },

  async ingresarMarcaPorRut({ rut, tipo, ts, estado = "Válida", metodo = "App", ip = "" }) {
    return api.post("/ingest/marca", { rut, tipo, ts, estado, metodo, ip });
  },

  async ingresarMarcaPorCodigo({ codigo, tipo, ts, estado = "Válida", metodo = "App", ip = "" }) {
    return api.post("/ingest/marca", { codigo, tipo, ts, estado, metodo, ip });
  },
};

export default empleados;
