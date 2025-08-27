import React from "react";
import "./SubirDocumentoModal.css";

export default function SubirDocumentoModal({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-pushup">
        <h2>📎 Subir documento</h2>
        <p>Completa los datos y adjunta el documento para guardarlo en la carpeta seleccionada.</p>

        <form className="form-subida">
          <div className="campo">
            <label>Nombre *</label>
            <input type="text" placeholder="Ej: Contrato Indefinido" />
          </div>

          <div className="campo">
            <label>Descripción</label>
            <textarea placeholder="Descripción breve del documento" />
          </div>

          <div className="campo">
            <label>Seleccionar carpeta</label>
            <select>
              <option>Seleccionar categoría</option>
              <option>Contrato y Anexos</option>
              <option>Documentación Personal</option>
              <option>Ficha Previsional y Bancaria</option>
              <option>Salud y Seguridad Laboral</option>
              <option>Permisos y Descansos</option>
              <option>Otros Documentos</option>
            </select>
          </div>

          <div className="campo">
            <label>📄 Documento</label>
            <div className="file-drop">Haz clic o arrastra el documento aquí.</div>
          </div>

          <div className="botones-modal">
            <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-guardar">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
