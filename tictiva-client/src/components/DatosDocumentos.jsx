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
  FiChevronDown,
  FiChevronRight,
  FiFolder,
} from 'react-icons/fi';

/**
 * Modal único para SUBIR o EDITAR documentos.
 * - existingDocument === null  => SUBIR
 * - existingDocument !== null  => EDITAR
 */
function DocumentModal({ onClose, onSave, rut, existingDocument = null }) {
  const isEditing = !!existingDocument;

  const [nombre, setNombre] = useState(existingDocument?.display_name || '');
  const [descripcion, setDescripcion] = useState(
    existingDocument?.description || ''
  );
  const [tag, setTag] = useState(existingDocument?.tag || 'General');
  const [file, setFile] = useState(null); // nuevo archivo (opcional al editar)
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const title = isEditing ? 'Editar Documento' : 'Subir Documento';

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
            console.warn(
              'Error al eliminar archivo antiguo del storage:',
              removeError.message
            );
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
      const documentData = {
        rut,
        display_name: nombre,
        description: descripcion,
        tag,
        file_path: filePath,
      };

      // 3) INSERT o UPDATE
      if (isEditing) {
        const { error: dbError } = await supabase
          .from('employee_documents')
          .update(documentData)
          .eq('id', existingDocument.id);

        if (dbError) {
          throw new Error(
            `Error al actualizar los datos del documento: ${dbError.message}`
          );
        }
      } else {
        const { error: dbError } = await supabase.from('employee_documents').insert({
          ...documentData,
          uploaded_at: new Date(),
        });

        if (dbError) {
          throw new Error(
            `Error al guardar los datos del documento: ${dbError.message}`
          );
        }
      }

      onSave(); // refresca la lista
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
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
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
              <label htmlFor="descripcion">Descripción</label>
              <textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej. Contrato indefinido firmado el 03/03/2021"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="tag">Etiqueta (Tipo de Documento)</label>
              <select
                id="tag"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              >
                <option value="Contractual">Contractual</option>
                <option value="Previsional">Previsional</option>
                <option value="Personal">Personal</option>
                <option value="Salud">Salud</option>
                <option value="General">General</option>
              </select>
              <small className={styles.helperText}>
                Tip: los comprobantes automáticos usan <b>category</b> (Asistencia / Evidencias) y se ordenan solos.
              </small>
            </div>

            <div className={styles.dropZone}>
              <FiPaperclip size={30} />
              {file ? (
                <p>
                  Nuevo archivo: <strong>{file.name}</strong>
                </p>
              ) : isEditing ? (
                <p>
                  Arrastra un nuevo archivo aquí para reemplazar el actual o haz clic.
                </p>
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
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isUploading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={isUploading || !nombre || (!isEditing && !file)}
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
 * Listado principal de documentos (con "carpetas" visuales)
 */
function DatosDocumentos({ rut: rutProp }) {
  const { rut: rutFromParams } = useParams();
  const rut = rutProp || rutFromParams;

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);

  // Estado de carpetas (expand/collapse)
  const [openFolders, setOpenFolders] = useState({
    asistencia: true,
    contractual: true,
    previsional: true,
    personal: true,
    salud: true,
    otros: true,
  });

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
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rut]);

  const getTagColor = (tag) => {
    if (!tag) return styles.tagGrey;
    switch (tag.toLowerCase()) {
      case 'contractual':
        return styles.tagBlue;
      case 'previsional':
        return styles.tagGreen;
      case 'personal':
        return styles.tagPurple;
      case 'salud':
        return styles.tagRed;
      default:
        return styles.tagGrey;
    }
  };

  const getFolderKey = (doc) => {
    const cat = (doc?.category || '').toString().trim().toLowerCase();
    const tag = (doc?.tag || '').toString().trim().toLowerCase();

    // 1) Primero category (para comprobantes automáticos)
    if (cat.includes('asistencia') || cat.includes('evidencia')) return 'asistencia';

    // 2) Si no hay category, usamos tag
    if (tag === 'contractual') return 'contractual';
    if (tag === 'previsional') return 'previsional';
    if (tag === 'personal') return 'personal';
    if (tag === 'salud') return 'salud';

    return 'otros';
  };

  const folders = useMemo(() => {
    const base = {
      asistencia: [],
      contractual: [],
      previsional: [],
      personal: [],
      salud: [],
      otros: [],
    };

    for (const d of documents) {
      const k = getFolderKey(d);
      base[k].push(d);
    }
    return base;
  }, [documents]);

  const folderMeta = [
    { key: 'asistencia', title: 'Asistencia / Evidencias', emoji: '🧾' },
    { key: 'contractual', title: 'Contractual', emoji: '📄' },
    { key: 'previsional', title: 'Previsional', emoji: '🏦' },
    { key: 'personal', title: 'Personal', emoji: '🪪' },
    { key: 'salud', title: 'Salud', emoji: '🩺' },
    { key: 'otros', title: 'Otros', emoji: '📎' },
  ];

  const toggleFolder = (key) => {
    setOpenFolders((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownload = async (filePath) => {
    try {
      if (!filePath) {
        alert('Este documento no tiene archivo asociado.');
        return;
      }

      const { data, error } = await supabase.storage
        .from('employee-documents')
        .download(filePath);

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

  const renderDocRow = (doc) => {
    const fecha = doc.uploaded_at
      ? new Date(doc.uploaded_at).toLocaleDateString('es-ES')
      : 'Fecha desconocida';

    // Para mostrar etiqueta bonita:
    // - si viene category (comprobantes) mostramos category
    // - si no, mostramos tag
    const badgeText = doc.category?.trim() ? doc.category : (doc.tag || 'Sin etiqueta');

    return (
      <div key={doc.id} className={styles.documentItem}>
        <div className={styles.fileIcon}>
          <FiFileText size={20} />
        </div>

        <div className={styles.fileInfo}>
          <strong>{doc.display_name}</strong>
          <small>
            Subido el {fecha}
            <span
              className={`${styles.fileTag} ${getTagColor(doc.tag)}`}
              title={badgeText}
            >
              {badgeText}
            </span>
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
            onClick={() => handleDownload(doc.file_path)}
            className={styles.actionButtonDownload}
            type="button"
          >
            <FiDownload size={14} /> Descargar
          </button>
        </div>
      </div>
    );
  };

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

      <div className={styles.documentHeader}>
        <h2>Documentos del Empleado</h2>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className={styles.uploadButton}
          disabled={!rut}
        >
          <FiUpload /> Subir Documento
        </button>
      </div>

      <div className={styles.documentList}>
        {loading && <p>Cargando documentos...</p>}

        {!loading && documents.length === 0 && (
          <p>No hay documentos para este empleado.</p>
        )}

        {!loading && documents.length > 0 && (
          <div className={styles.foldersWrapper}>
            {folderMeta.map((f) => {
              const list = folders[f.key] || [];
              const isOpen = !!openFolders[f.key];

              // Si quieres, puedes ocultar carpetas vacías:
              // if (list.length === 0) return null;

              return (
                <div key={f.key} className={styles.folderBlock}>
                  <button
                    type="button"
                    className={styles.folderHeader}
                    onClick={() => toggleFolder(f.key)}
                  >
                    <span className={styles.folderLeft}>
                      <span className={styles.folderEmoji}>{f.emoji}</span>
                      <span className={styles.folderTitle}>{f.title}</span>
                      <span className={styles.folderCount}>{list.length}</span>
                    </span>

                    <span className={styles.folderRight}>
                      {isOpen ? <FiChevronDown /> : <FiChevronRight />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className={styles.folderBody}>
                      {list.length === 0 ? (
                        <div className={styles.emptyFolder}>
                          <FiFolder />
                          <span>Sin documentos en esta carpeta.</span>
                        </div>
                      ) : (
                        list.map(renderDocRow)
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default DatosDocumentos;
