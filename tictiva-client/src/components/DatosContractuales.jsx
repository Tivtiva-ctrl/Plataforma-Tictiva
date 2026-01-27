// src/components/DatosContractuales.jsx
import React, { useState, useEffect } from "react";
// Reutilizamos el CSS de DatosPersonales
import styles from "./DatosPersonales.module.css";
import { supabase } from "../supabaseClient";

const DEBUG = false; // 👈 ponlo en true si quieres ver logs en consola

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

// Detecta si parece UUID (employee_personal.id)
function isUuid(v) {
  if (!v) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(v)
  );
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
  enrolledAt = null,

  // ✅ NUEVO (no rompe nada): si el padre lo pasa, lo usamos y listo
  employeeId: employeeIdProp = null,
}) {
  const [formData, setFormData] = useState(contractData || {});

  // ✅ Estado local para enrolamiento consultado en Supabase
  const [remoteEnrolled, setRemoteEnrolled] = useState(null); // null = verificando / desconocido
  const [remoteEnrolledAt, setRemoteEnrolledAt] = useState(null);
  const [remoteEnrollmentPhotoUrl, setRemoteEnrollmentPhotoUrl] = useState(null);

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
  // ✅ ENROLAMIENTO (CORREGIDO y ROBUSTO)
  // Regla: ENROLADO = existe registro en face_enrollments por employee_id
  // 1) Intentamos por employeeId (lo correcto)
  // 2) Si no hay employeeId, intentamos resolverlo desde contractData
  // 3) Si no podemos, hacemos fallback por RUT (por compatibilidad con datos viejos)
  // ==========================================================
  useEffect(() => {
    let cancelled = false;

    async function checkEnrollment() {
      if (!contractData) return;

      // Estado "verificando"
      setRemoteEnrolled(null);
      setRemoteEnrolledAt(null);
      setRemoteEnrollmentPhotoUrl(null);

      // 1) Obtener employeeId (prioridad: prop del padre)
      const employeeIdCandidate =
        employeeIdProp ||
        contractData.employee_id ||
        contractData.empleado_id ||
        contractData.trabajador_id ||
        contractData.colaborador_id ||
        (isUuid(contractData.id) ? contractData.id : null) ||
        null;

      // 2) Intentar por employee_id directo en face_enrollments (lo ideal)
      //    (Esto NO depende del PIN ni del RUT)
      if (employeeIdCandidate) {
        if (DEBUG) {
          console.log("🟦 [DatosContractuales] checkEnrollment by employee_id:", {
            employeeIdCandidate,
          });
        }

        // 2.a) Primero intentamos usar la VIEW si existe (si la creaste)
        //      Si no existe, fallará y hacemos fallback al select directo.
        try {
          const { data: vData, error: vErr } = await supabase
            .from("v_employee_enrollment_status")
            .select("is_enrolled, enrolled_at, enrollment_photo_url")
            .eq("employee_id", employeeIdCandidate)
            .maybeSingle();

          // Si la view existe y responde (aunque sea null), usamos eso
          if (!vErr) {
            if (cancelled) return;

            const ok = !!vData?.is_enrolled;
            setRemoteEnrolled(ok);
            setRemoteEnrolledAt(vData?.enrolled_at || null);
            setRemoteEnrollmentPhotoUrl(vData?.enrollment_photo_url || null);

            if (DEBUG) {
              console.log("🟩 [DatosContractuales] view result:", vData);
            }
            return; // ✅ listo por view
          }

          // Si el error es porque la view no existe, seguimos al fallback
          if (DEBUG) {
            console.warn("🟨 [DatosContractuales] view not usable, fallback:", vErr);
          }
        } catch (e) {
          if (DEBUG) console.warn("🟨 [DatosContractuales] view try/catch:", e);
        }

        // 2.b) Fallback directo a face_enrollments por employee_id
        const { data: feData, error: feErr } = await supabase
          .from("face_enrollments")
          .select("employee_id, created_at, updated_at, enrolled_at, photo_url, photo_path")
          .eq("employee_id", employeeIdCandidate)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (cancelled) return;

        if (feErr) {
          console.warn("Error verificando enrolamiento (face_enrollments por employee_id):", feErr);
          setRemoteEnrolled(false);
          setRemoteEnrolledAt(null);
          setRemoteEnrollmentPhotoUrl(null);
          return;
        }

        const found = !!feData;
        setRemoteEnrolled(found);
        setRemoteEnrolledAt(
          feData?.enrolled_at || feData?.updated_at || feData?.created_at || null
        );

        // foto: preferimos photo_url (si existe); si no, dejamos photo_path (si existe) para que el padre la convierta
        setRemoteEnrollmentPhotoUrl(feData?.photo_url || feData?.photo_path || null);

        if (DEBUG) {
          console.log("🟩 [DatosContractuales] face_enrollments by employee_id:", feData);
        }
        return; // ✅ listo por employee_id
      }

      // 3) Si no hay employeeId, hacemos fallback por RUT (compatibilidad)
      //    OJO: tu BD tiene rut "cuerpo+dv pegado" en varios lados, así que normalizamos.
      let rutRaw =
        contractData.rut ||
        contractData.rut_trabajador ||
        contractData.rut_empleado ||
        contractData.employee_rut ||
        contractData.rutKey ||
        "";

      // Si no viene rut en contractuales, probamos buscarlo en employee_personal
      // pero SIN inventar columnas: usamos SOLO employee_personal.id (si contractData.id es UUID)
      if (!rutRaw && isUuid(contractData.id)) {
        const q = await supabase
          .from("employee_personal")
          .select("rut")
          .eq("id", contractData.id)
          .maybeSingle();

        rutRaw = q?.data?.rut || "";
      }

      const rutKey = normalizeRut(rutRaw);

      if (DEBUG) {
        console.log("🟦 [DatosContractuales] fallback by rut:", { rutRaw, rutKey });
      }

      if (!rutKey) {
        // No se puede verificar
        setRemoteEnrolled(false);
        setRemoteEnrolledAt(null);
        setRemoteEnrollmentPhotoUrl(null);
        return;
      }

      const { data: dataRut, error: errRut } = await supabase
        .from("face_enrollments")
        .select("rut, created_at, updated_at, enrolled_at, photo_url, photo_path")
        .eq("rut", rutKey)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;

      if (errRut) {
        console.warn("Error verificando enrolamiento (face_enrollments por rut):", errRut);
        setRemoteEnrolled(false);
        setRemoteEnrolledAt(null);
        setRemoteEnrollmentPhotoUrl(null);
        return;
      }

      const foundRut = !!dataRut;
      setRemoteEnrolled(foundRut);
      setRemoteEnrolledAt(
        dataRut?.enrolled_at || dataRut?.updated_at || dataRut?.created_at || null
      );
      setRemoteEnrollmentPhotoUrl(dataRut?.photo_url || dataRut?.photo_path || null);

      if (DEBUG) {
        console.log("🟩 [DatosContractuales] face_enrollments by rut:", dataRut);
      }
    }

    checkEnrollment();
    return () => {
      cancelled = true;
    };
  }, [contractData, employeeIdProp]);

  // --- Opciones para los menús desplegables ---
  const tiposContrato = ["Indefinido", "Plazo Fijo", "Por Obra o Faena"];
  const estadosContrato = ["Vigente", "Terminado", "Suspendido"];
  const tiposJornada = ["Completa (40h)", "Parcial (30h)", "Part-Time (20h)"];
  const afps = [
    "Capital",
    "Cuprum",
    "Habitat",
    "Modelo",
    "Planvital",
    "Provida",
    "Uno",
  ];
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
      : effectiveIsEnrolled
      ? "✅ Enrolado"
      : "❌ No enrolado";

  const enrolledBg =
    remoteEnrolled === null ? "#E5E7EB" : effectiveIsEnrolled ? "#DCFCE7" : "#FEE2E2";

  const enrolledColor =
    remoteEnrolled === null ? "#111827" : effectiveIsEnrolled ? "#166534" : "#991B1B";

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

          {/* (Opcional) si quieres ver si llega URL/path */}
          {DEBUG && remoteEnrollmentPhotoUrl && (
            <span style={{ fontSize: 12, opacity: 0.75 }}>
              Foto: <b>{String(remoteEnrollmentPhotoUrl).slice(0, 50)}…</b>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default DatosContractuales;
