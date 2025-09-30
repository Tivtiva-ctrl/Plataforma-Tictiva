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

export default ROUTES;
