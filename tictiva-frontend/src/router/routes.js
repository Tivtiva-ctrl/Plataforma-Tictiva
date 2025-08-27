// src/routes.js
const ROUTES = {
  home: "/",

  // RRHH
  listadoFichas: "/rrhh/fichas",
  empleadoDetalle: "/rrhh/empleado/:rut",   // con parámetro
  rrhhPermisos: "/rrhh/permisos",
  rrhhValidacionDT: "/rrhh/validacion-dt",
  rrhhDocumentos: "/rrhh/documentos",

  // Asistencia (submódulos vigentes)
  asistenciaSupervision: "/asistencia/supervision",
  asistenciaMarcas: "/asistencia/marcas-registradas",
  asistenciaMapaCobertura: "/asistencia/mapa-cobertura",
  asistenciaMapa: "/asistencia/mapa-cobertura", // alias para compatibilidad
  asistenciaGestionDispositivos: "/asistencia/gestion-dispositivos",
  asistenciaGestionTurnos: "/asistencia/gestion-turnos-jornadas",
};

export default ROUTES;
export { ROUTES };
