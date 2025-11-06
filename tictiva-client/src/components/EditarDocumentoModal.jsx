import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { FiX, FiUploadCloud } from 'react-icons/fi';
import documentStyles from './DatosDocumentos.module.css';

// Usamos prop `document` pero lo renombramos internamente a `doc`
function EditarDocumentoModal({ onClose, onSuccess, document: doc, employeeRut }) {
  const [nombre, setNombre] = useState(doc?.display_name || '');
  const [descripcion, setDescripcion] = useState(doc?.description || '');
  const [tag, setTag] = useState(doc?.tag || '');
  const [file, setFile] = useState(null); // Nuevo archivo si se desea reemplazar
  const [isDragActive, setIsDragActive] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef(null);

  const documentTypes = [
    'Contractual',
    'Previsional',
    'Salud',
    'Educación',
    'Personal',
    'Legal',
    'General',
  ];

  // Resetea el formulario cuando el documento cambie
  useEffect(() => {
    if (doc) {
      setNombre(doc.display_name || '');
      setDescripcion(doc.description || '');
      setTag(doc.tag || '');
      setFile(null); // Limpiar archivo al cargar un nuevo documento para editar
      setError('');
    }
  }, [doc]);

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!doc || !doc.id) {
      setError('No se encontró el documento a editar.');
      return;
    }

    const rutParaPath = employeeRut || doc.rut;
    if (!rutParaPath) {
      setError('No se encontró el RUT del empleado para asociar el documento.');
      return;
    }

    if (!nombre || !tag) {
      setError('Por favor, completa el nombre y selecciona una etiqueta.');
      return;
    }

    setUpdating(true);

    try {
      let updatedFilePath = doc.file_path || null;

      // Si hay un nuevo archivo, subirlo y reemplazar el antiguo
      if (file) {
        // 1. Eliminar el archivo antiguo del storage si existe ruta
        if (doc.file_path) {
          const { error: removeError } = await supabase.storage
            .from('employee-documents')               // 👈 bucket correcto
            .remove([doc.file_path]);

          if (removeError) {
            console.warn(
              'Error al eliminar archivo antiguo del storage (puede que no exista o haya sido movido):',
              removeError.message
            );
            // No bloqueamos el proceso, solo advertimos
          }
        }

        // 2. Subir el nuevo archivo
        const fileExt = file.name.split('.').pop();
        const newFileName = `${Date.now()}.${fileExt}`;
        const newFilePath = `${rutParaPath}/${newFileName}`;

        const { error: uploadError } = await supabase.storage
          .from('employee-documents')                 // 👈 bucket correcto
          .upload(newFilePath, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          throw new Error(
            `Error al subir el nuevo archivo: ${uploadError.message}`
          );
        }

        updatedFilePath = newFilePath;
      }

      // 3. Actualizar el registro en la base de datos
      const { error: dbError } = await supabase
        .from('employee_documents')
        .update({
          display_name: nombre,
          description: descripcion,
          tag,
          file_path: updatedFilePath,
        })
        .eq('id', doc.id);

      if (dbError) {
        // Si falla la actualización en DB, intentar borrar el nuevo archivo si se subió
        if (file && updatedFilePath && updatedFilePath !== doc.file_path) {
          await supabase.storage
            .from('employee-documents')               // 👈 bucket correcto
            .remove([updatedFilePath]);
        }
        throw new Error(
          `Error al actualizar los datos del documento: ${dbError.message}`
        );
      }

      onSuccess(); // Refresca lista y cierra modal (lo manejas desde el padre)
    } catch (err) {
      console.error('Error al editar documento:', err.message);
      setError(err.message || 'Error desconocido al editar el documento.');
    } finally {
      setUpdating(false);
    }
  };

  if (!doc) {
    // Por si acaso el modal se abre sin documento
    return null;
  }

  const nombreArchivoActual = doc.file_path
    ? doc.file_path.split('/').pop()
    : 'No especificado';

  return (
    <div className={documentStyles.modalOverlay}>
      <div className={documentStyles.modalContent}>
        <button className={documentStyles.modalCloseButton} onClick={onClose}>
          <FiX />
        </button>
        <h2 className={documentStyles.modalTitle}>Editar Documento</h2>

        {error && (
          <p
            className={`${documentStyles.notification} ${documentStyles.error}`}
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className={documentStyles.modalForm}>
          <div className={documentStyles.modalFormField}>
            <label htmlFor="nombre">Nombre *</label>
            <input
              type="text"
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
          </div>

          <div className={documentStyles.modalFormField}>
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            ></textarea>
          </div>

          <div className={documentStyles.modalFormField}>
            <label htmlFor="tipoDocumento">Etiqueta (Tipo de Documento) *</label>
            <select
              id="tipoDocumento"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              required
            >
              <option value="">Seleccionar...</option>
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div
            className={`${documentStyles.dropzone} ${
              isDragActive ? documentStyles.dropzoneActive : ''
            }`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => {
              if (fileInputRef.current) {
                fileInputRef.current.click();
              }
            }}
          >
            <FiUploadCloud className={documentStyles.dropzoneIcon} />
            <p>Arrastra un nuevo archivo aquí para reemplazar el actual o haz clic.</p>
            {file ? (
              <p className={documentStyles.fileName}>
                Nuevo archivo: {file.name}
              </p>
            ) : (
              <p className={documentStyles.fileName}>
                Archivo actual: {nombreArchivoActual}
              </p>
            )}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
            />
          </div>

          <div className={documentStyles.modalActions}>
            <button
              type="button"
              className={`${documentStyles.modalButton} ${documentStyles.cancel}`}
              onClick={onClose}
              disabled={updating}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`${documentStyles.modalButton} ${documentStyles.primary}`}
              disabled={updating || !nombre || !tag}
            >
              {updating ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditarDocumentoModal;
