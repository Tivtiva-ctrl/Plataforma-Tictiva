// src/api/sucursales.js
import { http } from "./http";

const DEMO = [
  { id:"site_central", nombre:"Oficina Central Santiago (Prueba 1)", direccion:"Av. Siempre Viva 123, Santiago",
    region:"Metropolitana de Santiago", comuna:"Santiago", lat:-33.4429, lng:-70.65, estado:"parcial",
    asignados:3, marcadosHoy:2,
    colaboradores:[{nombre:"Eva Green", detalle:"Marcó 08:58"}, {nombre:"Juan Pérez", detalle:"Marcó 09:01"}, {nombre:"Sofía Ventura", detalle:"Pendiente"}]},
  { id:"site_provi", nombre:"Oficina de Ventas Providencia (P1)", direccion:"Av. Providencia 1234",
    region:"Metropolitana de Santiago", comuna:"Providencia", lat:-33.4267, lng:-70.617, estado:"sin",
    asignados:3, marcadosHoy:0,
    colaboradores:[{nombre:"Carlos Ventas", detalle:"Sin marca"}, {nombre:"Sofía Ventas", detalle:"Sin marca"}, {nombre:"Ana Ventas", detalle:"Sin marca"}]},
  { id:"s-1", nombre:"Kiosko Mall Arauco (Tictiva)", direccion:"Mall Arauco Maipú, Local K-10",
    region:"Metropolitana de Santiago", comuna:"Maipú", lat:-33.5137, lng:-70.7579, estado:"completa",
    asignados:1, marcadosHoy:1, colaboradores:[{nombre:"Patricia García", detalle:"Marcó 09:55"}]},
  { id:"s-2", nombre:"Sucursal Bilbao", direccion:"Av. Bilbao 1234", region:"RM", comuna:"Providencia",
    lat:-33.4285, lng:-70.6048, estado:"completa", asignados:2, marcadosHoy:2,
    colaboradores:[{nombre:"J. Díaz", detalle:"Marcó 08:58"}, {nombre:"M. Pérez", detalle:"Marcó 09:03"}]},
  { id:"s-3", nombre:"Bodega Quilicura", direccion:"Camino A", region:"RM", comuna:"Quilicura",
    lat:-33.358, lng:-70.728, estado:"parcial", asignados:3, marcadosHoy:1,
    colaboradores:[{nombre:"C. Rodríguez", detalle:"Pendiente"}]},
  { id:"s-4", nombre:"Punto Ñuñoa", direccion:"Plaza Ñuñoa", region:"RM", comuna:"Ñuñoa",
    lat:-33.457, lng:-70.6, estado:"sin", asignados:1, marcadosHoy:0, colaboradores:[{nombre:"Vacante", detalle:"Sin marca"}]},
  { id:"s-5", nombre:"Kiosko Viña", direccion:"Centro Viña", region:"Valparaíso", comuna:"Viña del Mar",
    lat:-33.0245, lng:-71.5518, estado:"desconocida", asignados:1, marcadosHoy:0, colaboradores:[]},
];

export const SucursalesAPI = {
  async list() {
    try {
      const data = await http("/sucursales");
      const rows = (Array.isArray(data) ? data : []).map((d, i) => ({
        id: d.id ?? `s-${i}`,
        nombre: d.nombre ?? d.titulo ?? "Sucursal",
        direccion: d.direccion ?? "",
        region: d.region ?? "",
        comuna: d.comuna ?? "",
        lat: Number(d.lat), lng: Number(d.lng),
        estado: String(d.estado ?? "desconocida").toLowerCase(), // completa/parcial/sin/desconocida
        asignados: Number(d.asignados ?? 0),
        marcadosHoy: Number(d.marcadosHoy ?? 0),
        colaboradores: Array.isArray(d.colaboradores) ? d.colaboradores : [],
      })).filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));

      return rows.length ? rows : DEMO;
    } catch {
      // Si el endpoint no existe (404) o falla, no rompe la vista
      return DEMO;
    }
  },
};
