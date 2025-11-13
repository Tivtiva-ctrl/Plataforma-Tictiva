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

// Motivos sugeridos para anotaciones
const MOTIVOS_POSITIVOS = [
  'Reconocimiento por desempeño',
  'Cumplimiento destacado de metas',
  'Excelente actitud con el equipo',
  'Aporte significativo a un proyecto',
];

const MOTIVOS_NEGATIVOS = [
  'Incumplimiento de horario',
  'Incumplimiento de funciones',
  'Llamado de atención por conducta',
  'Falta a protocolo interno',
];

// ==========================================
// === MODAL (CREAR / EDITAR / VER / EVIDENCIA)
// ==========================================
function LogModal({ mode, logData, onClose, onSave, rut }) {
  const [formData, setFormData] = useState({
    fecha: logData?.fecha || new Date().toISOString().split('T')[0],
    tipo: logData?.tipo || 'Anotación', // Anotación, Observación, Entrevista
    area: logData?.area || '',
    motivo: logData?.motivo || '',
    detalle: logData?.detalle || '',
    impacto: logData?.impacto || 'Leve',
    estado: logData?.estado || 'Abierto',
    grado: logData?.grado || 'Positiva', // Solo para Anotaciones
  });

  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const isReadOnly = mode === 'view';
  const isEvidenceMode = mode === 'evidence';

  const titles = {
    create: 'Nueva Entrada de Bitácora',
    edit: 'Editar Entrada',
    view: 'Detalle de Bitácora',
    evidence: 'Subir Evidencia',
  };

  useEffect(() => {
    setFormData({
      fecha: logData?.fecha || new Date().toISOString().split('T')[0],
      tipo: logData?.tipo || 'Anotación',
      area: logData?.area || '',
      motivo: logData?.motivo || '',
      detalle: logData?.detalle || '',
      impacto: logData?.impacto || 'Leve',
      estado: logData?.estado || 'Abierto',
      grado: logData?.grado || 'Positiva',
    });
  }, [logData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Cambiar entre Positiva/Negativa → resetear motivo para que elija uno acorde
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

      // 2) Payload completo (si la tabla tiene todas las columnas, se usa esto)
      const fullPayload = {
        ...formData,
        rut,
        evidence_path: evidencePath,
      };

      // 3) Payload básico (para tablas más simples, "como antes")
      const basePayload = {
        rut,
        fecha: formData.fecha,
        tipo: formData.tipo,
        motivo: formData.motivo,
        detalle: formData.detalle,
      };

      const save = async (payload) => {
        if (mode === 'create') {
          return supabase.from(LOG_TABLE).insert(payload);
        }
        return supabase
          .from(LOG_TABLE)
          .update(payload)
          .eq('id', logData.id);
      };

      // 4) Intento 1: guardar con payload completo
      let { error } = await save(fullPayload);

      // 5) Si falla por columnas inexistentes → intentamos con payload básico
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

  const motivosOptions =
    formData.grado === 'Negativa' ? MOTIVOS_NEGATIVOS : MOTIVOS_POSITIVOS;

  const isAnotacion = formData.tipo === 'Anotación';

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        {/* HEADER MODAL */}
        <div className={styles.modalHeader}>
          <h2>{titles[mode]}</h2>
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

              {/* Solo en Anotación: Positiva / Negativa + Motivos */}
              {isAnotacion && (
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
                      {motivosOptions.map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Otros tipos: motivo libre */}
              {!isAnotacion && (
                <div className={styles.formGroup}>
                  <label>Motivo</label>
                  <input
                    type="text"
                    name="motivo"
                    value={formData.motivo}
                    onChange={handleChange}
                    disabled={isReadOnly}
                    placeholder="Resumen breve"
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

          {/* Evidencias */}
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
// === COMPONENTE PRINCIPAL: DATOS BITÁCORA ===
// ==========================================
function DatosBitacora({ rut }) {
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

  const fetchLogbook = async () => {
    if (!rut) return;
    setLoading(true);

    let query = supabase
      .from(LOG_TABLE)
      .select('*')
      .eq('rut', rut)
      .order('fecha', { ascending: false });

    if (periodo !== 'Todos') {
      const startDate = `${periodo}-01-01`;
      const endDate = `${periodo}-12-31`;
      query = query.gte('fecha', startDate).lte('fecha', endDate);
    }

    if (tipo !== 'Todos') query = query.eq('tipo', tipo);
    if (estado !== 'Todos') query = query.eq('estado', estado);

    const { data, error } = await query;

    if (error) {
      console.error('Error al cargar bitácora:', error.message);
      setLogs([]);
    } else {
      setLogs(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchLogbook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rut, tipo, estado, periodo]);

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

  const generatePDF = (log) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(26, 56, 90);
    doc.text('Acta de Bitácora Laboral', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);

    doc.text(
      `Fecha: ${
        log.fecha ? new Date(log.fecha).toLocaleDateString('es-ES') : '—'
      }`,
      20,
      40
    );
    doc.text(`RUT trabajador: ${log.rut || 'No registrado'}`, 20, 48);
    doc.text(`Tipo de registro: ${log.tipo}`, 20, 56);

    if (log.tipo === 'Anotación' && log.grado) {
      doc.text(`Clasificación: ${log.grado}`, 20, 64);
    } else if (log.tipo === 'Positiva' || log.tipo === 'Negativa') {
      doc.text(`Clasificación: ${log.tipo}`, 20, 64);
    } else {
      doc.text(`Estado: ${log.estado}`, 20, 64);
    }

    doc.text(`Área: ${log.area || 'No especificada'}`, 20, 72);

    doc.setLineWidth(0.5);
    doc.line(20, 78, 190, 78);

    doc.setFontSize(14);
    doc.text(`Motivo: ${log.motivo || 'Sin motivo'}`, 20, 90);

    doc.setFontSize(12);
    doc.text('Detalle:', 20, 105);

    const detalle = log.detalle || 'Sin detalles.';
    const splitText = doc.splitTextToSize(detalle, 170);
    doc.text(splitText, 20, 113);

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

  return (
    <div className={styles.logbookContainer}>
      {modalOpen && (
        <LogModal
          mode={modalMode}
          logData={selectedLog}
          rut={rut}
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
            onClick={() =>
              alert('Descargar reporte general (Próximamente)')
            }
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
            className={`${styles.semaforoItem} ${styles.semaforoEstable}`}
          >
            Estable
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
