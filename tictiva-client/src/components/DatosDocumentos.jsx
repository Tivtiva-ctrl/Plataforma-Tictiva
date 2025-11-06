import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useParams } from 'react-router-dom';
import EditarDocumentoModal from './EditarDocumentoModal';
import styles from './DatosDocumentos.module.css';
import {
  FiFileText,
  FiUpload,
  FiX,
  FiPaperclip,
  FiEdit,
  FiDownload,
} from 'react-icons/fi';

// ===============================================
// === 1. EL POPUP (MODAL) PARA SUBIR DOCUMENTOS ===
// ===============================================
function UploadModal({ onClose, onSave, rut }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tag, setTag] = useState('General');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null); // Para mostrar errores

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSave = async () => {
    if (!file || !nombre || !rut) {
      setError('Por favor completa el nombre y selecciona un archivo.');
      return;
    }
    setIsUploading(true);
    setError(null);

    try {
      // 1. Creamos un path único (ej: 12.345.678-9/16788866.pdf)
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${rut}/${fileName}`;

      // 2. Subimos el archivo a Supabase Storage (al bucket que creaste)
      const { error: storageError } = await supabase.storage
        .from('employee-documents') // 👈 NOMBRE CORRECTO DEL BUCKET
        .upload(filePath, file);

      if (storageError) {
        throw storageError;
      }

      // 3. Guardamos la referencia en la Base de Datos (tu tabla)
      const { error: dbError } = await supabase.from('employee_documents').insert({
        rut,
        display_name: nombre,
        description: descripcion,
        tag,
        file_path: filePath, // ¡Guardamos el path del archivo!
      });

      if (dbError) {
        throw dbError;
      }

      setIsUploading(false);
      onSave(); // Recarga la lista
      onClose(); // Cierra modal
    } catch (error) {
      console.error('Error al subir documento:', error.message);
      setError('Error al subir el archivo: ' + (error.message || 'Error desconocido'));
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Subir Documento</h2>
          <button onClick={onClose} className={styles.closeButton}>
            <FiX />
          </button>
        </div>

        {/* Formulario del Modal */}
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
            <label htmlFor="tag">Etiqueta (para clasificar)</label>
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
          </div>

          <div className={styles.dropZone}>
            <FiPaperclip size={30} />
            {file ? (
              <p>
                Archivo seleccionado: <strong>{file.name}</strong>
              </p>
            ) : (
              <p>Haz clic o arrastra el documento hasta aquí.</p>
            )}
            <input type="file" onChange={handleFileChange} />
          </div>

          {/* Mostramos el error si existe */}
          {error && <p className={styles.modalError}>{error}</p>}
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelButton} disabled={isUploading}>
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className={styles.saveButton}
            disabled={isUploading || !file || !nombre}
          >
            {isUploading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===============================================
// === 2. EL COMPONENTE PRINCIPAL DE DOCUMENTOS ===
// ===============================================
function DatosDocumentos({ rut: rutProp }) {
  // Si no viene el rut por props, tomamos el de la URL (/empleado/:rut)
  const { rut: rutFromParams } = useParams();
  const rut = rutProp || rutFromParams;

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🔹 Estado para edición
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

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

  // Función para descargar
  const handleDownload = async (filePath) => {
    try {
      const { data, error } = await supabase.storage
        .from('employee-documents') // 👈 NOMBRE CORRECTO DEL BUCKET
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

  const handleOpenEditModal = (doc) => {
    setSelectedDoc(doc);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setSelectedDoc(null);
    setIsEditModalOpen(false);
  };

  const handleEditSuccess = () => {
    fetchDocuments();
    handleCloseEditModal();
  };

  return (
    <div className={styles.documentContainer}>
      {/* Modal de subida */}
      {isModalOpen && (
        <UploadModal
          rut={rut}
          onClose={() => setIsModalOpen(false)}
          onSave={fetchDocuments}
        />
      )}

      {/* Modal de edición */}
      {isEditModalOpen && selectedDoc && (
        <EditarDocumentoModal
          document={selectedDoc}
          employeeRut={rut}
          onClose={handleCloseEditModal}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Header con el botón "Subir" a la derecha */}
      <div className={styles.documentHeader}>
        <h2>Documentos del Empleado</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className={styles.uploadButton}
          disabled={!rut}
        >
          <FiUpload /> Subir Documento
        </button>
      </div>

      {/* Lista de Documentos */}
      <div className={styles.documentList}>
        {loading && <p>Cargando documentos...</p>}

        {!loading && documents.length === 0 && (
          <p>No hay documentos para este empleado.</p>
        )}

        {!loading &&
          documents.map((doc) => {
            const fecha = doc.uploaded_at
              ? new Date(doc.uploaded_at).toLocaleDateString('es-ES')
              : 'Fecha desconocida';

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
                    >
                      {doc.tag || 'Sin etiqueta'}
                    </span>
                  </small>
                </div>
                <div className={styles.fileActions}>
                  <button
                    className={styles.actionButtonEdit}
                    type="button"
                    onClick={() => handleOpenEditModal(doc)}
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
          })}
      </div>
    </div>
  );
}

export default DatosDocumentos;
