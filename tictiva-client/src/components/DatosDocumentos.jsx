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
  FiTrash2,
  FiFileText,
  FiChevronRight,
  FiArrowLeft,
} from "react-icons/fi";

/**
 * =========================================================
 * Constantes (NO CONFUNDIR)
 * - TABLE: tabla en Postgres
 * - BUCKET: bucket en Storage
 * =========================================================
 */
const DOCUMENTS_TABLE = "employee_documents"; // ✅ tabla (con guion bajo)
const DEFAULT_BUCKET = "employee-documents"; // ✅ bucket (con guion)

/**
 * =========================================================
 * Config de carpetas (Windows-like)
 * =========================================================
 */
const FOLDERS = [
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

/**
 * =========================================================
 * Helpers
 * =========================================================
 */
const normalizeCategory = (raw) => {
  const s = (raw || "").toString().trim();
  if (!s) return "Otros";

  const compact = s.toLowerCase().replace(/\s+/g, "");

  // Si venía la carpeta antigua de marcaciones, la mandamos a Otros
  if (compact === "asistencia/evidencias") return "Otros";
  if (s.replace(/\s+/g, "") === "Asistencia/Evidencias") return "Otros";
  if (s.toLowerCase() === "asistencia / evidencias") return "Otros";

  const valid = {
    contractual: "Contractual",
    previsional: "Previsional",
    personal: "Personal",
    salud: "Salud",
    otros: "Otros",
  };

  return valid[compact] || "Otros";
};

const formatDateCL = (iso) => {
  if (!iso) return "Fecha desconocida";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Fecha desconocida";
  return d.toLocaleDateString("es-CL");
};

/**
 * =========================================================
 * Menú de 3 puntitos (kebab) - inteligente (abre arriba si no cabe)
 * =========================================================
 */
function DocMenu({ showEdit, onView, onDownload, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState("down"); // "down" | "up"
  const ref = useRef(null);

  const toggle = () => setOpen((v) => !v);

  // Cierra con ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Cierra con click/tap afuera (NO con scroll)
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Decide abrir arriba o abajo según espacio visible
  useEffect(() => {
    if (!open) return;
    const el = ref.current;
    if (!el) return;

    const menuHeight = 200; // aprox
    const margin = 12;

    const rect = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < menuHeight + margin && spaceAbove > menuHeight + margin) {
      setDirection("up");
    } else {
      setDirection("down");
    }
  }, [open]);

  return (
    <div className={styles.menuWrap} ref={ref}>
      <button
        type="button"
        className={styles.kebabButton}
        onClick={toggle}
        aria-label="Más opciones"
        title="Más opciones"
      >
        <FiMoreHorizontal />
      </button>

      {open && (
        <div
          className={styles.menu}
          style={
            direction === "up"
              ? { top: "auto", bottom: "46px" }
              : { top: "46px", bottom: "auto" }
          }
        >
          <button
            type="button"
            className={styles.menuItem}
            onClick={() => {
              setOpen(false);
              onView?.();
            }}
          >
            <FiEye /> Ver
          </button>

          <button
            type="button"
            className={styles.menuItem}
            onClick={() => {
              setOpen(false);
              onDownload?.();
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
                onEdit?.();
              }}
            >
              <FiEdit /> Editar
            </button>
          )}

          <button
            type="button"
            className={styles.menuItem}
            onClick={() => {
              setOpen(false);
              onDelete?.();
            }}
            title="Eliminar documento"
          >
            <FiTrash2 /> Eliminar
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * =========================================================
 * Modal para SUBIR o EDITAR documento
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
  const [category, setCategory] = useState(
    normalizeCategory(existingDocument?.category || defaultCategory)
  );
  const [tag, setTag] = useState(normalizeCategory(existingDocument?.tag || defaultCategory));
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
      const bucket = DEFAULT_BUCKET;
      let filePath = existingDocument?.file_path || null;

      // Si se sube/reemplaza archivo => storage
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

      const cleanCategory = normalizeCategory(category);
      const cleanTag = normalizeCategory(tag);

      const documentData = {
        rut,
        display_name: nombre,
        description: descripcion,
        category: cleanCategory,
        tag: cleanTag,
        bucket,
        file_path: filePath,
      };

      // ✅ OJO: aquí es TABLA, no bucket
      if (isEditing) {
        const { error: dbError } = await supabase
          .from(DOCUMENTS_TABLE)
          .update(documentData)
          .eq("id", existingDocument.id);

        if (dbError) throw new Error(`Error al actualizar: ${dbError.message}`);
      } else {
        const { error: dbError } = await supabase.from(DOCUMENTS_TABLE).insert({
          ...documentData,
          created_at: new Date().toISOString(),
        });

        if (dbError) throw new Error(`Error al guardar: ${dbError.message}`);
      }

      await onSave();
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
                  * Los comprobantes de asistencia se gestionan desde el módulo de Asistencia.
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
 * Vista principal
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

    // ✅ OJO: aquí es TABLA, no bucket
    const { data, error } = await supabase
      .from(DOCUMENTS_TABLE)
      .select("*")
      .eq("rut", rut)
      .order("created_at", { ascending: false });

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

  const folderMeta = useMemo(() => {
    const map = {};
    for (const f of FOLDERS) map[f.key] = f;
    return map;
  }, []);

  const selectedFolderKey = selectedFolder ? normalizeCategory(selectedFolder) : null;
  const selectedFolderMeta = selectedFolderKey ? folderMeta[selectedFolderKey] : null;
  const isReadOnlyFolder = !!selectedFolderMeta?.readOnly;

  const groupedCounts = useMemo(() => {
    const counts = {};
    for (const f of FOLDERS) counts[f.key] = 0;

    for (const d of docs) {
      const cat = normalizeCategory(d.category || d.tag || "Otros");
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [docs]);

  const docsInFolder = useMemo(() => {
    if (!selectedFolderKey) return [];
    return docs.filter(
      (d) => normalizeCategory(d.category || d.tag || "Otros") === selectedFolderKey
    );
  }, [docs, selectedFolderKey]);

  const getBucketAndPath = (doc) => {
    const bucket = (doc.bucket || DEFAULT_BUCKET).trim();
    const filePath = (doc.file_path || "").trim();
    return { bucket, filePath };
  };

  const handleView = async (doc) => {
    try {
      const { bucket, filePath } = getBucketAndPath(doc);
      if (!bucket || !filePath) throw new Error("Documento sin ruta/bucket.");

      // 1) Intento signed URL (sirve incluso si el bucket no es public)
      const { data: signed, error: signedErr } = await supabase.storage
        .from(bucket)
        .createSignedUrl(filePath, 60);

      if (!signedErr && signed?.signedUrl) {
        window.open(signed.signedUrl, "_blank", "noopener,noreferrer");
        return;
      }

      // 2) Fallback public URL (si el bucket es public)
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

  const handleDelete = async (doc) => {
    const name = doc?.display_name || "Documento";
    const ok = window.confirm(`¿Eliminar "${name}"?\n\nEsta acción no se puede deshacer.`);
    if (!ok) return;

    try {
      if (!doc?.id) {
        console.error("Documento sin id:", doc);
        alert("No se pudo eliminar: el documento no tiene ID.");
        return;
      }

      // 1) Storage (si hay ruta)
      const { bucket, filePath } = getBucketAndPath(doc);
      if (bucket && filePath) {
        const { error: removeErr } = await supabase.storage.from(bucket).remove([filePath]);
        if (removeErr) console.warn("Storage remove error:", removeErr);
      }

      // 2) DB (tabla correcta)
      const { data: deleted, error: dbErr } = await supabase
        .from(DOCUMENTS_TABLE)
        .delete()
        .eq("id", doc.id)
        .select("id");

      if (dbErr) {
        console.error("DB delete error:", dbErr);
        alert(`No se pudo eliminar (DB): ${dbErr.message}`);
        return;
      }

      if (!deleted || deleted.length === 0) {
        console.warn("Delete no borró filas. Probable RLS.", doc.id);
        alert("No se eliminó nada. Probable bloqueo por permisos (RLS).");
        return;
      }

      // 3) UI
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
      await fetchDocuments();
    } catch (e) {
      console.error("Delete catch:", e);
      alert("No se pudo eliminar el documento.");
    }
  };

  return (
    <div className={styles.documentContainer}>
      {isUploadModalOpen && (
        <DocumentModal
          rut={rut}
          onClose={() => setIsUploadModalOpen(false)}
          onSave={fetchDocuments}
          defaultCategory={selectedFolderKey && !isReadOnlyFolder ? selectedFolderKey : "Otros"}
        />
      )}

      {editingDocument && (
        <DocumentModal
          rut={rut}
          existingDocument={editingDocument}
          onClose={() => setEditingDocument(null)}
          onSave={fetchDocuments}
          defaultCategory={normalizeCategory(editingDocument?.category || "Otros")}
        />
      )}

      <div className={styles.headerRow}>
        <div>
          <h2 className={styles.pageTitle}>Documentos del Empleado</h2>

          <div className={styles.breadcrumb}>
            <span
              className={styles.crumb}
              onClick={() => setSelectedFolder(null)}
              role="button"
              tabIndex={0}
            >
              Documentos
            </span>

            {selectedFolderKey && (
              <>
                <FiChevronRight />
                <span className={styles.crumbActive}>{selectedFolderKey}</span>
              </>
            )}
          </div>
        </div>

        <button
          className={styles.uploadButton}
          onClick={() => setIsUploadModalOpen(true)}
          disabled={!rut}
          title={!rut ? "No se encontró el RUT del empleado" : "Subir documento"}
        >
          <FiUpload /> Subir Documento
        </button>
      </div>

      {!selectedFolderKey && (
        <div className={styles.foldersList}>
          {FOLDERS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={styles.folderRow}
              onClick={() => setSelectedFolder(f.key)}
            >
              <div className={styles.folderIcon} aria-hidden="true" />

              <div className={styles.folderText}>
                <div className={styles.folderTitleRow}>
                  <div className={styles.folderTitle}>{f.title}</div>
                  <div className={styles.folderCount}>{groupedCounts[f.key] || 0}</div>
                </div>
                <div className={styles.folderSubtitle}>{f.description}</div>
              </div>

              <div className={styles.folderChevron}>
                <FiChevronRight />
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedFolderKey && (
        <div className={styles.folderDetail}>
          <button
            type="button"
            className={styles.backButton}
            onClick={() => setSelectedFolder(null)}
          >
            <FiArrowLeft /> Volver a carpetas
          </button>

          {loading && <p className={styles.muted}>Cargando documentos...</p>}

          {!loading && docsInFolder.length === 0 && (
            <div className={styles.emptyFolder}>
              <div className={styles.emptyIcon} aria-hidden="true" />
              <div>
                <div className={styles.emptyTitle}>Sin documentos</div>
                <div className={styles.emptySub}>No hay documentos en esta carpeta.</div>
              </div>
            </div>
          )}

          {!loading && docsInFolder.length > 0 && (
            <div className={styles.documentList}>
              {docsInFolder.map((doc) => {
                const fecha = formatDateCL(doc.created_at);
                const showEdit = !isReadOnlyFolder;

                return (
                  <div key={doc.id} className={styles.documentItem}>
                    <div className={styles.fileIcon}>
                      <FiFileText />
                    </div>

                    <div className={styles.fileInfo}>
                      <strong>{doc.display_name || "Documento"}</strong>
                      <div className={styles.fileMeta}>
                        <span>Subido el {fecha}</span>
                      </div>
                    </div>

                    <div className={styles.fileActions}>
                      <DocMenu
                        showEdit={showEdit}
                        onView={() => handleView(doc)}
                        onDownload={() => handleDownload(doc)}
                        onEdit={() => setEditingDocument(doc)}
                        onDelete={() => handleDelete(doc)}
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
