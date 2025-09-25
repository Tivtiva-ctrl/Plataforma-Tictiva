// src/api/empleados.js
import http from "./config"; // usamos el cliente con get/post y API key

async function listar() {
  return http.get("/admin/empleados");
}

async function crear({ rut, nombre, cargo = "", estado = "Activo", fechaIngreso = "", area = "" }) {
  return http.post("/admin/empleados", { rut, nombre, cargo, estado, fechaIngreso, area });
}

async function regenerarCodigo(id) {
  return http.post(`/admin/empleados/${id}/regenerar-codigo`);
}

async function ingresarMarcaPorRut({ rut, tipo, ts, estado = "Válida", metodo = "App", ip = "" }) {
  return http.post("/ingest/marca", { rut, tipo, ts, estado, metodo, ip });
}

async function ingresarMarcaPorCodigo({ codigo, tipo, ts, estado = "Válida", metodo = "App", ip = "" }) {
  return http.post("/ingest/marca", { codigo, tipo, ts, estado, metodo, ip });
}

export const EmpleadosAPI = {
  listar,
  crear,
  regenerarCodigo,
  ingresarMarcaPorRut,
  ingresarMarcaPorCodigo,
};

export default EmpleadosAPI;
