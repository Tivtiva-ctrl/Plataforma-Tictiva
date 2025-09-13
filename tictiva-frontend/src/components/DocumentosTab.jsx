/* ======================= Documentos (PushPop + menú ⋯) ====================== */
const DocumentosTab = ({
  empleado,
  onNuevaCarpeta,
  onSubirArchivo,   // (file, parentId?) => void
  onDelete,         // (id) => void
  onRename,         // (id, newName) => void
}) => {
  const items = Array.isArray(empleado?.documentos) ? empleado.documentos : [];

  const [showPush, setShowPush] = useState(false);
  const [folderName, setFolderName] = useState("");
  const inputRef = React.useRef(null);

  const [showUpload, setShowUpload] = useState(false);
  const [picked, setPicked] = useState(null);
  const fileInputRef = React.useRef(null);

  // Menú ⋯ global (fuera de la tabla)
  const [menu, setMenu] = useState({ open:false, item:null, x:0, y:0 });
  const menuRef = React.useRef(null);

  // Push: ver carpeta / ver doc
  const [openFolder, setOpenFolder] = useState(null);
  const [openDoc, setOpenDoc] = useState(null);

  // Renombrar
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameText, setRenameText] = useState("");

  // Subir a carpeta
  const [uploadFolder, setUploadFolder] = useState(null);
  const folderFileInputRef = React.useRef(null);
  const [pickedInFolder, setPickedInFolder] = useState(null);

  const isFolder = (it) => (it?.tipo || "").toLowerCase() === "folder";
  const childrenOf = (folderId) => items.filter(d => d.parentId === folderId && d.tipo !== "folder");

  useEffect(() => {
    if (showPush && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); }
  }, [showPush]);

  // Cerrar menú por click afuera y Esc
  useEffect(() => {
    const onDown = (e) => {
      if (menu.open && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenu(s => ({...s, open:false}));
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenu(s => ({...s, open:false}));
        setShowPush(false);
        setShowUpload(false);
        setOpenFolder(null);
        setOpenDoc(null);
        setRenameTarget(null);
        setUploadFolder(null);
      }
      if (e.key === "Enter") {
        if (showPush) handleCreateFolder();
        if (renameTarget) confirmRename();
      }
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [menu.open, showPush, renameTarget]);

  const openMenu = (e, it) => {
    const r = e.currentTarget.getBoundingClientRect();
    setMenu({ open:true, item:it, x: r.left, y: r.bottom + 6 });
  };

  const handleCreateFolder = () => {
    const name = (folderName || "").trim();
    if (!name) return;
    // Soporta ambos casos: handler con o sin parámetro (para no tocar el padre)
    try {
      if (typeof onNuevaCarpeta === "function") {
        if (onNuevaCarpeta.length >= 1) onNuevaCarpeta(name);
        else onNuevaCarpeta(); // (puede abrir el prompt heredado)
      }
    } finally {
      setShowPush(false);
    }
  };

  const fakeDownload = (name) => {
    const blob = new Blob([`Descarga simulada de ${name}\n(placeholder)`], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name || "archivo.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const askRename = (it) => {
    setRenameTarget({ id: it.id, nombre: it.nombre });
    setRenameText(it.nombre || "");
    setMenu(s => ({...s, open:false}));
  };
  const confirmRename = () => {
    const txt = (renameText || "").trim();
    if (txt && renameTarget) onRename?.(renameTarget.id, txt);
    setRenameTarget(null);
  };

  const removeItem = (it) => {
    if (!it) return;
    if (isFolder(it)) {
      const hijos = childrenOf(it.id);
      if (hijos.length && !window.confirm(`La carpeta contiene ${hijos.length} documento(s). ¿Eliminar todo?`)) return;
      hijos.forEach(h => onDelete?.(h.id));
    }
    onDelete?.(it.id);
    setMenu(s => ({...s, open:false}));
  };

  const confirmUploadIntoFolder = () => {
    if (pickedInFolder && uploadFolder) {
      onSubirArchivo?.(pickedInFolder, uploadFolder.id);
      setUploadFolder(null);
      setPickedInFolder(null);
    }
  };

  return (
    <div className="ed-card">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
        <h3 className="ed-card-title" style={{margin:0}}>Documentos</h3>
        <div style={{display:'flex', gap:8}}>
          <button className="ed-btn" onClick={()=>{ setFolderName(""); setShowPush(true); }}>Nueva Carpeta</button>
          <button className="ed-btn primary" onClick={()=>{ setPicked(null); setShowUpload(true); }}>Subir Archivo</button>
        </div>
      </div>

      <table className="asistencia-tabla">
        <thead>
          <tr>
            <th>Nombre</th><th>Fecha de Modificación</th><th>Tamaño</th><th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              <td style={{fontWeight:600}}>{isFolder(it) ? "📁" : "📄"} {it.nombre}</td>
              <td>{it.mod || "—"}</td>
              <td>{isFolder(it) ? "—" : (it.tam || "—")}</td>
              <td><button className="ed-btn" onClick={(e)=>openMenu(e,it)}>⋯</button></td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr><td colSpan={4} style={{color:'#6B7280'}}>Sin documentos por ahora.</td></tr>
          )}
        </tbody>
      </table>

      {/* Menú ⋯ global */}
      {menu.open && (
        <div
          ref={menuRef}
          className="kebab-menu"
          style={{ top: menu.y, left: menu.x, position:'fixed' }}
        >
          {isFolder(menu.item) ? (
            <>
              <button onClick={()=>{ setOpenFolder(menu.item); setMenu(s=>({...s, open:false})); }}>📂 Ver</button>
              <button onClick={()=>{ setUploadFolder(menu.item); setPickedInFolder(null); setMenu(s=>({...s, open:false})); }}>⬆️ Subir a esta carpeta</button>
              <button onClick={()=>askRename(menu.item)}>✏️ Renombrar</button>
              <button className="danger" onClick={()=>removeItem(menu.item)}>🗑️ Eliminar</button>
            </>
          ) : (
            <>
              <button onClick={()=>{ setOpenDoc(menu.item); setMenu(s=>({...s, open:false})); }}>👁️ Ver</button>
              <button onClick={()=>fakeDownload(menu.item?.nombre)}>⬇️ Descargar</button>
              <button onClick={()=>askRename(menu.item)}>✏️ Renombrar</button>
              <button className="danger" onClick={()=>removeItem(menu.item)}>🗑️ Eliminar</button>
            </>
          )}
        </div>
      )}

      {/* PushPop: Nueva carpeta */}
      {showPush && (
        <div className="pushpop-overlay" role="dialog" aria-modal="true" onClick={()=>setShowPush(false)}>
          <div className="pushpop-card" role="document" onClick={(e)=>e.stopPropagation()}>
            <div className="pushpop-title">Nombre de la nueva carpeta</div>
            <input
              ref={inputRef}
              value={folderName}
              onChange={(e)=>setFolderName(e.target.value)}
              className="pushpop-input"
              placeholder="p. ej. Contratos 2025"
              aria-label="Nombre de la nueva carpeta"
            />
            <div className="pushpop-actions">
              <button className="ed-btn" onClick={()=>setShowPush(false)}>Cancelar</button>
              <button
                className="ed-btn primary"
                onClick={handleCreateFolder}
                disabled={!folderName.trim()}
                style={{opacity: folderName.trim() ? 1 : .6, cursor: folderName.trim() ? 'pointer' : 'not-allowed'}}
              >
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PushPop: Subir (raíz) */}
      {showUpload && (
        <div className="pushpop-overlay" role="dialog" aria-modal="true" onClick={()=>setShowUpload(false)}>
          <div className="pushpop-card" role="document" onClick={(e)=>e.stopPropagation()}>
            <div className="pushpop-title">Subir archivo</div>
            <div className="dropzone"
              onDragOver={(e)=>e.preventDefault()}
              onDrop={(e)=>{ e.preventDefault(); const f=e.dataTransfer?.files?.[0]; if (f) setPicked(f); }}
            >
              <div className="dropzone-icon">⬆️</div>
              <div className="dropzone-text">Arrastra y suelta el archivo aquí<br/><span className="muted">o</span></div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                style={{display:'none'}}
                onChange={(e)=>{ const f=e.target.files?.[0]; if (f) setPicked(f); }}
              />
              <button className="ed-btn" onClick={()=>fileInputRef.current?.click()}>Elegir archivo</button>
            </div>
            <div className="picked">
              {picked ? (
                <div className="picked-file">
                  <span>📄 {picked.name}</span>
                  <span className="muted">{(picked.size/1024/1024).toFixed(picked.size>10*1024*1024?0:1)} MB</span>
                </div>
              ) : (
                <div className="muted">Ningún archivo seleccionado</div>
              )}
            </div>
            <div className="pushpop-actions">
              <button className="ed-btn" onClick={()=>setShowUpload(false)}>Cancelar</button>
              <button className="ed-btn primary" onClick={()=>{ if (picked) onSubirArchivo?.(picked); setShowUpload(false); setPicked(null); }} disabled={!picked}>Subir</button>
            </div>
          </div>
        </div>
      )}

      {/* PushPop: Ver carpeta */}
      {openFolder && (
        <div className="pushpop-overlay" role="dialog" aria-modal="true" onClick={()=>setOpenFolder(null)}>
          <div className="pushpop-card" role="document" onClick={(e)=>e.stopPropagation()}>
            <div className="pushpop-title">Carpeta: {openFolder.nombre}</div>
            <div className="muted" style={{marginBottom:8}}>Documentos dentro de esta carpeta</div>
            {childrenOf(openFolder.id).length === 0 ? (
              <div className="muted" style={{marginBottom:8}}>No hay documentos aquí aún.</div>
            ) : (
              <ul style={{listStyle:'none', margin:0, padding:0, maxHeight:280, overflow:'auto'}}>
                {childrenOf(openFolder.id).map(doc => (
                  <li key={doc.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, padding:'8px 0', borderTop:'1px solid #2a2a36'}}>
                    <div style={{display:'flex', flexDirection:'column', gap:2}}>
                      <div>📄 <b>{doc.nombre}</b></div>
                      <div className="muted">{doc.mod || "—"} · {doc.tam || "—"}</div>
                    </div>
                    <div style={{display:'flex', gap:6}}>
                      <button className="ed-btn" onClick={()=>setOpenDoc(doc)}>Ver</button>
                      <button className="ed-btn" onClick={()=>fakeDownload(doc.nombre)}>Descargar</button>
                      <button className="ed-btn" onClick={()=>askRename(doc)}>Renombrar</button>
                      <button className="ed-btn" onClick={()=>onDelete?.(doc.id)}>Eliminar</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="pushpop-actions" style={{marginTop:12}}>
              <div style={{flex:1}} />
              <input
                ref={folderFileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                style={{display:'none'}}
                onChange={(e)=>{ const f=e.target.files?.[0]; if (f) setPickedInFolder(f); }}
              />
              <button className="ed-btn" onClick={()=>folderFileInputRef.current?.click()}>Elegir archivo</button>
              <button className="ed-btn primary" onClick={confirmUploadIntoFolder} disabled={!pickedInFolder}>Subir a “{openFolder.nombre}”</button>
              <button className="ed-btn" onClick={()=>setOpenFolder(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* PushPop: Detalle documento */}
      {openDoc && (
        <div className="pushpop-overlay" role="dialog" aria-modal="true" onClick={()=>setOpenDoc(null)}>
          <div className="pushpop-card" role="document" onClick={(e)=>e.stopPropagation()}>
            <div className="pushpop-title">Documento: {openDoc.nombre}</div>
            <div className="muted" style={{marginBottom:8}}>Últ. mod: {openDoc.mod || "—"} · Tamaño: {openDoc.tam || "—"}</div>
            <div style={{border:'1px solid #2a2a36', borderRadius:12, padding:12, background:'#13131b'}}>
              <div className="muted">Vista previa (mock)</div>
              <div style={{height:160, display:'grid', placeItems:'center'}}>👁️ No hay previsualización disponible</div>
            </div>
            <div className="pushpop-actions">
              <button className="ed-btn" onClick={()=>askRename(openDoc)}>Renombrar</button>
              <button className="ed-btn" onClick={()=>fakeDownload(openDoc.nombre)}>Descargar</button>
              <button className="ed-btn danger" onClick={()=>{ onDelete?.(openDoc.id); setOpenDoc(null); }}>Eliminar</button>
              <div style={{flex:1}} />
              <button className="ed-btn" onClick={()=>setOpenDoc(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* PushPop: Renombrar */}
      {renameTarget && (
        <div className="pushpop-overlay" role="dialog" aria-modal="true" onClick={()=>setRenameTarget(null)}>
          <div className="pushpop-card" role="document" onClick={(e)=>e.stopPropagation()}>
            <div className="pushpop-title">Renombrar</div>
            <input value={renameText} onChange={(e)=>setRenameText(e.target.value)} className="pushpop-input" aria-label="Nuevo nombre" />
            <div className="pushpop-actions">
              <button className="ed-btn" onClick={()=>setRenameTarget(null)}>Cancelar</button>
              <button className="ed-btn primary" onClick={confirmRename} disabled={!renameText.trim()}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* PushPop: Subir a carpeta (desde menú ⋯) */}
      {uploadFolder && (
        <div className="pushpop-overlay" role="dialog" aria-modal="true" onClick={()=>setUploadFolder(null)}>
          <div className="pushpop-card" role="document" onClick={(e)=>e.stopPropagation()}>
            <div className="pushpop-title">Subir a: {uploadFolder.nombre}</div>
            <div className="dropzone"
              onDragOver={(e)=>e.preventDefault()}
              onDrop={(e)=>{ e.preventDefault(); const f=e.dataTransfer?.files?.[0]; if (f) setPickedInFolder(f); }}
            >
              <div className="dropzone-icon">⬆️</div>
              <div className="dropzone-text">Arrastra aquí o <span className="muted">elige un archivo</span></div>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                style={{display:'none'}}
                onChange={(e)=>{ const f=e.target.files?.[0]; if (f) setPickedInFolder(f); }}
                ref={folderFileInputRef}
              />
              <button className="ed-btn" onClick={()=>folderFileInputRef.current?.click()}>Elegir archivo</button>
            </div>
            <div className="picked" style={{marginTop:10}}>
              {pickedInFolder ? <div className="picked-file"><span>📄 {pickedInFolder.name}</span><span className="muted">{(pickedInFolder.size/1024/1024).toFixed(1)} MB</span></div> : <div className="muted">Ningún archivo seleccionado</div>}
            </div>
            <div className="pushpop-actions">
              <button className="ed-btn" onClick={()=>setUploadFolder(null)}>Cancelar</button>
              <button className="ed-btn primary" onClick={confirmUploadIntoFolder} disabled={!pickedInFolder}>Subir</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .kebab-menu{
          z-index: 1000;
          background:#0b0b11; color:#fff; border:1px solid rgba(255,255,255,.08);
          border-radius:12px; box-shadow:0 10px 30px rgba(0,0,0,.35);
          padding:6px; display:flex; flex-direction:column; min-width: 220px;
        }
        .kebab-menu button{ text-align:left; background:transparent; border:none; color:#fff; padding:8px 10px; border-radius:8px; cursor:pointer; }
        .kebab-menu button:hover{ background:#181826 }
        .kebab-menu .danger{ color:#fca5a5 }

        .pushpop-overlay{
          position:fixed; inset:0; background:rgba(17,24,39,.5);
          display:flex; align-items:flex-start; justify-content:center; padding-top:10vh;
          z-index: 999; animation: pp-fade .12s ease-out;
        }
        .pushpop-card{
          width:min(560px, 92vw);
          background:#0b0b11; color:#fff; border:1px solid rgba(255,255,255,.08);
          border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,.35);
          padding:18px; transform-origin: top center; animation: pp-drop .16s ease-out;
        }
        .pushpop-title{ font-weight:800; font-size:16px; margin-bottom:10px }
        .pushpop-input{
          width:100%; border:1px solid #2a2a36; background:#13131b; color:#fff;
          border-radius:10px; padding:10px 12px; outline:none; font-size:14px;
        }
        .pushpop-input:focus{ border-color:#6d6dff; box-shadow:0 0 0 3px rgba(109,109,255,.15) }
        .pushpop-actions{ display:flex; justify-content:flex-end; gap:8px; margin-top:14px }

        .dropzone{ border:1px dashed #3b3b4a; border-radius:12px; padding:18px; text-align:center; margin-top:4px; background:#111118; }
        .dropzone-icon{ font-size:22px; margin-bottom:6px }
        .dropzone-text{ color:#d1d5db; margin-bottom:10px }
        .muted{ color:#9CA3AF; font-size:12px }
        .picked-file{ display:flex; justify-content:space-between; align-items:center; gap:8px; padding:8px 10px; border:1px solid #2a2a36; background:#13131b; border-radius:10px; }

        @keyframes pp-fade { from{opacity:0} to{opacity:1} }
        @keyframes pp-drop { from{opacity:0; transform: translateY(-8px) scale(.98)} to{opacity:1; transform: translateY(0) scale(1)} }
      `}</style>
    </div>
  );
};
