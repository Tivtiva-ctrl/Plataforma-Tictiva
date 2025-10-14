// src/pages/EmpleadoFicha.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import PersonalesForm from "../components/PersonalesForm";
import { calcNextBirthdayLabel } from "../utils/birthday";
import "../styles/personales.css";

// Normaliza RUT (sin puntos, mantiene guion)
const normalizeRut = (r) => (r || "").toString().replace(/\./g, "").toUpperCase();

/** Toma id o rut desde params, query o location.state */
function useEmployeeLookup() {
  const params = useParams();
  const location = useLocation();

  let id = params?.id ?? params?.empId ?? params?.empleadoId ?? null;
  let rut = params?.rut ?? null;

  if (!id || !rut) {
    const qs = new URLSearchParams(location.search);
    id = id ?? qs.get("id");
    rut = rut ?? qs.get("rut");
  }

  if ((!id || !rut) && location.state) {
    id = id ?? (location.state.id ?? location.state.employeeId ?? location.state.empleadoId);
    rut = rut ?? (location.state.rut ?? location.state.employeeRut);
  }

  if (id) return { by: "id", value: /^\d+$/.test(String(id)) ? Number(id) : String(id) };
  if (rut) return { by: "rut", value: normalizeRut(rut) };
  return null;
}

export default function EmpleadoFicha() {
  const lookup = useEmployeeLookup();
  const [empleado, setEmpleado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!lookup) {
      setLoading(false);
      setLoadError("Falta el parámetro :id o :rut en la ruta (o ?id= / ?rut=).");
      return;
    }

    let canceled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);

      // 👇 OJO: columnas reales en español
      let query = supabase
        .from("employees")
        .select(`
          id,
          nombre, nombres,           -- puede existir una u otra
          apellido, apellidos,       -- puede existir una u otra
          rut,
          cargo,
          genero,
          discapacidad,
          activo,
          direccion,
          region_id,
          comuna_id,
          telefono_movil,
          telefono_fijo,
          email_personal,
          email_corporativo,         -- (antes pedíamos email_corporate)
          office,
          horario,                   -- (antes pedíamos schedule)
          fecha_nacimiento,          -- (antes pedíamos birth_date)
          estado_civil_id,
          nacionalidad_id
        `);

      if (lookup.by === "id") query = query.eq("id", lookup.value);
      else query = query.eq("rut", lookup.value);

      const { data, error } = await query.maybeSingle();

      if (canceled) return;

      if (error) {
        console.error(error);
        setLoadError(error.message || "Error cargando empleado");
        setEmpleado(null);
      } else {
        setEmpleado(data || null);
      }
      setLoading(false);
    })();

    return () => { canceled = true; };
  }, [lookup]);

  const proxCumple = useMemo(() => {
    return calcNextBirthdayLabel(empleado?.fecha_nacimiento)?.label ?? "—";
  }, [empleado?.fecha_nacimiento]);

  async function handleSavePersonales(payload) {
    if (!empleado?.id) return;

    // payload viene desde PersonalesForm con nombres en español
    const { data, error } = await supabase
      .from("employees")
      .update(payload)
      .eq("id", empleado.id)
      .select()
      .maybeSingle();

    if (error) {
      console.error(error);
      alert(error.message || "Error al guardar");
    } else {
      setEmpleado(data);
      setIsEditing(false);
    }
  }

  // Estados UI
  if (loading) return <div>Cargando…</div>;
  if (!lookup) {
    return (
      <div style={{ padding: 16 }}>
        <h3>No se pudo abrir la ficha</h3>
        <p>Falta el parámetro <code>:id</code> o <code>:rut</code> en la ruta, o <code>?id=</code>/<code>?rut=</code>.</p>
        <p>Ejemplos: <code>/empleados/123</code> · <code>/empleado?id=123</code> · <code>/rrhh/ficha/16.238.789-8</code></p>
      </div>
    );
  }
  if (loadError) return <div style={{ color: "crimson", padding: 12 }}>{loadError}</div>;
  if (!empleado) return <div>No encontrado</div>;

  return (
    <div className="ficha-wrap">
      {/* Botón único de Editar/Guardar */}
      <div className="ficha-actions">
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)}>Editar</button>
        ) : (
          <button form="personales-form" type="submit">Guardar</button>
        )}
        {isEditing && (
          <button onClick={() => setIsEditing(false)}>Cancelar</button>
        )}
      </div>

      <div className="ficha-grid">
        <div className="ficha-col">
          <PersonalesForm
            key={empleado.id}
            initialValues={empleado}
            isEditing={isEditing}
            onSubmit={handleSavePersonales}
          />
        </div>

        <aside className="ficha-aside">
          <div className="card info-rapida">
            <h3>Información Rápida</h3>

            <div className="info-item">
              <span className="info-label">Nacimiento:</span>
              <span className="info-value">
                {empleado.fecha_nacimiento
                  ? new Date(empleado.fecha_nacimiento).toLocaleDateString("es-CL")
                  : "—"}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Horario:</span>
              <span className="info-value">{empleado.horario || "—"}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Oficina:</span>
              <span className="info-value">{empleado.office || "—"}</span>
            </div>

            <div className="info-item">
              <span className="info-label">Próx. cumple:</span>
              <span className="info-value">{proxCumple}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
