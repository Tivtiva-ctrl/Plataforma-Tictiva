// EmpleadoDetalle.jsx
// ✅ Versión corregida por ChatGPT (Septiembre 2025)

import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { differenceInMinutes, parseISO } from "date-fns";
import "./EmpleadoDetalle.css";
import VolverAtras from "../components/VolverAtras";
import PersonalesTab from "../components/PersonalesTab";
import ContractualesTab from "../components/ContractualesTab";
import DocumentosTab from "../components/DocumentosTab";
import PrevisionTab from "../components/PrevisionTab";
import BancariosTab from "../components/BancariosTab";
import HojaDeVida from "../components/HojaDeVida";
import AsistenciaTab from "../components/AsistenciaTab";
import HistorialTab from "../components/HistorialTab";

// ---------- Utils ----------
const normalizeRut = (r) =>
  (r || "").toString().replace(/\./g, "").replace(/-/g, "").toUpperCase();

export default function EmpleadoDetalle() {
  const { rut } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [empleado, setEmpleado] = useState({});
  const [tabActiva, setTabActiva] = useState("personales");
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => {
    setEmpleado({
      rut,
      nombre: "Nicolás Torres",
      correo: "nicolas@empresa.com",
      telefono: "+56 9 1234 5678",
      direccion: "Av. Siempre Viva 123",
      estadoCivil: "Soltero(a)",
      fechaNacimiento: "1990-01-01",
      datosContractuales: { cargo: "Desarrollador", area: "TI" }
    });
  }, [rut]);

  const handleChange = (campo, valor) => {
    setEmpleado(prev => ({ ...prev, [campo]: valor }));
  };

  const guardarEmpleado = () => {
    console.log("Guardando cambios:", empleado);
    setModoEdicion(false);
  };

  const cumpleTxt = empleado?.fechaNacimiento
    ? new Date(empleado.fechaNacimiento).toLocaleDateString("es-CL")
    : "—";

  return (
    <div className="detalle-container">
      <div className="detalle-header">
        <span className="detalle-logo">Ficha de Empleado</span>
        <div>
          {modoEdicion ? (
            <button className="ed-btn primary" onClick={guardarEmpleado}>Guardar Cambios</button>
          ) : (
            <button
              className="ed-btn primary"
              onClick={() => setModoEdicion(true)}
              disabled={["asistencia", "historial"].includes(tabActiva)}
              title={["asistencia", "historial"].includes(tabActiva) ? "Esta sección no es editable" : ""}
              style={{
                opacity: ["asistencia", "historial"].includes(tabActiva) ? 0.5 : 1,
                cursor: ["asistencia", "historial"].includes(tabActiva) ? "not-allowed" : "pointer"
              }}
            >
              Editar Ficha
            </button>
          )}
        </div>
      </div>
      <VolverAtras />

      <div className="tabs-nav">
        {[
          ["personales", "Personales"],
          ["contractuales", "Contractuales"],
          ["prevision", "Previsión"],
          ["bancarios", "Bancarios"],
          ["documentos", "Documentos"],
          ["hojaVida", "Hoja de Vida"],
          ["asistencia", "Asistencia"],
          ["historial", "Historial"]
        ].map(([clave, label]) => (
          <div
            key={clave}
            className={`tabs-item ${tabActiva === clave ? "active" : ""}`}
            onClick={() => setTabActiva(clave)}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="ed-left">
        {tabActiva === "personales" && (
          <PersonalesTab
            empleado={empleado}
            modoEdicion={modoEdicion}
            onChange={handleChange}
          />
        )}
        {tabActiva === "contractuales" && (
          <ContractualesTab
            datos={empleado.datosContractuales || {}}
            modoEdicion={modoEdicion}
            onChange={handleChange}
            empleado={empleado}
          />
        )}
        {tabActiva === "documentos" && (
          <DocumentosTab
            empleado={empleado}
            modoEdicion={modoEdicion}
            onChange={handleChange}
          />
        )}
        {tabActiva === "prevision" && (
          <PrevisionTab
            empleado={empleado}
            modoEdicion={modoEdicion}
            onChange={handleChange}
          />
        )}
        {tabActiva === "bancarios" && (
          <BancariosTab
            empleado={empleado}
            modoEdicion={modoEdicion}
            onChange={handleChange}
          />
        )}
        {tabActiva === "hojaVida" && (
          <HojaDeVida
            empleado={empleado}
            modoEdicion={modoEdicion}
            onChange={handleChange}
          />
        )}
        {tabActiva === "asistencia" && (
          <AsistenciaTab empleado={empleado} />
        )}
        {tabActiva === "historial" && (
          <HistorialTab empleado={empleado} />
        )}
      </div>
    </div>
  );
}
