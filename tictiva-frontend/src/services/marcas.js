import http from "../lib/http";

/**
 * Ingesta de marca (por PIN o por RUT)
 * Body esperado por backend:
 * { codigo?:string | pin?:string, rut?:string, tipo:"Entrada"|"Salida"|...,
 *   ts?:ISO, fecha?:YYYY-MM-DD, hora?:HH:mm:ss, estado?, metodo?, ip? }
 */
export const ingestarMarca = (payload) =>
  http.post("/ingest/marca", payload).then(r => r.data);
