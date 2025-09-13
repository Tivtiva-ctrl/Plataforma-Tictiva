/* ======================= Documentos (Tictiva – con Acciones y upload fiable) ====================== */
const DocumentosTab = ({
  empleado,
  onNuevaCarpeta,
  onSubirArchivo,   // 0 args (compat) o (file, folderId) recomendado
  onDelete,         // opcional
  onRename,         // opcional
}) => {
  const items = Array.isArray(empleado?.documentos) ? empleado.documentos : [];

  const [menuItem, setMenuItem] = React.useState(null);
  const [modal, setModal] = React.useState(null);    // {type:'create'|'folder'|'doc'|'rename', data?}
  const [inputVal, setInputVal] = React.useState("");
  const [targetFolderId, setTargetFolderId] = React.useState(null);

  const fileRef = React.useRef(null);

  const isFolder = (it) => (it?.tipo || "").toLowerCase() === "folder";
  const closeAll = () => { setMenuItem(null); setModal(null); setInputVal(""); setTargetFolderId(null); };

  // ===== Upload fiable =====
  const supportsFileArg = typeof onSubirArchivo === "function" && onSubirArchivo.length >= 1;
  const triggerUpload = (folderId = null) => {
    if (supportsFileArg && fileRef.current) {
      setTargetFolderId(folderId || null);
      fileRef.current.click(); // abre file picker verdadero en el DOM
    } else {
      // compatibilidad con tu handler anterior (crea su propio input interno)
      onSubirArchivo?.();
      closeAll();
    }
  };
  const onLocalFilePicked = (e) => {
    const file = e.target.files && e.target.files[0];
    // limpiamos el value para permitir volver a elegir el mismo archivo después
    e.target.value = "";
    if (!file) return;
    if (supportsFileArg) onSubirArchivo(file, targetFolderId || null);
    closeAll();
  };

  // ===== Acciones mock =====
  const humanDownload = (name) => {
    const blob = new Blob([`Descarga simulada de ${name}\n(placeholder)`], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = name || "archivo.txt"; a.click();
    URL.revokeObjectURL(url);
  };

  const doCreateFolder = () => {
    const name = (inputVal || "").trim();
    if (!name) return;
    try {
      if (typeof onNuevaCarpeta === "function") {
        if (onNuevaCarpeta.length >= 1) onNuevaCarpeta(name);
        else onNuevaCarpeta();
      }
    } finally {
      closeAll();
    }
  };

  const doRename = () => {
    const name = (inputVal || "").trim();
    if (!name || !modal?.data) return;
    if (typeof onRename === "function") onRename(modal.data.id, name);
    else window.alert("Renombrar (mock): implementa onRename si quieres persistir.");
    closeAll();
  };

  const doDelete = (it) => {
    if (!it) return;
    if (typeof onDelete === "function") onDelete(it.id);
    else window.alert("Eliminar (mock): implementa onDelete si quieres persistir.");
    closeAll();
  };

  return (
    <div className="ed-card">
      {/* input file real, oculto */}
      <input
        ref={fileRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
        style={{ display: "none" }}
        onChange={onLocalFilePicked}
      />

      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
        <h3 className="ed-card-title" style={{margin:0}}>Documentos</h3>
        <div style={{display:'flex', gap:8}}>
          <button className="ed-btn" type="button" onClick={()=>{ setModal({type:'create'}); setInputVal(""); }}>Nueva Carpeta</button>
          <button className="ed-btn primary" type="button" onClick={()=>triggerUpload(null)}>Subir Archivo</button>
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
                >⋯</button>
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr><td colSpan={4} style={{color:'#6B7280'}}>Sin documentos por ahora.</td></tr>
          )}
        </tbody>
      </table>

      {/* ===== Menú (PushPop) ===== */}
      {menuItem && (
        <PushPop title="Acciones" onClose={closeAll}>
          {isFolder(menuItem) ? (
            <div style={{display:'grid', gap:8}}>
              <button className="ed-btn" type="button" onClick={()=>{ setModal({type:'folder', data:menuItem}); setMenuItem(null); }}>📂 Abrir carpeta</button>
              <button className="ed-btn" type="button" onClick={()=>triggerUpload(menuItem.id)}>⬆️ Subir</button>
              <button className="ed-btn" type="button" onClick={()=>{ setModal({type:'rename', data:menuItem}); setInputVal(menuItem.nombre || ""); setMenuItem(null); }}>✏️ Renombrar</button>
              <button className="ed-btn" type="button" onClick={()=>doDelete(menuItem)}>🗑️ Eliminar</button>
              <div style={{display:'flex', justifyContent:'flex-end'}}><button className="ed-btn" onClick={closeAll}>Cerrar</button></div>
            </div>
          ) : (
            <div style={{display:'grid', gap:8}}>
              <button className="ed-btn" type="button" onClick={()=>{ setModal({type:'doc', data:menuItem}); setMenuItem(null); }}>👁️ Ver</button>
              <button className="ed-btn" type="button" onClick={()=>{ humanDownload(menuItem.nombre); closeAll(); }}>⬇️ Descargar</button>
              <button className="ed-btn" type="button" onClick={()=>{ setModal({type:'rename', data:menuItem}); setInputVal(menuItem.nombre || ""); setMenuItem(null); }}>✏️ Renombrar</button>
              <button className="ed-btn" type="button" onClick={()=>doDelete(menuItem)}>🗑️ Eliminar</button>
              <div style={{display:'flex', justifyContent:'flex-end'}}><button className="ed-btn" onClick={closeAll}>Cerrar</button></div>
            </div>
          )}
        </PushPop>
      )}

      {/* ===== PushPop: crear carpeta ===== */}
      {modal?.type === "create" && (
        <PushPop title="Nueva carpeta" onClose={closeAll}>
          <input className="pushpop-input" placeholder="Ej. Contratos 2025" value={inputVal} onChange={(e)=>setInputVal(e.target.value)} />
          <div className="pushpop-actions">
            <button className="ed-btn" onClick={closeAll}>Cancelar</button>
            <button className="ed-btn primary" onClick={doCreateFolder} disabled={!inputVal.trim()}>Crear</button>
          </div>
        </PushPop>
      )}

      {/* ===== PushPop: ver carpeta (mock) ===== */}
      {modal?.type === "folder" && (
        <PushPop title={`Carpeta: ${modal.data?.nombre || ""}`} onClose={closeAll}>
          <div className="muted" style={{marginBottom:8}}>En este mock no hay hijos definidos. Si manejas jerarquía (parentId), pásame esa data y lo listamos aquí.</div>
          <div className="pushpop-actions"><button className="ed-btn" onClick={closeAll}>Cerrar</button></div>
        </PushPop>
      )}

      {/* ===== PushPop: ver documento (mock) ===== */}
      {modal?.type === "doc" && (
        <PushPop title={`Documento: ${modal.data?.nombre || ""}`} onClose={closeAll}>
          <div className="muted" style={{marginBottom:8}}>Últ. mod: {modal.data?.mod || "—"} · Tamaño: {modal.data?.tam || "—"}</div>
          <div style={{border:'1px solid #E5E7EB', borderRadius:12, padding:12, background:'#fff'}}>
            <div className="muted">Vista previa (mock)</div>
            <div style={{height:160, display:'grid', placeItems:'center'}}>👁️ No hay previsualización disponible</div>
          </div>
          <div className="pushpop-actions">
            <button className="ed-btn" onClick={()=>{ humanDownload(modal.data?.nombre || "archivo"); }}>Descargar</button>
            <div style={{flex:1}} />
            <button className="ed-btn" onClick={closeAll}>Cerrar</button>
          </div>
        </PushPop>
      )}

      {/* ===== PushPop: renombrar ===== */}
      {modal?.type === "rename" && (
        <PushPop title="Renombrar" onClose={closeAll}>
          <input className="pushpop-input" value={inputVal} onChange={(e)=>setInputVal(e.target.value)} />
          <div className="pushpop-actions">
            <button className="ed-btn" onClick={closeAll}>Cancelar</button>
            <button className="ed-btn primary" onClick={doRename} disabled={!inputVal.trim()}>Guardar</button>
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

/* ===== Mini PushPop (igual que antes) ===== */
function PushPop({ title, onClose, children }) {
  React.useEffect(() => {
    const onEsc = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" className="pp-wrap" onMouseDown={onClose}>
      <div className="pp-card" onMouseDown={(e)=>e.stopPropagation()}>
        <div className="pp-head">
          <div className="pp-title">{title || "Acciones"}</div>
          <button className="ed-btn" type="button" onClick={onClose}>✕</button>
        </div>
        <div className="pp-body">{children}</div>
      </div>
      <style>{`
        .pp-wrap{ position:fixed; inset:0; background:rgba(17,24,39,.45); display:grid; place-items:center; z-index:9999 }
        .pp-card{ width:min(520px, 92vw); background:#fff; border:1px solid #E5E7EB; border-radius:16px; box-shadow:0 20px 40px rgba(0,0,0,.25); }
        .pp-head{ display:flex; align-items:center; justify-content:space-between; padding:12px 12px 0 16px }
        .pp-title{ font-weight:800; color:#111827; font-size:16px }
        .pp-body{ padding:12px 16px 16px; }
      `}</style>
    </div>
  );
}
