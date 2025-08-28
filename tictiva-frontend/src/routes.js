// src/routes.js
const ROUTES = {
  home: "/",

  // RRHH
  listadoFichas: "/rrhh/fichas",
  empleadoDetalle: "/rrhh/empleado/:rut",
  rrhhPermisos: "/rrhh/permisos",
  rrhhValidacionDT: "/rrhh/validacion-dt",
  rrhhDocumentos: "/rrhh/documentos",
  rrhhBodega: {
    root: "/rrhh/bodega",
    dashboard: "/rrhh/bodega/dashboard",
    inventario: "/rrhh/bodega/inventario",
    colaboradores: "/rrhh/bodega/colaboradores",
    operaciones: "/rrhh/bodega/operaciones",
  },

  // Asistencia
  asistenciaSupervision: "/asistencia/supervision",
  asistenciaMarcas: "/asistencia/marcas",
  asistenciaMapa: "/asistencia/mapa",              // 👈 Mapa de Cobertura
  asistenciaDispositivos: "/asistencia/dispositivos", // 👈 Gestión de Dispositivos
  asistenciaTurnos: "/asistencia/turnos",          // (opcional/futuro)
};

export default ROUTES;
export { ROUTES };
