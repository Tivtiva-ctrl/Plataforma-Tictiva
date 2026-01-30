// src/components/DatosContractuales.jsx
import React, { useEffect, useMemo, useState } from "react";
import styles from "./DatosPersonales.module.css";
import { supabase } from "../supabaseClient";

function normalizeRut(raw) {
  return (raw || "")
    .toString()
    .trim()
    .replace(/\./g, "")
    .replace(/-/g, "")
    .replace(/\s/g, "")
    .toUpperCase();
}

function FormField({
  label,
  value,
  name,
  onChange,
  isEditing,
  type = "text",
  options = [],
}) {
  const normalizedValue = value ?? "";
  const displayValue = normalizedValue || "—";

  return (
    <div className={styles.formGroup}>
      <label className={styles.formLabel}>{label}</label>

      {isEditing ? (
        type === "select" ? (
          <select
            name={name}
            value={normalizedValue}
            onChange={onChange}
            className={styles.formInput}
          >
            <option value="">Seleccionar...</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            name={name}
            value={normalizedValue}
            onChange={onChange}
            className={styles.formInput}
            type={type}
          />
        )
      ) : (
        <input type="text" value={displayValue} readOnly className={styles.formInput} />
      )}
    </div>
  );
}

function DatosContractuales({
  contractData,
  isEditing,
  onChange,
  employeeId = null,
  isEnrolled = false,
  enrolledAt = null,
}) {
  // ✅ Estado SOLO para enrolamiento remoto (no para el formulario)
  const [remoteEnrolled, setRemoteEnrolled] = useState(null);
  const [remoteEnrolledAt, setRemoteEnrolledAt] = useState(null);

  const tiposContrato = ["Indefinido", "Plazo Fijo", "Por Obra o Faena"];
  const estadosContrato = ["Vigente", "Terminado", "Suspendido"];
  const tiposJornada = ["Completa (40h)", "Parcial (30h)", "Part-Time (20h)"];
  const afps = ["Capital", "Cuprum", "Habitat", "Modelo", "Planvital", "Provida", "Uno"];
  const sistemasSalud = [
    "Fonasa",
    "Isapre Banmédica",
    "Isapre Colmena",
    "Isapre CruzBlanca",
    "Isapre Consalud",
    "Isapre Vida Tres",
    "Otro",
  ];

  if (!contractData) {
    return <div className={styles.loading}>Cargando datos contractuales...</div>;
  }

  // ✅ FIX: usamos estado (NO estado_contrato)
  const safeContract = useMemo(() => {
    const d = { ...(contractData || {}) };
    if (d.estado == null && d.estado_contrato != null) d.estado = d.estado_contrato;
    return d;
  }, [contractData]);

  const handleChange = (e) => {
  const { name, value } = e.target;

  const updated = { ...safeContract, [name]: value };

  if (typeof onChange === "function") onChange(updated);
};


  // ==========================
  // Enrolamiento remoto
  // ==========================
  const pinStable = useMemo(() => {
    return safeContract?.pin_marcacion || safeContract?.pin || "";
  }, [safeContract?.pin_marcacion, safeContract?.pin]);

  useEffect(() => {
    let cancelled = false;

    async function checkEnrollment() {
      setRemoteEnrolled(null);
      setRemoteEnrolledAt(null);

      const effectiveEmployeeId =
        employeeId ||
        safeContract.employee_id ||
        safeContract.empleado_id ||
        safeContract.trabajador_id ||
        safeContract.colaborador_id ||
        null;

      let rutRaw =
        safeContract.rut ||
        safeContract.rut_trabajador ||
        safeContract.rut_empleado ||
        safeContract.employee_rut ||
        "";

      if (!rutRaw && effectiveEmployeeId) {
        const q2 = await supabase
          .from("employee_personal")
          .select("rut")
          .eq("id", effectiveEmployeeId)
          .maybeSingle();
        if (!q2.error && q2.data?.rut) rutRaw = q2.data.rut;
      }

      const rutKey = normalizeRut(rutRaw);

      let enrollment = null;

      if (effectiveEmployeeId) {
        const { data } = await supabase
          .from("face_enrollments")
          .select("employee_id, rut, enrolled_at, created_at")
          .eq("employee_id", effectiveEmployeeId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        enrollment = data || null;
      }

      if (!enrollment && rutKey) {
        const { data } = await supabase
          .from("face_enrollments")
          .select("employee_id, rut, enrolled_at, created_at")
          .eq("rut", rutKey)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        enrollment = data || null;
      }

      if (cancelled) return;

      setRemoteEnrolled(!!enrollment);
      setRemoteEnrolledAt(enrollment?.enrolled_at || enrollment?.created_at || null);
    }

    if (safeContract) checkEnrollment();
    return () => {
      cancelled = true;
    };
  }, [safeContract, employeeId, pinStable]);

  const effectiveIsEnrolled = remoteEnrolled !== null ? remoteEnrolled : isEnrolled;
  const effectiveEnrolledAt = remoteEnrolledAt || enrolledAt;

  const enrolledLabel =
    remoteEnrolled === null
      ? "⏳ Verificando enrolamiento..."
      : effectiveIsEnrolled
      ? "✅ Enrolado"
      : "❌ No enrolado";

  let enrolledAtText = null;
  if (effectiveIsEnrolled && effectiveEnrolledAt) {
    try {
      enrolledAtText = new Date(effectiveEnrolledAt).toLocaleString("es-CL");
    } catch {
      enrolledAtText = String(effectiveEnrolledAt);
    }
  }

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.sectionTitle}>1. Información del contrato</h3>
      <div className={styles.formGrid}>
        <FormField
          label="Tipo de contrato"
          name="tipo_contrato"
          value={safeContract.tipo_contrato}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={tiposContrato}
        />
        <FormField
          label="Fecha de inicio"
          name="fecha_inicio"
          value={safeContract.fecha_inicio}
          onChange={handleChange}
          isEditing={isEditing}
          type="date"
        />
        <FormField
          label="Fecha de término"
          name="fecha_termino"
          value={safeContract.fecha_termino}
          onChange={handleChange}
          isEditing={isEditing}
          type="date"
        />
        {/* ✅ FIX: estado */}
        <FormField
          label="Estado del contrato"
          name="estado_contrato"
          value={safeContract.estado}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={estadosContrato}
        />
        <FormField
          label="Motivo de término"
          name="motivo_termino"
          value={safeContract.motivo_termino}
          onChange={handleChange}
          isEditing={isEditing}
        />
      </div>

      <h3 className={styles.sectionTitle}>2. Cargo y organización</h3>
      <div className={styles.formGrid}>
        <FormField label="Cargo" name="cargo" value={safeContract.cargo} onChange={handleChange} isEditing={isEditing} />
        <FormField label="Área / Departamento" name="area" value={safeContract.area} onChange={handleChange} isEditing={isEditing} />
        <FormField label="Centro de costo / Sucursal" name="centro_costo" value={safeContract.centro_costo} onChange={handleChange} isEditing={isEditing} />
      </div>

      <h3 className={styles.sectionTitle}>3. Jornada laboral</h3>
      <div className={styles.formGrid}>
        <FormField label="Tipo de jornada" name="tipo_jornada" value={safeContract.tipo_jornada} onChange={handleChange} isEditing={isEditing} type="select" options={tiposJornada} />
        <FormField label="Horas semanales" name="horas_semanales" value={safeContract.horas_semanales} onChange={handleChange} isEditing={isEditing} type="number" />
        <FormField label="Día de descanso" name="dia_descanso" value={safeContract.dia_descanso} onChange={handleChange} isEditing={isEditing} />
        <FormField label="Turno asignado" name="turno_asignado" value={safeContract.turno_asignado} onChange={handleChange} isEditing={isEditing} />
      </div>

      <h3 className={styles.sectionTitle}>4. Remuneraciones base</h3>
      <div className={styles.formGrid}>
        <FormField label="Sueldo base" name="sueldo_base" value={safeContract.sueldo_base} onChange={handleChange} isEditing={isEditing} type="number" />
        <FormField label="Moneda" name="moneda" value={safeContract.moneda} onChange={handleChange} isEditing={isEditing} />
        <FormField label="Gratificación" name="gratificacion" value={safeContract.gratificacion} onChange={handleChange} isEditing={isEditing} />
        <FormField label="Asignación de colación" name="asignacion_colacion" value={safeContract.asignacion_colacion} onChange={handleChange} isEditing={isEditing} type="number" />
        <FormField label="Asignación de locomoción" name="asignacion_locomocion" value={safeContract.asignacion_locomocion} onChange={handleChange} isEditing={isEditing} type="number" />
        <FormField label="Otros haberes" name="otros_haberes" value={safeContract.otros_haberes} onChange={handleChange} isEditing={isEditing} type="number" />
      </div>

      <h3 className={styles.sectionTitle}>5. Previsión</h3>
      <div className={styles.formGrid}>
        <FormField label="AFP" name="afp" value={safeContract.afp} onChange={handleChange} isEditing={isEditing} type="select" options={afps} />
        <FormField label="Sistema de salud" name="sistema_salud" value={safeContract.sistema_salud} onChange={handleChange} isEditing={isEditing} type="select" options={sistemasSalud} />
        <FormField label="Plan de salud / Detalle plan" name="plan_salud" value={safeContract.plan_salud} onChange={handleChange} isEditing={isEditing} />
        <FormField label="Caja de compensación" name="caja_compensacion" value={safeContract.caja_compensacion} onChange={handleChange} isEditing={isEditing} />
      </div>

      <h3 className={styles.sectionTitle}>6. Control de asistencia</h3>
      <div style={{ display: "grid", gap: 10 }}>
        <div className={styles.formGrid}>
          <FormField label="PIN de marcación" name="pin_marcacion" value={safeContract.pin_marcacion} onChange={handleChange} isEditing={false} />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ padding: "6px 12px", borderRadius: 999, fontWeight: 800, background: "#E5E7EB" }}>
            {enrolledLabel}
          </span>
          {effectiveIsEnrolled && enrolledAtText && (
            <span style={{ fontSize: 12, opacity: 0.75 }}>
              Enrolado el: <b>{enrolledAtText}</b>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default DatosContractuales;
