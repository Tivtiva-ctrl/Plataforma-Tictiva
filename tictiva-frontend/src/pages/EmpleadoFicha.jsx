// src/pages/EmpleadoFicha.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import PersonalesForm from "../components/PersonalesForm"; // edición
import { calcNextBirthdayLabel } from "../utils/birthday";
import "../styles/personales.css";

function useEmployeeId() {
  const params = useParams();
  const location = useLocation();

  // Soporte para diferentes nombres de parámetro en la ruta
  let id =
    params?.id ??
    params?.empId ??
    params?.empleadoId ??
    null;

  // Fallback: ?id=123 en querystring
  if (!id) {
    const qs = new URLSearchParams(location.search);
    const qid = qs.get("id");
    if (qid) id = qid;
  }

  // Normaliza: si es numérico, a número; si no, deja string (por si usas UUID)
  if (id && /^\d+$/.test(String(id))) {
    return Number(id);
  }
  return id; // podría ser string/uuid
}

export default function EmpleadoFicha() {
  const employeeId = useEmployeeId();
  const [empleado, setEmpleado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    // Evita consultar si no tenemos un ID válido
    if (!employeeId) {
      setLoading(false);
      setLoadError("Falta el parámetro :id en la ruta (o ?id=).");
      return;
    }

    let canceled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      const { data, error } = await supabase
        .from("employees")
        .select(`
          id, first_name, last_name, rut, role, region_id, comuna_id,
          mobile_phone, phone, email_personal, email_corporate,
          office, schedule, birth_date
        `)
        .eq("id", employeeId)
        .maybeSingle(); // evita tirar error si no hay registros

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
  }, [employeeId]);

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
  if (!employeeId) {
    return (
      <div style={{ padding: 16 }}>
        <h3>No se pudo abrir la ficha</h3>
        <p>Falta el parámetro <code>:id</code> en la ruta o <code>?id=</code> en la URL.</p>
        <p>Ejemplo de ruta: <code>/empleados/123</code> o <code>/empleado?id=123</code></p>
      </div>
    );
  }
  if (loadError) return <div style={{ color: "crimson" }}>{loadError}</div>;
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
