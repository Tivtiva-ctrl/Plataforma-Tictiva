// src/pages/RepositorioDocs.jsx
import React, { useEffect, useMemo, useState } from "react";
import HRSubnav from "../components/HRSubnav";
import "./RepoDocs.css";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";

export default function RepositorioDocs() {
  const [folders, setFolders] = useState([]);
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [q, setQ] = useState("");
  const [fCat, setFCat] = useState("Todas");
  const [fFolder, setFFolder] = useState("Todas");
  const [activeFolder, setActiveFolder] = useState(null);

  // Modales
  const [openUpload, setOpenUpload] = useState(false);
  const [openNewFolder, setOpenNewFolder] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null); // {id, nombre}
  const [upload, setUpload] = useState({
    nombre: "",
    descripcion: "",
    carpeta: "",
    categoria: "",
    etiquetas: "",
    version: "1.0",
    vence: "",
    url: ""
  });
  const [newFolderName, setNewFolderName] = useState("");

  // Cargar datos
  const loadAll = async () => {
    setLoading(true);
    try {
      const [rf, rd] = await Promise.all([
        fetch(`${API}/repo_folders`).then(r => r.json()),
        fetch(`${API}/repo_docs`).then(r => r.json())
      ]);
      setFolders(Array.isArray(rf) ? rf : []);
      setDocs(Array.isArray(rd) ? rd : []);
    } catch (e) {
      console.error("Repositorio: no se pudo cargar", e);
      setFolders([]);
      setDocs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Derivados
  const categorias = useMemo(() => {
    const set = new Set();
    docs.forEach(d => d?.categoria && set.add(d.categoria));
    return ["Todas", ...Array.from(set)];
  }, [docs]);

  const foldersSelect = useMemo(() => ["Todas", ...folders.map(f => f.nombre)], [folders]);

  const docsFiltrados = useMemo(() => {
    let list = [...docs];
    if (q.trim()) {
      const t = q.trim().toLowerCase();
      list = list.filter(d =>
        `${d.nombre} ${d.descripcion || ""} ${d.carpeta || ""} ${d.categoria || ""} ${(d.etiquetas || []).join(" ")}`
          .toLowerCase()
          .includes(t)
      );
    }
    const filtroFolder = activeFolder || (fFolder !== "Todas" ? fFolder : null);
    if (filtroFolder) list = list.filter(d => (d.carpeta || "") === filtroFolder);
    if (fCat !== "Todas") list = list.filter(d => (d.categoria || "") === fCat);
    return list;
  }, [docs, q, fCat, fFolder, activeFolder]);

  const countDocsIn = (folderName) => docs.filter(d => (d.carpeta || "") === folderName).length;

  // Acciones
  const handleOpenUpload = () => {
    setUpload({
      nombre: "",
      descripcion: "",
      carpeta: activeFolder || "",
      categoria: "",
      etiquetas: "",
      version: "1.0",
      vence: "",
      url: ""
    });
    setOpenUpload(true);
  };

  const saveUpload = async () => {
    const carpetaDef =
      upload.carpeta ||
      activeFolder ||
      (folders[0]?.nombre || "Otros Documentos");

    const payload = {
      id: `r-${Date.now()}`,
      nombre: upload.nombre || "Documento sin título",
      descripcion: upload.descripcion || "",
      carpeta: carpetaDef,
      categoria: upload.categoria || "",
      etiquetas: (upload.etiquetas || "")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean),
      version: upload.version || "1.0",
      vence: upload.vence || "",
      url: upload.url || "",
      actualizadoTs: new Date().toISOString().slice(0, 16).replace("T", " ")
    };
    try {
      await fetch(`${API}/repo_docs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setDocs(p => [payload, ...p]);
      setOpenUpload(false);
    } catch (e) {
      console.error("No se pudo crear doc", e);
      alert("No se pudo crear el documento");
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;
    const payload = { id: `f-${Date.now()}`, nombre: newFolderName.trim() };
    try {
      await fetch(`${API}/repo_folders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setFolders(p => [...p, payload]);
      setActiveFolder(payload.nombre);
      setNewFolderName("");
      setOpenNewFolder(false);
    } catch (e) {
      console.error("No se pudo crear carpeta", e);
      alert("No se pudo crear la carpeta");
    }
  };

  const askRenameFolder = (folder) => setRenameTarget(folder);

  const applyRenameFolder = async () => {
    if (!renameTarget) return;
    const { id, nombre: oldName } = renameTarget;
    const input = document.getElementById("rename-folder-input");
    const newName = (input?.value || "").trim();
    if (!newName || newName === oldName) {
      setRenameTarget(null);
      return;
    }
    try {
      // 1) renombrar carpeta
      await fetch(`${API}/repo_folders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: newName })
      });

      // 2) actualizar docs que estén en esa carpeta
      const affected = docs.filter(d => (d.carpeta || "") === oldName);
      for (const d of affected) {
        await fetch(`${API}/repo_docs/${d.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ carpeta: newName })
        });
      }

      // 3) actualizar estado local
      setFolders(p => p.map(f => (f.id === id ? { ...f, nombre: newName } : f)));
      setDocs(p => p.map(d => (d.carpeta === oldName ? { ...d, carpeta: newName } : d)));
      if (activeFolder === oldName) setActiveFolder(newName);
    } catch (e) {
      console.error("No se pudo renombrar carpeta", e);
      alert("No se pudo renombrar la carpeta");
    } finally {
      setRenameTarget(null);
    }
  };

  const deleteDoc = async (doc) => {
    if (!confirm(`¿Eliminar "${doc.nombre}"?`)) return;
    try {
      await fetch(`${API}/repo_docs/${doc.id}`, { method: "DELETE" });
      setDocs(p => p.filter(d => d.id !== doc.id));
    } catch (e) {
      console.error("No se pudo eliminar", e);
      alert("No se pudo eliminar el documento");
    }
  };

  const resetFilters = () => {
    setQ("");
    setFCat("Todas");
    setFFolder("Todas");
    setActiveFolder(null);
  };

  return (
    <div className="repo-wrap">
      <HRSubnav />

      {/* Header */}
      <div className="repo-header">
        <div>
          <h1 className="repo-title">Repositorio Documental</h1>
          <p className="repo-sub">
            Archivador de documentos de la empresa (políticas, reglamentos, plantillas,
            contratos-tipo, comunicados y más).
          </p>
        </div>
        <div className="repo-actions">
          <input
            className="repo-input"
            placeholder="Buscar por nombre, texto o etiqueta"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="repo-btn ghost" onClick={() => setOpenNewFolder(true)}>
            + Carpeta
          </button>
          <button className="repo-btn primary" onClick={handleOpenUpload}>
            + Subir documento
          </button>
        </div>
      </div>

      {/* Folders grid */}
      <div className="repo-grid">
        {folders.map((f) => (
          <div
            key={f.id}
            className={`repo-card ${activeFolder === f.nombre ? "is-active" : ""}`}
            onClick={() => setActiveFolder(f.nombre)}
            title="Click para filtrar por esta carpeta"
          >
            <div className="repo-card-emoji">📁</div>
            <div>
              <div className="repo-card-title">{f.nombre}</div>
              <div className="repo-card-small">{countDocsIn(f.nombre)} documentos</div>
            </div>
            <button
              className="repo-card-rename"
              onClick={(e) => {
                e.stopPropagation();
                askRenameFolder(f);
              }}
              title="Renombrar carpeta"
            >
              ✎
            </button>
          </div>
        ))}
      </div>

      {/* Listado (7 columnas para calzar con RepoDocs.css) */}
      <div className="repo-card-full">
        <div className="repo-filters">
          <select
            className="repo-input"
            value={fFolder}
            onChange={(e) => {
              setFFolder(e.target.value);
              setActiveFolder(null); // evitar conflicto con activeFolder
            }}
          >
            {foldersSelect.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
          <select className="repo-input" value={fCat} onChange={(e) => setFCat(e.target.value)}>
            {categorias.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <div className="repo-spacer" />
          <button className="repo-btn ghost" onClick={resetFilters}>Limpiar filtros</button>
        </div>

        <div className="repo-table">
          <div className="repo-tr repo-th">
            <div>Nombre / Descripción</div>
            <div>Carpeta</div>
            <div>Categoría</div>
            <div>Etiquetas</div>
            <div>Versión</div>
            <div>Vence</div>
            <div>Acciones</div>
          </div>

          {loading && <div className="repo-empty">Cargando…</div>}

          {!loading && docsFiltrados.length === 0 && (
            <div className="repo-empty">Sin documentos que coincidan.</div>
          )}

          {!loading &&
            docsFiltrados.map((d) => (
              <div key={d.id} className="repo-tr">
                <div>
                  <div className="repo-doc-name">{d.nombre}</div>
                  {d.descripcion && <div className="repo-doc-desc">{d.descripcion}</div>}
                </div>
                <div>{d.carpeta || "—"}</div>
                <div>{d.categoria || "—"}</div>
                <div>
                  {(d.etiquetas || []).map((t, i) => (
                    <span key={i} className="repo-tag">#{t}</span>
                  ))}
                </div>
                <div>{d.version || "—"}</div>
                <div>{d.vence || "—"}</div>
                <div className="actions">
                  {d.url ? (
                    <a className="repo-icon" href={d.url} target="_blank" rel="noreferrer" title="Abrir">
                      👁️
                    </a>
                  ) : (
                    <button className="repo-icon" onClick={() => alert("Documento sin URL")} title="Abrir">👁️</button>
                  )}
                  <button
                    className="repo-icon"
                    onClick={() => navigator.clipboard?.writeText(d.url || "")}
                    title="Copiar enlace"
                  >
                    📋
                  </button>
                  <button className="repo-icon danger" onClick={() => deleteDoc(d)} title="Eliminar">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Aviso si no existe colección */}
      {!loading && folders.length === 0 && docs.length === 0 && (
        <div className="repo-alert">
          No se encontró colección para el Repositorio. Crea <b>"repo_folders"</b> y <b>"repo_docs"</b> en <code>db.json</code>.
        </div>
      )}

      {/* Modal: subir documento */}
      {openUpload && (
        <>
          <div className="repo-backdrop" onClick={() => setOpenUpload(false)} />
          <div className="repo-modal">
            <div className="repo-modal-head">
              <h3>Subir documento</h3>
              <button className="repo-x" onClick={() => setOpenUpload(false)}>✖</button>
            </div>
            <div className="repo-modal-body">
              <label className="repo-label">Nombre*</label>
              <input
                className="repo-input"
                value={upload.nombre}
                onChange={(e) => setUpload({ ...upload, nombre: e.target.value })}
              />

              <label className="repo-label">Descripción</label>
              <textarea
                className="repo-input"
                rows={3}
                value={upload.descripcion}
                onChange={(e) => setUpload({ ...upload, descripcion: e.target.value })}
              />

              <div className="repo-grid-3">
                <div>
                  <label className="repo-label">Carpeta*</label>
                  <select
                    className="repo-input"
                    value={upload.carpeta}
                    onChange={(e) => setUpload({ ...upload, carpeta: e.target.value })}
                  >
                    <option value="">— Selecciona carpeta —</option>
                    {folders.map(f => <option key={f.id} value={f.nombre}>{f.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="repo-label">Categoría</label>
                  <input
                    className="repo-input"
                    value={upload.categoria}
                    onChange={(e) => setUpload({ ...upload, categoria: e.target.value })}
                  />
                </div>
                <div>
                  <label className="repo-label">Versión</label>
                  <input
                    className="repo-input"
                    value={upload.version}
                    onChange={(e) => setUpload({ ...upload, version: e.target.value })}
                  />
                </div>
              </div>

              <div className="repo-grid-2">
                <div>
                  <label className="repo-label">Vence</label>
                  <input
                    type="date"
                    className="repo-input"
                    value={upload.vence}
                    onChange={(e) => setUpload({ ...upload, vence: e.target.value })}
                  />
                </div>
                <div>
                  <label className="repo-label">URL (si aplica)</label>
                  <input
                    className="repo-input"
                    placeholder="https://..."
                    value={upload.url}
                    onChange={(e) => setUpload({ ...upload, url: e.target.value })}
                  />
                </div>
              </div>

              <label className="repo-label">Etiquetas (coma separadas)</label>
              <input
                className="repo-input"
                placeholder="reglamento, seguridad, interno"
                value={upload.etiquetas}
                onChange={(e) => setUpload({ ...upload, etiquetas: e.target.value })}
              />
            </div>
            <div className="repo-modal-foot">
              <button className="repo-btn ghost" onClick={() => setOpenUpload(false)}>Cancelar</button>
              <button className="repo-btn primary" onClick={saveUpload}>Guardar</button>
            </div>
          </div>
        </>
      )}

      {/* Modal: nueva carpeta */}
      {openNewFolder && (
        <>
          <div className="repo-backdrop" onClick={() => setOpenNewFolder(false)} />
          <div className="repo-modal">
            <div className="repo-modal-head">
              <h3>Nueva carpeta</h3>
              <button className="repo-x" onClick={() => setOpenNewFolder(false)}>✖</button>
            </div>
            <div className="repo-modal-body">
              <label className="repo-label">Nombre de la carpeta*</label>
              <input
                className="repo-input"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
            </div>
            <div className="repo-modal-foot">
              <button className="repo-btn ghost" onClick={() => setOpenNewFolder(false)}>Cancelar</button>
              <button className="repo-btn primary" onClick={createFolder}>Crear</button>
            </div>
          </div>
        </>
      )}

      {/* Modal: renombrar carpeta */}
      {renameTarget && (
        <>
          <div className="repo-backdrop" onClick={() => setRenameTarget(null)} />
          <div className="repo-modal">
            <div className="repo-modal-head">
              <h3>Renombrar carpeta</h3>
              <button className="repo-x" onClick={() => setRenameTarget(null)}>✖</button>
            </div>
            <div className="repo-modal-body">
              <label className="repo-label">Nombre actual</label>
              <div className="repo-input" style={{ background: "#f9fafb" }}>{renameTarget.nombre}</div>
              <label className="repo-label">Nuevo nombre*</label>
              <input id="rename-folder-input" className="repo-input" defaultValue={renameTarget.nombre} />
              <p className="repo-sub" style={{ marginTop: 6 }}>
                Se actualizarán los documentos asignados a esta carpeta.
              </p>
            </div>
            <div className="repo-modal-foot">
              <button className="repo-btn ghost" onClick={() => setRenameTarget(null)}>Cancelar</button>
              <button className="repo-btn primary" onClick={applyRenameFolder}>Guardar</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
