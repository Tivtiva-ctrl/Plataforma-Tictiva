/* ======================= Documentos (Tictiva – con Acciones) ====================== */
const DocumentosTab = ({
  empleado,
  onNuevaCarpeta,
  onSubirArchivo,   // recibe (file?, parentId?)
  onDelete,         // opcional
  onRename,         // opcional
}) => {
  const items = Array.isArray(empleado?.documentos) ? empleado.documentos : [];

  const [menuItem, setMenuItem] = React.useState(null); // item del que se abre el menú ⋯
  const [modal, setModal] = React.useState(null);       // {type: 'create'|'folder'|'doc'|'rename', data?:any}
  const [inputVal, setInputVal] = React.useState("");
  const topFileRef = React.useRef(null); // input oculto del botón "Subir Archivo" del header

  const isFolder = (it) => (it?.tipo || "").toLowerCase() === "folder";
  const childrenOf = (folderId) => items.filter(x => (x.parentId || "") === folderId);

  // Cerrar menú ⋯ al hacer click fuera
  React.useEffect(() => {
    if (!menuItem) return;
    const onDocClick = () => setMenuItem(null);
    const t = setTimeout(() => window.addEventListener('click', onDocClick), 0);
    return () => { clearTimeout(t); window.removeEventListener('click', onDocClick); };
  }, [menuItem]);

  // ===== helpers =====
  const closeAll = () => { setMenuItem(null); setModal(null); setInputVal(""); };

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
        // si tu handler acepta 1 arg (nombre), lo uso; si no, lo llamo sin args
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
    <div className="ed-card" style={{ overflow:'visible' }}>
      {/* Header */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
        <h3 className="ed-card-title" style={{margin:0}}>Documentos</h3>
        <div style={{display:'flex', gap:8}}>
          <button className="ed-btn" type="button" onClick={()=>{ setModal({type:'create'}); setInputVal(""); }}>Nueva Carpeta</button>

          {/* input oculto para el botón del header */}
          <input
            ref={topFileRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
            style={{display:'none'}}
            onChange={(e)=>{
              const f = e.target.files?.[0];
              if (f) onSubirArchivo?.(f, null);
              e.target.value = "";
            }}
          />
          <button className="ed-btn primary" type="button" onClick={()=>topFileRef.current?.click()}>
            Subir Archivo
          </button>
        </div>
      </div>

      {/* Tabla */}
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

              {/* Botón ⋯ + mini menú */}
              <td className="mini-actions-cell" style={{ textAlign:'right', position:'relative' }}>
                <button
                  className="ed-btn"
                  type="button"
                  aria-label="Acciones"
                  onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); setMenuItem(it); }}
                >⋯</button>

                {menuItem?.id === it.id && (
                  <div className="mini-menu" role="menu" onClick={(e)=>e.stopPropagation()}>
                    {isFolder(it) ? (
                      <>
                        <button className="mini-menu-item" onClick={()=>{ setModal({type:'folder', data:it}); setMenuItem(null); }}>Abrir carpeta</button>
                        <button className="mini-menu-item" onClick={()=>{ onSubirArchivo?.(undefined, it.id); setMenuItem(null); }}>Subir aquí</button>
                        <button className="mini-menu-item" onClick={()=>{ setModal({type:'rename', data:it}); setInputVal(it.nombre || ""); setMenuItem(null); }}>Renombrar</button>
                        <button className="mini-menu-item danger" onClick={()=>{ doDelete(it); }}>Eliminar</button>
                      </>
                    ) : (
                      <>
                        <button className="mini-menu-item" onClick={()=>{ setModal({type:'doc', data:it}); setMenuItem(null); }}>Ver</button>
                        <button className="mini-menu-item" onClick={()=>{ humanDownload(it.nombre); setMenuItem(null); }}>Descargar</button>
                        <button className="mini-menu-item" onClick={()=>{ setModal({type:'rename', data:it}); setInputVal(it.nombre || ""); setMenuItem(null); }}>Renombrar</button>
                        <button className="mini-menu-item danger" onClick={()=>{ doDelete(it); }}>Eliminar</button>
                      </>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr><td colSpan={4} style={{color:'#6B7280'}}>Sin documentos por ahora.</td></tr>
          )}
        </tbody>
      </table>

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

      {/* ===== PushPop: ver carpeta (con hijos por parentId) ===== */}
      {modal?.type === "folder" && (
        <PushPop title={`Carpeta: ${modal.data?.nombre || ""}`} onClose={closeAll}>
          <div className="muted" style={{marginBottom:8}}>Últ. mod: {modal.data?.mod || "—"}</div>

          <div style={{display:'flex', justifyContent:'flex-end', marginBottom:8}}>
            <button className="ed-btn" onClick={()=>onSubirArchivo?.(undefined, modal.data?.id)}>Subir aquí</button>
          </div>

          {childrenOf(modal.data?.id).length === 0 ? (
            <div className="muted">Esta carpeta está vacía.</div>
          ) : (
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
                {childrenOf(modal.data?.id).map(child => (
                  <tr key={child.id}>
                    <td style={{fontWeight:600}}>📄 {child.nombre}</td>
                    <td>{child.mod || "—"}</td>
                    <td>{child.tam || "—"}</td>
                    <td style={{textAlign:'right'}}>
                      <button className="ed-btn" onClick={()=>setModal({type:'doc', data:child})}>Ver</button>
                      <button className="ed-btn" onClick={()=>humanDownload(child.nombre)}>Descargar</button>
                      <button className="ed-btn" onClick={()=>{ setModal({type:'rename', data:child}); setInputVal(child.nombre || ""); }}>Renombrar</button>
                      <button className="ed-btn" onClick={()=>doDelete(child)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="pushpop-actions"><button className="ed-btn" onClick={closeAll}>Cerrar</button></div>
        </PushPop>
      )}

      {/* ===== PushPop: ver documento ===== */}
      {modal?.type === "doc" && (
        <PushPop title={`Documento: ${modal.data?.nombre || ""}`} onClose={closeAll}>
          <div className="muted" style={{marginBottom:8}}>Últ. mod: {modal.data?.mod || "—"} · Tamaño: {modal.data?.tam || "—"}</div>
          <div style={{border:'1px solid #E5E7EB', borderRadius:12, padding:12, background:'#fff'}}>
            <div className="muted">Vista previa (mock)</div>
            <div style={{height:160, display:'grid', placeItems:'center'}}>No hay previsualización disponible</div>
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

      {/* Estilos locales */}
      <style>{`
        .muted{ color:#6B7280; font-size:12px }
        .pushpop-input{
          width:100%; border:1px solid #E5E7EB; background:#fff; color:#111827;
          border-radius:10px; padding:10px 12px; outline:none; font-size:14px;
        }
        .pushpop-input:focus{ border-color:#93C5FD; box-shadow:0 0 0 3px rgba(59,130,246,.15) }
        .pushpop-actions{ display:flex; justify-content:flex-end; gap:8px; margin-top:14px }

        /* Mini menú ⋯ */
        .mini-actions-cell{ position:relative; overflow:visible; }
        .mini-menu{
          position:absolute; top: calc(100% + 6px); right:0;
          width:220px; background:#fff; border:1px solid #E5E7EB; border-radius:10px;
          box-shadow:0 10px 20px rgba(0,0,0,.08); padding:6px; z-index:9999;
        }
        .mini-menu-item{
          width:100%; text-align:left; background:transparent; border:none;
          padding:8px 10px; border-radius:8px; font-weight:600; color:#111827; cursor:pointer;
        }
        .mini-menu-item:hover{ background:#F9FAFB; }
        .mini-menu-item.danger{ color:#B91C1C; }
      `}</style>
    </div>
  );
};
