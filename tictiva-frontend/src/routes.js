// src/router/routes.js
export const ROUTES = {
  home: "/",

  // RRHH
  listadoFichas: "/rrhh/fichas",
  empleadoDetalle: "/rrhh/empleado/:rut",       // compat
  empleadoDetalleByRut: "/rrhh/empleado/rut/:rut",
  empleadoDetalleById: "/rrhh/empleado/:id",
  empleadoBase: "/rrhh/empleado",
  rrhhPermisos: "/rrhh/permisos",
  rrhhValidacionDT: "/rrhh/validacion-dt",
  rrhhDocumentos: "/rrhh/documentos",

  // RRHH → Bodega & EPP
  rrhhBodegaRoot: "/rrhh/bodega",
  rrhhBodegaDashboard: "/rrhh/bodega/dashboard",
  rrhhBodegaInventario: "/rrhh/bodega/inventario",
  rrhhBodegaColaboradores: "/rrhh/bodega/colaboradores",
  rrhhBodegaOperaciones: "/rrhh/bodega/operaciones",

  // Asistencia
  asistenciaSupervision: "/asistencia/supervision",
  asistenciaMarcas: "/asistencia/marcas-registradas",
  asistenciaMapaCobertura: "/asistencia/mapa-cobertura",
  asistenciaMapa: "/asistencia/mapa-cobertura", // alias

  // Aliases App/Dashboard
  asistenciaGestionDispositivos: "/asistencia/gestion-dispositivos",
  asistenciaDispositivos: "/asistencia/gestion-dispositivos", // alias

  asistenciaGestionTurnos: "/asistencia/gestion-turnos-jornadas",
  asistenciaTurnos: "/asistencia/gestion-turnos-jornadas", // alias
};
