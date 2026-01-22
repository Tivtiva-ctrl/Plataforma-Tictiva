// src/components/DatosContractuales.jsx
import React, { useState, useEffect } from 'react';
// Reutilizamos el CSS de DatosPersonales
import styles from './DatosPersonales.module.css';
import { supabase } from '../supabaseClient';

// ================================
// Normalizador de RUT (sin puntos ni guión)
// ================================
function normalizeRut(raw) {
  return (raw || "")
    .toString()
    .trim()
    .replace(/\./g, "")
    .replace(/-/g, "")
    .toUpperCase();
}

// ================================
// Componente reutilizable de campo
// ================================
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
        <input
          type="text"
          value={displayValue}
          readOnly
          className={styles.formInput}
        />
      )}
    </div>
  );
}

// --- Componente Principal de Datos Contractuales ---
function DatosContractuales({
  contractData,
  isEditing,
  onChange,
  // props existentes (se mantienen)
  isEnrolled = false,
  enrolledAt = null
}) {
  const [formData, setFormData] = useState(contractData || {});

  // ✅ Estado local para enrolamiento consultado en Supabase
  const [remoteEnrolled, setRemoteEnrolled] = useState(null); // null = verificando / desconocido
  const [remoteEnrolledAt, setRemoteEnrolledAt] = useState(null);

  useEffect(() => {
    setFormData(contractData || {});
  }, [contractData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      // Avisamos al padre (EmployeeProfilePage)
      if (typeof onChange === "function") {
        onChange(updated);
      }

      return updated;
    });
  };

  // ==========================================================
  // ✅ PUNTO 2 (MODIFICADO): Verificar enrolamiento desde PIN
  // - Contractuales NO tiene RUT, pero sí tiene PIN.
  // - Usamos employee_id (si viene) para buscar RUT en employee_personal.
  // - Luego consultamos face_enrollments por RUT normalizado.
  // ==========================================================
  useEffect(() => {
    let cancelled = false;

    async function checkEnrollmentFromPin() {
      if (!contractData) return;

      // 1) PIN (ancla visual para este bloque)
      const pin =
        contractData.pin_marcacion ||
        contractData.pin ||
        formData.pin_marcacion ||
        "";

      // 2) Intentamos obtener un ID del trabajador desde contractuales
      const employeeId =
        contractData.employee_id ||
        contractData.empleado_id ||
        contractData.trabajador_id ||
        contractData.colaborador_id ||
        contractData.id ||
        null;

      // Si no hay PIN, no verificamos (este bloque vive junto al PIN)
      if (!pin) {
        setRemoteEnrolled(null);
        setRemoteEnrolledAt(null);
        return;
      }

      // Estado "verificando"
      setRemoteEnrolled(null);
      setRemoteEnrolledAt(null);

      // 3) Resolver RUT (desde contractData si viniera, si no desde employee_personal por employeeId)
      let rutRaw =
        contractData.rut ||
        contractData.rut_trabajador ||
        contractData.rut_empleado ||
        contractData.employee_rut ||
        contractData.rutKey ||
        "";

      // Si no viene rut en contractuales, lo buscamos en employee_personal con el ID
      if (!rutRaw && employeeId) {
        // Probamos dos formatos comunes: employee_id o id
        // (No rompe si uno no existe; solo cae en error y seguimos al siguiente)
        let personal = null;

        const q1 = await supabase
          .from("employee_personal")
          .select("rut, rut_trabajador, rut_empleado")
          .eq("employee_id", employeeId)
          .maybeSingle();

        if (!q1.error && q1.data) personal = q1.data;

        if (!personal) {
          const q2 = await supabase
            .from("employee_personal")
            .select("rut, rut_trabajador, rut_empleado")
            .eq("id", employeeId)
            .maybeSingle();

          if (!q2.error && q2.data) personal = q2.data;
        }

        rutRaw =
          personal?.rut ||
          personal?.rut_trabajador ||
          personal?.rut_empleado ||
          "";
      }

      const rutKey = normalizeRut(rutRaw);

      // Si aún no tenemos RUT, no podemos consultar face_enrollments (pero NO rompemos UI)
      if (!rutKey) {
        // Dejamos en "no verificable" sin tirar error feo
        if (!cancelled) {
          setRemoteEnrolled(false);
          setRemoteEnrolledAt(null);
        }
        return;
      }

      // 4) Consultar enrolamiento real en face_enrollments
      const { data, error } = await supabase
        .from("face_enrollments")
        .select("rut, enrolled_at, created_at, updated_at, photo_url, photo_path")
        .eq("rut", rutKey)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.warn("Error verificando enrolamiento (face_enrollments):", error);
        setRemoteEnrolled(false);
        setRemoteEnrolledAt(null);
        return;
      }

      const found = !!data;
      setRemoteEnrolled(found);

      // Fecha: preferimos enrolled_at; si no existe, updated_at; si no, created_at
      setRemoteEnrolledAt(
        data?.enrolled_at || data?.updated_at || data?.created_at || null
      );
    }

    checkEnrollmentFromPin();
    return () => { cancelled = true; };
    // Nota: dependemos de contractData (y pin dentro de formData)
  }, [contractData, formData.pin_marcacion]);

  // --- Opciones para los menús desplegables ---
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

  // ✅ Si la consulta remota ya resolvió, usamos eso. Si no, usamos lo que venga del padre.
  const effectiveIsEnrolled = remoteEnrolled !== null ? remoteEnrolled : isEnrolled;
  const effectiveEnrolledAt = remoteEnrolledAt || enrolledAt;

  const enrolledLabel =
    remoteEnrolled === null
      ? "⏳ Verificando enrolamiento..."
      : (effectiveIsEnrolled ? "✅ Enrolado" : "❌ No enrolado");

  const enrolledBg =
    remoteEnrolled === null
      ? "#E5E7EB"
      : (effectiveIsEnrolled ? "#DCFCE7" : "#FEE2E2");

  const enrolledColor =
    remoteEnrolled === null
      ? "#111827"
      : (effectiveIsEnrolled ? "#166534" : "#991B1B");

  let enrolledAtText = null;
  if (effectiveIsEnrolled && effectiveEnrolledAt) {
    try {
      enrolledAtText = new Date(effectiveEnrolledAt).toLocaleString();
    } catch (e) {
      enrolledAtText = String(effectiveEnrolledAt);
    }
  }

  return (
    <div className={styles.formContainer}>
      {/* === Sección 1: Información del contrato === */}
      <h3 className={styles.sectionTitle}>1. Información del contrato</h3>
      <div className={styles.formGrid}>
        <FormField
          label="Tipo de contrato"
          name="tipo_contrato"
          value={formData.tipo_contrato}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={tiposContrato}
        />
        <FormField
          label="Fecha de inicio"
          name="fecha_inicio"
          value={formData.fecha_inicio}
          onChange={handleChange}
          isEditing={isEditing}
          type="date"
        />
        <FormField
          label="Fecha de término"
          name="fecha_termino"
          value={formData.fecha_termino}
          onChange={handleChange}
          isEditing={isEditing}
          type="date"
        />
        <FormField
          label="Estado del contrato"
          name="estado_contrato"
          value={formData.estado_contrato}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={estadosContrato}
        />
        <FormField
          label="Motivo de término"
          name="motivo_termino"
          value={formData.motivo_termino}
          onChange={handleChange}
          isEditing={isEditing}
        />
      </div>

      {/* === Sección 2: Cargo y organización === */}
      <h3 className={styles.sectionTitle}>2. Cargo y organización</h3>
      <div className={styles.formGrid}>
        <FormField
          label="Cargo"
          name="cargo"
          value={formData.cargo}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <FormField
          label="Área / Departamento"
          name="area"
          value={formData.area}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <FormField
          label="Centro de costo / Sucursal"
          name="centro_costo"
          value={formData.centro_costo}
          onChange={handleChange}
          isEditing={isEditing}
        />
      </div>

      {/* === Sección 3: Jornada laboral === */}
      <h3 className={styles.sectionTitle}>3. Jornada laboral</h3>
      <div className={styles.formGrid}>
        <FormField
          label="Tipo de jornada"
          name="tipo_jornada"
          value={formData.tipo_jornada}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={tiposJornada}
        />
        <FormField
          label="Horas semanales"
          name="horas_semanales"
          value={formData.horas_semanales}
          onChange={handleChange}
          isEditing={isEditing}
          type="number"
        />
        <FormField
          label="Día de descanso"
          name="dia_descanso"
          value={formData.dia_descanso}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <FormField
          label="Turno asignado"
          name="turno_asignado"
          value={formData.turno_asignado}
          onChange={handleChange}
          isEditing={isEditing}
        />
      </div>

      {/* === Sección 4: Remuneraciones base === */}
      <h3 className={styles.sectionTitle}>4. Remuneraciones base</h3>
      <div className={styles.formGrid}>
        <FormField
          label="Sueldo base"
          name="sueldo_base"
          value={formData.sueldo_base}
          onChange={handleChange}
          isEditing={isEditing}
          type="number"
        />
        <FormField
          label="Moneda"
          name="moneda"
          value={formData.moneda}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <FormField
          label="Gratificación"
          name="gratificacion"
          value={formData.gratificacion}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <FormField
          label="Asignación de colación"
          name="asignacion_colacion"
          value={formData.asignacion_colacion}
          onChange={handleChange}
          isEditing={isEditing}
          type="number"
        />
        <FormField
          label="Asignación de locomoción"
          name="asignacion_locomocion"
          value={formData.asignacion_locomocion}
          onChange={handleChange}
          isEditing={isEditing}
          type="number"
        />
        <FormField
          label="Otros haberes"
          name="otros_haberes"
          value={formData.otros_haberes}
          onChange={handleChange}
          isEditing={isEditing}
          type="number"
        />
      </div>

      {/* === Sección 5: Previsión asociada al contrato === */}
      <h3 className={styles.sectionTitle}>5. Previsión</h3>
      <div className={styles.formGrid}>
        <FormField
          label="AFP"
          name="afp"
          value={formData.afp}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={afps}
        />
        <FormField
          label="Sistema de salud"
          name="sistema_salud"
          value={formData.sistema_salud}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={sistemasSalud}
        />
        <FormField
          label="Plan de salud / Detalle plan"
          name="plan_salud"
          value={formData.plan_salud}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <FormField
          label="Caja de compensación"
          name="caja_compensacion"
          value={formData.caja_compensacion}
          onChange={handleChange}
          isEditing={isEditing}
        />
      </div>

      {/* === Sección 6: Control de asistencia === */}
      <h3 className={styles.sectionTitle}>6. Control de asistencia</h3>

      {/* PIN SIEMPRE SOLO LECTURA, AUN EN EDICIÓN */}
      <div style={{ display: "grid", gap: 10 }}>
        <div className={styles.formGrid}>
          <FormField
            label="PIN de marcación"
            name="pin_marcacion"
            value={formData.pin_marcacion}
            onChange={handleChange}
            isEditing={false}
          />
        </div>

        {/* ✅ Enrolado: Sí/No (solo informativo, NO editable) */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              fontWeight: 800,
              background: enrolledBg,
              color: enrolledColor,
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            {enrolledLabel}
          </span>

          {effectiveIsEnrolled && enrolledAtText && (
            <span style={{ fontSize: 12, opacity: 0.75 }}>
              Actualizado: <b>{enrolledAtText}</b>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default DatosContractuales
