// src/pages/EmpleadoFicha.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import PersonalesForm from "../components/PersonalesForm"; // edición
import { calcNextBirthdayLabel } from "../utils/birthday";
import "../styles/personales.css";

// Normaliza RUT: quita puntos y guion, mayúsculas (ajústalo si tu BD guarda con guion)
const normalizeRut = (r) =>
  (r || "").toString().replace(/\./g, "").toUpperCase();

/** Lee id o rut desde params, query o location.state */
function useEmployeeLookup() {
  const params = useParams();
  const location = useLocation();

  // 1) params
  let id =
    params?.id ??
    params?.empId ??
    params?.empleadoId ??
    null;
  let rut = params?.rut ?? null;

  // 2) query
  if (!id || !rut) {
    const qs = new URLSearchParams(location.search);
    id = id ?? qs.get("id");
    rut = rut ?? qs.get("rut");
  }

  // 3) location.state
  if ((!id || !rut) && location.state) {
    id = id ?? (location.state.id ?? location.state.employeeId ?? location.state.empleadoId);
    rut = rut ?? (location.state.rut ?? location.state.employeeRut);
  }

  if (id) {
    if (/^\d+$/.test(String(id))) return { by: "id", value: Number(id) };
    return { by: "id", value: String(id) }; // UUID u otro string
  }
  if (rut) {
    return { by: "rut", value: normalizeRut(rut) };
  }
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

      let query = supabase
        .from("employees")
        .select(`
          id, first_name, last_name, rut, role, region_id, comuna_id,
          mobile_phone, phone, email_personal, email_corporate,
          office, schedule, birth_date
        `);

      if (lookup.by === "id") {
        query = query.eq("id", lookup.value);
      } else {
        // IMPORTANTE: si en tu BD el RUT se guarda con guion, puedes quitar normalizeRut
        query = query.eq("rut", lookup.value);
      }

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

    return () => {
      canceled = true;
    };
  }, [lookup]);

  const proxCumple = useMemo(() => {
    return calcNextBirthdayLabel(empleado?.birth_date)?.label ?? "—";
  }, [empleado?.birth_date]);

  async function handleSavePersonales(payload) {
    if (!empleado?.id) return;
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

  // UI de estados
  if (loading) return <div>Cargando…</div>;
  if (!lookup) {
    return (
      <div style={{ padding: 16 }}>
        <h3>No se pudo abrir la ficha</h3>
        <p>Falta el parámetro <code>:id</code> o <code>:rut</code> en la ruta, o <code>?id=</code>/<code>?rut=</code> en la URL.</p>
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
          {/* PERSONALES: un solo formulario controla todo */}
          <PersonalesForm
            key={empleado.id}
            initialValues={empleado}
            isEditing={isEditing}
            onSubmit={handleSavePersonales}
          />
        </div>

        <aside className="ficha-aside">
          {/* Información Rápida */}
          <div className="card info-rapida">
            <h3>Información Rápida</h3>

            <div className="info-item">
              <span className="info-label">Nacimiento:</span>
              <span className="info-value">
                {empleado.birth_date
                  ? new Date(empleado.birth_date).toLocaleDateString("es-CL")
                  : "—"}
              </span>
            </div>

            <div className="info-item">
              <span className="info-label">Horario:</span>
              <span className="info-value">{empleado.schedule || "—"}</span>
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
