/* ======================= Documentos (Tictiva – menú en PushPop) ====================== */
const DocumentosTab = ({
  empleado,
  onNuevaCarpeta,
  onSubirArchivo,   // (file, parentId?) => void  (tu handler actual ignora el 2° arg y sirve igual)
  onDelete,         // (id) => void               (opcional: si no lo pasas, hago confirm + alerta)
  onRename,         // (id, newName) => void      (opcional)
}) => {
  const items = Array.isArray(empleado?.documentos) ? empleado.documentos : [];

  const [menuItem, setMenuItem] = useState(null);          // item seleccionado para el menú
  const [showCreate, setShowCreate] = useState(false);     // crear carpeta
  const [newFolder, setNewFolder] = useState("");

  const [showUploadRoot, setShowUploadRoot] = useState(false);
  const [pickedRoot, setPickedRoot] = useState(null);
  const rootFileBtn = React.useRef(null);

  const [openFolder, setOpenFolder] = useState(null);      // ver contenidos de carpeta
  const [openDoc, setOpenDoc] = useState(null);            // ver detalle doc

  const [uploadFolder, setUploadFolder] = useState(null);  // subir dentro de carpeta
  const [pickedInFolder, setPickedInFolder] = useState(null);
  const folderFileBtn = React.useRef(null);

  const [renameTarget, setRenameTarget] = useState(null);  // renombrar (id/nombre)
  const [renameText, setRenameText] = useState("");

  const isFolder = (it) => (it?.tipo || "").toLowerCase() === "folder";
  const childrenOf = (folderId) => items.filter(d => d.parentId === folderId && d.tipo !== "folder");

  // === helpers ===
  const humanDownload = (name) => {
    const blob = new Blob([`Descarga simulada de ${name}\n(placeholder)`], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name || "archivo.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const doDelete = (it) => {
    if (!it) return;
    if (!onDelete) { window.confirm("Eliminar no implementado"); return; }
    if (isFolder(it)) {
      const hijos = childrenOf(it.id);
      if (hijos.length && !window.confirm(`La carpeta contiene ${hijos.length} documento(s). ¿Eliminar todo?`)) return;
      hijos.forEach(h => onDelete(h.id));
    }
    onDelete(it.id);
  };

  const confirmCreateFolder = () => {
    const name = (newFolder || "").trim();
    if (!name) return;
    try {
      if (typeof onNuevaCarpeta === "function") {
        // compat: si tu handler no recibe nombre, solo lo llamo
        if (onNuevaCarpeta.length >= 1) onNuevaCarpeta(name);
        else onNuevaCarpeta();
      }
    } finally {
      setShowCreate(false);
      setNewFolder("");
    }
  };

  const confirmUploadRoot = () => {
    if (pickedRoot) onSubirArchivo?.(pickedRoot);
    setShowUploadRoot(false);
    setPickedRoot(null);
  };

  const confirmUploadToFolder = () => {
    if (pickedInFolder && uploadFolder) {
      onSubirArchivo?.(pickedInFolder, uploadFolder.id);
    }
    setUploadFolder(null);
    setPickedInFolder(null);
  };

  const startRename = (it) => { setRenameTarget({ id: it.id, nombre: it.nombre }); setRenameText(it.nombre || ""); };
  const confirmRename = () => {
    const txt = (renameText || "").trim();
    if (txt && renameTarget) onRename?.(renameTarget.id, txt);
    setRenameTarget(null);
  };

  return (
    <div className="ed-card">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
        <h3 className="ed-card-title" style={{margin:0}}>Documentos</h3>
        <div style={{display:'flex', gap:8}}>
          <button className="ed-btn" type="button" onClick={()=>setShowCreate(true)}>Nueva Carpeta</button>
          <button className="ed-btn primary" type="button" onClick={()=>setShowUploadRoot(true)}>Subir Archivo</button>
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
              <td style={{ textAlign:'right' }}>
                <button
                  className="ed-btn"
                  type="button"
                  aria-label="Acciones"
                  onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); setMenuItem(it); }}
                >
                  ⋯
                </button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr><td colSpan={4} style={{color:'#6B7280'}}>Sin documentos por ahora.</td></tr>
          )}
        </tbody>
      </table>

      {/* ===== Menú de Acciones (PushPop) ===== */}
      {menuItem && (
        <PushPop onClose={()=>setMenuItem(null)} title="Acciones">
          {isFolder(menuItem) ? (
            <div style={{display:'grid', gap:8}}>
              <button className="ed-btn" type="button" onClick={()=>{ setOpenFolder(menuItem); setMenuItem(null); }}>📂 Abrir carpeta</button>
              <button className="ed-btn" type="button" onClick={()=>{ setUploadFolder(menuItem); setMenuItem(null); }}>⬆️ Subir</button>
              <button className="ed-btn" type="button" onClick={()=>{ startRename(menuItem); setMenuItem(null); }}>✏️ Renombrar</button>
              <button className="ed-btn" type="button" onClick={()=>{ doDelete(menuItem); setMenuItem(null); }}>🗑️ Eliminar</button>
              <div style={{display:'flex', justifyContent:'flex-end', marginTop:6}}>
                <button className="ed-btn" type="button" onClick={()=>setMenuItem(null)}>Cerrar</button>
              </div>
            </div>
          ) : (
            <div style={{display:'grid', gap:8}}>
              <button className="ed-btn" type="button" onClick={()=>{ setOpenDoc(menuItem); setMenuItem(null); }}>👁️ Ver</button>
              <button className="ed-btn" type="button" onClick={()=>{ humanDownload(menuItem.nombre); setMenuItem(null); }}>⬇️ Descargar</button>
              <button className="ed-btn" type="button" onClick={()=>{ startRename(menuItem); setMenuItem(null); }}>✏️ Renombrar</button>
              <button className="ed-btn" type="button" onClick={()=>{ doDelete(menuItem); setMenuItem(null); }}>🗑️ Eliminar</button>
              <div style={{display:'flex', justifyContent:'flex-end', marginTop:6}}>
                <button className="ed-btn" type="button" onClick={()=>setMenuItem(null)}>Cerrar</button>
              </div>
            </div>
          )}
        </PushPop>
      )}

      {/* ===== Crear carpeta ===== */}
      {showCreate && (
        <PushPop onClose={()=>setShowCreate(false)} title="Nombre de la nueva carpeta">
          <input
            className="pushpop-input"
            value={newFolder}
            onChange={(e)=>setNewFolder(e.target.value)}
            placeholder="p. ej. Contratos 2025"
          />
          <div className="pushpop-actions">
            <button className="ed-btn" type="button" onClick={()=>setShowCreate(false)}>Cancelar</button>
            <button className="ed-btn primary" type="button" onClick={confirmCreateFolder} disabled={!newFolder.trim()}>Crear</button>
          </div>
        </PushPop>
      )}

      {/* ===== Subir (raíz) ===== */}
      {showUploadRoot && (
        <PushPop onClose={()=>setShowUploadRoot(false)} title="Subir archivo">
          <Dropzone picked={pickedRoot} setPicked={setPickedRoot} btnRef={rootFileBtn} />
          <div className="pushpop-actions">
            <button className="ed-btn" type="button" onClick={()=>setShowUploadRoot(false)}>Cancelar</button>
            <button className="ed-btn primary" type="button" onClick={confirmUploadRoot} disabled={!pickedRoot}>Subir</button>
          </div>
        </PushPop>
      )}

      {/* ===== Ver carpeta ===== */}
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
                    <button className="ed-btn" type="button" onClick={()=>humanDownload(doc.nombre)}>Descargar</button>
                    <button className="ed-btn" type="button" onClick={()=>startRename(doc)}>Renombrar</button>
                    <button className="ed-btn" type="button" onClick={()=>onDelete?.(doc.id)}>Eliminar</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="pushpop-actions" style={{marginTop:12}}>
            <div style={{flex:1}} />
            <input
              ref={folderFileBtn}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              style={{display:'none'}}
              onChange={(e)=>{ const f=e.target.files?.[0]; if (f) setPickedInFolder(f); }}
            />
            <button className="ed-btn" type="button" onClick={()=>folderFileBtn.current?.click()}>Elegir archivo</button>
            <button className="ed-btn primary" type="button" onClick={confirmUploadToFolder} disabled={!pickedInFolder}>Subir a “{openFolder.nombre}”</button>
            <button className="ed-btn" type="button" onClick={()=>setOpenFolder(null)}>Cerrar</button>
          </div>
        </PushPop>
      )}

      {/* ===== Ver documento ===== */}
      {openDoc && (
        <PushPop onClose={()=>setOpenDoc(null)} title={`Documento: ${openDoc.nombre}`}>
          <div className="muted" style={{marginBottom:8}}>Últ. mod: {openDoc.mod || "—"} · Tamaño: {openDoc.tam || "—"}</div>
          <div style={{border:'1px solid #E5E7EB', borderRadius:12, padding:12, background:'#fff'}}>
            <div className="muted">Vista previa (mock)</div>
            <div style={{height:160, display:'grid', placeItems:'center'}}>👁️ No hay previsualización disponible</div>
          </div>
          <div className="pushpop-actions">
            <button className="ed-btn" type="button" onClick={()=>startRename(openDoc)}>Renombrar</button>
            <button className="ed-btn" type="button" onClick={()=>humanDownload(openDoc.nombre)}>Descargar</button>
            <button className="ed-btn danger" type="button" onClick={()=>{ onDelete?.(openDoc.id); setOpenDoc(null); }}>Eliminar</button>
            <div style={{flex:1}} />
            <button className="ed-btn" type="button" onClick={()=>setOpenDoc(null)}>Cerrar</button>
          </div>
        </PushPop>
      )}

      {/* ===== Renombrar ===== */}
      {renameTarget && (
        <PushPop onClose={()=>setRenameTarget(null)} title="Renombrar">
          <input value={renameText} onChange={(e)=>setRenameText(e.target.value)} className="pushpop-input" />
          <div className="pushpop-actions">
            <button className="ed-btn" type="button" onClick={()=>setRenameTarget(null)}>Cancelar</button>
            <button className="ed-btn primary" type="button" onClick={confirmRename} disabled={!renameText.trim()}>Guardar</button>
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
