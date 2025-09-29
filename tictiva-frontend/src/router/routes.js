// Rutas principales de la app (single source of truth)
export const ROUTES = {
  // Home / dashboard
  dashboard: "/",

  // Auth
  login: "/login",
  recuperar: "/recuperar",                 // recuperar acceso
  cambiarContrasena: "/cambiar-contrasena",

  // Módulos
  rrhh: {
    root: "/rrhh",
    listadoFichas: "/rrhh/listado-fichas",
    // Ruta con builder para la ficha individual
    ficha: (id = ":id") => `/rrhh/ficha/${id}`,
  },

  asistencia: "/asistencia",
  comunicaciones: "/comunicaciones",
  reporteria: "/reporteria",
  cuida: "/cuida",
  bodega: "/bodega",

  // Fallback
  notFound: "*",
};

// Atajos planos (útiles para importar rápido)
export const routePaths = {
  dashboard: ROUTES.dashboard,
  login: ROUTES.login,
  recuperar: ROUTES.recuperar,
  cambiarContrasena: ROUTES.cambiarContrasena,

  listadoFichas: ROUTES.rrhh.listadoFichas,
  fichaEmpleado: ROUTES.rrhh.ficha(), // deja :id en la definición

  asistencia: ROUTES.asistencia,
  comunicaciones: ROUTES.comunicaciones,
  reporteria: ROUTES.reporteria,
  cuida: ROUTES.cuida,
  bodega: ROUTES.bodega,

  notFound: ROUTES.notFound,
};

// Map para “Abrir módulo” desde el Dashboard
export const MODULE_ROUTES = {
  rrhh: ROUTES.rrhh.listadoFichas,
  asistencia: ROUTES.asistencia,
  comunicaciones: ROUTES.comunicaciones,
  reporteria: ROUTES.reporteria,
  cuida: ROUTES.cuida,
  bodega: ROUTES.bodega,
};

// Helper para armar links
export const linkToFicha = (id) => ROUTES.rrhh.ficha(id);

export default ROUTES;
