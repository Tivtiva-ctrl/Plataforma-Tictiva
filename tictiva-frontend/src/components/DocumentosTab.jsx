/* ======================= Documentos (Tictiva – con Acciones) ====================== */
const DocumentosTab = ({
  empleado,
  onNuevaCarpeta,
  onSubirArchivo,   // puede aceptar (file?, folderId?)
  onDelete,         // opcional
  onRename,         // opcional
}) => {
  const items = Array.isArray(empleado?.documentos) ? empleado.documentos : [];

  // --- estado para popover chico anclado al botón de cada fila
  const [menuId, setMenuId] = React.useState(null);     // id del item que tiene el menú abierto
  const menuRef = React.useRef(null);

  // --- estado para los PushPop (crear carpeta / ver doc / ver carpeta / renombrar)
  const [modal, setModal] = React.useState(null);       // {type: 'create'|'folder'|'doc'|'rename', data?:any}
  const [inputVal, setInputVal] = React.useState("");

  const isFolder = (it) => (it?.tipo || "").toLowerCase() === "folder";

  React.useEffect(() => {
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuId(null);
    };
    const onKey = (e) => { if (e.key === "Escape") setMenuId(null); };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // ===== helpers =====
  const closeAll = () => { setMenuId(null); setModal(null); setInputVal(""); };

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
        if (onNuevaCarpeta.length >= 1) onNuevaCarpeta(name); // si tu handler acepta nombre
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
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
        <h3 className="ed-card-title" style={{margin:0}}>Documentos</h3>
        <div style={{display:'flex', gap:8}}>
          <button className="ed-btn" type="button" onClick={()=>{ setModal({type:'create'}); setInputVal(""); }}>Nueva Carpeta</button>
          <button className="ed-btn primary" type="button" onClick={()=>onSubirArchivo?.()}>Subir Archivo</button>
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

              {/* Acciones: botón tres puntos + popover chico anclado */}
              <td className="mini-actions-cell">
                <button
                  className="ed-btn"
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={menuId === it.id}
                  onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); setMenuId(prev => prev === it.id ? null : it.id); }}
                >⋯</button>

                {menuId === it.id && (
                  <div ref={menuRef} className="mini-menu" role="menu" aria-label="Acciones">
                    {isFolder(it) ? (
                      <>
                        <button className="mini-menu-item" role="menuitem" onClick={()=>{ setModal({type:'folder', data:it}); setMenuId(null); }}>Abrir carpeta</button>
                        <button className="mini-menu-item" role="menuitem" onClick={()=>{ onSubirArchivo?.(undefined, it.id); setMenuId(null); }}>Subir aquí</button>
                        <button className="mini-menu-item" role="menuitem" onClick={()=>{ setModal({type:'rename', data:it}); setInputVal(it.nombre || ""); setMenuId(null); }}>Renombrar</button>
                        <button className="mini-menu-item danger" role="menuitem" onClick={()=>{ doDelete(it); setMenuId(null); }}>Eliminar</button>
                      </>
                    ) : (
                      <>
                        <button className="mini-menu-item" role="menuitem" onClick={()=>{ setModal({type:'doc', data:it}); setMenuId(null); }}>Ver</button>
                        <button className="mini-menu-item" role="menuitem" onClick={()=>{ humanDownload(it.nombre); setMenuId(null); }}>Descargar</button>
                        <button className="mini-menu-item" role="menuitem" onClick={()=>{ setModal({type:'rename', data:it}); setInputVal(it.nombre || ""); setMenuId(null); }}>Renombrar</button>
                        <button className="mini-menu-item danger" role="menuitem" onClick={()=>{ doDelete(it); setMenuId(null); }}>Eliminar</button>
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

      {/* ===== PushPop: ver carpeta (mock) ===== */}
      {modal?.type === "folder" && (
        <PushPop title={`Carpeta: ${modal.data?.nombre || ""}`} onClose={closeAll}>
          <div className="muted" style={{marginBottom:8}}>En este mock no hay hijos definidos. Cuando exista parentId, aquí listaremos su contenido.</div>
          <div className="pushpop-actions"><button className="ed-btn" onClick={closeAll}>Cerrar</button></div>
        </PushPop>
      )}

      {/* ===== PushPop: ver documento (mock) ===== */}
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

      {/* Estilos locales del popover y pequeños ajustes */}
      <style>{`
        .muted{ color:#6B7280; font-size:12px }
        .pushpop-input{
          width:100%; border:1px solid #E5E7EB; background:#fff; color:#111827;
          border-radius:10px; padding:10px 12px; outline:none; font-size:14px;
        }
        .pushpop-input:focus{ border-color:#93C5FD; box-shadow:0 0 0 3px rgba(59,130,246,.15) }
        .pushpop-actions{ display:flex; justify-content:flex-end; gap:8px; margin-top:14px }

        /* popover chico anclado */
        .mini-actions-cell{ position:relative; text-align:right; overflow:visible; }
        .mini-menu{
          position:absolute; top:calc(100% + 6px); right:0;
          width:220px; background:#fff; border:1px solid #E5E7EB; border-radius:10px;
          box-shadow:0 10px 20px rgba(0,0,0,.08); padding:6px; z-index:60;
        }
        .mini-menu-item{
          width:100%; text-align:left; background:transparent; border:none;
          padding:8px 10px; border-radius:8px; font-weight:600; color:#111827; cursor:pointer;
        }
        .mini-menu-item:hover{ background:#F9FAFB; }
        .mini-menu-item.danger{ color:#B91C1C; }

        /* evitar que el contenedor recorte el popover */
        .asistencia-tabla, .ed-card { overflow: visible; }
      `}</style>
    </div>
  );
};
