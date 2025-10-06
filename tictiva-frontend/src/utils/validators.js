// src/utils/validators.js
export const normalizaRut = (rut = "") => rut.replace(/[.\-]/g, "").toUpperCase();

export const validaRut = (rut = "") => {
  const v = normalizaRut(rut);
  if (!/^\d{7,8}[0-9K]$/.test(v)) return false;
  const cuerpo = v.slice(0, -1);
  const dv = v.slice(-1);
  let suma = 0, mul = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const res = 11 - (suma % 11);
  const dvCalc = res === 11 ? "0" : res === 10 ? "K" : String(res);
  return dv === dvCalc;
};

export const isEmail = (s = "") =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim());

export const isPhoneCL = (s = "") =>
  /^(\+56)?\s?9\d{8}$/.test(String(s).replace(/\s/g, ""));

export const isPastDate = (iso = "") => {
  const d = new Date(iso);
  return !isNaN(d) && d.getTime() < Date.now();
};

export const yearsBetween = (iso = "") => {
  const d = new Date(iso); if (isNaN(d)) return NaN;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 3600 * 1000));
};

export const isAdult = (iso = "", min = 18) => yearsBetween(iso) >= min;

export const required = (v) => (v === undefined || v === null || String(v).trim() === "") ? "Obligatorio" : null;
export const oneOf = (list) => (v) => (v && list.includes(v) ? null : "Valor inválido");

export const compose = (...validators) => (v) => {
  for (const fn of validators) {
    const err = fn(v);
    if (err) return err;
  }
  return null;
};
