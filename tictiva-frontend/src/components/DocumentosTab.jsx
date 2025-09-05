// src/components/DocumentosTab.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/* ============ Iconos livianos (sin libs) ============ */
const IcoFolder = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const IcoFile = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" strokeWidth="2" />
    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const IcoDots = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <circle cx="6" cy="12" r="1.5" fill="currentColor" />
    <circle cx="18" cy="12" r="1.5" fill="currentColor" />
  </svg>
);
const IcoPlusFolder = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M4 7h6l2 2h8v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" />
    <path d="M12 11v6M9 14h6" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const IcoUpload = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" />
    <path d="M7 9l5-5 5 5M12 4v12" stroke="currentColor" strokeWidth="2" />
  </svg>
);

/* ============ Utils ============ */
const todayISO = () => new Date().toISOString().slice(0, 10);
const formatBytes = (bytes) => {
  if (typeof bytes !== "number") return "—";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};
const ext = (name = "") => name.split(".").pop()?.toLowerCase() || "";

/* ============ Datos demo si no llegan por props ============ */
const demoItems = [
  { id: "f1", type: "folder", name: "Contratos", modified: "2025-08-15", size: null },
  { id: "f2", type: "folder", name: "Liquidaciones de Sueldo", modified: "2025-09-01", size: null },
  { id: "f3", type: "folder", name: "Certificados", modified: "2025-07-30", size: null },
  { id: "d1", type: "file",   name: "Reglamento Interno 2025.pdf", modified: "2025-01-10", size: "1.2 MB", parentId: null },
  { id: "d2", type: "file",   name: "Política de Teletrabajo.docx", modified: "2025-06-22", size: "256 KB", parentId: null },
];

/**
 * DocumentosTab
 * Props:
 * - rut?: string
 * - items?: Array<{id,type,name,modified,size,parentId?}>
 * - onCreateFolder?: (name: string) => Promise<any> | any
 * - onUploadFiles?: (files: File[], ctx: {folderId, folderName, comment}) => Promise<any> | any
 */
export default function DocumentosTab({
  rut,
  items,
  onCreateFolder,
  onUploadFiles,
}) {
  const initial = useMemo(
    () => (Array.isArray(items) && items.length ? items : demoItems),
    [items]
  );
  const [data, setData] = useState(initial);
  useEffect(() => setData(initial), [initial]);

  /* ====== NUEVA CARPETA ====== */
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [folderName, setFolderName] = useState("");

  const handleCreateFolder = async () => {
    const name = folderName.trim();
    if (!name) return;

    const newFolder = { id: `nf-${Date.now()}`, type: "folder", name, modified: todayISO(), size: null };
    setData((prev) => [newFolder, ...prev]); // optimista
    setShowNewFolder(false);
    setFolderName("");

    try {
      if (typeof onCreateFolder === "function") await onCreateFolder(name);
    } catch {
      // revertir si falla
      setData((prev) => prev.filter((x) => x.id !== newFolder.id));
      alert("No se pudo crear la carpeta.");
    }
  };

  /* ====== PUSH-PUB: SUBIR ARCHIVO ====== */
  const [showUpload, setShowUpload] = useState(false);
  const [destFolder, setDestFolder] = useState("");
  const [comment, setComment] = useState("");
  const [picked, setPicked] = useState([]); // [{file, name, size}]
  const fileInputRef = useRef(null);

  const folders = useMemo(() => data.filter((d) => d.type === "folder"), [data]);

  useEffect(() => {
    // carpeta por defecto: primera o "sin carpeta"
    setDestFolder((prev) => (prev ? prev : (folders[0]?.id || "")));
  }, [folders]);

  const openFilePicker = () => fileInputRef.current?.click();

  const allowed = new Set(["pdf", "xls", "xlsx"]);
  const handleFilesChosen = (filesArr) => {
    const arr = Array.from(filesArr || []);
    const bad = arr.filter((f) => !allowed.has(ext(f.name)));
    if (bad.length) {
      alert("Sólo se permiten archivos PDF o Excel (.xls, .xlsx).");
      return;
    }
    setPicked(arr.map((f) => ({ file: f, name: f.name, size: f.size })));
  };

  const onInputChange = (e) => handleFilesChosen(e.target.files);

  // Dropzone soporte
  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFilesChosen(e.dataTransfer.files);
  };
  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleUploadConfirm = async () => {
    if (!picked.length) return alert("Selecciona al menos un archivo.");
    const folderId = destFolder || null;
    const folderName = folderId ? folders.find((f) => f.id === folderId)?.name : "Documentos";

    // Optimista en UI
    const rows = picked.map((p, i) => ({
      id: `u-${Date.now()}-${i}`,
      type: "file",
      name: p.name,
      modified: todayISO(),
      size: formatBytes(p.size),
      parentId: folderId,
      __file: p.file,
      __comment: comment,
    }));
    setData((prev) => [...rows, ...prev]);

    try {
      if (typeof onUploadFiles === "function") {
        await onUploadFiles(
          picked.map((p) => p.file),
          { folderId, folderName, comment }
        );
      }
      // cerrar y limpiar
      setShowUpload(false);
      setComment("");
      setPicked([]);
    } catch {
      // revertir en caso de error
      setData((prev) => prev.filter((r) => !String(r.id).startsWith("u-")));
      alert("No se pudieron subir los archivos.");
    }
  };

  return (
    <div className="ed-card doc-card">
      {/* Encabezado */}
      <div className="doc-head">
        <h3 className="ed-card-title" style={{ margin: 0 }}>Documentos</h3>
        <div className="doc-actions">
          <button type="button" className="doc-btn" onClick={() => setShowNewFolder(true)}>
            <IcoPlusFolder /> <span>Nueva Carpeta</span>
          </button>
          <button type="button" className="doc-btn primary" onClick={() => setShowUpload(true)}>
            <IcoUpload /> <span>Subir Archivo</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,application/pdf,.xls,application/vnd.ms-excel,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            style={{ display: "none" }}
            onChange={onInputChange}
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="doc-tablewrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Fecha de Modificación</th>
              <th>Tamaño</th>
              <th aria-label="acciones"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((it) => {
              const parentName = it.parentId ? folders.find((f) => f.id === it.parentId)?.name : null;
              return (
                <tr key={it.id}>
                  <td>
                    <div className="doc-namecell">
                      {it.type === "folder" ? <IcoFolder /> : <IcoFile />}
                      <div className="doc-namecol">
                        <span className="doc-name">{it.name}</span>
                        {parentName ? <span className="doc-sub">En: {parentName}</span> : null}
                      </div>
                    </div>
                  </td>
                  <td className="doc-dim">{it.modified || "—"}</td>
                  <td className="doc-dim">{it.size || "—"}</td>
                  <td className="doc-actions-cell">
                    <button type="button" className="doc-morebtn" title="Más acciones">
                      <IcoDots />
                    </button>
                  </td>
                </tr>
              );
            })}
            {data.length === 0 && (
              <tr>
                <td colSpan={4} className="doc-empty">Sin documentos por ahora.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== Modal: Nueva Carpeta ===== */}
      {showNewFolder && (
        <>
          <div className="doc-backdrop" onClick={() => setShowNewFolder(false)} />
          <div className="doc-modal" role="dialog" aria-modal="true">
            <h4 className="doc-modal-title">Crear nueva carpeta</h4>
            <input
              className="doc-input"
              placeholder="Nombre de la carpeta"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              autoFocus
            />
            <div className="doc-modal-actions">
              <button className="doc-btn" onClick={() => setShowNewFolder(false)}>Cancelar</button>
              <button className="doc-btn primary" onClick={handleCreateFolder}>Crear</button>
            </div>
          </div>
        </>
      )}

      {/* ===== PushPub: Subir Archivo ===== */}
      {showUpload && (
        <>
          {/* Overlay transparente para cerrar al hacer click afuera */}
          <button aria-hidden className="pp-overlay" onClick={() => setShowUpload(false)} />
          <div className="pp" role="dialog" aria-modal="true">
            <div className="pp-head">
              <strong>Subir archivo</strong>
            </div>

            <label className="pp-label">Guardar en carpeta</label>
            <select
              className="pp-select"
              value={destFolder}
              onChange={(e) => setDestFolder(e.target.value)}
            >
              <option value="">📁 Documentos (raíz)</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>📁 {f.name}</option>
              ))}
            </select>

            <label className="pp-label">Archivo(s) (PDF / Excel)</label>
            <div
              className="pp-drop"
              onDrop={onDrop}
              onDragOver={onDragOver}
              onClick={openFilePicker}
            >
              <div className="pp-drop-text">
                Arrastra aquí o <b>elige</b>
              </div>
              <div className="pp-accept">.pdf · .xls · .xlsx</div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,application/pdf,.xls,application/vnd.ms-excel,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                style={{ display: "none" }}
                onChange={onInputChange}
              />
            </div>

            {picked.length > 0 && (
              <ul className="pp-list">
                {picked.map((p, i) => (
                  <li key={i}>
                    <IcoFile /> <span className="pp-file">{p.name}</span>
                    <span className="pp-size">{formatBytes(p.size)}</span>
                  </li>
                ))}
              </ul>
            )}

            <label className="pp-label">Comentario (opcional)</label>
            <textarea
              className="pp-textarea"
              rows={3}
              placeholder="Ej: Contrato firmado por ambas partes."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <div className="pp-actions">
              <button className="doc-btn" onClick={() => setShowUpload(false)}>Cancelar</button>
              <button className="doc-btn primary" onClick={handleUploadConfirm}>Subir</button>
            </div>
          </div>
        </>
      )}

      <style>{`
        .doc-card{ padding:16px; }
        .doc-head{ display:flex; align-items:center; justify-content:space-between; margin-bottom:10px; }
        .doc-actions{ display:flex; gap:8px; }
        .doc-btn{ display:inline-flex; align-items:center; gap:8px; border:1px solid #E5E7EB; background:#fff; color:#111827;
                  padding:8px 10px; border-radius:10px; font-weight:700; cursor:pointer; }
        .doc-btn.primary{ background:#1A56DB; color:#fff; border-color:#1A56DB; }
        .doc-btn:hover{ background:#F9FAFB; }
        .doc-btn.primary:hover{ background:#1744B3; }

        .doc-tablewrap{ border:1px solid #E5E7EB; border-radius:12px; overflow:hidden; background:#fff; }
        .doc-table{ width:100%; border-collapse:collapse; }
        .doc-table thead th{ text-align:left; padding:12px 14px; font-size:12px; font-weight:800; text-transform:uppercase;
                             color:#6B7280; background:#F9FAFB; border-bottom:1px solid #F3F4F6; }
        .doc-table tbody td{ padding:12px 14px; border-bottom:1px solid #F3F4F6; color:#111827; }
        .doc-table tbody tr:hover{ background:#FAFBFF; }
        .doc-namecell{ display:flex; align-items:center; gap:10px; }
        .doc-namecol{ display:flex; flex-direction:column; }
        .doc-name{ font-weight:700; color:#111827; max-width:520px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .doc-sub{ font-size:12px; color:#6B7280; }
        .doc-dim{ color:#374151; font-weight:600; }
        .doc-actions-cell{ width:48px; text-align:right; }
        .doc-morebtn{ background:transparent; border:none; border-radius:999px; padding:4px; cursor:pointer; color:#374151; }
        .doc-morebtn:hover{ background:#EEF2FF; color:#1E3A8A; }
        .doc-empty{ text-align:center; color:#6B7280; padding:18px; }

        /* Modal Nueva Carpeta */
        .doc-backdrop{ position:fixed; inset:0; background:rgba(0,0,0,.35); z-index:999; }
        .doc-modal{ position:fixed; left:50%; top:50%; transform:translate(-50%,-50%);
          width:420px; max-width:92vw; background:#fff; border:1px solid #E5E7EB; border-radius:12px;
          box-shadow:0 18px 42px rgba(0,0,0,.22); z-index:1000; padding:16px; }
        .doc-modal-title{ margin:0 0 10px; font-size:18px; font-weight:800; color:#111827; }
        .doc-input{ width:100%; border:1px solid #E5E7EB; border-radius:10px; padding:10px 12px; font-size:14px; }
        .doc-modal-actions{ display:flex; justify-content:flex-end; gap:8px; margin-top:12px; }

        /* PushPub pequeño: anclado arriba-derecha */
        .pp-overlay{
          position:fixed; inset:0; background:transparent; border:none; padding:0; margin:0; z-index:998; cursor:default;
        }
        .pp{
          position:fixed; right:24px; top:110px; z-index:999;
          width:360px; max-width:92vw;
          background:#fff; border:1px solid #E5E7EB; border-radius:12px;
          box-shadow:0 18px 42px rgba(0,0,0,.16);
          padding:12px;
        }
        .pp-head{ font-size:14px; margin-bottom:6px; color:#111827; }
        .pp-label{ display:block; font-size:12px; font-weight:700; color:#6B7280; margin-top:8px; margin-bottom:6px; text-transform:uppercase; }
        .pp-select{ width:100%; border:1px solid #E5E7EB; border-radius:10px; padding:8px 10px; font-weight:600; }
        .pp-drop{
          border:1.5px dashed #C7D2FE; border-radius:10px; padding:14px; text-align:center; cursor:pointer;
          background:#F9FAFF;
        }
        .pp-drop:hover{ background:#F4F6FF; }
        .pp-drop-text{ color:#1E3A8A; font-weight:800; }
        .pp-accept{ color:#6B7280; font-size:12px; margin-top:4px; }
        .pp-list{ list-style:none; margin:8px 0 0; padding:0; max-height:120px; overflow:auto; }
        .pp-list li{ display:flex; align-items:center; gap:8px; padding:6px 2px; border-bottom:1px solid #F3F4F6; }
        .pp-file{ flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .pp-size{ color:#6B7280; font-size:12px; }
        .pp-textarea{ width:100%; border:1px solid #E5E7EB; border-radius:10px; padding:8px 10px; font-size:14px; }
        .pp-actions{ display:flex; justify-content:flex-end; gap:8px; margin-top:10px; }
      `}</style>
    </div>
  );
}
