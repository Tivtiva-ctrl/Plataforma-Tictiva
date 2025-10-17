import React from "react";
import PrevisionView from "./PrevisionView";
import PrevisionForm from "./PrevisionForm";

/**
 * Props:
 * - mode: 'view' | 'edit'
 * - data: objeto de previsión (puede ser null)
 * - catalogs: { afp, isapre, cajas, mutual, ... }
 * - employee: { id, tenant_id, ... }  // lo pasamos al form para guardar
 * - onSaved: (row)=>void               // refresca estado arriba cuando guarda
 */
export default function PrevisionSection({ mode="view", data, catalogs, employee, onSaved }) {
  if (mode === "edit") {
    // En edición: SIEMPRE mostrar formulario, aunque data sea null
    return <PrevisionForm employee={employee} onSaved={onSaved} />;
  }
  // En vista: muestra tabla aunque falten campos (usa — en vacíos)
  return <PrevisionView data={data ?? {}} catalogs={catalogs} />;
}
