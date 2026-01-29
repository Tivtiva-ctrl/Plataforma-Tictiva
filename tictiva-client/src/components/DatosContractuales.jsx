// src/components/DatosContractuales.jsx
import React, { useState, useEffect } from "react";
// Reutilizamos el CSS de DatosPersonales
import styles from "./DatosPersonales.module.css";
import { supabase } from "../supabaseClient";

// ================================
// Normalizador de RUT (sin puntos ni guión)
// ================================
function normalizeRut(raw) {
  return (raw || "")
    .toString()
    .trim()
    .replace(/\./g, "")
    .replace(/-/g, "")
    .replace(/\s/g, "")
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

  // ✅ nuevos (vienen desde EmployeeProfilePage corregido)
  employeeId = null,

  // props existentes (se mantienen)
  isEnrolled = false,
  enrolledAt = null,
}) {
  const [formData, setFormData] = useState(contractData || {});

  // ✅ Estado local para enrolamiento consultado en Supabase
  const [remoteEnrolled, setRemoteEnrolled] = useState(null); // null = verificando
  const [remoteEnrolledAt, setRemoteEnrolledAt] = useState(null);
  const [remotePhotoUrl, setRemotePhotoUrl] = useState(null);

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

      if (typeof onChange === "function") {
        onChange(updated);
      }

      return updated;
    });
  };

  // ==========================================================
  // ✅ Verificar enrolamiento (ROBUSTO):
  // 1) Por employee_id (lo ideal)
  // 2) Si no encuentra, fallback por rut normalizado (por si hay migrados raros)
  // ==========================================================
  useEffect(() => {
    let cancelled = false;

    async function checkEnrollment() {
      if (!contractData) return;

      // PIN (solo para mostrar el bloque; si no hay PIN, igual no rompemos)
      const pin =
        contractData.pin_marcacion ||
        contractData.pin ||
        formData.pin_marcacion ||
        "";

      // Si no hay employeeId, intentamos sacarlo de contractData (por si viene)
      const effectiveEmployeeId =
        employeeId ||
        contractData.employee_id ||
        contractData.empleado_id ||
        contractData.trabajador_id ||
        contractData.colaborador_id ||
        null;

      // Si no hay pin, igual podemos verificar enrolamiento (porque es informativo),
      // pero si quieres amarrarlo al pin, deja este if como estaba.
      // Yo lo dejo flexible para que no te quede "No enrolado" solo por no tener pin.
      setRemoteEnrolled(null);
      setRemoteEnrolledAt(null);
      setRemotePhotoUrl(null);

      // 1) Buscamos RUT desde contractData si existe, si no desde employee_personal con employeeId
      let rutRaw =
        contractData.rut ||
        contractData.rut_trabajador ||
        contractData.rut_empleado ||
        contractData.employee_rut ||
        contractData.rutKey ||
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

      // 2) Intento A: por employee_id
      let enrollment = null;

      if (effectiveEmployeeId) {
        const { data, error } = await supabase
          .from("face_enrollments")
          .select("employee_id, rut, photo_url, enrolled_at, created_at, updated_at")
          .eq("employee_id", effectiveEmployeeId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!cancelled && !error && data) {
          enrollment = data;
        }
      }

      // 3) Intento B (fallback): por rut normalizado
      if (!enrollment && rutKey) {
        const { data, error } = await supabase
          .from("face_enrollments")
          .select("employee_id, rut, photo_url, enrolled_at, created_at, updated_at")
          .eq("rut", rutKey)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!cancelled && !error && data) {
          enrollment = data;
        }
      }

      if (cancelled) return;

      const found = !!enrollment;
      setRemoteEnrolled(found);
      setRemotePhotoUrl(enrollment?.photo_url || null);

      // ✅ Fecha correcta para mostrar "Enrolado el..."
      // Preferimos enrolled_at. Si no existe, usamos created_at.
      // NO usamos updated_at para que no aparezca como "actualizado" (confunde).
      setRemoteEnrolledAt(enrollment?.enrolled_at || enrollment?.created_at || null);
    }

    checkEnrollment();
    return () => {
      cancelled = true;
    };
  }, [contractData, formData.pin_marcacion, employeeId]);

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

  // ✅ Si la consulta remota ya resolvió, usamos eso. Si no, usamos lo del padre.
  const effectiveIsEnrolled = remoteEnrolled !== null ? remoteEnrolled : isEnrolled;
  const effectiveEnrolledAt = remoteEnrolledAt || enrolledAt;

  const enrolledLabel =
    remoteEnrolled === null
      ? "⏳ Verificando enrolamiento..."
      : effectiveIsEnrolled
      ? "✅ Enrolado"
      : "❌ No enrolado";

  const enrolledBg =
    remoteEnrolled === null
      ? "#E5E7EB"
      : effectiveIsEnrolled
      ? "#DCFCE7"
      : "#FEE2E2";

  const enrolledColor =
    remoteEnrolled === null
      ? "#111827"
      : effectiveIsEnrolled
      ? "#166534"
      : "#991B1B";

  // ✅ Texto final: "Enrolado el: ..."
  let enrolledAtText = null;
  if (effectiveIsEnrolled && effectiveEnrolledAt) {
    try {
      enrolledAtText = new Date(effectiveEnrolledAt).toLocaleString("es-CL");
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

        {/* ✅ Enrolamiento */}
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
              Enrolado el: <b>{enrolledAtText}</b>
            </span>
          )}
        </div>

        {/* (Opcional) Si después quieres mostrar mini-preview de la foto en contractuales:
            OJO: no lo hago obligatorio para no "cambiar diseño". Solo queda preparado.
        */}
        {false && remotePhotoUrl && (
          <div style={{ marginTop: 8 }}>
            <img
              src={remotePhotoUrl}
              alt="Foto enrolamiento"
              style={{ width: 120, height: 120, objectFit: "cover", borderRadius: 12 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default DatosContractuales;
