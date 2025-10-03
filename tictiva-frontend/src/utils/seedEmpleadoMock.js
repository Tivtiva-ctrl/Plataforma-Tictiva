// src/utils/seedEmpleadosMock.js
const LS_KEY = "tictiva.empleados.v1";

export function seedEmpleadosMock() {
  const mock = [
    {
      id: "id:demo-1",
      nombres: "Nicolás",
      apellidos: "Torres",
      nombre_completo: "Nicolás Torres",
      rut: "11.111.111-1",
      cargo: "Desarrollador",
      estado_laboral: "Activo",
      genero: "Hombre",
      foto_url: "",
    },
    {
      id: "id:demo-2",
      nombres: "Verónica",
      apellidos: "Mateo",
      nombre_completo: "Verónica Mateo",
      rut: "22.222.222-2",
      cargo: "Analista",
      estado_laboral: "Activo",
      genero: "Mujer",
      foto_url: "",
    },
  ];
  localStorage.setItem(LS_KEY, JSON.stringify(mock));
  return mock;
}

export function readEmpleadosLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
