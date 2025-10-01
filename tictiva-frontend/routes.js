// src/router/routes.js

// Rutas de la app (públicas y privadas)
export const ROUTES = {
  // públicas
  login: "/login",
  recuperar: "/recuperar",
  cambiarContrasena: "/cambiar-contrasena",

  // privadas
  dashboard: "/",

  // RRHH
  rrhh: {
    listadoFichas: "/rrhh/listado-fichas",
    // Builder para la ficha por RUT. Ej: ROUTES.rrhh.ficha(encodeURIComponent(rut))
    ficha: (rut = ":rut") => `/rrhh/ficha/${rut}`,
  },

  // catch-all
  notFound: "*",
};

// Map para abrir módulos desde el Dashboard (MODULES -> MODULE_ROUTES)
export const MODULE_ROUTES = {
  rrhh: ROUTES.rrhh.listadoFichas,
  asistencia: "/asistencia",       // placeholder (cuando tengas vistas reales, cámbialas)
  comunicaciones: "/comunicaciones",
  reporteria: "/reporteria",
  cuida: "/cuida",
  bodega: "/bodega",
};
