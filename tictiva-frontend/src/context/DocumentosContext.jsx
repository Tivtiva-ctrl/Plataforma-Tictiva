import React, { createContext, useContext, useState } from "react";

// Crear contexto
const EmpresaContext = createContext();

export const useEmpresa = () => useContext(EmpresaContext);

export const EmpresaProvider = ({ children }) => {
  // Lista inicial de empresas (puedes cargarla de un backend en el futuro)
  const [empresas] = useState([
    { id: "empresa1", nombre: "Tictiva 1" },
    { id: "empresa2", nombre: "Tictiva 2" },
  ]);

  // Empresa seleccionada
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(empresas[0]);

  return (
    <EmpresaContext.Provider
      value={{ empresas, empresaSeleccionada, setEmpresaSeleccionada }}
    >
      {children}
    </EmpresaContext.Provider>
  );
};
