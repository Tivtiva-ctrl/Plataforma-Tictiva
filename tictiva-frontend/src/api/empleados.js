// src/api/empleados.js
import { api } from "./config";

/**
 * API de Empleados (named export) para que coincida con:
 *   import { EmpleadosAPI } from "../api/empleados";
 */
async function listar() {
  return api.get("/admin/empleados");
}

async function crear({ rut, nombre, cargo = "", estado = "Activo", fechaIngreso = "", area = "" }) {
  return api.post("/admin/empleados", { rut, nombre, cargo, estado, fechaIngreso, area });
}

async function regenerarCodigo(id) {
  return api.post(`/admin/empleados/${id}/regenerar-codigo`);
}

async function ingresarMarcaPorRut({ rut, tipo, ts, estado = "Válida", metodo = "App", ip = "" }) {
  return api.post("/ingest/marca", { rut, tipo, ts, estado, metodo, ip });
}

async function ingresarMarcaPorCodigo({ codigo, tipo, ts, estado = "Válida", metodo = "App", ip = "" }) {
  return api.post("/ingest/marca", { codigo, tipo, ts, estado, metodo, ip });
}

export const EmpleadosAPI = {
  listar,
  crear,
  regenerarCodigo,
  ingresarMarcaPorRut,
  ingresarMarcaPorCodigo,
};
