import http from "../lib/http";

/** Listado de empleados */
export const listarEmpleados = () =>
  http.get("/empleados").then(r => r.data);

/** Obtener empleado por RUT (acepta con o sin puntos/guión) */
export const obtenerEmpleado = (rut) =>
  http.get(`/empleados/${encodeURIComponent(rut)}`).then(r => r.data);

/** Actualizar empleado por RUT (merge superficial) */
export const actualizarEmpleado = (rut, payload) =>
  http.put(`/empleados/${encodeURIComponent(rut)}`, payload).then(r => r.data);

/** Crear empleado (genera PIN único automáticamente) */
export const crearEmpleado = (payload) =>
  http.post("/admin/empleados", payload).then(r => r.data);

/** Regenerar PIN por RUT */
export const regenerarPin = (rut) =>
  http.post(`/admin/empleados/${encodeURIComponent(rut)}/regenerar-pin`).then(r => r.data);
