// src/components/EmployeeProfilePage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Routes, Route, Link, NavLink, useParams } from "react-router-dom";
import { supabase } from "../supabaseClient";
import styles from "./EmployeeProfilePage.module.css";
import { FiEdit, FiDownload } from "react-icons/fi";

import DatosPersonales from "./DatosPersonales";
import DatosContractuales from "./DatosContractuales";
import DatosPrevisionales from "./DatosPrevisionales";
import DatosBancarios from "./DatosBancarios";
import DatosSalud from "./DatosSalud";
import DatosDocumentos from "./DatosDocumentos";
import DatosAsistencia from "./DatosAsistencia";
import DatosBitacora from "./DatosBitacora";
import DatosHistorial from "./DatosHistorial";

// =======================================================
// ✅ Helper: Normalizar RUT (########-DV)
// =======================================================
function normalizeRut(input) {
  if (input == null) return "";
  let s = String(input).trim().toUpperCase();
  s = s.replace(/[.\s-]/g, "");
  s = s.replace(/[^0-9K]/g, "");
  if (s.length < 2) return "";
  const dv = s.slice(-1);
  const num = s.slice(0, -1);
  if (!/^\d+$/.test(num)) return "";
  if (!/^[0-9K]$/.test(dv)) return "";
  const numClean = String(parseInt(num, 10));
  return `${numClean}-${dv}`;
}

// =======================================================
// ✅ FIX: limpiar payload para Supabase SIN pisar con null
// - omitimos keys técnicas
// - NO convertimos "" a null (porque borra datos sin querer)
// - NO enviamos "" ni undefined (para no pisar)
// - null se respeta (si algún día quieres borrar a propósito)
// =======================================================
function sanitizeRow(row, omitKeys = []) {
  if (!row || typeof row !== "object") return row;
  const cleaned = {};

  for (const [key, value] of Object.entries(row)) {
    if (omitKeys.includes(key)) continue;

    if (value === undefined) continue;
    if (typeof value === "string" && value.trim() === "") continue;

    cleaned[key] = value;
  }
  return cleaned;
}

// =======================================================
// ✅ Mostrar error real (Supabase/PostgREST)
// =======================================================
function formatSupabaseError(err) {
  if (!err) return "Error desconocido";
  const code = err.code || err.status || "";
  const msg = err.message || err.error_description || "";
  const details = err.details || "";
  const hint = err.hint || "";
  return [code, msg, details, hint].filter(Boolean).join(" | ");
}

// =======================================================
// Helper: registrar evento en employee_history
// =======================================================
async function registerHistoryEntry({ rut, employeeId, autor }) {
  if (!rut || !employeeId) return;

  const actorName = autor || "Admin Tictiva";

  const payload = {
    employee_id: employeeId,
    rut,
    modulo: "RRHH",
    submodulo: "FICHA",
    tipo: "CAMBIO",
    titulo: "Actualización de ficha del colaborador",
    categoria: "RRHH",
    descripcion:
      "Se actualizó la información de la ficha del colaborador desde el módulo RRHH.",
    estado: "REGISTRADO",
    tipo_accion: "ACTUALIZACION",
    gravedad: "BAJA",
    etiqueta_accion: "FICHA_ACTUALIZADA",
    valor_anterior: null,
    nuevo_valor: null,
    autor: actorName,
    autor_role: "ADMINISTRADOR",
    realizado_por_id: null,
    realizado_por_nombre: actorName,
    realizado_por_role: "ADMINISTRADOR",
    origen: "WEB_RRHH",
    direccion_ip: null,
    agente_usuario: null,
    dt_relevante: false,
  };

  const { error } = await supabase.from("employee_history").insert([payload]);
  if (error) console.error("Error registrando historial (employee_history):", error);
}

// =======================================================
// === COMPONENTE "TICTIVA 360" (SOLO LECTURA) ===
// =======================================================
function Overview360({ employee }) {
  if (!employee) {
    return <div className={styles.sectionContent}>Cargando datos del empleado…</div>;
  }

  return (
    <div className={styles.cardGrid}>
      <div className={styles.infoCard}>
        <h3>Datos personales</h3>
        <p>Email: {employee.email_personal || "[campo sin definir]"}</p>
        <p>Dirección: {employee.direccion || "[campo sin definir]"}</p>
        <p>Comuna: {employee.comuna || "[campo sin definir]"}</p>
        <Link to="personal" className={styles.detailButton}>Ver detalle</Link>
      </div>

      <div className={styles.infoCard}>
        <h3>Horario</h3>
        <p>El empleado no tiene asignaciones activas en este momento.</p>
        <Link to="asistencia" className={styles.detailButton}>Ver detalle</Link>
      </div>

      <div className={styles.infoCard}>
        <h3>Evaluaciones</h3>
        <div className={styles.evaluationScore}>7.8</div>
        <p className={styles.evaluationStatus}>Estado óptimo</p>
        <p className={styles.evaluationSubtitle}>
          Último test aplicado por Nadia (psicóloga interna)
        </p>
        <Link to="bitacora" className={styles.detailButton}>Ver detalle</Link>
      </div>

      <div className={styles.infoCard}>
        <h3>Contacto de emergencia</h3>
        <p>Nombre: {employee.contacto_emergencia_nombre || "[campo sin definir]"}</p>
        <p>Teléfono: {employee.contacto_emergencia_telefono || "[campo sin definir]"}</p>
        <Link to="personal" className={styles.detailButton}>Ver detalle</Link>
      </div>

      <div className={styles.infoCard}>
        <h3>Registros y anotaciones</h3>
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBarLabel}>Observaciones</div>
          <div className={styles.progressBar}>
            <div className={styles.progressBarFillBlue} style={{ width: "60%" }} />
          </div>
          <div className={styles.progressBarValue}>1</div>
        </div>
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBarLabel}>Positivas</div>
          <div className={styles.progressBar}>
            <div className={styles.progressBarFillGreen} style={{ width: "80%" }} />
          </div>
          <div className={styles.progressBarValue}>1</div>
        </div>
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBarLabel}>Negativas</div>
          <div className={styles.progressBar}>
            <div className={styles.progressBarFillRed} style={{ width: "30%" }} />
          </div>
          <div className={styles.progressBarValue}>1</div>
        </div>
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBarLabel}>Entrevistas</div>
          <div className={styles.progressBar}>
            <div className={styles.progressBarFillPurple} style={{ width: "40%" }} />
          </div>
          <div className={styles.progressBarValue}>0</div>
        </div>
        <Link to="bitacora" className={styles.detailButton}>Ver detalle</Link>
      </div>

      <div className={styles.infoCard}>
        <h3>Asistencia</h3>
        <div className={styles.attendanceCircle}>100%</div>
        <p className={styles.attendanceStatus}>Asistencia destacada</p>
        <div className={styles.attendanceAlert}>
          ⚠️ Atrasos: 1 atraso – 4h: 51m acumulado
        </div>
        <Link to="asistencia" className={styles.detailButton}>Ver detalle</Link>
      </div>

      <div className={`${styles.infoCard} ${styles.alertCard}`}>
        <h3>Hola, Verónica 💚</h3>
        <p>Detecté que {employee.nombre_completo} tiene 2 documentos vencidos.</p>
        <p className={styles.alertQuestion}>¿Quieres enviarle un recordatorio?</p>
        <div className={styles.alertActions}>
          <button className={styles.alertButtonSend}>Sí, enviar</button>
          <button className={styles.alertButtonCancel}>No, gracias</button>
        </div>
      </div>

      <div className={styles.infoCard}>
        <h3>Datos de salud</h3>
        <p>Alergias: {employee.tipo_discapacidad || "[campo sin definir]"}</p>
        <p>Enf. crónicas: {"[campo sin definir]"}</p>
        <p>Seguro de salud: {"[Sin definir]"}</p>
        <Link to="salud" className={styles.detailButton}>Ver detalle</Link>
      </div>

      <div className={styles.infoCard}>
        <h3>Comunicación interna</h3>
        <p>18 mensajes registrados</p>
        <p className={styles.lastCommunication}>
          Hola Verito 👋 tu solicitud fue respondida.
        </p>
        <Link
          to="/dashboard/comunicaciones/envío-de-mensajes"
          className={styles.detailButton}
        >
          Ver detalle
        </Link>
      </div>
    </div>
  );
}

// =======================================================
// === PÁGINA DE PERFIL PRINCIPAL ===
// =======================================================
function EmployeeProfilePage() {
  const { rut: rutParamRaw } = useParams();

  const [personalData, setPersonalData] = useState(null);
  const [contractData, setContractData] = useState(null);
  const [previsionalData, setPrevisionalData] = useState(null);
  const [bankData, setBankData] = useState({});
  const [healthData, setHealthData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const [faceEnroll, setFaceEnroll] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);

  const [fallbackFacePhotoUrl, setFallbackFacePhotoUrl] = useState(null);
  const [avatarCandidates, setAvatarCandidates] = useState([]);
  const [avatarIdx, setAvatarIdx] = useState(0);
  const [avatarSrc, setAvatarSrc] = useState(null);

  const getInitials = (fullName) => {
    if (!fullName) return "??";
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] || "";
    const last = parts[parts.length - 1]?.[0] || "";
    return (first + last).toUpperCase() || "??";
  };

  async function resolveToHttpUrl(maybeUrlOrPath) {
    const v = (maybeUrlOrPath || "").trim();
    if (!v) return null;

    if (v.startsWith("http://") || v.startsWith("https://")) {
      return `${v}${v.includes("?") ? "&" : "?"}t=${Date.now()}`;
    }

    const cleanPath = v.replace(/^\/+/, "");
    try {
      const { data: signed, error } = await supabase.storage
        .from("enrollment_photos")
        .createSignedUrl(cleanPath, 60 * 60);

      if (!error && signed?.signedUrl) {
        return `${signed.signedUrl}${signed.signedUrl.includes("?") ? "&" : "?"}t=${Date.now()}`;
      }

      const { data: pub } = supabase.storage.from("enrollment_photos").getPublicUrl(cleanPath);
      if (pub?.publicUrl) {
        const p = pub.publicUrl;
        return `${p}${p.includes("?") ? "&" : "?"}t=${Date.now()}`;
      }
    } catch (e) {}
    return null;
  }

  // ==========================================
  // Carga de datos desde Supabase
  // ==========================================
  useEffect(() => {
    if (!rutParamRaw) {
      setLoading(false);
      console.error("No se proporcionó RUT");
      return;
    }

    const fetchEmployeeData = async () => {
      setLoading(true);
      setSaveError(null);
      setFallbackFacePhotoUrl(null);
      setFaceEnroll(null);
      setAvatarCandidates([]);
      setAvatarIdx(0);
      setAvatarSrc(null);

      const rutCanonicoParam = normalizeRut(rutParamRaw);

      let personal = null;

      if (rutCanonicoParam) {
        const { data, error } = await supabase
          .from("employee_personal")
          .select("*")
          .eq("rut", rutCanonicoParam)
          .maybeSingle();
        if (!error) personal = data || null;
      }

      if (!personal) {
        const { data, error } = await supabase
          .from("employee_personal")
          .select("*")
          .eq("rut", rutParamRaw)
          .maybeSingle();

        if (error) {
          console.error("Error al cargar datos personales:", error);
          setLoading(false);
          return;
        }
        personal = data || null;
      }

      if (!personal) {
        setPersonalData(null);
        setLoading(false);
        return;
      }

      setPersonalData(personal);

      const resolvedEmployeeId = personal.employee_id || personal.id || null;
      setEmployeeId(resolvedEmployeeId);

      if (!resolvedEmployeeId) {
        setContractData(null);
        setPrevisionalData(null);
        setBankData({});
        setHealthData({});
        setFaceEnroll(null);
        setLoading(false);
        return;
      }

      const rutCanonico = normalizeRut(personal.rut) || rutCanonicoParam || "";

      const { data: enroll, error: enrollError } = await supabase
        .from("face_enrollments")
        .select("employee_id, photo_url, enrolled_at, updated_at, created_at")
        .eq("employee_id", resolvedEmployeeId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (enrollError) {
        console.warn("Error al cargar face_enrollments:", enrollError.message);
        setFaceEnroll(null);
      } else {
        setFaceEnroll(enroll || null);
      }

      if (rutCanonico) {
        try {
          const folder = `Enrollment/${rutCanonico}`;

          const { data: files, error: listError } = await supabase.storage
            .from("enrollment_photos")
            .list(folder, {
              limit: 50,
              offset: 0,
              sortBy: { column: "created_at", order: "desc" },
            });

          if (!listError && files && files.length > 0) {
            const img = files.find((f) => {
              const n = (f.name || "").toLowerCase();
              return (
                n.endsWith(".jpg") ||
                n.endsWith(".jpeg") ||
                n.endsWith(".png") ||
                n.endsWith(".webp")
              );
            });

            if (img) {
              const fullPath = `${folder}/${img.name}`;
              const { data: signed, error: signedErr } = await supabase.storage
                .from("enrollment_photos")
                .createSignedUrl(fullPath, 60 * 60);

              if (!signedErr && signed?.signedUrl) {
                setFallbackFacePhotoUrl(
                  `${signed.signedUrl}${signed.signedUrl.includes("?") ? "&" : "?"}t=${Date.now()}`
                );
              } else {
                const { data: pub } = supabase.storage
                  .from("enrollment_photos")
                  .getPublicUrl(fullPath);

                if (pub?.publicUrl) {
                  setFallbackFacePhotoUrl(
                    `${pub.publicUrl}${pub.publicUrl.includes("?") ? "&" : "?"}t=${Date.now()}`
                  );
                }
              }
            }
          } else if (listError) {
            console.warn("No se pudo listar Storage enrolamiento:", listError.message);
          }
        } catch (e) {
          console.warn("Fallback Storage enrolamiento excepción:", e?.message || e);
        }
      }

      // 2) Contrato
      const { data: contract, error: conError } = await supabase
        .from("employee_contracts")
        .select("*")
        .eq("employee_id", resolvedEmployeeId)
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (conError) console.warn("Error al cargar datos de contrato:", conError.message);
      setContractData(contract || { employee_id: resolvedEmployeeId });

      // 3) Previsión
      const { data: previsional, error: prevError } = await supabase
        .from("employee_prevision")
        .select("*")
        .eq("employee_id", resolvedEmployeeId)
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (prevError) console.warn("Error al cargar datos previsionales:", prevError.message);
      setPrevisionalData(previsional || { employee_id: resolvedEmployeeId });

      // 4) Bancarios
      const { data: bank, error: bankError } = await supabase
        .from("employee_bank_accounts")
        .select("*")
        .eq("employee_id", resolvedEmployeeId)
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (bankError) console.warn("Error al cargar datos bancarios:", bankError.message);
      setBankData(bank || { employee_id: resolvedEmployeeId });

      // 5) Salud
      const { data: health, error: healthError } = await supabase
        .from("employee_health")
        .select("*")
        .eq("employee_id", resolvedEmployeeId)
        .order("id", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (healthError) console.warn("Error al cargar datos de salud:", healthError.message);
      setHealthData(health || { employee_id: resolvedEmployeeId });

      setLoading(false);
    };

    fetchEmployeeData();
  }, [rutParamRaw]);

  // ✅ Construir candidatos de avatar y setear src inicial
  useEffect(() => {
    const build = async () => {
      const candidates = [];

      const resolvedFace = await resolveToHttpUrl(faceEnroll?.photo_url);
      if (resolvedFace) candidates.push(resolvedFace);

      if (fallbackFacePhotoUrl) candidates.push(fallbackFacePhotoUrl);

      if (
        personalData?.avatar &&
        typeof personalData.avatar === "string" &&
        personalData.avatar.startsWith("http")
      ) {
        candidates.push(
          `${personalData.avatar}${personalData.avatar.includes("?") ? "&" : "?"}t=${Date.now()}`
        );
      }

      setAvatarCandidates(candidates);
      setAvatarIdx(0);
      setAvatarSrc(candidates[0] || null);
    };

    build();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faceEnroll?.photo_url, fallbackFacePhotoUrl, personalData?.avatar]);

  // Antigüedad
  const yearsAndMonths = useMemo(() => {
    const fecha = contractData?.fecha_inicio || personalData?.fecha_ingreso;
    if (!fecha) return "[Sin fecha de ingreso]";

    const ingressDate = new Date(fecha);
    if (Number.isNaN(ingressDate.getTime())) return "[Sin fecha de ingreso válida]";

    const today = new Date();
    let years = today.getFullYear() - ingressDate.getFullYear();
    let months = today.getMonth() - ingressDate.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < ingressDate.getDate())) {
      years--;
      months = (months + 12) % 12;
    }

    if (years === 0) return `${months} ${months === 1 ? "mes" : "meses"}`;
    if (months === 0) return `${years} ${years === 1 ? "año" : "años"}`;
    return `${years} ${years === 1 ? "año" : "años"} y ${months} ${
      months === 1 ? "mes" : "meses"
    }`;
  }, [contractData?.fecha_inicio, personalData?.fecha_ingreso]);

  const menuItems = [
    { title: "Tictiva 360", path: "." },
    { title: "Datos personales", path: "personal" },
    { title: "Datos contractuales", path: "contractual" },
    { title: "Datos previsionales", path: "previsional" },
    { title: "Datos bancarios", path: "bancario" },
    { title: "Datos de salud", path: "salud" },
    { title: "Documentos", path: "documentos" },
    { title: "Asistencia", path: "asistencia" },
    { title: "Bitácora laboral", path: "bitacora" },
    { title: "Historial", path: "historial" },
  ];

  // ==========================================
  // ✅ Guardar TODAS las secciones editables
  // ==========================================
  const saveAllSections = async () => {
    if (!personalData) return;

    setSaving(true);
    setSaveError(null);

    try {
      const resolvedEmployeeId = personalData.employee_id || personalData.id;
      const rutCanonico = normalizeRut(personalData.rut) || personalData.rut;

      // 1) Personal
      if (rutCanonico) {
        const personalPayload = sanitizeRow(
          { ...personalData, rut: rutCanonico },
          ["id", "employee_id", "created_at", "updated_at"]
        );

        const { error: perUpdateError } = await supabase
          .from("employee_personal")
          .update(personalPayload)
          .eq("rut", rutCanonico);

        if (perUpdateError) throw perUpdateError;
      }

      // 2) Contractuales
      if (contractData && (contractData.id || resolvedEmployeeId)) {
        // ✅ FIX REAL: NO usar "estado" (no existe). Usar "estado_contrato".
        // Además, si por alguna razón quedó "estado" colado, lo borramos.
        const normalizedContract = { ...(contractData || {}) };
        delete normalizedContract.estado; // 🔥 clave

        const contractPayload = sanitizeRow(normalizedContract, [
          "id",
          "employee_id",
          "created_at",
          "updated_at",
        ]);

        if (contractData.id) {
          const { error } = await supabase
            .from("employee_contracts")
            .update(contractPayload)
            .eq("id", contractData.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("employee_contracts")
            .insert([{ ...contractPayload, employee_id: resolvedEmployeeId }]);
          if (error) throw error;
        }
      }

      // 3) Previsión
      if (previsionalData && (previsionalData.id || resolvedEmployeeId)) {
        const prevPayload = sanitizeRow(previsionalData, [
          "id",
          "employee_id",
          "created_at",
          "updated_at",
        ]);

        if (previsionalData.id) {
          const { error } = await supabase
            .from("employee_prevision")
            .update(prevPayload)
            .eq("id", previsionalData.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("employee_prevision")
            .insert([{ ...prevPayload, employee_id: resolvedEmployeeId }]);
          if (error) throw error;
        }
      }

      // 4) Bancarios
      if (bankData && (bankData.id || resolvedEmployeeId)) {
        const bankPayload = sanitizeRow(bankData, [
          "id",
          "employee_id",
          "created_at",
          "updated_at",
        ]);

        if (bankData.id) {
          const { error } = await supabase
            .from("employee_bank_accounts")
            .update(bankPayload)
            .eq("id", bankData.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("employee_bank_accounts")
            .insert([{ ...bankPayload, employee_id: resolvedEmployeeId }]);
          if (error) throw error;
        }
      }

      // 5) Salud
      if (healthData && (healthData.id || resolvedEmployeeId)) {
        const healthPayload = sanitizeRow(healthData, [
          "id",
          "employee_id",
          "created_at",
          "updated_at",
        ]);

        if (healthData.id) {
          const { error } = await supabase
            .from("employee_health")
            .update(healthPayload)
            .eq("id", healthData.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from("employee_health")
            .insert([{ ...healthPayload, employee_id: resolvedEmployeeId }]);
          if (error) throw error;
        }
      }

      await registerHistoryEntry({
        rut: rutCanonico,
        employeeId: resolvedEmployeeId,
        autor: "Admin Tictiva",
      });

      setIsEditing(false);
    } catch (err) {
      console.error("Error al guardar la ficha completa:", err);
      setSaveError(`No se pudo guardar: ${formatSupabaseError(err)}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEditToggle = async () => {
    if (!isEditing) {
      setSaveError(null);
      setIsEditing(true);
      return;
    }
    await saveAllSections();
  };

  const handleAvatarError = () => {
    const next = avatarIdx + 1;
    if (avatarCandidates[next]) {
      setAvatarIdx(next);
      setAvatarSrc(avatarCandidates[next]);
    } else {
      setAvatarSrc(null);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <h2>Cargando perfil del empleado...</h2>
      </div>
    );
  }

  if (!personalData) {
    return (
      <div className={styles.errorContainer}>
        <h2>Empleado no encontrado</h2>
        <p>No se pudieron cargar los datos del empleado (RUT: {rutParamRaw}).</p>
        <Link to="/dashboard/rrhh/listado-de-fichas" className={styles.backLink}>
          ← Volver a Lista de Empleados
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <div className={styles.profileHeader}>
        <Link to="/dashboard/rrhh/listado-de-fichas" className={styles.backButton}>
          ←
        </Link>

        <div className={styles.profileInfo}>
          <div className={styles.profileAvatar}>
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={personalData.nombre_completo}
                onError={handleAvatarError}
              />
            ) : (
              <span>{getInitials(personalData.nombre_completo)}</span>
            )}
          </div>

          <div className={styles.profileDetails}>
            <h1 className={styles.employeeName}>{personalData.nombre_completo}</h1>
            <p className={styles.employeeTitle}>{personalData.cargo}</p>
            <p className={styles.employeeStatus}>
              <span
                className={`${styles.statusBadge} ${
                  personalData.estado === "Activo"
                    ? styles.statusActive
                    : styles.statusInactive
                }`}
              >
                {personalData.estado}
              </span>
              <span className={styles.employeeDates}>Empleado desde {yearsAndMonths}</span>
            </p>
          </div>
        </div>

        <div className={styles.profileActions}>
          <button
            className={styles.actionButton}
            onClick={handleEditToggle}
            disabled={saving}
          >
            {isEditing ? (saving ? "Guardando..." : "Guardar Ficha") : "Editar Ficha"}{" "}
            <FiEdit />
          </button>

          {!isEditing && (
            <button className={styles.actionButton}>
              Descargar Ficha <FiDownload />
            </button>
          )}
        </div>

        {saveError && (
          <div className={styles.saveStatusBar}>
            <span className={styles.saveError}>{saveError}</span>
          </div>
        )}

        <nav className={styles.profileNav}>
          {menuItems.map((item) => {
            const targetPath =
              item.path === "."
                ? `/dashboard/rrhh/empleado/${rutParamRaw}`
                : `/dashboard/rrhh/empleado/${rutParamRaw}/${item.path}`;

            return (
              <NavLink
                key={item.path}
                to={targetPath}
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }
                end={item.path === "."}
              >
                {item.title}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <main className={styles.profileContent}>
        <Routes>
          <Route index element={<Overview360 employee={personalData} />} />
          <Route path="tictiva-360" element={<Overview360 employee={personalData} />} />

          <Route
            path="personal"
            element={
              <DatosPersonales
                personalData={personalData}
                isEditing={isEditing}
                onChange={setPersonalData}
              />
            }
          />

          <Route
            path="contractual"
            element={
              <DatosContractuales
                contractData={contractData}
                isEditing={isEditing}
                onChange={setContractData}
                employeeId={employeeId}
                isEnrolled={!!faceEnroll}
                enrolledAt={faceEnroll?.enrolled_at || faceEnroll?.created_at || null}
              />
            }
          />

          <Route
            path="previsional"
            element={
              <DatosPrevisionales
                previsionalData={previsionalData}
                isEditing={isEditing}
                onChange={setPrevisionalData}
              />
            }
          />

          <Route
            path="bancario"
            element={
              <DatosBancarios
                bankData={bankData}
                isEditing={isEditing}
                onChange={setBankData}
              />
            }
          />

          <Route
            path="salud"
            element={
              <DatosSalud
                healthData={healthData}
                isEditing={isEditing}
                onChange={setHealthData}
              />
            }
          />

          <Route path="documentos" element={<DatosDocumentos />} />

          <Route
            path="asistencia"
            element={<DatosAsistencia rut={rutParamRaw} employeeId={employeeId} />}
          />

          <Route path="bitacora" element={<DatosBitacora rut={rutParamRaw} />} />
          <Route path="historial" element={<DatosHistorial rut={rutParamRaw} />} />
        </Routes>
      </main>
    </div>
  );
}

export default EmployeeProfilePage;
