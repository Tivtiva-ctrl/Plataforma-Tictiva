// src/components/DocumentosTab.jsx
import React, { useState, useEffect } from "react";
import "../pages/EmpleadoDetalle.css";

const categorias = [
  { key: "contrato", nombre: "Contrato y Anexos", icono: "📑" },
  { key: "personal", nombre: "Documentación Personal", icono: "👤" },
  { key: "previsional", nombre: "Ficha Previsional y Bancaria", icono: "💳" },
  { key: "salud", nombre: "Salud y Seguridad Laboral", icono: "🛡️" },
  { key: "permisos", nombre: "Permisos y Descansos", icono: "📆" },
  { key: "otros", nombre: "Otros Documentos", icono: "📂" },
];

export default function DocumentosTab({ rut, modoEdicion }) {
  const [documentos, setDocumentos] = useState({});
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modalPreview, setModalPreview] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [nombreDoc, setNombreDoc] = useState("");
  const [descripcionDoc, setDescripcionDoc] = useState("");
  const [archivo, setArchivo] = useState(null);

  useEffect(() => {
    const docsEjemplo = {
      contrato: [
        {
          nombre: "Contrato Indefinido",
          descripcion: "Contrato base firmado",
          archivo: "contrato.pdf",
          fecha: "3 de jul. de 2025 19:30",
          usuario: "Veronica Mateo",
        },
      ],
      personal: [
        {
          nombre: "Certificado Nacimiento",
          descripcion: "Documento oficial",
          archivo: "certificado_nacimiento.pdf",
          fecha: "4 de jul. de 2025 10:00",
          usuario: "Veronica Mateo",
        },
      ],
    };
    setDocumentos(docsEjemplo);
  }, [rut]);

  const guardarDocumento = () => {
    if (!nombreDoc || !categoriaSeleccionada || !archivo) {
      alert("Completa todos los campos y selecciona un archivo");
      return;
    }
    const nuevoDoc = {
      nombre: nombreDoc,
      descripcion: descripcionDoc,
      archivo: archivo.name,
      fecha: new Date().toLocaleString(),
      usuario: "Veronica Mateo",
    };
    setDocumentos((prev) => ({
      ...prev,
      [categoriaSeleccionada]: [...(prev[categoriaSeleccionada] || []), nuevoDoc],
    }));
    setMostrarModal(false);
    setNombreDoc("");
    setDescripcionDoc("");
    setCategoriaSeleccionada("");
    setArchivo(null);
  };

  const eliminarDocumento = (catKey, index) => {
    setDocumentos((prev) => ({
      ...prev,
      [catKey]: prev[catKey].filter((_, i) => i !== index),
    }));
  };

  const descargarDocumento = (doc) => {
    const link = document.createElement("a");
    link.href = `/documentos/${doc.archivo}`;
    link.download = doc.archivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const verDocumento = (doc) => setModalPreview(doc);
  const volverACategorias = () => setCategoriaSeleccionada(null);

  const handleFieldChange = (catKey, index, field, value) => {
    setDocumentos((prev) => {
      const nuevos = { ...prev };
      nuevos[catKey][index][field] = value;
      return nuevos;
    });
  };

  return (
    <div className="detalle-card-datos">
      <div className="documentos-header">
        <div>
          <h3 className="titulo-datos">📂 Documentos Digitales</h3>
          <p className="descripcion-docs">
            Todos los documentos del colaborador organizados por categorías
          </p>
        </div>
        {!categoriaSeleccionada && (
          <button className="btn-editar" onClick={() => setMostrarModal(true)}>
            ⬆ Subir documento
          </button>
        )}
      </div>

      {categoriaSeleccionada ? (
        <>
          <button className="btn-volver" onClick={volverACategorias}>← Volver</button>
          <h4 style={{ marginTop: "10px" }}>
            {categorias.find((c) => c.key === categoriaSeleccionada)?.nombre}
          </h4>
          <div className="lista-documentos">
            {documentos[categoriaSeleccionada]?.length > 0 ? (
              documentos[categoriaSeleccionada].map((doc, index) => (
                <div key={index} className="documento-card-item">
                  <div className="doc-icon">📄</div>
                  <div className="doc-info">
                    {modoEdicion ? (
                      <>
                        <input
                          value={doc.nombre}
                          onChange={(e) =>
                            handleFieldChange(
                              categoriaSeleccionada,
                              index,
                              "nombre",
                              e.target.value
                            )
                          }
                        />
                        <textarea
                          value={doc.descripcion}
                          onChange={(e) =>
                            handleFieldChange(
                              categoriaSeleccionada,
                              index,
                              "descripcion",
                              e.target.value
                            )
                          }
                        />
                      </>
                    ) : (
                      <>
                        <strong>{doc.nombre}</strong>
                        <p>
                          Subido por: {doc.usuario} - {doc.fecha} - Documento: Público
                        </p>
                      </>
                    )}
                  </div>
                  <div className="doc-actions">
                    {!modoEdicion && (
                      <>
                        <button
                          title="Ver documento"
                          onClick={() => verDocumento(doc)}
                        >
                          👁
                        </button>
                        <button
                          title="Descargar"
                          onClick={() => descargarDocumento(doc)}
                        >
                          ⬇
                        </button>
                      </>
                    )}
                    <button
                      title="Eliminar"
                      onClick={() => eliminarDocumento(categoriaSeleccionada, index)}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No hay documentos en esta categoría</p>
            )}
          </div>
        </>
      ) : (
        <div className="documentos-grid tarjetas-categorias">
          {categorias.map((cat) => (
            <div
              key={cat.key}
              className="documento-card tarjeta"
              onClick={() => setCategoriaSeleccionada(cat.key)}
            >
              <div className="tarjeta-icono">{cat.icono}</div>
              <div className="tarjeta-info">
                <strong>{cat.nombre}</strong>
                <span>{(documentos[cat.key]?.length || 0)} documentos</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de subir documento */}
      {mostrarModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-pushpop">
            <button className="modal-close" onClick={() => setMostrarModal(false)}>
              ✖
            </button>
            <h2 className="modal-title">Subir documento</h2>
            <p className="modal-subtitle">
              Completa los datos y adjunta el documento para guardarlo en la
              carpeta seleccionada.
            </p>
            <div className="modal-form">
              <label>Nombre *</label>
              <input
                type="text"
                value={nombreDoc}
                onChange={(e) => setNombreDoc(e.target.value)}
                placeholder="Ej: Contrato Indefinido"
                required
              />
              <label>Descripción</label>
              <textarea
                value={descripcionDoc}
                onChange={(e) => setDescripcionDoc(e.target.value)}
                placeholder="Descripción breve del documento"
              ></textarea>
              <label>Seleccionar carpeta</label>
              <select
                value={categoriaSeleccionada || ""}
                onChange={(e) => setCategoriaSeleccionada(e.target.value)}
              >
                <option value="">Seleccionar categoría</option>
                {categorias.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              <div
                className="dropzone"
                onClick={() => document.getElementById("fileInput").click()}
              >
                <input
                  id="fileInput"
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => setArchivo(e.target.files[0])}
                />
                {archivo ? (
                  <span>{archivo.name}</span>
                ) : (
                  <span>Haz clic o arrastra el documento aquí.</span>
                )}
              </div>
            </div>
            <div className="modal-buttons">
              <button
                className="btn-cancelar"
                onClick={() => setMostrarModal(false)}
              >
                Cancelar
              </button>
              <button className="btn-guardar" onClick={guardarDocumento}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de vista previa */}
      {modalPreview && (
        <div className="modal-overlay">
          <div className="modal-content modal-pushpop">
            <button className="modal-close" onClick={() => setModalPreview(null)}>
              ✖
            </button>
            <h3>{modalPreview.nombre}</h3>
            <p>{modalPreview.descripcion}</p>
            <iframe
              title="Vista previa"
              src="https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf"
              style={{ width: "100%", height: "400px" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
