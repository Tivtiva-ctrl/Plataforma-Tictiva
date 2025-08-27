// src/context/EmpresaContext.jsx
import React, { createContext, useContext, useMemo, useState } from "react";

const EmpresaContext = createContext(null);

export function EmpresaProvider({ children }) {
  const [empresaId, setEmpresaId] = useState(null);

  const value = useMemo(() => ({ empresaId, setEmpresaId }), [empresaId]);

  // 👇 Importante: usar .Provider, no <EmpresaContext> a secas
  return (
    <EmpresaContext.Provider value={value}>
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa() {
  const ctx = useContext(EmpresaContext);
  if (!ctx) throw new Error("useEmpresa debe usarse dentro de <EmpresaProvider>");
  return ctx;
}
