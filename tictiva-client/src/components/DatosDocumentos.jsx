import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../supabaseClient";
import { useParams } from "react-router-dom";
import styles from "./DatosDocumentos.module.css";
import {
  FiUpload,
  FiX,
  FiPaperclip,
  FiMoreHorizontal,
  FiEye,
  FiDownload,
  FiEdit,
  FiFolder,
  FiFileText,
  FiChevronRight,
  FiArrowLeft,
} from "react-icons/fi";

/**
 * =========================================================
 * Config de carpetas (Windows-like)
 * =========================================================
 */
const FOLDERS = [
  {
    key: "Asistencia / Evidencias",
    title: "Asistencia / Evidencias",
    description: "Comprobantes de marcación y evidencias asociadas",
    readOnly: true,
  },
  {
    key: "Contractual",
    title: "Contractual",
    description: "Contratos, anexos, renovaciones y documentos laborales",
    readOnly: false,
  },
  {
    key: "Previsional",
    title: "Previsional",
    description: "AFP, Isapre/Fonasa, cotizaciones y documentos previsionales",
    readOnly: false,
  },
  {
    key: "Personal",
    title: "Personal",
    description: "Documentación personal del colaborador",
    readOnly: false,
  },
  {
    key: "Salud",
    title: "Salud",
    description: "Licencias médicas y documentos de salud",
    readOnly: false,
  },
  {
    key: "Otros",
    title: "Otros",
    description: "Cualquier documento adicional o misceláneo",
    readOnly: false,
  },
];

const DEFAULT_BUCKET = "employee-documents";

/**
 * =========================================================
 * Menú de 3 puntitos
 * =========================================================
 */
function DocMenu({ showEdit, onView, onDownload, onEdit }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className={styles.menuWrap} ref={ref}>
      <button
        type="button"
        className={styles.moreBtn}
        onClick={() => setOpen((v) => !v)}
        aria-label="Más opciones"
        title="Más opciones"
      >
        <FiMoreHorizontal />
      </button>

      {open && (
        <div className={styles.menu}>
          <button
            type="button"
            className={styles.menuItem}
            onClick={() => {
              setOpen(false);
              onView();
            }}
          >
            <FiEye /> Ver
          </button>

          <button
            type="button"
            className={styles.menuItem}
            onClick={() => {
              setOpen(false);
              onDownload();
            }}
          >
            <FiDownload /> Descargar
          </button>

          {showEdit && (
            <button
              type="button"
              className={styles.menuItem}
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
            >
              <FiEdit /> Editar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * =========================================================
 * Modal para SUBIR o EDITAR documento (solo carpetas NO readOnly)
 * =========================================================
 */
function DocumentModal({
  onClose,
  onSave,
  rut,
  existingDocument = null,
  defaultCategory = "Otros",
}) {
  const isEditing = !!existingDocument;

  const [nombre, setNombre] = useState(existingDocument?.display_name || "");
  const [descripcion, setDescripcion] = useState(existingDocument?.description || "");
  const [category, setCategory] = useState(existingDocument?.category || defaultCategory);
  const [tag, setTag] = useState(existingDocument?.tag || defaultCategory);
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const title = isEditing ? "Editar Documento" : "Subir Documento";

  const allowedFolders = useMemo(() => FOLDERS.filter((f) => !f.readOnly), []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!rut) return setError("No se encontró el RUT del empleado.");
    if (!nombre) return setError("Por favor completa el nombre.");

    if (!isEditing && !file) return setError("Por favor selecciona un archivo para subir.");

    setIsUploading(true);

    try {
      // ✅ uploads manuales SIEMPRE a employee-documents
      const bucket = DEFAULT_BUCKET;

      let filePath = existingDocument?.file_path || null;

      if (file) {
        if (isEditing && filePath && (existingDocument?.bucket || bucket) === bucket) {
          const { error: removeError } = await supabase.storage.from(bucket).remove([filePath]);
          if (removeError) console.warn("No se pudo borrar archivo antiguo:", removeError.message);
        }

        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        filePath = `${rut}/${fileName}`;

        const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

        if (uploadError) throw new Error(`Error al subir el archivo: ${uploadError.message}`);
      }

      const documentData = {
        rut,
        display_name: nombre,
        description: descripcion,
        category,
        tag,
        bucket,
        file_path: filePath,
      };

      if (isEditing) {
        const { error: dbError } = await supabase
          .from("employee_documents")
          .update(documentData)
          .eq("id", existingDocument.id);

        if (dbError) throw new Error(`Error al actualizar: ${dbError.message}`);
      } else {
        const { error: dbError } = await supabase.from("employee_documents").insert({
          ...documentData,
          created_at: new Date().toISOString(), // ✅ TU COLUMNA REAL
        });

        if (dbError) throw new Error(`Error al guardar: ${dbError.message}`);
      }

      onSave();
      onClose();
    } catch (err) {
      console.error("Error guardando documento:", err);
      setError(err?.message || "Error desconocido al guardar el documento.");
    } finally {
      setIsUploading(false);
    }
  };

  const nombreArchivoActual = existingDocument?.file_path
    ? existingDocument.file_path.split("/").pop()
    : "No especificado";

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
                  placeholder="Ej. Anexo contrato / Certificado / etc."
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="category">Carpeta</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setTag(e.target.value);
                  }}
                >
                  {allowedFolders.map((f) => (
                    <option key={f.key} value={f.key}>
                      {f.title}
                    </option>
                  ))}
                </select>
                <small className={styles.helpText}>
                  * “Asistencia / Evidencias” se genera automáticamente (no editable).
                </small>
              </div>

              <div className={styles.formGroup} style={{ gridColumn: "1 / -1" }}>
                <label htmlFor="descripcion">Descripción</label>
                <textarea
                  id="descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Breve contexto del documento"
                />
              </div>
            </div>

            <div className={styles.dropZone}>
              <FiPaperclip size={28} />
              {file ? (
                <p>
                  Archivo: <strong>{file.name}</strong>
                </p>
              ) : isEditing ? (
                <p>Arrastra un archivo aquí para reemplazar el actual o haz clic.</p>
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
              {isUploading ? "Guardando..." : isEditing ? "Guardar Cambios" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/**
 * =========================================================
 * Vista principal Documentos
 * =========================================================
 */
function DatosDocumentos({ rut: rutProp }) {
  const { rut: rutFromParams } = useParams();
  const rut = rutProp || rutFromParams;

  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedFolder, setSelectedFolder] = useState(null);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);

  const fetchDocuments = async () => {
    if (!rut) {
      setDocs([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("employee_documents")
      .select("*")
      .eq("rut", rut)
      .order("created_at", { ascending: false }); // ✅ TU COLUMNA REAL

    if (error) {
      console.error("Error al cargar documentos:", error);
      setDocs([]);
    } else {
      setDocs(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rut]);

  const groupedCounts = useMemo(() => {
    const counts = {};
    for (const f of FOLDERS) counts[f.key] = 0;

    for (const d of docs) {
      const cat = d.category || d.tag || "Otros";
      if (!counts[cat]) counts[cat] = 0;
      counts[cat] += 1;
    }
    return counts;
  }, [docs]);

  const docsInFolder = useMemo(() => {
    if (!selectedFolder) return [];
    return docs.filter((d) => {
      const cat = d.category || d.tag || "Otros";
      return cat === selectedFolder;
    });
  }, [docs, selectedFolder]);

  const getBucketAndPath = (doc) => {
    const bucket = (doc.bucket || DEFAULT_BUCKET).trim();
    const filePath = (doc.file_path || "").trim();
    return { bucket, filePath };
  };

  const handleView = async (doc) => {
    try {
      const { bucket, filePath } = getBucketAndPath(doc);
      if (!bucket || !filePath) throw new Error("Documento sin ruta/bucket.");

      const { data: signed, error: signedErr } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 60);

      if (!signedErr && signed?.signedUrl) {
        window.open(signed.signedUrl, "_blank", "noopener,noreferrer");
        return;
      }

      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(filePath);
      if (pub?.publicUrl) {
        window.open(pub.publicUrl, "_blank", "noopener,noreferrer");
        return;
      }

      throw new Error("No se pudo generar link para ver.");
    } catch (e) {
      console.error(e);
      alert("No se pudo abrir el documento.");
    }
  };

  const handleDownload = async (doc) => {
    try {
      const { bucket, filePath } = getBucketAndPath(doc);
      if (!bucket || !filePath) throw new Error("Documento sin ruta/bucket.");

      const { data, error } = await supabase.storage.from(bucket).download(filePath);
      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filePath.split("/").pop() || "documento";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert("No se pudo descargar el archivo.");
    }
  };

  const folderMeta = useMemo(() => {
    const map = {};
    for (const f of FOLDERS) map[f.key] = f;
    return map;
  }, []);

  const selectedFolderMeta = selectedFolder ? folderMeta[selectedFolder] : null;
  const isAsistenciaFolder = selectedFolder === "Asistencia / Evidencias";

  return (
    <div className={styles.page}>
      {/* Modales */}
      {isUploadModalOpen && (
        <DocumentModal
          rut={rut}
          onClose={() => setIsUploadModalOpen(false)}
          onSave={fetchDocuments}
          defaultCategory={selectedFolder && !isAsistenciaFolder ? selectedFolder : "Otros"}
        />
      )}

      {editingDocument && (
        <DocumentModal
          rut={rut}
          existingDocument={editingDocument}
          onClose={() => setEditingDocument(null)}
          onSave={fetchDocuments}
          defaultCategory={editingDocument?.category || "Otros"}
        />
      )}

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Documentos del Empleado</h2>

          <div className={styles.breadcrumb}>
            <span className={styles.bcItem}>Documentos</span>
            {selectedFolder && (
              <>
                <FiChevronRight />
                <span className={styles.bcCurrent}>{selectedFolder}</span>
              </>
            )}
          </div>
        </div>

        <button
          className={styles.uploadBtn}
          onClick={() => setIsUploadModalOpen(true)}
          disabled={!rut || isAsistenciaFolder}
          title={isAsistenciaFolder ? "Asistencia/Evidencias se genera automáticamente" : "Subir documento"}
        >
          <FiUpload /> Subir Documento
        </button>
      </div>

      {/* Vista: Carpetas */}
      {!selectedFolder && (
        <div className={styles.foldersWrap}>
          {FOLDERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={styles.folderRow}
              onClick={() => setSelectedFolder(f.key)}
            >
              <div className={styles.folderIcon}>
                <FiFolder />
              </div>

              <div className={styles.folderInfo}>
                <div className={styles.folderTitle}>{f.title}</div>
                <div className={styles.folderDesc}>{f.description}</div>
              </div>

              <div className={styles.folderCount}>{groupedCounts[f.key] || 0}</div>
            </button>
          ))}
        </div>
      )}

      {/* Vista: Dentro carpeta */}
      {selectedFolder && (
        <div className={styles.folderView}>
          <button type="button" className={styles.backBtn} onClick={() => setSelectedFolder(null)}>
            <FiArrowLeft /> Volver a carpetas
          </button>

          <div className={styles.folderHead}>
            <div className={styles.folderHeadLeft}>
              <div className={styles.folderIconBig}>
                <FiFolder />
              </div>
              <div>
                <div className={styles.folderHeadTitle}>{selectedFolderMeta?.title || selectedFolder}</div>
                <div className={styles.folderHeadDesc}>{selectedFolderMeta?.description || ""}</div>
              </div>
            </div>
            <div className={styles.folderHeadBadge}>{docsInFolder.length}</div>
          </div>

          {loading && <p className={styles.emptyText}>Cargando documentos...</p>}

          {!loading && docsInFolder.length === 0 && (
            <p className={styles.emptyText}>Sin documentos en esta carpeta.</p>
          )}

          {!loading && docsInFolder.length > 0 && (
            <div className={styles.docList}>
              {docsInFolder.map((doc) => {
                const fecha = doc.created_at
                  ? new Date(doc.created_at).toLocaleDateString("es-CL") // ✅ TU COLUMNA REAL
                  : "Fecha desconocida";

                const showEdit = !isAsistenciaFolder;

                return (
                  <div key={doc.id} className={styles.docRow}>
                    <div className={styles.docIcon}>
                      <FiFileText />
                    </div>

                    <div className={styles.docInfo}>
                      <div className={styles.docName}>{doc.display_name || "Documento"}</div>
                      <div className={styles.docMeta}>Subido el {fecha}</div>
                    </div>

                    <div className={styles.docActions}>
                      <DocMenu
                        showEdit={showEdit}
                        onView={() => handleView(doc)}
                        onDownload={() => handleDownload(doc)}
                        onEdit={() => setEditingDocument(doc)}
                      />
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
