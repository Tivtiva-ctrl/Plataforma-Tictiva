import React from 'react';
import { FiX } from 'react-icons/fi';
import documentStyles from './DatosDocumentos.module.css';

function VisualizadorPDF({ pdfUrl, onClose }) {
  if (!pdfUrl) return null;

  return (
    <div className={documentStyles.pdfViewerOverlay}>
      <div className={documentStyles.pdfViewerContent}>
        <button className={documentStyles.modalCloseButton} onClick={onClose}>
          <FiX />
        </button>
        <iframe
          src={pdfUrl}
          title="Vista previa del documento"
          className={documentStyles.pdfIframe}
        />
      </div>
    </div>
  );
}

export default VisualizadorPDF;

