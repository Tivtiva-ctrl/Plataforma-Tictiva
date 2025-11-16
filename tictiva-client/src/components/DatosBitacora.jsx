// DatosBitacora.jsx
// ==========================================
//  BITÁCORA LABORAL – REGISTRO 360
// ==========================================

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import styles from './DatosBitacora.module.css';
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
} from 'react-icons/fi';
import jsPDF from 'jspdf';

const LOG_TABLE = 'bitacora_entries';

// 🔹 Usuario actual (provisorio).
// Más adelante se reemplaza por el usuario logueado en Tictiva.
const CURRENT_USER_NAME = 'Usuario demo Tictiva';

// Motivos sugeridos para anotaciones (VISIBLES)
// Los códigos (AP-01, AN-01, etc.) se manejan INTERNAMENTE a nivel de reportes/ADIA.
const MOTIVOS_POSITIVOS = [
  // Desempeño / Productividad
  'Reconocimiento por desempeño',
  'Cumplimiento destacado de metas',
  'Calidad superior en la entrega de tareas',
  'Proactividad en resolución de problemas',
  // Trabajo en equipo
  'Excelente actitud con el equipo',
  'Apoyo voluntario a compañeros',
  'Buena comunicación y colaboración',
  // Innovación / Aporte
  'Aporte significativo a un proyecto',
  'Propuesta de mejoras efectivas',
  'Liderazgo positivo en actividades o reuniones',
];

const MOTIVOS_NEGATIVOS = [
  // Asistencia y puntualidad
  'Incumplimiento de horario',
  'Ausencias reiteradas sin justificación',
  'Salida anticipada sin autorización',
  'Retrasos constantes',
  // Rendimiento / Funciones
  'Incumplimiento de funciones asignadas',
  'Bajo rendimiento en tareas críticas',
  'Entrega deficiente de trabajo',
  'No cumplimiento de procedimientos establecidos',
  // Conducta
  'Llamado de atención por conducta',
  'Actitud inapropiada con compañeros o superiores',
  'Falta de respeto o trato hostil',
  'Conflictos o discusiones dentro del horario laboral',
  // Seguridad y normativa
  'Falta a protocolo interno',
  'Incumplimiento de normas de seguridad',
  'Uso incorrecto de equipamiento o herramientas',
  'Riesgo generado a terceros por negligencia',
  // Ética laboral
  'Ocultamiento de información relevante',
  'Uso inapropiado de recursos institucionales',
  'Falsificación de datos o mala fe',
  'Incumplimiento grave de políticas internas',
];

// Motivos para OBSERVACIONES (más leves que las anotaciones)
const MOTIVOS_OBSERVACION = [
  'Desempeño por debajo de lo esperado (puntual)',
  'Necesidad de refuerzo en funciones específicas',
  'Observación sobre calidad del trabajo',
  'Observación sobre tiempos de respuesta',
  'Observación sobre comunicación con el equipo',
  'Observación sobre cumplimiento parcial de instrucciones',
  'Observación sobre orden y presentación en el puesto de trabajo',
  'Observación sobre uso de herramientas o sistemas',
  'Conversación aclaratoria sobre una situación puntual',
  'Recomendación de mejora en el trato con usuarios/clientes',
];

// ==========================================
// === MODAL (CREAR / EDITAR / VER / EVIDENCIA)
// ==========================================
function LogModal({ mode, logData, onClose, onSave, rut, employeeId }) {
  const [formData, setFormData] = useState({
    fecha:
      logData?.fecha ||
      logData?.entry_date ||
      new Date().toISOString().split('T')[0],
    tipo: logData?.tipo || logData?.entry_type || 'Anotación',
    area: logData?.area || logData?.area_name || '',
    motivo: logData?.motivo || logData?.motive || '',
    detalle: logData?.detalle || logData?.detail || '',
    // 👇 leemos español o inglés
    impacto: logData?.impacto || logData?.impact || 'Leve',
    estado: logData?.estado || logData?.status || 'Abierto',
    grado: logData?.grado || 'Positiva',
  });

  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const isReadOnly = mode === 'view';
  const isEvidenceMode = mode === 'evidence';
  const isCreate = mode === 'create';

  // Títulos base
  const titles = {
    edit: 'Editar Entrada',
    view: 'Detalle de Bitácora',
    evidence: 'Subir Evidencia',
  };

  // Títulos dinámicos para creación según tipo
  const createTitlesByType = {
    Anotación: 'Nueva anotación',
    Observación: 'Nueva observación',
    Entrevista: 'Nueva entrevista',
  };

  useEffect(() => {
    setFormData({
      fecha:
        logData?.fecha ||
        logData?.entry_date ||
        new Date().toISOString().split('T')[0],
      tipo: logData?.tipo || logData?.entry_type || 'Anotación',
      area: logData?.area || logData?.area_name || '',
      motivo: logData?.motivo || logData?.motive || '',
      detalle: logData?.detalle || logData?.detail || '',
      // 👇 igual aquí: impacto / impact, estado / status
      impacto: logData?.impacto || logData?.impact || 'Leve',
      estado: logData?.estado || logData?.status || 'Abierto',
      grado: logData?.grado || 'Positiva',
    });
  }, [logData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'grado') {
      setFormData((prev) => ({
        ...prev,
        grado: value,
        motivo: '',
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

    // Validación básica: motivo y detalle obligatorios
    if (!formData.motivo || !formData.detalle) {
      alert('Por favor completa Motivo y Detalle antes de guardar.');
      setIsUploading(false);
      return;
    }

    let evidencePath = logData?.evidence_path || null;

    try {
      // 1) Subir archivo si hay
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${rut}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('bitacora_evidencias')
          .upload(filePath, file);

        if (uploadError) throw uploadError;
        evidencePath = filePath;
      }

      // Campos comunes (rut + employee_id si lo tenemos)
      const commonFields = {
        rut,
      };

      if (employeeId) {
        commonFields.employee_id = employeeId;
      } else if (logData?.employee_id) {
        commonFields.employee_id = logData.employee_id;
      }

      // 2) Payload completo alineado con la tabla
      const fullPayload = {
        ...commonFields,
        fecha: formData.fecha,
        entry_date: formData.fecha,
        entry_type: formData.tipo,
        grado: formData.grado,
        area: formData.area,
        area_name: formData.area || 'Sin área definida',
        motive: formData.motivo || 'Sin motivo definido',
        detail: formData.detalle || 'Sin detalles.',
        // 👇 sincronizamos ambas parejas de columnas
        impacto: formData.impacto,
        estado: formData.estado,
        impact: formData.impacto,
        status: formData.estado,
        evidence_path: evidencePath,
        author_name: CURRENT_USER_NAME, // 👈 se guarda el autor
      };

      // 3) Payload básico por si en dev falta alguna columna
      const basePayload = {
        ...commonFields,
        entry_date: formData.fecha,
        entry_type: formData.tipo,
        area_name: formData.area || 'Sin área definida',
        motive: formData.motivo || 'Sin motivo definido',
        detail: formData.detalle || 'Sin detalles.',
        author_name: CURRENT_USER_NAME, // 👈 también en el payload básico
      };

      const save = async (payload) => {
        if (mode === 'create') {
          return supabase.from(LOG_TABLE).insert(payload);
        }
        return supabase.from(LOG_TABLE).update(payload).eq('id', logData.id);
      };

      // Intento 1: payload completo
      let { error } = await save(fullPayload);

      // Si falla por alguna columna → fallback al básico
      if (error) {
        console.warn(
          'Fallo guardando con payload completo, probando payload básico:',
          error.message
        );
        ({ error } = await save(basePayload));
      }

      if (error) throw error;

      onSave();
      onClose();
    } catch (error) {
      console.error('Error al guardar:', error.message);
      alert('Error al guardar: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadEvidence = async () => {
    if (!logData?.evidence_path) return;

    try {
      const { data, error } = await supabase.storage
        .from('bitacora_evidencias')
        .download(logData.evidence_path);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = logData.evidence_path.split('/').pop();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando evidencia:', error);
      alert('No se pudo descargar la evidencia.');
    }
  };

  // Flags por tipo
  const isAnotacion = formData.tipo === 'Anotación';
  const isObservacion = formData.tipo === 'Observación';
  const isEntrevista = formData.tipo === 'Entrevista';

  // Motivos según tipo
  const motivosAnotacionOptions =
    formData.grado === 'Negativa' ? MOTIVOS_NEGATIVOS : MOTIVOS_POSITIVOS;

  // Autor (nombre) y fecha/hora de creación para mostrar en el header del modal
  const autorNombre =
    logData?.autor ||
    logData?.author ||
    logData?.author_name ||
    logData?.created_by_name ||
    logData?.created_by ||
    'No registrado';

  let autorFechaHora = '';
  if (logData?.created_at) {
    const fecha = new Date(logData.created_at);
    const fechaStr = fecha.toLocaleDateString('es-CL');
    const horaStr = fecha.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    });
    autorFechaHora = `${fechaStr} ${horaStr}`;
  }

  // 🔹 Título del modal
  const modalTitle = isCreate
    ? createTitlesByType[formData.tipo] || 'Nueva entrada de bitácora'
    : titles[mode] || 'Bitácora laboral';

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* HEADER MODAL */}
        <div className={styles.modalHeader}>
          <div>
            <h2>{modalTitle}</h2>
            {!isCreate && (
              <p className={styles.modalMeta}>
                Creado por: {autorNombre}
                {autorFechaHora ? ` (${autorFechaHora})` : ''}
              </p>
            )}
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <FiX />
          </button>
        </div>

        {/* BODY MODAL */}
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

                  {isCreate ? (
                    <p
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderRadius: '999px',
                        backgroundColor: '#f4f7f6',
                        fontWeight: 600,
                        color: 'var(--azul-tictiva)',
                        margin: 0,
                      }}
                    >
                      {formData.tipo}
                    </p>
                  ) : (
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
                  )}
                </div>
              </div>

              {/* ANOTACIONES */}
              {isAnotacion && (
                <>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Tipo de anotación</label>
                      <select
                        name="grado"
                        value={formData.grado}
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
                </>
              )}

              {/* OBSERVACIONES */}
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

              {/* ENTREVISTAS */}
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
                <FiPaperclip />{' '}
                {isEvidenceMode
                  ? 'Adjuntar Nueva Evidencia'
                  : 'Adjuntar Evidencia (PDF/IMG)'}
              </label>
              <input type="file" onChange={handleFileChange} />
              {logData?.evidence_path && (
                <p className={styles.fileExists}>
                  Ya existe un archivo adjunto.
                </p>
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

        {/* FOOTER MODAL */}
        <div className={styles.modalFooter}>
          <button
            onClick={onClose}
            className={styles.cancelButton}
            type="button"
          >
            {isReadOnly ? 'Cerrar' : 'Cancelar'}
          </button>

          {!isReadOnly && (
            <button
              onClick={handleSubmit}
              className={styles.saveButton}
              disabled={isUploading}
              type="button"
            >
              {isUploading ? 'Guardando...' : 'Guardar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// === FUNCIÓN DE PUNTUACIÓN DEL SEMÁFORO ===
// ==========================================
function computeLogScore(log) {
  const tipo = log.tipo || log.entry_type;
  const grado = log.grado;
  const impacto = log.impacto;
  const estado = log.estado;

  let score = 0;

  if (tipo === 'Anotación') {
    if (grado === 'Positiva' || tipo === 'Positiva') {
      score += 2;
    } else {
      switch (impacto) {
        case 'Crítico':
          score -= 5;
          break;
        case 'Alto':
          score -= 3;
          break;
        case 'Moderado':
          score -= 2;
          break;
        case 'Leve':
        default:
          score -= 1;
          break;
      }
    }
  } else if (tipo === 'Observación') {
    // Observaciones: siempre restan algo, pero menos que anotaciones fuertes
    switch (impacto) {
      case 'Crítico':
        score -= 4;
        break;
      case 'Alto':
        score -= 3;
        break;
      case 'Moderado':
        score -= 2;
        break;
      case 'Leve':
      default:
        score -= 1;
        break;
    }
  } else if (tipo === 'Entrevista') {
    if (estado === 'En seguimiento') {
      score -= 1;
    }
  }

  if (estado === 'En seguimiento') {
    score -= 1;
  }

  return score;
}

// ==========================================
// === COMPONENTE PRINCIPAL: DATOS BITÁCORA ===
// ==========================================
function DatosBitacora({ rut, employeeName }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedLog, setSelectedLog] = useState(null);

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [openActionMenuId, setOpenActionMenuId] = useState(null);

  const [periodo, setPeriodo] = useState('2025');
  const [tipo, setTipo] = useState('Todos');
  const [estado, setEstado] = useState('Todos');

  const [employeeId, setEmployeeId] = useState(null);
  const [employeeDisplayName, setEmployeeDisplayName] = useState(
    employeeName || ''
  );

  // Si el padre algún día manda employeeName, lo tomamos
  useEffect(() => {
    if (employeeName) {
      setEmployeeDisplayName(employeeName);
    }
  }, [employeeName]);

  // ==============================
  // Cargar nombre desde employee_personal
  // ==============================
  const fetchEmployeeId = async () => {
    if (!rut) return;

    try {
      const { data, error } = await supabase
        .from('employee_personal')
        .select('*')
        .eq('rut', rut)
        .single();

      if (error) {
        console.warn('Error en employee_personal:', error.message);
        return;
      }

      if (data) {
        // Si la tabla tiene un id o employee_id lo usamos por si más adelante lo conectamos
        const idFromPersonal = data.employee_id || data.id || null;
        if (idFromPersonal) {
          setEmployeeId(idFromPersonal);
        }

        // Varios posibles nombres, más combinación de nombres + apellidos
        const combinedName = `${data.nombres || ''} ${data.apellidos || ''}`.trim();

        const nameFromPersonal =
          data.full_name ||
          data.nombre_completo ||
          combinedName ||
          data.nombre ||
          data.name ||
          data.employee_name ||
          '';

        if (nameFromPersonal && !employeeDisplayName) {
          setEmployeeDisplayName(nameFromPersonal);
        }
      }
    } catch (err) {
      console.warn(
        'Error inesperado obteniendo nombre en employee_personal:',
        err.message
      );
    }
  };

  const fetchLogbook = async () => {
    if (!rut && !employeeId) return;
    setLoading(true);

    let query = supabase.from(LOG_TABLE).select('*');

    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    } else if (rut) {
      query = query.eq('rut', rut);
    }

    query = query.order('entry_date', { ascending: false });

    if (periodo !== 'Todos') {
      const startDate = `${periodo}-01-01`;
      const endDate = `${periodo}-12-31`;
      query = query.gte('entry_date', startDate).lte('entry_date', endDate);
    }

    if (tipo !== 'Todos') query = query.eq('entry_type', tipo);
    if (estado !== 'Todos') query = query.eq('estado', estado);

    const { data, error } = await query;

    if (error) {
      console.error('Error al cargar bitácora:', error.message);
      setLogs([]);
    } else {
      const mapped = (data || []).map((row) => ({
        ...row,
        tipo: row.tipo || row.entry_type,
        fecha: row.fecha || row.entry_date,
        area: row.area || row.area_name,
        motivo: row.motivo || row.motive,
        detalle: row.detalle || row.detail,
        // 👇 mapear impacto/estado desde ambas columnas
        impacto: row.impacto || row.impact || 'Leve',
        estado: row.estado || row.status || 'Abierto',
      }));
      setLogs(mapped);
    }

    setLoading(false);
  };

  useEffect(() => {
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

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este registro?')) return;

    const { error } = await supabase.from(LOG_TABLE).delete().eq('id', id);

    if (error) {
      console.error('Error al eliminar:', error.message);
      alert('No se pudo eliminar el registro.');
    } else {
      fetchLogbook();
    }
    setOpenActionMenuId(null);
  };

  const handleRegisterFollowUp = (log) => {
    openModal('edit', { ...log, estado: 'En seguimiento' });
  };

  // ==========================================
  // REPORTE GENERAL
  // ==========================================
  const generateGeneralReport = () => {
    if (!logs || logs.length === 0) {
      alert('No hay registros de bitácora para descargar.');
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const displayName = employeeDisplayName || employeeName || '-';

    // HEADER
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('BITÁCORA LABORAL DEL TRABAJADOR', 105, 20, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre trabajador: ${displayName}`, 20, 30);
    doc.text(`RUT trabajador: ${rut || '-'}`, 20, 36);

    let y = 46;

    const registros = [...logs].reverse(); // del más antiguo al más nuevo

    registros.forEach((log, index) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      let tipoDisplay = log.tipo;
      if (log.tipo === 'Anotación' && log.grado) {
        tipoDisplay = `Anotación (${log.grado})`;
      } else if (
        (log.tipo === 'Positiva' || log.tipo === 'Negativa') &&
        !log.grado
      ) {
        tipoDisplay = `Anotación (${log.tipo})`;
      }

      const fechaTexto = log.fecha
        ? new Date(log.fecha).toLocaleDateString('es-CL')
        : '—';

      const autor =
        log.autor ||
        log.author ||
        log.author_name ||
        log.created_by_name ||
        log.created_by ||
        'No registrado';

      const autorDisplay = autor && autor !== 'No registrado' ? autor : '-';

      // Título del bloque
      doc.setFont('helvetica', 'bold');
      doc.text(`Registro ${index + 1}`, 20, y);
      y += 6;

      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha: ${fechaTexto}`, 20, y);
      y += 5;
      doc.text(`Tipo de registro: ${tipoDisplay}`, 20, y);
      y += 5;
      doc.text(`Área / Equipo: ${log.area || '-'}`, 20, y);
      y += 5;
      doc.text(`Autor: ${autorDisplay}`, 20, y);
      y += 7;

      // Motivo
      doc.setFont('helvetica', 'bold');
      doc.text('Motivo:', 20, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      const motivoText = log.motivo || 'Sin motivo';
      const motivoLines = doc.splitTextToSize(motivoText, 170);
      doc.text(motivoLines, 25, y);
      y += motivoLines.length * 5 + 4;

      // Descripción / Detalle
      doc.setFont('helvetica', 'bold');
      doc.text('Descripción:', 20, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      const detalleText = log.detalle || 'Sin detalles.';
      const detalleLines = doc.splitTextToSize(detalleText, 170);
      doc.text(detalleLines, 25, y);
      y += detalleLines.length * 5 + 8;

      // Separador
      doc.setDrawColor(200);
      doc.line(20, y, 190, y);
      y += 6;
    });

    doc.save(`BitacoraLaboral_${rut || 'trabajador'}.pdf`);
  };

  const generatePDF = (log) => {
    const doc = new jsPDF();
    const displayName = employeeDisplayName || employeeName || '-';

    doc.setFontSize(20);
    doc.setTextColor(26, 56, 90);
    doc.text('Acta de Bitácora Laboral', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    const fechaTexto = log.fecha
      ? new Date(log.fecha).toLocaleDateString('es-ES')
      : '—';

    const autor =
      log.autor ||
      log.author ||
      log.author_name ||
      log.created_by_name ||
      log.created_by ||
      'No registrado';

    const autorDisplay = autor && autor !== 'No registrado' ? autor : '-';

    doc.text(`Fecha: ${fechaTexto}`, 20, 40);
    doc.text(`RUT trabajador: ${log.rut || rut || 'No registrado'}`, 20, 48);
    doc.text(`Nombre: ${displayName}`, 20, 56);
    doc.text(`Tipo de registro: ${log.tipo}`, 20, 64);
    doc.text(`Autor: ${autorDisplay}`, 20, 72);

    if (log.tipo === 'Anotación' && log.grado) {
      doc.text(`Clasificación: ${log.grado}`, 20, 80);
    } else if (log.tipo === 'Positiva' || log.tipo === 'Negativa') {
      doc.text(`Clasificación: ${log.tipo}`, 20, 80);
    } else {
      doc.text(`Estado: ${log.estado}`, 20, 80);
    }

    doc.text(`Área: ${log.area || 'No especificada'}`, 20, 88);

    doc.setLineWidth(0.5);
    doc.line(20, 94, 190, 94);

    doc.setFontSize(14);
    doc.text(`Motivo: ${log.motivo || 'Sin motivo'}`, 20, 106);

    doc.setFontSize(12);
    doc.text('Detalle:', 20, 121);

    const detalle = log.detalle || 'Sin detalles.';
    const splitText = doc.splitTextToSize(detalle, 170);
    doc.text(splitText, 20, 129);

    doc.text('__________________________', 105, 250, { align: 'center' });
    doc.text('Firma Responsable', 105, 258, { align: 'center' });

    doc.save(`Acta_${log.fecha}_${log.tipo}.pdf`);
    setOpenActionMenuId(null);
  };

  const total = logs.length;
  const positivos = logs.filter(
    (l) => l.grado === 'Positiva' || l.tipo === 'Positiva'
  ).length;
  const alertas = logs.filter(
    (l) => l.impacto === 'Alto' || l.impacto === 'Crítico'
  ).length;
  const seguimiento = logs.filter(
    (l) => l.estado === 'En seguimiento'
  ).length;

  // ============================
  // CÁLCULO DEL SEMÁFORO LABORAL
  // ============================
  let totalScore = 0;
  logs.forEach((log) => {
    totalScore += computeLogScore(log);
  });

  let semaforoLabel = 'Sin registros';
  let semaforoClassKey = 'semaforoEstable';

  if (logs.length > 0) {
    if (totalScore >= 2) {
      semaforoLabel = 'Estable';
      semaforoClassKey = 'semaforoEstable';
    } else if (totalScore >= -1) {
      semaforoLabel = 'Atención';
      semaforoClassKey = 'semaforoAtencion';
    } else if (totalScore > -5) {
      semaforoLabel = 'Alerta';
      semaforoClassKey = 'semaforoAlerta';
    } else {
      semaforoLabel = 'Crítico';
      semaforoClassKey = 'semaforoCritico';
    }
  }

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
          <button
            className={styles.actionButton}
            onClick={generateGeneralReport}
            type="button"
          >
            <FiDownload size={14} /> Descargar
          </button>

          <div className={styles.registerMenuContainer}>
            <button
              className={styles.registerButton}
              onClick={() => setIsRegisterOpen((prev) => !prev)}
              type="button"
            >
              <FiPlus size={14} /> Registrar
            </button>

            {isRegisterOpen && (
              <div className={styles.registerDropdown}>
                <button
                  type="button"
                  onClick={() =>
                    openModal('create', { tipo: 'Anotación' })
                  }
                >
                  <strong>Anotación</strong>
                  <small>Positivas o negativas</small>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    openModal('create', { tipo: 'Observación' })
                  }
                >
                  <strong>Observación</strong>
                  <small>Formales sobre desempeño</small>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    openModal('create', { tipo: 'Entrevista' })
                  }
                >
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
          <select
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="Todos">Todos</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <FiFilter />
          <label>Tipo:</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="Todos">Todos</option>
            <option value="Anotación">Anotación</option>
            <option value="Observación">Observación</option>
            <option value="Entrevista">Entrevista</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <FiCheckCircle />
          <label>Estado:</label>
          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
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
          <div
            className={`${styles.semaforoItem} ${
              styles[semaforoClassKey] || ''
            }`}
          >
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
                let tipoDisplay = log.tipo;
                if (log.tipo === 'Anotación' && log.grado) {
                  tipoDisplay = `Anotación (${log.grado})`;
                } else if (
                  (log.tipo === 'Positiva' || log.tipo === 'Negativa') &&
                  !log.grado
                ) {
                  tipoDisplay = `Anotación (${log.tipo})`;
                }

                return (
                  <tr key={log.id}>
                    <td>
                      {log.fecha
                        ? new Date(log.fecha).toLocaleDateString('es-ES')
                        : '—'}
                    </td>
                    <td>{tipoDisplay}</td>
                    <td>{log.area || '—'}</td>
                    <td>{log.motivo || '—'}</td>
                    <td
                      style={{
                        maxWidth: '200px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      title={log.detalle || ''}
                    >
                      {log.detalle || '—'}
                    </td>
                    <td>
                      <span className={styles.impactBadge}>
                        {log.impacto}
                      </span>
                    </td>
                    <td>
                      <span className={styles.statusBadge}>
                        {log.estado}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actionsCell}>
                        <button
                          className={styles.actionsButton}
                          type="button"
                          onClick={() =>
                            setOpenActionMenuId(
                              openActionMenuId === log.id ? null : log.id
                            )
                          }
                        >
                          <FiMoreHorizontal />
                        </button>

                        {openActionMenuId === log.id && (
                          <div className={styles.actionsDropdown}>
                            <button
                              type="button"
                              onClick={() => openModal('view', log)}
                            >
                              <FiEye /> Ver detalle
                            </button>
                            <button
                              type="button"
                              onClick={() => openModal('edit', log)}
                            >
                              <FiEdit /> Editar
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                openModal('evidence', log)
                              }
                            >
                              <FiPaperclip /> Subir evidencia
                            </button>
                            <button
                              type="button"
                              onClick={() => generatePDF(log)}
                            >
                              <FiDownload /> Descargar acta
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleRegisterFollowUp(log)
                              }
                            >
                              <FiActivity /> Registrar seguimiento
                            </button>
                            <button
                              type="button"
                              className={styles.actionDelete}
                              onClick={() => handleDelete(log.id)}
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
