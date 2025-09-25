import http from "./config";

async function listar() {
  return http.get("/admin/empleados");
}
async function crear(payload) {
  return http.post("/admin/empleados", payload);
}

export const EmpleadosAPI = { listar, crear };
export default EmpleadosAPI;
