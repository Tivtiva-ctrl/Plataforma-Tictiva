// Rutas principales de la app (single source of truth)
export const ROUTES = {
  // Home / dashboard
  dashboard: "/",

  // Auth públicas
  login: "/login",
  recuperar: "/recuperar",
  cambiarContrasena: "/cambiar-contrasena",

  // Módulos
  rrhh: {
    root: "/rrhh",
    listadoFichas: "/rrhh/listado-fichas",
    permisosJustificaciones: "/rrhh/permisos-justificaciones",
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

// Mapa para abrir módulos desde el Dashboard / buscador
export const MODULE_ROUTES = {
  rrhh: ROUTES.rrhh.listadoFichas,
  asistencia: ROUTES.asistencia,
  comunicaciones: ROUTES.comunicaciones,
  reporteria: ROUTES.reporteria,
  cuida: ROUTES.cuida,
  bodega: ROUTES.bodega,
};

export default ROUTES;
