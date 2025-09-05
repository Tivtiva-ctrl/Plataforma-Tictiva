// src/components/DocumentosTab.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/* ====== Iconos livianos (sin dependencias) ====== */
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

/* ====== Utilidades ====== */
const todayISO = () => new Date().toISOString().slice(0, 10);
const formatBytes = (bytes) => {
  if (typeof bytes !== "number") return "—";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

/* ====== Datos demo si no llegan por props ====== */
const demoItems = [
  { id: "f1", type: "folder", name: "Contratos", modified: "2025-08-15", size: null },
  { id: "f2", type: "folder", name: "Liquidaciones de Sueldo", modified: "2025-09-01", size: null },
  { id: "f3", type: "folder", name: "Certificados", modified: "2025-07-30", size: null },
  { id: "d1", type: "file",   name: "Reglamento Interno 2025.pdf", modified: "2025-01-10", size: "1.2 MB" },
  { id: "d2", type: "file",   name: "Política de Teletrabajo.docx", modified: "2025-06-22", size: "256 KB" },
];

/**
 * DocumentosTab
 * Props:
 * - rut?: string
 * - items?: Array<{id,type,name,modified,size}>
 * - onCreateFolder?: (name: string) => Promise<any> | any   // opcional para persistir
 * - onUploadFiles?: (files: File[]) => Promise<any> | any   // opcional para persistir
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

  // Subir archivo(s)
  const fileInputRef = useRef(null);
  const handleOpenPicker = () => fileInputRef.current?.click();

  const handleFilesChosen = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // 1) Optimista en UI
    const newRows = files.map((f, i) => ({
      id: `u-${Date.now()}-${i}`,
      type: "file",
      name: f.name,
      modified: todayISO(),
      size: formatBytes(f.size),
      __file: f, // por si tu callback lo necesita
    }));
    setData((prev) => [...newRows, ...prev]);

    // 2) Callback opcional para persistir
    try {
      if (typeof onUploadFiles === "function") {
        await onUploadFiles(files);
      }
    } catch (err) {
      // Si falla, revertimos en forma simple (quitamos los nuevos)
      setData((prev) => prev.filter((r) => !r.id.startsWith("u-")));
      alert("No se pudo subir el/los archivo(s).");
    } finally {
      // limpiar input para permitir re-subir el mismo archivo
      e.target.value = "";
    }
  };

  // Nueva Carpeta (modal)
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [folderName, setFolderName] = useState("");

  const handleCreateFolder = async () => {
    const name = folderName.trim();
    if (!name) return;

    const newFolder = {
      id: `nf-${Date.now()}`,
      type: "folder",
      name,
      modified: todayISO(),
      size: null,
    };

    // 1) Optimista
    setData((prev) => [newFolder, ...prev]);
    setShowNewFolder(false);
    setFolderName("");

    // 2) Persistencia opcional
    try {
      if (typeof onCreateFolder === "function") {
        await onCreateFolder(name);
      }
    } catch (err) {
      // revertir
      setData((prev) => prev.filter((r) => r.id !== newFolder.id));
      alert("No se pudo crear la carpeta.");
    }
  };

  return (
    <div className="ed-card doc-card">
      <div className="doc-head">
        <h3 className="ed-card-title" style={{ margin: 0 }}>Documentos</h3>
        <div className="doc-actions">
          <button type="button" className="doc-btn" onClick={() => setShowNewFolder(true)}>
            <IcoPlusFolder /> <span>Nueva Carpeta</span>
          </button>
          <button type="button" className="doc-btn primary" onClick={handleOpenPicker}>
            <IcoUpload /> <span>Subir Archivo</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            style={{ display: "none" }}
            onChange={handleFilesChosen}
          />
        </div>
      </div>

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
            {data.map((it) => (
              <tr key={it.id}>
                <td>
                  <div className="doc-namecell">
                    {it.type === "folder" ? <IcoFolder /> : <IcoFile />}
                    <span className="doc-name">{it.name}</span>
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
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={4} className="doc-empty">Sin documentos por ahora.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ===== Modal Nueva Carpeta ===== */}
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
        .doc-namecell{ display:flex; align-items:center; gap:10px; font-weight:700; color:#111827; }
        .doc-name{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display:inline-block; max-width:520px; }
        .doc-dim{ color:#374151; font-weight:600; }
        .doc-actions-cell{ width:48px; text-align:right; }
        .doc-morebtn{ background:transparent; border:none; border-radius:999px; padding:4px; cursor:pointer; color:#374151; }
        .doc-morebtn:hover{ background:#EEF2FF; color:#1E3A8A; }
        .doc-empty{ text-align:center; color:#6B7280; padding:18px; }

        /* Modal */
        .doc-backdrop{ position:fixed; inset:0; background:rgba(0,0,0,.35); z-index:999; }
        .doc-modal{ position:fixed; left:50%; top:50%; transform:translate(-50%,-50%);
          width:420px; max-width:92vw; background:#fff; border:1px solid #E5E7EB; border-radius:12px;
          box-shadow:0 18px 42px rgba(0,0,0,.22); z-index:1000; padding:16px; }
        .doc-modal-title{ margin:0 0 10px; font-size:18px; font-weight:800; color:#111827; }
        .doc-input{ width:100%; border:1px solid #E5E7EB; border-radius:10px; padding:10px 12px; font-size:14px; }
        .doc-modal-actions{ display:flex; justify-content:flex-end; gap:8px; margin-top:12px; }

        @media (max-width: 900px){ .doc-name{ max-width:220px; } }
      `}</style>
    </div>
  );
}
