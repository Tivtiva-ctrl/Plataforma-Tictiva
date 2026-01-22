import React, { useState, useEffect, useMemo } from 'react';
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

  // ✅ NUEVO: carpeta/categoría (para vista tipo Windows)
  const [category, setCategory] = useState(existingDocument?.category || '');

  // Mantenemos tag por compatibilidad (si tu tabla lo tiene y lo usas en otras partes)
  const [tag, setTag] = useState(existingDocument?.tag || 'General');

  const [file, setFile] = useState(null); // nuevo archivo (opcional al editar)
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const title = isEditing ? 'Editar Documento' : 'Subir Documento';

  // Carpeta por defecto si no viene
  useEffect(() => {
    if (!category) {
      // si venía tag, lo mapeamos
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

    if (!rut) {
      setError('No se encontró el RUT del empleado.');
      return;
    }

    if (!nombre) {
      setError('Por favor completa el nombre.');
      return;
    }

    if (!category) {
      setError('Selecciona una carpeta (categoría).');
      return;
    }

    // Al subir es obligatorio archivo, al editar es opcional
    if (!isEditing && !file) {
      setError('Por favor selecciona un archivo para subir.');
      return;
    }

    setIsUploading(true);

    try {
      let filePath = existingDocument?.file_path || null;

      // 1) Manejo del archivo (solo si se selecciona uno nuevo)
      if (file) {
        // Si estamos editando y ya había archivo, intentar borrarlo
        if (isEditing && filePath) {
          const { error: removeError } = await supabase.storage
            .from('employee-documents')
            .remove([filePath]);

          if (removeError) {
            console.warn('Error al eliminar archivo antiguo del storage:', removeError.message);
            // no cortamos el flujo por esto
          }
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        filePath = `${rut}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('employee-documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(`Error al subir el archivo: ${uploadError.message}`);
        }
      }

      // 2) Datos para la tabla
      // ✅ OJO: guardamos category (carpeta) sí o sí.
      const documentData = {
        rut,
        display_name: nombre,
        description: descripcion,
        category, // ✅ carpeta
        tag,      // compat
        file_path: filePath,
      };

      // 3) INSERT o UPDATE
      if (isEditing) {
        const { error: dbError } = await supabase
          .from('employee_documents')
          .update(documentData)
          .eq('id', existingDocument.id);

        if (dbError) {
          throw new Error(`Error al actualizar los datos del documento: ${dbError.message}`);
        }
      } else {
        const { error: dbError } = await supabase
          .from('employee_documents')
          .insert({
            ...documentData,
            uploaded_at: new Date(),
          });

        if (dbError) {
          throw new Error(`Error al guardar los datos del documento: ${dbError.message}`);
        }
      }

      onSave();  // refresca la lista
      onClose(); // cierra modal
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
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
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

            {/* Tag opcional (si lo sigues usando) */}
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

  // ✅ NUEVO: carpeta seleccionada
  const [selectedFolder, setSelectedFolder] = useState(null);

  // ✅ Definición de carpetas “fijas” (siempre visibles)
  const FOLDERS = useMemo(
    () => [
      {
        key: 'Asistencia / Evidencias',
        title: 'Asistencia / Evidencias',
        subtitle: 'Comprobantes de marcación y evidencias asociadas.',
      },
      {
        key: 'Contractual',
        title: 'Contractual',
        subtitle: 'Contratos, anexos, renovaciones y documentos laborales.',
      },
      {
        key: 'Previsional',
        title: 'Previsional',
        subtitle: 'AFP, Isapre/Fonasa y documentación previsional.',
      },
      {
        key: 'Personal',
        title: 'Personal',
        subtitle: 'Antecedentes personales y documentación del trabajador.',
      },
      {
        key: 'Salud',
        title: 'Salud',
        subtitle: 'Licencias, certificados médicos y respaldo de salud.',
      },
      {
        key: 'Otros',
        title: 'Otros',
        subtitle: 'Documentos generales o sin clasificación.',
      },
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
    setSelectedFolder(null); // ✅ si cambias de empleado, volvemos a carpetas
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rut]);

  // ✅ Agrupar documentos por carpeta
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

  const handleDownload = async (bucket, filePath) => {
    try {
      // ✅ si tu registro tiene bucket, lo usamos; si no, asumimos employee-documents
      const bucketName = bucket || 'employee-documents';

      const { data, error } = await supabase.storage.from(bucketName).download(filePath);
      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath.split('/').pop();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar el archivo:', error.message);
      alert('No se pudo descargar el archivo.');
    }
  };

  const folderCount = (folderKey) => (grouped.get(folderKey) || []).length;

  const currentDocs = selectedFolder ? grouped.get(selectedFolder) || [] : [];

  return (
    <div className={styles.documentContainer}>
      {/* Modal SUBIR */}
      {isUploadModalOpen && (
        <DocumentModal
          rut={rut}
          onClose={() => setIsUploadModalOpen(false)}
          onSave={fetchDocuments}
        />
      )}

      {/* Modal EDITAR */}
      {editingDocument && (
        <DocumentModal
          rut={rut}
          existingDocument={editingDocument}
          onClose={() => setEditingDocument(null)}
          onSave={fetchDocuments}
        />
      )}

      {/* Header */}
      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.pageTitle}>Documentos del Empleado</h2>

          {/* Breadcrumb */}
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

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className={styles.uploadButton}
          disabled={!rut}
        >
          <FiUpload /> Subir Documento
        </button>
      </div>

      {/* Loading */}
      {loading && <p className={styles.muted}>Cargando documentos...</p>}

      {/* Vista carpetas */}
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

      {/* Vista dentro de carpeta */}
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

                    <div className={styles.fileActions}>
                      <button
                        className={styles.actionButtonEdit}
                        type="button"
                        onClick={() => setEditingDocument(doc)}
                      >
                        <FiEdit size={14} /> Editar
                      </button>
                      <button
                        onClick={() => handleDownload(doc.bucket, doc.file_path)}
                        className={styles.actionButtonDownload}
                        type="button"
                      >
                        <FiDownload size={14} /> Descargar
                      </button>
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
