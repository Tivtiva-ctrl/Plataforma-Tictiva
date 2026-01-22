import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useParams } from 'react-router-dom';
import styles from './DatosDocumentos.module.css';
import {
  FiFileText,
  FiUpload,
  FiX,
  FiPaperclip,
  FiEdit,
  FiDownload,
  FiChevronRight,
  FiArrowLeft,
  FiEye,
  FiMoreHorizontal,
} from 'react-icons/fi';

/**
 * Modal único para SUBIR o EDITAR documentos.
 * - existingDocument === null  => SUBIR
 * - existingDocument !== null  => EDITAR
 */
function DocumentModal({ onClose, onSave, rut, existingDocument = null }) {
  const isEditing = !!existingDocument;

  const [nombre, setNombre] = useState(existingDocument?.display_name || '');
  const [descripcion, setDescripcion] = useState(existingDocument?.description || '');
  const [category, setCategory] = useState(existingDocument?.category || '');
  const [tag, setTag] = useState(existingDocument?.tag || 'General');

  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const title = isEditing ? 'Editar Documento' : 'Subir Documento';

  useEffect(() => {
    if (!category) {
      const t = (tag || '').toLowerCase();
      if (t === 'contractual') setCategory('Contractual');
      else if (t === 'previsional') setCategory('Previsional');
      else if (t === 'personal') setCategory('Personal');
      else if (t === 'salud') setCategory('Salud');
      else setCategory('Otros');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!rut) return setError('No se encontró el RUT del empleado.');
    if (!nombre) return setError('Por favor completa el nombre.');
    if (!category) return setError('Selecciona una carpeta (categoría).');
    if (!isEditing && !file) return setError('Por favor selecciona un archivo para subir.');

    setIsUploading(true);

    try {
      let filePath = existingDocument?.file_path || null;

      if (file) {
        if (isEditing && filePath) {
          const { error: removeError } = await supabase.storage
            .from('employee-documents')
            .remove([filePath]);
          if (removeError) console.warn('Error al eliminar archivo antiguo:', removeError.message);
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        filePath = `${rut}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('employee-documents')
          .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (uploadError) throw new Error(`Error al subir el archivo: ${uploadError.message}`);
      }

      const documentData = {
        rut,
        display_name: nombre,
        description: descripcion,
        category,
        tag,
        file_path: filePath,
      };

      if (isEditing) {
        const { error: dbError } = await supabase
          .from('employee_documents')
          .update(documentData)
          .eq('id', existingDocument.id);

        if (dbError) throw new Error(`Error al actualizar documento: ${dbError.message}`);
      } else {
        const { error: dbError } = await supabase
          .from('employee_documents')
          .insert({ ...documentData, uploaded_at: new Date() });

        if (dbError) throw new Error(`Error al guardar documento: ${dbError.message}`);
      }

      onSave();
      onClose();
    } catch (err) {
      console.error('Error al guardar documento:', err.message);
      setError(err.message || 'Error desconocido al guardar el documento.');
    } finally {
      setIsUploading(false);
    }
  };

  const nombreArchivoActual = existingDocument?.file_path
    ? existingDocument.file_path.split('/').pop()
    : 'No especificado';

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button type="button" onClick={onClose} className={styles.closeButton}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label htmlFor="nombre">Nombre *</label>
                <input
                  id="nombre"
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Contrato de Trabajo"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="category">Carpeta *</label>
                <select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">Selecciona carpeta…</option>
                  <option value="Asistencia / Evidencias">Asistencia / Evidencias</option>
                  <option value="Contractual">Contractual</option>
                  <option value="Previsional">Previsional</option>
                  <option value="Personal">Personal</option>
                  <option value="Salud">Salud</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej. Documento firmado el 03/03/2021"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="tag">Etiqueta (opcional)</label>
              <select id="tag" value={tag} onChange={(e) => setTag(e.target.value)}>
                <option value="Contractual">Contractual</option>
                <option value="Previsional">Previsional</option>
                <option value="Personal">Personal</option>
                <option value="Salud">Salud</option>
                <option value="General">General</option>
              </select>
            </div>

            <div className={styles.dropZone}>
              <FiPaperclip size={26} />
              {file ? (
                <p>
                  Nuevo archivo: <strong>{file.name}</strong>
                </p>
              ) : isEditing ? (
                <p>Arrastra un nuevo archivo aquí para reemplazar el actual o haz clic.</p>
              ) : (
                <p>Haz clic o arrastra el documento hasta aquí.</p>
              )}
              <input type="file" onChange={handleFileChange} />
            </div>

            {isEditing && (
              <p className={styles.currentFileText}>
                Archivo actual: <strong>{nombreArchivoActual}</strong>
              </p>
            )}

            {error && <p className={styles.modalError}>{error}</p>}
          </div>

          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.cancelButton} disabled={isUploading}>
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isUploading || !nombre || !category || (!isEditing && !file)}
            >
              {isUploading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/** Menú simple (⋯) por documento */
function DocMenu({ open, onClose, onView, onDownload, onEdit, allowEdit }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    const onEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div ref={ref} className={styles.menu}>
      <button type="button" className={styles.menuItem} onClick={onView}>
        <FiEye /> Ver
      </button>
      <button type="button" className={styles.menuItem} onClick={onDownload}>
        <FiDownload /> Descargar
      </button>
      {allowEdit && (
        <button type="button" className={styles.menuItem} onClick={onEdit}>
          <FiEdit /> Editar
        </button>
      )}
    </div>
  );
}

/**
 * Listado principal de documentos (vista carpetas tipo Windows)
 */
function DatosDocumentos({ rut: rutProp }) {
  const { rut: rutFromParams } = useParams();
  const rut = rutProp || rutFromParams;

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);

  const [selectedFolder, setSelectedFolder] = useState(null);

  // ✅ menú (⋯) abierto para doc.id
  const [menuOpenFor, setMenuOpenFor] = useState(null);

  const FOLDERS = useMemo(
    () => [
      { key: 'Asistencia / Evidencias', title: 'Asistencia / Evidencias', subtitle: 'Comprobantes de marcación y evidencias asociadas.' },
      { key: 'Contractual', title: 'Contractual', subtitle: 'Contratos, anexos, renovaciones y documentos laborales.' },
      { key: 'Previsional', title: 'Previsional', subtitle: 'AFP, Isapre/Fonasa y documentación previsional.' },
      { key: 'Personal', title: 'Personal', subtitle: 'Antecedentes personales y documentación del trabajador.' },
      { key: 'Salud', title: 'Salud', subtitle: 'Licencias, certificados médicos y respaldo de salud.' },
      { key: 'Otros', title: 'Otros', subtitle: 'Documentos generales o sin clasificación.' },
    ],
    []
  );

  const normalizeCategory = (doc) => {
    const cat = (doc?.category || '').trim();
    if (cat) return cat;

    const tag = (doc?.tag || '').trim().toLowerCase();
    if (tag === 'contractual') return 'Contractual';
    if (tag === 'previsional') return 'Previsional';
    if (tag === 'personal') return 'Personal';
    if (tag === 'salud') return 'Salud';
    if (tag) return tag.charAt(0).toUpperCase() + tag.slice(1);
    return 'Otros';
  };

  const fetchDocuments = async () => {
    if (!rut) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('employee_documents')
      .select('*')
      .eq('rut', rut)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error al cargar documentos:', error);
      setDocuments([]);
    } else {
      setDocuments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    setSelectedFolder(null);
    setMenuOpenFor(null);
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rut]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const f of FOLDERS) map.set(f.key, []);
    for (const d of documents) {
      const key = normalizeCategory(d);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(d);
    }
    return map;
  }, [documents, FOLDERS]);

  const folderCount = (folderKey) => (grouped.get(folderKey) || []).length;

  const currentDocs = selectedFolder ? grouped.get(selectedFolder) || [] : [];

  const getBucket = (doc) => doc.bucket || 'employee-documents';

  const viewFile = async (doc) => {
    try {
      const bucket = getBucket(doc);
      const filePath = doc.file_path;

      // ✅ Si el bucket es público, esto igual funciona; si es privado, te genera URL firmada
      const { data, error } = await supabase.storage.from(bucket).createSignedUrl(filePath, 60 * 10);
      if (error) throw error;

      window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
    } catch (e) {
      console.error('Error al ver documento:', e.message);
      alert('No se pudo abrir el documento.');
    } finally {
      setMenuOpenFor(null);
    }
  };

  const downloadFile = async (doc) => {
    try {
      const bucket = getBucket(doc);
      const filePath = doc.file_path;

      const { data, error } = await supabase.storage.from(bucket).download(filePath);
      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error al descargar:', e.message);
      alert('No se pudo descargar el archivo.');
    } finally {
      setMenuOpenFor(null);
    }
  };

  const canEditDoc = (folderKey) => folderKey !== 'Asistencia / Evidencias';

  return (
    <div className={styles.documentContainer}>
      {isUploadModalOpen && (
        <DocumentModal rut={rut} onClose={() => setIsUploadModalOpen(false)} onSave={fetchDocuments} />
      )}

      {editingDocument && (
        <DocumentModal
          rut={rut}
          existingDocument={editingDocument}
          onClose={() => setEditingDocument(null)}
          onSave={fetchDocuments}
        />
      )}

      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.pageTitle}>Documentos del Empleado</h2>

          <div className={styles.breadcrumb}>
            <span className={styles.crumb} onClick={() => setSelectedFolder(null)}>
              Documentos
            </span>
            {selectedFolder && (
              <>
                <FiChevronRight />
                <span className={styles.crumbActive}>{selectedFolder}</span>
              </>
            )}
          </div>
        </div>

        <button onClick={() => setIsUploadModalOpen(true)} className={styles.uploadButton} disabled={!rut}>
          <FiUpload /> Subir Documento
        </button>
      </div>

      {loading && <p className={styles.muted}>Cargando documentos...</p>}

      {!loading && !selectedFolder && (
        <div className={styles.foldersList}>
          {FOLDERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={styles.folderRow}
              onClick={() => setSelectedFolder(f.key)}
            >
              <div className={styles.folderIcon} />
              <div className={styles.folderText}>
                <div className={styles.folderTitleRow}>
                  <span className={styles.folderTitle}>{f.title}</span>
                  <span className={styles.folderCount}>{folderCount(f.key)}</span>
                </div>
                <div className={styles.folderSubtitle}>{f.subtitle}</div>
              </div>
              <div className={styles.folderChevron}>
                <FiChevronRight />
              </div>
            </button>
          ))}
        </div>
      )}

      {!loading && selectedFolder && (
        <div className={styles.folderDetail}>
          <button className={styles.backButton} type="button" onClick={() => setSelectedFolder(null)}>
            <FiArrowLeft /> Volver a carpetas
          </button>

          {currentDocs.length === 0 ? (
            <div className={styles.emptyFolder}>
              <div className={styles.emptyIcon} />
              <div>
                <div className={styles.emptyTitle}>Sin documentos en esta carpeta.</div>
                <div className={styles.emptySub}>
                  Puedes subir uno con el botón <b>Subir Documento</b>.
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.documentList}>
              {currentDocs.map((doc) => {
                const fecha = doc.uploaded_at
                  ? new Date(doc.uploaded_at).toLocaleDateString('es-CL')
                  : 'Fecha desconocida';

                const isAttendanceFolder = selectedFolder === 'Asistencia / Evidencias';
                const allowEdit = canEditDoc(selectedFolder);

                return (
                  <div key={doc.id} className={styles.documentItem}>
                    <div className={styles.fileIcon}>
                      <FiFileText size={20} />
                    </div>

                    <div className={styles.fileInfo}>
                      <strong>{doc.display_name}</strong>
                      <small className={styles.fileMeta}>
                        Subido el {fecha}
                        {doc.description ? <span className={styles.dot}>•</span> : null}
                        {doc.description ? <span className={styles.desc}>{doc.description}</span> : null}
                      </small>
                    </div>

                    {/* ✅ ACCIONES */}
                    <div className={styles.fileActions}>
                      {isAttendanceFolder ? (
                        <>
                          <button
                            className={styles.actionButtonGhost}
                            type="button"
                            onClick={() => viewFile(doc)}
                            title="Ver"
                          >
                            <FiEye size={16} /> Ver
                          </button>

                          <button
                            className={styles.actionButtonDownload}
                            type="button"
                            onClick={() => downloadFile(doc)}
                            title="Descargar"
                          >
                            <FiDownload size={16} /> Descargar
                          </button>
                        </>
                      ) : (
                        <div className={styles.menuWrap}>
                          <button
                            type="button"
                            className={styles.kebabButton}
                            onClick={() => setMenuOpenFor((prev) => (prev === doc.id ? null : doc.id))}
                            title="Más opciones"
                          >
                            <FiMoreHorizontal size={18} />
                          </button>

                          <DocMenu
                            open={menuOpenFor === doc.id}
                            onClose={() => setMenuOpenFor(null)}
                            onView={() => viewFile(doc)}
                            onDownload={() => downloadFile(doc)}
                            onEdit={() => {
                              setMenuOpenFor(null);
                              setEditingDocument(doc);
                            }}
                            allowEdit={allowEdit}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DatosDocumentos;
