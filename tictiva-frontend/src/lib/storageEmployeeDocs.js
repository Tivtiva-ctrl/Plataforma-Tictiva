// lib/storageEmployeeDocs.js
// Utilidades para subir/listar/firmar/borrar archivos en el bucket `employee-docs`
// Asegúrate de inicializar supabase en ../lib/supabase con tu URL y anon key.

import { supabase } from "../lib/supabase";

/**
 * Sube un archivo al bucket employee-docs con metadata de tenant.
 * @param {File|Blob} file - archivo a subir
 * @param {string} path - ruta dentro del bucket (ej: `empleados/11.111.111-1/contratos/contrato.pdf`)
 * @param {string} tenantId - uuid del tenant actual
 * @param {object} extraMeta - metadata adicional (ej: { employee_id, title })
 * @param {boolean} upsert - si quieres permitir reemplazo
 */
export async function uploadEmployeeDoc({ file, path, tenantId, extraMeta = {}, upsert = false }) {
  const { data, error } = await supabase.storage
    .from("employee-docs")
    .upload(path, file, {
      upsert,
      contentType: file?.type ?? "application/octet-stream",
      metadata: {
        tenant_id: tenantId,
        ...extraMeta,
      },
    });
  if (error) throw error;
  return data;
}

/**
 * Lista objetos por carpeta (prefijo).
 * @param {string} folder - ej: `empleados/11.111.111-1/contratos`
 * @param {object} opts - { limit, offset, search }
 */
export async function listEmployeeDocs(folder, opts = {}) {
  const { data, error } = await supabase.storage
    .from("employee-docs")
    .list(folder, {
      limit: opts.limit ?? 100,
      offset: opts.offset ?? 0,
      search: opts.search ?? "",
    });
  if (error) throw error;
  return data; // [{ name, id, updated_at, metadata, ... }]
}

/**
 * Obtiene una URL firmada temporal para descargar.
 * @param {string} path
 * @param {number} expiresIn - segundos (ej: 60)
 */
export async function getSignedUrl(path, expiresIn = 60) {
  const { data, error } = await supabase.storage
    .from("employee-docs")
    .createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

/**
 * Elimina uno o varios paths del bucket.
 * @param {string[]} paths
 */
export async function removeEmployeeDocs(paths) {
  const { data, error } = await supabase.storage
    .from("employee-docs")
    .remove(paths);
  if (error) throw error;
  return data;
}

/**
 * Actualiza metadatos (requiere UPDATE policy).
 * @param {string} path
 * @param {object} metadata - p.ej. { tenant_id, employee_id, title }
 */
export async function updateMetadata(path, metadata) {
  const { data, error } = await supabase.storage
    .from("employee-docs")
    .update(path, new Blob([]), { // truco: update metadatos sin cambiar contenido
      upsert: true,
      metadata,
      contentType: undefined,
    });
  if (error) throw error;
  return data;
}
