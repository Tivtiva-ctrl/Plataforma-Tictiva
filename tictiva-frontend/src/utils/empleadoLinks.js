export const empleadoTabURL = (rut, tab) =>
  `/empleados/${encodeURIComponent(rut)}#${tab}`;
