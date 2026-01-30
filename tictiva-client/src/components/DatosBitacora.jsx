// DatosBitacora.jsx
// ==========================================
//  BITÁCORA LABORAL – REGISTRO 360
// ==========================================

import React, { useEffect, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import styles from "./DatosBitacora.module.css";
import {
  FiCalendar,
  FiFilter,
  FiCheckCircle,
  FiPlus,
  FiMoreHorizontal,
  FiDownload,
  FiTrash2,
  FiEdit,
  FiEye,
  FiPaperclip,
  FiActivity,
  FiX,
} from "react-icons/fi";
import jsPDF from "jspdf";

const LOG_TABLE = "bitacora_entries";

// 🔹 Usuario actual (provisorio).
const CURRENT_USER_NAME = "Usuario demo Tictiva";
const CURRENT_USER_ROLE = "ADMINISTRADOR";

// ================================
// Normalizador robusto (quita tildes)
// ================================
function normKey(v) {
  return (v ?? "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Helper para fecha local en formato yyyy-MM-dd
function getTodayLocalString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ✅ Helper para mostrar fechas SIN problemas de zona horaria
function formatLogDate(value, locale = "es-CL") {
  if (!value) return "—";

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [yyyy, mm, dd] = value.split("-");
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString(locale);
  }

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(locale);
}

// ==========================================
// === HISTORIAL: REGISTRO EN employee_history
// ==========================================
async function registerBitacoraHistory({ rut, employeeId, actionType, log }) {
  if (!rut) return;

  const tipoRegistro =
    log?.tipo || log?.entry_type || log?.entryType || "Anotación";

  let titulo = "Registro en Bitácora Laboral";
  if (actionType === "CREAR")
    titulo = `Nueva ${tipoRegistro.toLowerCase()} en Bitácora Laboral`;
  if (actionType === "EDITAR")
    titulo = `Edición de ${tipoRegistro.toLowerCase()} en Bitácora Laboral`;
  if (actionType === "ELIMINAR")
    titulo = `Eliminación de ${tipoRegistro.toLowerCase()} en Bitácora Laboral`;

  const actionTextMap = {
    CREAR: "Se creó un registro en la Bitácora Laboral.",
    EDITAR: "Se editó un registro en la Bitácora Laboral.",
    ELIMINAR: "Se eliminó un registro en la Bitácora Laboral.",
  };

  const actionText = actionTextMap[actionType] || "";
  const motivo = log?.motivo || log?.motive || "";
  const detalle = log?.detalle || log?.detail || "";

  const descripcion = [
    actionText,
    `Tipo: ${tipoRegistro}.`,
    log?.grado ? `Clasificación: ${log.grado}.` : "",
    motivo ? `Motivo: ${motivo}.` : "",
    detalle ? `Detalle: ${detalle}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const payload = {
    employee_id: employeeId || null,
    rut,

    modulo: "BITACORA",
    submodulo: "BITACORA_LABORAL",

    tipo: "BITACORA",
    titulo,
    categoria: "BITACORA",
    descripcion,
    estado: log?.estado || "OK",

    tipo_accion: actionType,
    gravedad: log?.impacto || null,
    etiqueta_accion: `BITACORA_${actionType}`,
    valor_anterior: null,
    nuevo_valor: null,

    autor: CURRENT_USER_NAME,
    autor_role: CURRENT_USER_ROLE,
    realizado_por_id: null,
    realizado_por_nombre: CURRENT_USER_NAME,
    realizado_por_role: CURRENT_USER_ROLE,

    origen: "BITACORA_LABORAL",
    direccion_ip: null,
    agente_usuario: null,
    dt_relevante: true,
  };

  const { error } = await supabase.from("employee_history").insert([payload]);
  if (error) console.error("Error registrando historial de Bitácora:", error);
}

// Motivos sugeridos
const MOTIVOS_POSITIVOS = [
  "Reconocimiento por desempeño",
  "Cumplimiento destacado de metas",
  "Calidad superior en la entrega de tareas",
  "Proactividad en resolución de problemas",
  "Excelente actitud con el equipo",
  "Apoyo voluntario a compañeros",
  "Buena comunicación y colaboración",
  "Aporte significativo a un proyecto",
  "Propuesta de mejoras efectivas",
  "Liderazgo positivo en actividades o reuniones",
];

const MOTIVOS_NEGATIVOS = [
  "Incumplimiento de horario",
  "Ausencias reiteradas sin justificación",
  "Salida anticipada sin autorización",
  "Retrasos constantes",
  "Incumplimiento de funciones asignadas",
  "Bajo rendimiento en tareas críticas",
  "Entrega deficiente de trabajo",
  "No cumplimiento de procedimientos establecidos",
  "Llamado de atención por conducta",
  "Actitud inapropiada con compañeros o superiores",
  "Falta de respeto o trato hostil",
  "Conflictos o discusiones dentro del horario laboral",
  "Falta a protocolo interno",
  "Incumplimiento de normas de seguridad",
  "Uso incorrecto de equipamiento o herramientas",
  "Riesgo generado a terceros por negligencia",
  "Ocultamiento de información relevante",
  "Uso inapropiado de recursos institucionales",
  "Falsificación de datos o mala fe",
  "Incumplimiento grave de políticas internas",
];

const MOTIVOS_OBSERVACION = [
  "Desempeño por debajo de lo esperado (puntual)",
  "Necesidad de refuerzo en funciones específicas",
  "Observación sobre calidad del trabajo",
  "Observación sobre tiempos de respuesta",
  "Observación sobre comunicación con el equipo",
  "Observación sobre cumplimiento parcial de instrucciones",
  "Observación sobre orden y presentación en el puesto de trabajo",
  "Observación sobre uso de herramientas o sistemas",
  "Conversación aclaratoria sobre una situación puntual",
  "Recomendación de mejora en el trato con usuarios/clientes",
];

// =====================================================
// === Normalización DB -> UI (evita rarezas)
// =====================================================
function normalizeLogRow(row) {
  const tipo = row.tipo ?? row.entry_type ?? row.entryType ?? "Anotación";
  let grado = row.grado ?? null;

  // ✅ grado SOLO debe existir en "Anotación"
  if (tipo !== "Anotación") grado = null;

  const normalized = {
    ...row,
    tipo,
    fecha: row.fecha ?? row.entry_date ?? row.entryDate ?? null,
    area: row.area ?? row.area_name ?? row.areaName ?? "",
    motivo: row.motivo ?? row.motive ?? "",
    detalle: row.detalle ?? row.detail ?? "",
    impacto: row.impacto ?? row.impact ?? "Leve",
    estado: row.estado ?? "Abierto",
    grado,

    author_name:
      row.author_name ??
      row.autor ??
      row.author ??
      row.created_by_name ??
      row.created_by ??
      null,

    author_role:
      row.author_role ?? row.autor_role ?? row.authorRole ?? null,
  };

  // ✅ Normalizamos impacto SIEMPRE a: Leve / Moderado / Alto / Crítico
  const imp = normKey(normalized.impacto);
  if (imp === "critico" || imp === "critica") normalized.impacto = "Crítico";
  else if (imp === "alto" || imp === "alta") normalized.impacto = "Alto";
  else if (imp === "moderado" || imp === "moderada")
    normalized.impacto = "Moderado";
  else normalized.impacto = "Leve";

  return normalized;
}

// ==========================================
// === SEMÁFORO SCORE
// ==========================================
function computeLogScore(log) {
  const tipo = log.tipo || log.entry_type;
  const grado = log.grado;
  const impactoKey = normKey(log.impacto);
  const estadoKey = normKey(log.estado);

  let score = 0;

  if (tipo === "Anotación") {
    if (grado === "Positiva" || tipo === "Positiva") {
      score += 2;
    } else {
      switch (impactoKey) {
        case "critico":
        case "critica":
          score -= 5;
          break;
        case "alto":
        case "alta":
          score -= 3;
          break;
        case "moderado":
        case "moderada":
          score -= 2;
          break;
        default:
          score -= 1;
      }
    }
  } else if (tipo === "Observación") {
    switch (impactoKey) {
      case "critico":
      case "critica":
        score -= 4;
        break;
      case "alto":
      case "alta":
        score -= 3;
        break;
      case "moderado":
      case "moderada":
        score -= 2;
        break;
      default:
        score -= 1;
    }
  } else if (tipo === "Entrevista") {
    if (estadoKey === "en seguimiento") score -= 1;
  }

  if (estadoKey === "en seguimiento") score -= 1;
  return score;
}

// ==========================================
// === MODAL (CREAR / EDITAR / VER / EVIDENCIA)
// ==========================================
function LogModal({ mode, logData, onClose, onSave, rut, employeeId }) {
  const base = normalizeLogRow(logData || {});

  const [formData, setFormData] = useState({
    fecha: base.fecha || getTodayLocalString(),
    tipo: base.tipo || "Anotación",
    area: base.area || "",
    motivo: base.motivo || "",
    detalle: base.detalle || "",
    impacto: base.impacto || "Leve",
    estado: base.estado || "Abierto",
    grado: base.tipo === "Anotación" ? base.grado || "Positiva" : null,
  });

  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const isReadOnly = mode === "view";
  const isEvidenceMode = mode === "evidence";

  useEffect(() => {
    const b = normalizeLogRow(logData || {});
    setFormData({
      fecha: b.fecha || getTodayLocalString(),
      tipo: b.tipo || "Anotación",
      area: b.area || "",
      motivo: b.motivo || "",
      detalle: b.detalle || "",
      impacto: b.impacto || "Leve",
      estado: b.estado || "Abierto",
      grado: b.tipo === "Anotación" ? b.grado || "Positiva" : null,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logData?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "tipo") {
      setFormData((prev) => ({
        ...prev,
        tipo: value,
        grado: value === "Anotación" ? (prev.grado || "Positiva") : null,
        motivo: "",
      }));
      return;
    }

    if (name === "grado") {
      setFormData((prev) => ({
        ...prev,
        grado: value,
        motivo: "",
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async () => {
    setIsUploading(true);

    if (!isEvidenceMode) {
      if (!formData.motivo || !formData.detalle) {
        alert("Por favor completa Motivo y Detalle antes de guardar.");
        setIsUploading(false);
        return;
      }
    }

    let evidencePath = logData?.evidence_path || null;

    try {
      // 1) evidencia
      if (file) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const safeRut = rut || "SIN_RUT";
        const filePath = `${safeRut}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("bitacora_evidencias")
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        evidencePath = filePath;
      }

      // 2) id/rut
      const commonFields = { rut };
      if (employeeId) commonFields.employee_id = employeeId;
      else if (logData?.employee_id) commonFields.employee_id = logData.employee_id;

      const shouldSaveGrado = formData.tipo === "Anotación";

      const fullPayload = {
        ...commonFields,

        // Español
        fecha: formData.fecha,
        tipo: formData.tipo,
        area: formData.area,
        motivo: formData.motivo,
        detalle: formData.detalle,
        impacto: formData.impacto,
        estado: formData.estado,
        ...(shouldSaveGrado ? { grado: formData.grado } : { grado: null }),

        // Legacy inglés
        entry_date: formData.fecha,
        entry_type: formData.tipo,
        area_name: formData.area || "Sin área definida",
        motive: formData.motivo || "Sin motivo definido",
        detail: formData.detalle || "Sin detalles.",

        // Evidencia
        evidence_path: evidencePath,
        has_evidence: Boolean(evidencePath),

        // Autor
        author_name: CURRENT_USER_NAME,
        author_role: CURRENT_USER_ROLE,
      };

      const evidenceOnlyPayload = {
        ...commonFields,
        evidence_path: evidencePath,
        has_evidence: Boolean(evidencePath),
        updated_at: new Date().toISOString(),
        updated_by: CURRENT_USER_NAME,
      };

      const save = async (payload) => {
        if (mode === "create") return supabase.from(LOG_TABLE).insert(payload);
        return supabase.from(LOG_TABLE).update(payload).eq("id", logData.id);
      };

      let result;
      if (isEvidenceMode) {
        if (!file) {
          alert("Selecciona un archivo para adjuntar.");
          setIsUploading(false);
          return;
        }
        result = await save(evidenceOnlyPayload);
      } else {
        result = await save(fullPayload);
      }

      if (result.error) throw result.error;

      if (!isEvidenceMode) {
        const actionType = mode === "create" ? "CREAR" : "EDITAR";
        await registerBitacoraHistory({
          rut,
          employeeId: commonFields.employee_id || null,
          actionType,
          log: { ...(logData || {}), ...formData },
        });
      }

      await onSave?.();
      onClose?.();
    } catch (error) {
      console.error("Error al guardar:", error?.message || error);
      alert("Error al guardar: " + (error?.message || "Error desconocido"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadEvidence = async () => {
    if (!logData?.evidence_path) return;

    try {
      const { data, error } = await supabase.storage
        .from("bitacora_evidencias")
        .download(logData.evidence_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = logData.evidence_path.split("/").pop();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error descargando evidencia:", error);
      alert("No se pudo descargar la evidencia.");
    }
  };

  const isAnotacion = formData.tipo === "Anotación";
  const isObservacion = formData.tipo === "Observación";
  const isEntrevista = formData.tipo === "Entrevista";

  const motivosAnotacionOptions =
    formData.grado === "Negativa" ? MOTIVOS_NEGATIVOS : MOTIVOS_POSITIVOS;

  const autorNombre =
    logData?.autor ||
    logData?.author ||
    logData?.author_name ||
    logData?.created_by_name ||
    logData?.created_by ||
    "No registrado";

  let autorFechaHora = "";
  if (logData?.created_at) {
    const fecha = new Date(logData.created_at);
    const fechaStr = fecha.toLocaleDateString("es-CL");
    const horaStr = fecha.toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    });
    autorFechaHora = `${fechaStr} ${horaStr}`;
  }

  const titles = {
    edit: "Editar Entrada",
    view: "Detalle de Bitácora",
    evidence: "Subir Evidencia",
  };
  const createTitlesByType = {
    Anotación: "Nueva anotación",
    Observación: "Nueva observación",
    Entrevista: "Nueva entrevista",
  };

  const modalTitle =
    mode === "create"
      ? createTitlesByType[formData.tipo] || "Nueva entrada de bitácora"
      : titles[mode] || "Bitácora laboral";

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div>
            <h2>{modalTitle}</h2>
            {mode !== "create" && (
              <p className={styles.modalMeta}>
                Creado por: {autorNombre}
                {autorFechaHora ? ` (${autorFechaHora})` : ""}
              </p>
            )}
          </div>
          <button onClick={onClose} className={styles.closeButton} type="button">
            <FiX />
          </button>
        </div>

        <div className={styles.modalBody}>
          {!isEvidenceMode && (
            <>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Fecha</label>
                  <input
                    type="date"
                    name="fecha"
                    value={formData.fecha}
                    onChange={handleChange}
                    disabled={isReadOnly}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Tipo de registro</label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    disabled={isReadOnly}
                  >
                    <option value="Anotación">Anotación</option>
                    <option value="Observación">Observación</option>
                    <option value="Entrevista">Entrevista</option>
                  </select>
                </div>
              </div>

              {isAnotacion && (
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Tipo de anotación</label>
                    <select
                      name="grado"
                      value={formData.grado || "Positiva"}
                      onChange={handleChange}
                      disabled={isReadOnly}
                    >
                      <option value="Positiva">Positiva</option>
                      <option value="Negativa">Negativa</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Motivo</label>
                    <select
                      name="motivo"
                      value={formData.motivo}
                      onChange={handleChange}
                      disabled={isReadOnly}
                    >
                      <option value="">Selecciona un motivo</option>
                      {motivosAnotacionOptions.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {isObservacion && (
                <div className={styles.formGroup}>
                  <label>Motivo de la observación</label>
                  <select
                    name="motivo"
                    value={formData.motivo}
                    onChange={handleChange}
                    disabled={isReadOnly}
                  >
                    <option value="">Selecciona un motivo</option>
                    {MOTIVOS_OBSERVACION.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isEntrevista && (
                <div className={styles.formGroup}>
                  <label>Motivo</label>
                  <input
                    type="text"
                    name="motivo"
                    value={formData.motivo}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    placeholder="Resumen breve de la entrevista"
                  />
                </div>
              )}

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Área / Equipo</label>
                  <input
                    type="text"
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    placeholder="Ej. Ventas"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Impacto</label>
                  <select
                    name="impacto"
                    value={formData.impacto}
                    onChange={handleChange}
                    disabled={isReadOnly}
                  >
                    <option value="Leve">Leve</option>
                    <option value="Moderado">Moderado</option>
                    <option value="Alto">Alto</option>
                    <option value="Crítico">Crítico</option>
                  </select>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Detalle</label>
                <textarea
                  name="detalle"
                  value={formData.detalle}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  rows="4"
                  placeholder="Descripción detallada del suceso..."
                />
              </div>

              <div className={styles.formGroup}>
                <label>Estado (Seguimiento)</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  disabled={isReadOnly}
                >
                  <option value="Abierto">Abierto</option>
                  <option value="En seguimiento">En seguimiento</option>
                  <option value="Cerrado">Cerrado</option>
                </select>
              </div>
            </>
          )}

          {(!isReadOnly || isEvidenceMode) && (
            <div className={styles.evidenceSection}>
              <label>
                <FiPaperclip />{" "}
                {isEvidenceMode
                  ? "Adjuntar Nueva Evidencia"
                  : "Adjuntar Evidencia (PDF/IMG)"}
              </label>
              <input type="file" onChange={handleFileChange} />
              {logData?.evidence_path && (
                <p className={styles.fileExists}>Ya existe un archivo adjunto.</p>
              )}
            </div>
          )}

          {isReadOnly && logData?.evidence_path && (
            <button
              className={styles.downloadBtn}
              type="button"
              onClick={handleDownloadEvidence}
            >
              <FiDownload /> Descargar Evidencia Adjunta
            </button>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelButton} type="button">
            {isReadOnly ? "Cerrar" : "Cancelar"}
          </button>

          {!isReadOnly && (
            <button
              onClick={handleSubmit}
              className={styles.saveButton}
              disabled={isUploading}
              type="button"
            >
              {isUploading ? "Guardando..." : "Guardar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// === COMPONENTE PRINCIPAL: DATOS BITÁCORA ===
// ==========================================
function DatosBitacora({ rut, employeeName }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedLog, setSelectedLog] = useState(null);

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState(null);

  const [periodo, setPeriodo] = useState(String(new Date().getFullYear()));
  const [tipo, setTipo] = useState("Todos");
  const [estado, setEstado] = useState("Todos");

  const [employeeId, setEmployeeId] = useState(null);
  const [employeeDisplayName, setEmployeeDisplayName] = useState(employeeName || "");

  // ✅ Evita pisadas (solo aplica el último fetch)
  const fetchSeq = useRef(0);

  // ✅ Cierra dropdowns al click fuera (evita “raros”)
  useEffect(() => {
    const onClick = (e) => {
      const el = e.target;

      // si el click fue dentro de acciones o registrar, no cierres
      if (el.closest?.(`.${styles.actionsCell}`)) return;
      if (el.closest?.(`.${styles.registerMenuContainer}`)) return;

      setOpenActionMenuId(null);
      setIsRegisterOpen(false);
    };

    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  useEffect(() => {
    if (employeeName) setEmployeeDisplayName(employeeName);
  }, [employeeName]);

  const fetchEmployeeId = async () => {
    if (!rut) return;

    try {
      const { data, error } = await supabase
        .from("employee_personal")
        .select("*")
        .eq("rut", rut)
        .single();

      if (error) {
        console.warn("Error en employee_personal:", error.message);
        return;
      }

      if (data) {
        const idFromPersonal = data.employee_id || data.id || null;
        if (idFromPersonal) setEmployeeId(idFromPersonal);

        const combinedName = `${data.nombres || ""} ${data.apellidos || ""}`.trim();
        const nameFromPersonal =
          data.full_name ||
          data.nombre_completo ||
          combinedName ||
          data.nombre ||
          data.name ||
          data.employee_name ||
          "";

        if (nameFromPersonal && !employeeDisplayName) {
          setEmployeeDisplayName(nameFromPersonal);
        }
      }
    } catch (err) {
      console.warn("Error inesperado obteniendo nombre:", err?.message || err);
    }
  };

  const fetchLogbook = async () => {
    if (!rut && !employeeId) return;

    const seq = ++fetchSeq.current;
    setLoading(true);

    try {
      let query = supabase.from(LOG_TABLE).select("*");

      // ✅ registros antiguos: rut null, pero employee_id sí
      if (rut && employeeId) query = query.or(`rut.eq.${rut},employee_id.eq.${employeeId}`);
      else if (rut) query = query.eq("rut", rut);
      else if (employeeId) query = query.eq("employee_id", employeeId);

      query = query.order("entry_date", { ascending: false, nullsFirst: false });
      query = query.order("created_at", { ascending: false, nullsFirst: false });

      if (periodo !== "Todos") {
        const startDate = `${periodo}-01-01`;
        const endDate = `${periodo}-12-31`;
        query = query.gte("entry_date", startDate).lte("entry_date", endDate);
      }

      if (tipo !== "Todos") query = query.eq("entry_type", tipo);
      if (estado !== "Todos") query = query.eq("estado", estado);

      const { data, error } = await query;

      if (seq !== fetchSeq.current) return;

      if (error) {
        console.error("Error al cargar bitácora:", error.message);
        setLogs([]);
      } else {
        setLogs((data || []).map(normalizeLogRow));
      }
    } catch (e) {
      if (seq !== fetchSeq.current) return;
      console.error("Error inesperado cargando bitácora:", e?.message || e);
      setLogs([]);
    } finally {
      if (seq === fetchSeq.current) setLoading(false);
    }
  };

  useEffect(() => {
    setLogs([]);
    setEmployeeId(null);
    fetchEmployeeId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rut]);

  useEffect(() => {
    fetchLogbook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rut, employeeId, tipo, estado, periodo]);

  const openModal = (mode, log = null) => {
    setModalMode(mode);
    setSelectedLog(log);
    setModalOpen(true);
    setOpenActionMenuId(null);
    setIsRegisterOpen(false);
  };

  const handleDelete = async (log) => {
    if (!window.confirm("¿Estás seguro de eliminar este registro?")) return;

    const { error } = await supabase.from(LOG_TABLE).delete().eq("id", log.id);

    if (error) {
      console.error("Error al eliminar:", error.message);
      alert("No se pudo eliminar el registro.");
    } else {
      await registerBitacoraHistory({
        rut,
        employeeId,
        actionType: "ELIMINAR",
        log,
      });
      fetchLogbook();
    }
    setOpenActionMenuId(null);
  };

  const handleRegisterFollowUp = (log) => {
    openModal("edit", { ...log, estado: "En seguimiento" });
  };

  // ==========================================
  // REPORTE GENERAL
  // ==========================================
  const generateGeneralReport = () => {
    if (!logs || logs.length === 0) {
      alert("No hay registros de bitácora para descargar.");
      return;
    }

    const doc = new jsPDF("p", "mm", "a4");
    const displayName = employeeDisplayName || employeeName || "-";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("BITÁCORA LABORAL DEL TRABAJADOR", 105, 20, { align: "center" });

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Nombre trabajador: ${displayName}`, 20, 30);
    doc.text(`RUT trabajador: ${rut || "-"}`, 20, 36);

    let y = 46;
    const registros = [...logs].reverse();

    registros.forEach((log, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      let tipoDisplay = log.tipo;
      if (log.tipo === "Anotación" && log.grado) tipoDisplay = `Anotación (${log.grado})`;

      const fechaTexto = formatLogDate(log.fecha, "es-CL");
      const autor = log.author_name || "No registrado";
      const autorDisplay = autor && autor !== "No registrado" ? autor : "-";

      doc.setFont("helvetica", "bold");
      doc.text(`Registro ${index + 1}`, 20, y);
      y += 6;

      doc.setFont("helvetica", "normal");
      doc.text(`Fecha: ${fechaTexto}`, 20, y);
      y += 5;
      doc.text(`Tipo de registro: ${tipoDisplay}`, 20, y);
      y += 5;
      doc.text(`Área / Equipo: ${log.area || "-"}`, 20, y);
      y += 5;
      doc.text(`Autor: ${autorDisplay}`, 20, y);
      y += 7;

      doc.setFont("helvetica", "bold");
      doc.text("Motivo:", 20, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      const motivoLines = doc.splitTextToSize(log.motivo || "Sin motivo", 170);
      doc.text(motivoLines, 25, y);
      y += motivoLines.length * 5 + 4;

      doc.setFont("helvetica", "bold");
      doc.text("Descripción:", 20, y);
      y += 5;
      doc.setFont("helvetica", "normal");
      const detalleLines = doc.splitTextToSize(log.detalle || "Sin detalles.", 170);
      doc.text(detalleLines, 25, y);
      y += detalleLines.length * 5 + 8;

      doc.setDrawColor(200);
      doc.line(20, y, 190, y);
      y += 6;
    });

    doc.save(`BitacoraLaboral_${rut || "trabajador"}.pdf`);
  };

  const generatePDF = (log) => {
    const doc = new jsPDF();
    const displayName = employeeDisplayName || employeeName || "-";

    doc.setFontSize(20);
    doc.setTextColor(26, 56, 90);
    doc.text("Acta de Bitácora Laboral", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    const fechaTexto = formatLogDate(log.fecha, "es-CL");
    const autor = log.author_name || "No registrado";
    const autorDisplay = autor && autor !== "No registrado" ? autor : "-";

    doc.text(`Fecha: ${fechaTexto}`, 20, 40);
    doc.text(`RUT trabajador: ${log.rut || rut || "No registrado"}`, 20, 48);
    doc.text(`Nombre: ${displayName}`, 20, 56);
    doc.text(`Tipo de registro: ${log.tipo}`, 20, 64);
    doc.text(`Autor: ${autorDisplay}`, 20, 72);

    if (log.tipo === "Anotación" && log.grado) doc.text(`Clasificación: ${log.grado}`, 20, 80);
    else doc.text(`Estado: ${log.estado}`, 20, 80);

    doc.text(`Área: ${log.area || "No especificada"}`, 20, 88);
    doc.setLineWidth(0.5);
    doc.line(20, 94, 190, 94);

    doc.setFontSize(14);
    doc.text(`Motivo: ${log.motivo || "Sin motivo"}`, 20, 106);

    doc.setFontSize(12);
    doc.text("Detalle:", 20, 121);

    const splitText = doc.splitTextToSize(log.detalle || "Sin detalles.", 170);
    doc.text(splitText, 20, 129);

    doc.text("__________________________", 105, 250, { align: "center" });
    doc.text("Firma Responsable", 105, 258, { align: "center" });

    doc.save(`Acta_${log.fecha || "sin_fecha"}_${log.tipo || "bitacora"}.pdf`);
    setOpenActionMenuId(null);
  };

  // ✅ stats coherentes (sobre logs filtrados)
  const total = logs.length;
  const positivos = logs.filter((l) => l.tipo === "Anotación" && l.grado === "Positiva").length;

  const alertas = logs.filter((l) => {
    const k = normKey(l.impacto);
    return k === "alto" || k === "alta" || k === "critico" || k === "critica";
  }).length;

  const seguimiento = logs.filter((l) => normKey(l.estado) === "en seguimiento").length;

  let totalScore = 0;
  logs.forEach((log) => (totalScore += computeLogScore(log)));

  let semaforoLabel = "Sin registros";
  let semaforoClassKey = "semaforoEstable";

  if (logs.length > 0) {
    if (totalScore >= 2) {
      semaforoLabel = "Estable";
      semaforoClassKey = "semaforoEstable";
    } else if (totalScore >= -1) {
      semaforoLabel = "Atención";
      semaforoClassKey = "semaforoAtencion";
    } else if (totalScore > -5) {
      semaforoLabel = "Alerta";
      semaforoClassKey = "semaforoAlerta";
    } else {
      semaforoLabel = "Crítico";
      semaforoClassKey = "semaforoCritico";
    }
  }

  // ✅ clases de color para IMPACTO
  const getImpactClass = (impacto) => {
    const k = normKey(impacto);
    if (k === "critico" || k === "critica") return styles.impactCritico || "";
    if (k === "alto" || k === "alta") return styles.impactAlto || "";
    if (k === "moderado" || k === "moderada") return styles.impactModerado || "";
    return styles.impactLeve || "";
  };

  return (
    <div className={styles.logbookContainer}>
      {modalOpen && (
        <LogModal
          mode={modalMode}
          logData={selectedLog}
          rut={rut}
          employeeId={employeeId}
          onClose={() => setModalOpen(false)}
          onSave={fetchLogbook}
        />
      )}

      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h2>Bitácora Laboral – Registro 360</h2>
          <p>Anotaciones, observaciones y entrevistas laborales.</p>
        </div>

        <div className={styles.headerActions}>
          <button className={styles.actionButton} onClick={generateGeneralReport} type="button">
            <FiDownload size={14} /> Descargar
          </button>

          <div className={styles.registerMenuContainer}>
            <button
              className={styles.registerButton}
              onClick={(e) => {
                e.stopPropagation();
                setIsRegisterOpen((prev) => !prev);
              }}
              type="button"
            >
              <FiPlus size={14} /> Registrar
            </button>

            {isRegisterOpen && (
              <div className={styles.registerDropdown} onClick={(e) => e.stopPropagation()}>
                <button type="button" onClick={() => openModal("create", { tipo: "Anotación" })}>
                  <strong>Anotación</strong>
                  <small>Positivas o negativas</small>
                </button>
                <button type="button" onClick={() => openModal("create", { tipo: "Observación" })}>
                  <strong>Observación</strong>
                  <small>Formales sobre desempeño</small>
                </button>
                <button type="button" onClick={() => openModal("create", { tipo: "Entrevista" })}>
                  <strong>Entrevista</strong>
                  <small>Individual con colaborador</small>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <FiCalendar />
          <label>Periodo:</label>
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="Todos">Todos</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <FiFilter />
          <label>Tipo:</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="Todos">Todos</option>
            <option value="Anotación">Anotación</option>
            <option value="Observación">Observación</option>
            <option value="Entrevista">Entrevista</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <FiCheckCircle />
          <label>Estado:</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="Todos">Todos</option>
            <option value="Abierto">Abierto</option>
            <option value="En seguimiento">En seguimiento</option>
            <option value="Cerrado">Cerrado</option>
          </select>
        </div>
      </div>

      {/* RESUMEN */}
      <div className={styles.summaryGrid}>
        <div className={styles.statCard}>
          <h3>Totales</h3>
          <p>{total}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Positivos</h3>
          <p>{positivos}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Alertas</h3>
          <p>{alertas}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Seguimiento</h3>
          <p>{seguimiento}</p>
        </div>
        <div className={styles.semaforoCard}>
          <h3>Semáforo Laboral</h3>
          <p>Estado actual</p>
          <div className={`${styles.semaforoItem} ${styles[semaforoClassKey] || ""}`}>
            {semaforoLabel}
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className={styles.tableContainer}>
        <table className={styles.detailsTable}>
          <thead>
            <tr>
              <th>FECHA</th>
              <th>TIPO</th>
              <th>ÁREA</th>
              <th>MOTIVO</th>
              <th>DETALLE</th>
              <th>IMPACTO</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8">Cargando...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="8">No hay registros para mostrar.</td>
              </tr>
            ) : (
              logs.map((log) => {
                const tipoDisplay =
                  log.tipo === "Anotación" && log.grado ? `Anotación (${log.grado})` : log.tipo;

                return (
                  <tr key={log.id}>
                    <td>{formatLogDate(log.fecha, "es-CL")}</td>
                    <td>{tipoDisplay}</td>
                    <td>{log.area || "—"}</td>
                    <td>{log.motivo || "—"}</td>
                    <td
                      style={{
                        maxWidth: "200px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                      title={log.detalle || ""}
                    >
                      {log.detalle || "—"}
                    </td>
                    <td>
                      <span className={`${styles.impactBadge} ${getImpactClass(log.impacto)}`}>
                        {log.impacto}
                      </span>
                    </td>
                    <td>
                      <span className={styles.statusBadge}>{log.estado}</span>
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button
                          className={styles.actionsButton}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenActionMenuId(openActionMenuId === log.id ? null : log.id);
                          }}
                        >
                          <FiMoreHorizontal />
                        </button>

                        {openActionMenuId === log.id && (
                          <div className={styles.actionsDropdown} onClick={(e) => e.stopPropagation()}>
                            <button type="button" onClick={() => openModal("view", log)}>
                              <FiEye /> Ver detalle
                            </button>
                            <button type="button" onClick={() => openModal("edit", log)}>
                              <FiEdit /> Editar
                            </button>
                            <button type="button" onClick={() => openModal("evidence", log)}>
                              <FiPaperclip /> Subir evidencia
                            </button>
                            <button type="button" onClick={() => generatePDF(log)}>
                              <FiDownload /> Descargar acta
                            </button>
                            <button type="button" onClick={() => handleRegisterFollowUp(log)}>
                              <FiActivity /> Registrar seguimiento
                            </button>
                            <button
                              type="button"
                              className={styles.actionDelete}
                              onClick={() => handleDelete(log)}
                            >
                              <FiTrash2 /> Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DatosBitacora;
