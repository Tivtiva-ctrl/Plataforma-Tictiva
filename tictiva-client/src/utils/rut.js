// src/utils/rut.js
export function normalizeRut(raw) {
  return (raw || "")
    .toString()
    .trim()
    .replace(/\./g, "")
    .replace(/-/g, "")
    .toUpperCase();
}
