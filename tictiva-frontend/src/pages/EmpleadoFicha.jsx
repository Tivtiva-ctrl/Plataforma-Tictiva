// src/pages/EmpleadoFicha.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import PersonalesView from "../components/Personales";     // lectura
import PersonalesForm from "../components/PersonalesForm"; // edición
import { calcNextBirthdayLabel } from "../utils/birthday";
import "../styles/personales.css";

export default function EmpleadoFicha() {
  const { id } = useParams();
  const [empleado, setEmpleado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("employees")
        .select(`
          id, first_name, last_name, rut, role, region_id, comuna_id,
          mobile_phone, phone, email_personal, email_corporate,
          office, schedule,
          birth_date   -- 👈 traemos la fecha de nacimiento
        `)
        .eq("id", id)
        .single();
      if (!error) setEmpleado(data);
      setLoading(false);
    })();
  }, [id]);

  const proxCumple = useMemo(() => {
    return calcNextBirthdayLabel(empleado?.birth_date)?.label ?? "—";
  }, [empleado?.birth_date]);

  if (loading) return <div>Cargando…</div>;
  if (!empleado) return <div>No encontrado</div>;

  async function handleSavePersonales(payload) {
    // payload incluye birth_date
    const { data, error } = await supabase
      .from("employees")
      .update(payload)
      .eq("id", empleado.id)
      .select()
      .single();
    if (!error) {
      setEmpleado(data);
      setIsEditing(false);
    } else {
      console.error(error);
      alert("Error al guardar");
    }
  }

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
              {/* aquí puedes mostrar solo el valor (no editable) */}
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
              {/* 👇 Solo lectura, calculado */}
              <span className="info-value">{proxCumple}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
