/* ======================= Documentos (Tictiva PushPop + Dropdown) ====================== */
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

  const [openFolder, setOpenFolder] = useState(null);
  const [openDoc, setOpenDoc] = useState(null);

  const [renameTarget, setRenameTarget] = useState(null);
  const [renameText, setRenameText] = useState("");

  const [uploadFolder, setUploadFolder] = useState(null);
  const folderFileInputRef = React.useRef(null);
  const [pickedInFolder, setPickedInFolder] = useState(null);

  const isFolder = (it) => (it?.tipo || "").toLowerCase() === "folder";
  const childrenOf = (folderId) => items.filter(d => d.parentId === folderId && d.tipo !== "folder");

  useEffect(() => {
    if (showPush && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); }
  }, [showPush]);

  const handleCreateFolder = () => {
    const name = (folderName || "").trim();
    if (!name) return;
    try {
      if (typeof onNuevaCarpeta === "function") {
        if (onNuevaCarpeta.length >= 1) onNuevaCarpeta(name); // si tu handler acepta nombre
        else onNuevaCarpeta(); // compatibilidad con tu implementación actual (prompt)
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
          <button className="ed-btn" type="button" onClick={()=>{ setFolderName(""); setShowPush(true); }}>Nueva Carpeta</button>
          <button className="ed-btn primary" type="button" onClick={()=>{ setPicked(null); setShowUpload(true); }}>Subir Archivo</button>
        </div>
      </div>

      <table className="asistencia-tabla">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Fecha de Modificación</th>
            <th>Tamaño</th>
            <th style={{width:120, textAlign:'right'}}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              <td style={{fontWeight:600}}>{isFolder(it) ? "📁" : "📄"} {it.nombre}</td>
              <td>{it.mod || "—"}</td>
              <td>{isFolder(it) ? "—" : (it.tam || "—")}</td>
              <RowActions
                item={it}
                isFolder={isFolder(it)}
                onOpenDoc={() => setOpenDoc(it)}
                onOpenFolder={() => setOpenFolder(it)}
                onUploadToFolder={() => setUploadFolder(it)}
                onRename={() => askRename(it)}
                onDelete={() => removeItem(it)}
                onDownload={() => fakeDownload(it.nombre)}
              />
            </tr>
          ))}
          {items.length === 0 && (
            <tr><td colSpan={4} style={{color:'#6B7280'}}>Sin documentos por ahora.</td></tr>
          )}
        </tbody>
      </table>

      {/* PushPop: Nueva carpeta */}
      {showPush && (
        <PushPop onClose={()=>setShowPush(false)} title="Nombre de la nueva carpeta">
          <input
            ref={inputRef}
            value={folderName}
            onChange={(e)=>setFolderName(e.target.value)}
            className="pushpop-input"
            placeholder="p. ej. Contratos 2025"
            aria-label="Nombre de la nueva carpeta"
          />
          <div className="pushpop-actions">
            <button className="ed-btn" type="button" onClick={()=>setShowPush(false)}>Cancelar</button>
            <button className="ed-btn primary" type="button" onClick={handleCreateFolder} disabled={!folderName.trim()}>
              Crear
            </button>
          </div>
        </PushPop>
      )}

      {/* PushPop: Subir (raíz) */}
      {showUpload && (
        <PushPop onClose={()=>setShowUpload(false)} title="Subir archivo">
          <Dropzone picked={picked} setPicked={setPicked} btnRef={fileInputRef} />
          <div className="pushpop-actions">
            <button className="ed-btn" type="button" onClick={()=>setShowUpload(false)}>Cancelar</button>
            <button className="ed-btn primary" type="button" onClick={()=>{ if (picked) onSubirArchivo?.(picked); setShowUpload(false); setPicked(null); }} disabled={!picked}>
              Subir
            </button>
          </div>
        </PushPop>
      )}

      {/* PushPop: Ver carpeta */}
      {openFolder && (
        <PushPop onClose={()=>setOpenFolder(null)} title={`Carpeta: ${openFolder.nombre}`}>
          <div className="muted" style={{marginBottom:8}}>Documentos dentro de esta carpeta</div>
          {childrenOf(openFolder.id).length === 0 ? (
            <div className="muted" style={{marginBottom:8}}>No hay documentos aquí aún.</div>
          ) : (
            <ul style={{listStyle:'none', margin:0, padding:0, maxHeight:280, overflow:'auto'}}>
              {childrenOf(openFolder.id).map(doc => (
                <li key={doc.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, padding:'8px 0', borderTop:'1px solid #E5E7EB'}}>
                  <div style={{display:'flex', flexDirection:'column', gap:2}}>
                    <div>📄 <b>{doc.nombre}</b></div>
                    <div className="muted">{doc.mod || "—"} · {doc.tam || "—"}</div>
                  </div>
                  <div style={{display:'flex', gap:6}}>
                    <button className="ed-btn" type="button" onClick={()=>setOpenDoc(doc)}>Ver</button>
                    <button className="ed-btn" type="button" onClick={()=>fakeDownload(doc.nombre)}>Descargar</button>
                    <button className="ed-btn" type="button" onClick={()=>askRename(doc)}>Renombrar</button>
                    <button className="ed-btn" type="button" onClick={()=>onDelete?.(doc.id)}>Eliminar</button>
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
            <button className="ed-btn" type="button" onClick={()=>folderFileInputRef.current?.click()}>Elegir archivo</button>
            <button className="ed-btn primary" type="button" onClick={confirmUploadIntoFolder} disabled={!pickedInFolder}>Subir a “{openFolder.nombre}”</button>
            <button className="ed-btn" type="button" onClick={()=>setOpenFolder(null)}>Cerrar</button>
          </div>
        </PushPop>
      )}

      {/* PushPop: Detalle documento */}
      {openDoc && (
        <PushPop onClose={()=>setOpenDoc(null)} title={`Documento: ${openDoc.nombre}`}>
          <div className="muted" style={{marginBottom:8}}>Últ. mod: {openDoc.mod || "—"} · Tamaño: {openDoc.tam || "—"}</div>
          <div style={{border:'1px solid #E5E7EB', borderRadius:12, padding:12, background:'#fff'}}>
            <div className="muted">Vista previa (mock)</div>
            <div style={{height:160, display:'grid', placeItems:'center'}}>👁️ No hay previsualización disponible</div>
          </div>
          <div className="pushpop-actions">
            <button className="ed-btn" type="button" onClick={()=>askRename(openDoc)}>Renombrar</button>
            <button className="ed-btn" type="button" onClick={()=>fakeDownload(openDoc.nombre)}>Descargar</button>
            <button className="ed-btn danger" type="button" onClick={()=>{ onDelete?.(openDoc.id); setOpenDoc(null); }}>Eliminar</button>
            <div style={{flex:1}} />
            <button className="ed-btn" type="button" onClick={()=>setOpenDoc(null)}>Cerrar</button>
          </div>
        </PushPop>
      )}

      {/* PushPop: Renombrar */}
      {renameTarget && (
        <PushPop onClose={()=>setRenameTarget(null)} title="Renombrar">
          <input value={renameText} onChange={(e)=>setRenameText(e.target.value)} className="pushpop-input" aria-label="Nuevo nombre" />
          <div className="pushpop-actions">
            <button className="ed-btn" type="button" onClick={()=>setRenameTarget(null)}>Cancelar</button>
            <button className="ed-btn primary" type="button" onClick={confirmRename} disabled={!renameText.trim()}>Guardar</button>
          </div>
        </PushPop>
      )}

      {/* Subir a carpeta (desde menú) */}
      {uploadFolder && (
        <PushPop onClose={()=>setUploadFolder(null)} title={`Subir a: ${uploadFolder.nombre}`}>
          <Dropzone picked={pickedInFolder} setPicked={setPickedInFolder} btnRef={folderFileInputRef} />
          <div className="pushpop-actions">
            <button className="ed-btn" type="button" onClick={()=>setUploadFolder(null)}>Cancelar</button>
            <button className="ed-btn primary" type="button" onClick={confirmUploadIntoFolder} disabled={!pickedInFolder}>Subir</button>
          </div>
        </PushPop>
      )}

      <style>{`
        .muted{ color:#6B7280; font-size:12px }
        .pushpop-input{
          width:100%; border:1px solid #E5E7EB; background:#fff; color:#111827;
          border-radius:10px; padding:10px 12px; outline:none; font-size:14px;
        }
        .pushpop-input:focus{ border-color:#93C5FD; box-shadow:0 0 0 3px rgba(59,130,246,.15) }
        .pushpop-actions{ display:flex; justify-content:flex-end; gap:8px; margin-top:14px }
      `}</style>
    </div>
  );
};

/* === Componentes auxiliares: RowActions / PushPop / Dropzone ================= */

const RowActions = ({
  item, isFolder,
  onOpenDoc, onOpenFolder, onUploadToFolder, onRename, onDelete, onDownload
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = React.useRef(null);

  // Cierra por click afuera (solo cuando está abierto)
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <td style={{ textAlign:'right', position:'relative' }}>
      <button className="ed-btn" type="button" aria-label="Acciones" onClick={(e)=>{ e.stopPropagation(); setOpen((v)=>!v); }}>⋯</button>
      {open && (
        <div
          ref={menuRef}
          style={{
            position:'absolute', right:0, top:'100%', transform:'translateY(6px)',
            zIndex: 9999, background:'#fff', border:'1px solid #E5E7EB',
            borderRadius:12, boxShadow:'0 10px 30px rgba(0,0,0,.12)', padding:6, minWidth:220
          }}
        >
          <div style={{fontWeight:800, fontSize:12, color:'#6B7280', padding:'6px 8px 8px'}}>Acciones</div>
          {isFolder ? (
            <>
              <MenuBtn text="📂 Abrir carpeta" onClick={()=>{ setOpen(false); onOpenFolder?.(); }} />
              <MenuBtn text="⬆️ Subir" onClick={()=>{ setOpen(false); onUploadToFolder?.(); }} />
              <MenuBtn text="✏️ Renombrar" onClick={()=>{ setOpen(false); onRename?.(); }} />
              <MenuBtn text="🗑️ Eliminar" danger onClick={()=>{ setOpen(false); onDelete?.(); }} />
            </>
          ) : (
            <>
              <MenuBtn text="👁️ Ver" onClick={()=>{ setOpen(false); onOpenDoc?.(); }} />
              <MenuBtn text="⬇️ Descargar" onClick={()=>{ setOpen(false); onDownload?.(); }} />
              <MenuBtn text="✏️ Renombrar" onClick={()=>{ setOpen(false); onRename?.(); }} />
              <MenuBtn text="🗑️ Eliminar" danger onClick={()=>{ setOpen(false); onDelete?.(); }} />
            </>
          )}
        </div>
      )}
    </td>
  );
};

const MenuBtn = ({ text, danger, onClick }) => (
  <button
    type="button"
    onClick={(e)=>{ e.stopPropagation(); onClick?.(); }}
    style={{
      textAlign:'left', width:'100%', background:'transparent', border:'none', padding:'8px 10px',
      borderRadius:8, cursor:'pointer', color: danger ? '#B91C1C' : '#111827'
    }}
    onMouseEnter={(e)=>{ e.currentTarget.style.background='#F3F4F6'; }}
    onMouseLeave={(e)=>{ e.currentTarget.style.background='transparent'; }}
  >
    {text}
  </button>
);

const PushPop = ({ title, onClose, children }) => {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="pushpop-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position:'fixed', inset:0, background:'rgba(17,24,39,.35)',
        display:'flex', alignItems:'flex-start', justifyContent:'center', paddingTop:'10vh',
        zIndex: 9998, animation: 'pp-fade .12s ease-out'
      }}
    >
      <div
        role="document"
        onClick={(e)=>e.stopPropagation()}
        style={{
          width:'min(560px, 92vw)', background:'#fff', color:'#111827', border:'1px solid #E5E7EB',
          borderRadius:16, boxShadow:'0 10px 30px rgba(0,0,0,.12)', padding:18, transformOrigin:'top center',
          animation:'pp-drop .16s ease-out'
        }}
      >
        <div style={{fontWeight:800, fontSize:16, marginBottom:10}}>{title}</div>
        {children}
        <style>{`
          @keyframes pp-fade { from{opacity:0} to{opacity:1} }
          @keyframes pp-drop { from{opacity:0; transform: translateY(-8px) scale(.98)} to{opacity:1; transform: translateY(0) scale(1)} }
        `}</style>
      </div>
    </div>
  );
};

const Dropzone = ({ picked, setPicked, btnRef }) => (
  <>
    <div
      className="dropzone"
      onDragOver={(e)=>e.preventDefault()}
      onDrop={(e)=>{ e.preventDefault(); const f=e.dataTransfer?.files?.[0]; if (f) setPicked(f); }}
      style={{ border:'1px dashed #CBD5E1', borderRadius:12, padding:18, textAlign:'center', marginTop:4, background:'#FAFAFA' }}
    >
      <div style={{fontSize:22, marginBottom:6}}>⬆️</div>
      <div style={{color:'#374151', marginBottom:10}}>Arrastra y suelta el archivo aquí<br/><span style={{color:'#6B7280', fontSize:12}}>o</span></div>
      <input
        ref={btnRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
        style={{display:'none'}}
        onChange={(e)=>{ const f=e.target.files?.[0]; if (f) setPicked(f); }}
      />
      <button className="ed-btn" type="button" onClick={()=>btnRef.current?.click()}>Elegir archivo</button>
    </div>
    <div style={{marginTop:10}}>
      {picked ? (
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:8, padding:'8px 10px', border:'1px solid #E5E7EB', background:'#fff', borderRadius:10}}>
          <span>📄 {picked.name}</span>
          <span style={{color:'#6B7280', fontSize:12}}>{(picked.size/1024/1024).toFixed(picked.size>10*1024*1024?0:1)} MB</span>
        </div>
      ) : (
        <div style={{color:'#6B7280', fontSize:12}}>Ningún archivo seleccionado</div>
      )}
    </div>
  </>
);
