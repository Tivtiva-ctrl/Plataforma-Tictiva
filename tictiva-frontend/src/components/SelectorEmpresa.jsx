import React, { useEffect, useState } from "react";
import { useEmpresa } from "../context/EmpresaContext";

export default function SelectorEmpresa() {
  const { empresaSeleccionada, setEmpresaSeleccionada } = useEmpresa();
  const [empresas, setEmpresas] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/empresas")
      .then((res) => res.json())
      .then((data) => setEmpresas(data));
  }, []);

  const handleChange = (e) => {
    const empresa = empresas.find((emp) => emp.id === e.target.value);
    setEmpresaSeleccionada(empresa);
  };

  return (
    <select onChange={handleChange} value={empresaSeleccionada?.id || ""}>
      <option value="">Seleccione Empresa</option>
      {empresas.map((emp) => (
        <option key={emp.id} value={emp.id}>{emp.nombre}</option>
      ))}
    </select>
  );
}
