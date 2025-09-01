import http from "../lib/http";

// INVENTARIO
export const getInventario = (params = {}) =>
  http.get("/bodega/inventario", { params }).then(r => r.data);

export const getItem = (sku) =>
  http.get(`/bodega/items/${encodeURIComponent(sku)}`).then(r => r.data);

export const editarItem = (sku, payload) =>
  http.put(`/bodega/items/${encodeURIComponent(sku)}`, payload).then(r => r.data);

export const verQR = (sku) =>
  http.get(`/bodega/items/${encodeURIComponent(sku)}/qr`).then(r => r.data);

// COLABORADORES
export const getFichaColaborador = (rut) =>
  http.get(`/bodega/colaboradores/${encodeURIComponent(rut)}`).then(r => r.data);

export const entregarEPP = (rut, payload) =>
  http.post(`/bodega/colaboradores/${encodeURIComponent(rut)}/entregar`, payload).then(r => r.data);

export const bajaEPP = (rut, payload) =>
  http.post(`/bodega/colaboradores/${encodeURIComponent(rut)}/baja`, payload).then(r => r.data);
