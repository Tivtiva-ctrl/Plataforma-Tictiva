// src/components/DocumentosTab.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";

/* ============ Iconos (sin dependencias) ============ */
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
const IcoBack = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" />
  </svg>
);

/* ============ Utils & helpers ============ */
const todayISO = () => new Date().toISOString().slice(0, 10);
const formatBytes = (bytes) => {
  if (typeof bytes !== "number") return "—";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};
const getExt = (name = "") => name.split(".").pop()?.toLowerCase() || "";
const uid = (p = "id") => `${p}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Estructura:
 *  { id, type:'folder'|'file', name, modified, size?, parentId?, comment? }
 *
 * Persistencia: localStorage por RUT (storageKey = docs:<rut>).
 */
export default function DocumentosTab({ rut, items, onCreateFolder, onUploadFiles }) {
  const storageKey = `docs:${rut || "global"}`;

  const demo = useMemo(
    () => [
      { id: "f1", type: "folder", name: "Contratos", modified: "2025-08-15" },
      { id: "f2", type: "folder", name: "Liquidaciones de Sueldo", modified: "2025-09-01" },
      { id: "f3", type: "folder", name: "Certificados", modified: "2025-07-30" },
      { id: "d1", type: "file", name: "Reglamento Interno 2025.pdf", modified: "2025-01-10", size: "1.2 MB" },
      { id: "d2", type: "file", name: "Política de Teletrabajo.docx", modified: "2025-06-22", size: "256 KB" },
      // ejemplo: archivo dentro de “Contratos”
      { id: "d3", type: "file", name: "Contrato 2021-03-01.pdf", modified: "2025-02-10", size: "420 KB", parentId: "f1" },
    ],
    []
  );

  const load = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return arr;
      }
    } catch {}
    if (Array.isArray(items) && items.length) return items;
    return demo;
  };
  const save = (arr) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(arr));
    } catch {}
  };

  const [data, setData] = useState(load());
  useEffect(() => { setData(load()); }, [rut]); // recarga si cambia rut

  const folders = useMemo(
    () => data.filter((d) => d.type === "folder").sort((a, b) => a.name.localeCompare(b.name)),
    [data]
  );
  const rootFiles = useMemo(
    () => data.filter((d) => d.type === "file" && !d.parentId).sort((a, b) => a.name.localeCompare(b.name)),
    [data]
  );

  /* ========== Navegación de carpetas (abrir/cerrar) ========== */
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const currentFolder = useMemo(() => folders.find((f) => f.id === currentFolderId) || null, [folders, currentFolderId]);
  const filesInCurrent = useMemo(
    () => data.filter((d) => d.type === "file" && d.parentId === currentFolderId).sort((a, b) => a.name.localeCompare(b.name)),
    [data, currentFolderId]
  );

  const openFolder = (id) => setCurrentFolderId(id);
  const goRoot = () => setCurrentFolderId(null);

  // filas visibles: raíz → carpetas + archivos raíz; dentro de carpeta → sólo archivos de esa carpeta
  const visibleRows = useMemo(() => {
    if (!currentFolderId) {
      return [...folders, ...rootFiles];
    }
    return filesInCurrent;
  }, [folders, rootFiles, filesInCurrent, currentFolderId]);

  /* ========== Nueva carpeta ========== */
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const createFolder = async () => {
    const name = folderName.trim();
    if (!name) return;
    const newFolder = { id: uid("f"), type: "folder", name, modified: todayISO() };
    setData((prev) => {
      const arr = [newFolder, ...prev];
      save(arr);
      return arr;
    });
    setShowNewFolder(false);
    setFolderName("");
    try { if (typeof onCreateFolder === "function") await onCreateFolder(name); } catch {}
  };

  /* ========== PushPub: Subir archivo ========== */
  const [showUpload, setShowUpload] = useState(false);
  const [destFolder, setDestFolder] = useState("");
  const [comment, setComment] = useState("");
  const [picked, setPicked] = useState([]); // {file,name,size}
  const fileInputRef = useRef(null);

  // Si estás dentro de una carpeta, preseleccionarla como destino
  useEffect(() => {
    if (currentFolderId) setDestFolder(currentFolderId);
    else setDestFolder(folders[0]?.id || "");
  }, [currentFolderId, folders]);

  const allowed = new Set(["pdf", "xls", "xlsx"]);
  const pickFiles = (filesArr) => {
    const arr = Array.from(filesArr || []);
    const invalid = arr.filter((f) => !allowed.has(getExt(f.name)));
    if (invalid.length) {
      alert("Sólo se permiten PDF y Excel (.xls, .xlsx).");
      return;
    }
    setPicked(arr.map((f) => ({ file: f, name: f.name, size: f.size })));
  };
  const onInputChange = (e) => pickFiles(e.target.files);
  const onDrop = (e) => { e.preventDefault(); e.stopPropagation(); pickFiles(e.dataTransfer.files); };
  const onDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };

  const confirmUpload = async () => {
    if (!picked.length) return alert("Selecciona al menos un archivo.");
    const folderId = destFolder || null;
    const rows = picked.map((p) => ({
      id: uid("d"),
      type: "file",
      name: p.name,
      modified: todayISO(),
      size: formatBytes(p.size),
      parentId: folderId,
      comment: comment?.trim() || "",
    }));
    setData((prev) => {
      const arr = [...rows, ...prev];
      save(arr);
      return arr;
    });

    try {
      if (typeof onUploadFiles === "function") {
        await onUploadFiles(
          picked.map((p) => p.file),
          { folderId, folderName: folderId ? (folders.find((f) => f.id === folderId)?.name || "") : "Documentos", comment: comment?.trim() || "" }
        );
      }
    } catch {}

    setPicked([]); setComment(""); setShowUpload(false);
  };

  /* ========== Menú ⋯ (acciones por fila) ========== */
  const [menu, setMenu] = useState(null); // {id, type, x, y}
  const openMenu = (e, it) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMenu({ id: it.id, type: it.type, x: rect.left, y: rect.bottom + 6 });
  };
  const closeMenu = () => setMenu(null);

  // Modales de acciones
  const [renameOf, setRenameOf] = useState(null);     // item
  const [moveOf, setMoveOf] = useState(null);         // file
  const [newName, setNewName] = useState("");

  const doRename = () => {
    const name = newName.trim();
    if (!name || !renameOf) return;
    setData((prev) => {
      const arr = prev.map((x) => (x.id === renameOf.id ? { ...x, name, modified: todayISO() } : x));
      save(arr);
      return arr;
    });
    if (currentFolderId && renameOf.id === currentFolderId) {
      // si renombraste la carpeta abierta, actualiza breadcrumb
      const found = folders.find((f) => f.id === renameOf.id);
      if (found) setCurrentFolderId(found.id);
    }
    setRenameOf(null);
    setNewName("");
  };

  const doDelete = (it) => {
    if (!it) return;
    if (it.type === "folder") {
      const count = data.filter((x) => x.parentId === it.id).length;
      const ok = window.confirm(`Eliminar carpeta "${it.name}"${count ? ` y ${count} elemento(s) adentro` : ""}?`);
      if (!ok) return;
      setData((prev) => {
        const arr = prev.filter((x) => x.id !== it.id && x.parentId !== it.id);
        save(arr);
        return arr;
      });
      if (currentFolderId === it.id) goRoot();
    } else {
      const ok = window.confirm(`Eliminar archivo "${it.name}"?`);
      if (!ok) return;
      setData((prev) => {
        const arr = prev.filter((x) => x.id !== it.id);
        save(arr);
        return arr;
      });
    }
    closeMenu();
  };

  const doMove = (fileId, folderId) => {
    setData((prev) => {
      const arr = prev.map((x) => (x.id === fileId ? { ...x, parentId: folderId || null, modified: todayISO() } : x));
      save(arr);
      return arr;
    });
    setMoveOf(null);
  };

  return (
    <div className="ed-card doc-card">
      {/* Encabezado + breadcrumb */}
      <div className="doc-head">
        <div className="doc-bread">
          {!currentFolder ? (
            <h3 className="ed-card-title" style={{ margin: 0 }}>Documentos</h3>
          ) : (
            <div className="doc-crumbs">
              <button className="doc-back" onClick={goRoot}><IcoBack /> Volver</button>
              <span className="doc-crumb-root">Documentos</span>
              <span className="doc-crumb-sep">/</span>
              <span className="doc-crumb-here">{currentFolder.name}</span>
            </div>
          )}
        </div>
        <div className="doc-actions">
          <button type="button" className="doc-btn" onClick={() => setShowNewFolder(true)}>
            <IcoPlusFolder /> <span>Nueva Carpeta</span>
          </button>
          <button type="button" className="doc-btn primary" onClick={() => setShowUpload(true)}>
            <IcoUpload /> <span>Subir Archivo</span>
          </button>
          {/* input oculto para el PushPub */}
          <input
            type="file"
            multiple
            ref={fileInputRef}
            accept=".pdf,application/pdf,.xls,application/vnd.ms-excel,.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            style={{ display: "none" }}
            onChange={(e) => pickFiles(e.target.files)}
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
            {visibleRows.map((it) => {
              const parentName = it.parentId ? folders.find((f) => f.id === it.parentId)?.name : null;
              const isFolder = it.type === "folder";
              return (
                <tr key={it.id} onDoubleClick={() => isFolder && openFolder(it.id)}>
                  <td>
                    <div className="doc-namecell">
                      {isFolder ? (
                        <button className="doc-inline-btn" onClick={() => openFolder(it.id)} title="Abrir carpeta">
                          <IcoFolder />
                        </button>
                      ) : (
                        <IcoFile />
                      )}
                      <div className="doc-namecol">
                        {isFolder ? (
                          <button className="doc-namebtn" onClick={() => openFolder(it.id)}>{it.name}</button>
                        ) : (
                          <span className="doc-name">{it.name}</span>
                        )}
                        {parentName ? <span className="doc-sub">En: {parentName}</span> : null}
                        {it.type === "file" && it.comment ? <span className="doc-sub">Nota: {it.comment}</span> : null}
                      </div>
                    </div>
                  </td>
                  <td className="doc-dim">{it.modified || "—"}</td>
                  <td className="doc-dim">{isFolder ? "—" : (it.size || "—")}</td>
                  <td className="doc-actions-cell">
                    <button type="button" className="doc-morebtn" title="Más acciones" onClick={(e) => openMenu(e, it)}>
                      <IcoDots />
                    </button>
                  </td>
                </tr>
              );
            })}
            {visibleRows.length === 0 && (
              <tr><td colSpan={4} className="doc-empty">{currentFolder ? "Esta carpeta está vacía." : "Sin documentos por ahora."}</td></tr>
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
              onKeyDown={(e)=>{ if(e.key==='Enter') createFolder(); }}
            />
            <div className="doc-modal-actions">
              <button className="doc-btn" onClick={() => setShowNewFolder(false)}>Cancelar</button>
              <button className="doc-btn primary" onClick={createFolder}>Crear</button>
            </div>
          </div>
        </>
      )}

      {/* ===== PushPub: Subir Archivo ===== */}
      {showUpload && (
        <>
          <button aria-hidden className="pp-overlay" onClick={() => setShowUpload(false)} />
          <div className="pp" role="dialog" aria-modal="true">
            <div className="pp-head"><strong>Subir archivo</strong></div>

            <label className="pp-label">Guardar en carpeta</label>
            <select className="pp-select" value={destFolder} onChange={(e) => setDestFolder(e.target.value)}>
              <option value="">📁 Documentos (raíz)</option>
              {folders.map((f) => <option key={f.id} value={f.id}>📁 {f.name}</option>)}
            </select>

            <label className="pp-label">Archivo(s) (PDF / Excel)</label>
            <div className="pp-drop" onDrop={onDrop} onDragOver={onDragOver} onClick={() => fileInputRef.current?.click()}>
              <div className="pp-drop-text">Arrastra aquí o <b>elige</b></div>
              <div className="pp-accept">.pdf · .xls · .xlsx</div>
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
              <button className="doc-btn primary" onClick={confirmUpload}>Subir</button>
            </div>
          </div>
        </>
      )}

      {/* ===== Menú ⋯ ===== */}
      {menu && (
        <>
          <button className="menu-overlay" onClick={closeMenu} aria-hidden />
          <div className="menu" style={{ left: menu.x, top: menu.y }}>
            {menu.type === "folder" ? (
              <>
                <button className="menu-item" onClick={() => { openFolder(menu.id); closeMenu(); }}>Abrir</button>
                <button
                  className="menu-item"
                  onClick={() => {
                    const it = data.find((x) => x.id === menu.id);
                    setRenameOf(it);
                    setNewName(it?.name || "");
                    closeMenu();
                  }}
                >Renombrar</button>
                <button
                  className="menu-item danger"
                  onClick={() => {
                    const it = data.find((x) => x.id === menu.id);
                    doDelete(it);
                  }}
                >Eliminar</button>
              </>
            ) : (
              <>
                <button
                  className="menu-item"
                  onClick={() => {
                    const it = data.find((x) => x.id === menu.id);
                    setRenameOf(it);
                    setNewName(it?.name || "");
                    closeMenu();
                  }}
                >Renombrar</button>
                <button
                  className="menu-item"
                  onClick={() => {
                    const it = data.find((x) => x.id === menu.id);
                    setMoveOf(it);
                    closeMenu();
                  }}
                >Mover a…</button>
                <button
                  className="menu-item danger"
                  onClick={() => {
                    const it = data.find((x) => x.id === menu.id);
                    doDelete(it);
                  }}
                >Eliminar</button>
              </>
            )}
          </div>
        </>
      )}

      {/* ===== Modal: Renombrar ===== */}
      {renameOf && (
        <>
          <div className="doc-backdrop" onClick={() => setRenameOf(null)} />
          <div className="doc-modal" role="dialog" aria-modal="true">
            <h4 className="doc-modal-title">Renombrar {renameOf.type === "folder" ? "carpeta" : "archivo"}</h4>
            <input
              className="doc-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") doRename(); }}
            />
            <div className="doc-modal-actions">
              <button className="doc-btn" onClick={() => setRenameOf(null)}>Cancelar</button>
              <button className="doc-btn primary" onClick={doRename}>Guardar</button>
            </div>
          </div>
        </>
      )}

      {/* ===== Modal: Mover archivo ===== */}
      {moveOf && (
        <>
          <div className="doc-backdrop" onClick={() => setMoveOf(null)} />
          <div className="doc-modal" role="dialog" aria-modal="true">
            <h4 className="doc-modal-title">Mover “{moveOf.name}”</h4>
            <label className="doc-label">Destino</label>
            <select className="doc-input" value={moveOf.parentId || ""} onChange={(e) => doMove(moveOf.id, e.target.value || null)}>
              <option value="">📁 Documentos (raíz)</option>
              {folders.map((f) => <option key={f.id} value={f.id}>📁 {f.name}</option>)}
            </select>
            <div className="doc-modal-actions">
              <button className="doc-btn" onClick={() => setMoveOf(null)}>Cerrar</button>
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

        .doc-crumbs{ display:flex; align-items:center; gap:8px; }
        .doc-back{ display:inline-flex; align-items:center; gap:6px; border:1px solid #E5E7EB; background:#fff; padding:6px 10px; border-radius:8px; cursor:pointer; font-weight:700; }
        .doc-crumb-root{ font-weight:800; color:#111827; }
        .doc-crumb-sep{ color:#9CA3AF; }
        .doc-crumb-here{ font-weight:800; color:#1E3A8A; }

        .doc-tablewrap{ border:1px solid #E5E7EB; border-radius:12px; overflow:hidden; background:#fff; }
        .doc-table{ width:100%; border-collapse:collapse; }
        .doc-table thead th{ text-align:left; padding:12px 14px; font-size:12px; font-weight:800; text-transform:uppercase;
                             color:#6B7280; background:#F9FAFB; border-bottom:1px solid #F3F4F6; }
        .doc-table tbody td{ padding:12px 14px; border-bottom:1px solid #F3F4F6; color:#111827; }
        .doc-table tbody tr:hover{ background:#FAFBFF; }
        .doc-namecell{ display:flex; align-items:center; gap:10px; }
        .doc-inline-btn{ background:transparent; border:none; padding:0; display:inline-flex; align-items:center; color:#111827; cursor:pointer; }
        .doc-inline-btn:hover{ color:#1E3A8A; }
        .doc-namebtn{ background:transparent; border:none; padding:0; margin:0; font-weight:800; color:#111827; cursor:pointer; text-align:left; }
        .doc-namebtn:hover{ text-decoration:underline; color:#1E3A8A; }
        .doc-namecol{ display:flex; flex-direction:column; }
        .doc-name{ font-weight:800; color:#111827; max-width:520px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .doc-sub{ font-size:12px; color:#6B7280; }
        .doc-dim{ color:#111827; font-weight:800; }
        .doc-actions-cell{ width:48px; text-align:right; }
        .doc-morebtn{ background:transparent; border:none; border-radius:999px; padding:4px; cursor:pointer; color:#374151; }
        .doc-morebtn:hover{ background:#EEF2FF; color:#1E3A8A; }
        .doc-empty{ text-align:center; color:#6B7280; padding:18px; }

        /* Modal Nueva Carpeta / genérico */
        .doc-backdrop{ position:fixed; inset:0; background:rgba(0,0,0,.35); z-index:999; }
        .doc-modal{ position:fixed; left:50%; top:50%; transform:translate(-50%,-50%);
          width:420px; max-width:92vw; background:#fff; border:1px solid #E5E7EB; border-radius:12px;
          box-shadow:0 18px 42px rgba(0,0,0,.22); z-index:1000; padding:16px; }
        .doc-modal-title{ margin:0 0 10px; font-size:18px; font-weight:800; color:#111827; }
        .doc-input{ width:100%; border:1px solid #E5E7EB; border-radius:10px; padding:10px 12px; font-size:14px; }
        .doc-label{ display:block; color:#6B7280; font-weight:700; font-size:12px; margin:8px 0 6px; text-transform:uppercase; }
        .doc-modal-actions{ display:flex; justify-content:flex-end; gap:8px; margin-top:12px; }

        /* PushPub (pequeño) */
        .pp-overlay{ position:fixed; inset:0; background:transparent; border:none; padding:0; margin:0; z-index:998; }
        .pp{ position:fixed; right:24px; top:110px; z-index:999; width:360px; max-width:92vw; background:#fff;
             border:1px solid #E5E7EB; border-radius:12px; box-shadow:0 18px 42px rgba(0,0,0,.16); padding:12px; }
        .pp-head{ font-size:14px; margin-bottom:6px; color:#111827; }
        .pp-label{ display:block; font-size:12px; font-weight:700; color:#6B7280; margin-top:8px; margin-bottom:6px; text-transform:uppercase; }
        .pp-select{ width:100%; border:1px solid #E5E7EB; border-radius:10px; padding:8px 10px; font-weight:600; }
        .pp-drop{ border:1.5px dashed #C7D2FE; border-radius:10px; padding:14px; text-align:center; cursor:pointer; background:#F9FAFF; }
        .pp-drop:hover{ background:#F4F6FF; }
        .pp-drop-text{ color:#1E3A8A; font-weight:800; }
        .pp-accept{ color:#6B7280; font-size:12px; margin-top:4px; }
        .pp-list{ list-style:none; margin:8px 0 0; padding:0; max-height:120px; overflow:auto; }
        .pp-list li{ display:flex; align-items:center; gap:8px; padding:6px 2px; border-bottom:1px solid #F3F4F6; }
        .pp-file{ flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .pp-size{ color:#6B7280; font-size:12px; }
        .pp-textarea{ width:100%; border:1px solid #E5E7EB; border-radius:10px; padding:8px 10px; font-size:14px; }
        .pp-actions{ display:flex; justify-content:flex-end; gap:8px; margin-top:10px; }

        /* Menú ⋯ */
        .menu-overlay{ position:fixed; inset:0; background:transparent; border:none; padding:0; margin:0; z-index:1000; }
        .menu{ position:fixed; z-index:1001; background:#fff; border:1px solid #E5E7EB; border-radius:10px; box-shadow:0 12px 28px rgba(0,0,0,.18); min-width:170px; }
        .menu-item{ width:100%; text-align:left; border:none; background:#fff; padding:8px 12px; cursor:pointer; font-weight:600; color:#111827; }
        .menu-item:hover{ background:#F3F4F6; }
        .menu-item.danger{ color:#B91C1C; }
        .menu-item.danger:hover{ background:#FEF2F2; }
      `}</style>
    </div>
  );
}
