import React from "react";
import PushPop from "./PushPop";

const DocumentosTab = ({ empleado, onNuevaCarpeta, onSubirArchivo, onDelete, onRename }) => {
  const items = Array.isArray(empleado?.documentos) ? empleado.documentos : [];

  const [menuItem, setMenuItem] = React.useState(null);
  const [modal, setModal] = React.useState(null); // {type:'create'|'folder'|'doc'|'rename', data}
  const [inputVal, setInputVal] = React.useState("");
  const topFileRef = React.useRef(null);
  const [loadingPreview, setLoadingPreview] = React.useState(false);

  const isFolder = (it) => (it?.tipo || "").toLowerCase() === "folder";
  const childrenOf = (folderId) => items.filter(x => (x.parentId || "") === folderId);

  // ===== Preview helpers
  const humanSize = (bytes = 0) => {
    if (bytes == null || bytes === "—") return "—";
    if (typeof bytes === "string" && /\d+\s?(B|KB|MB|GB)/i.test(bytes)) return bytes;
    const n = Number(bytes); if (!isFinite(n) || n <= 0) return "—";
    const k = 1024, sizes = ["B","KB","MB","GB"];
    const i = Math.floor(Math.log(n)/Math.log(k));
    return `${(n/Math.pow(k,i)).toFixed(1)} ${sizes[i]}`;
  };
  const extFromName = (name = "") => {
    const ix = name.lastIndexOf(".");
    return ix !== -1 ? name.slice(ix + 1).toLowerCase() : "";
  };
  const getExt = (file) => file?.ext || extFromName(file?.nombre || file?.name || "");
  const isOffice = (ext) => ["doc","docx","xls","xlsx","ppt","pptx"].includes((ext||"").toLowerCase());
  const isImage = (mime) => (mime || "").startsWith("image/");
  const isPDF = (mime, ext) => (mime || "").includes("pdf") || (ext || "").toLowerCase() === "pdf";
  const isTextLike = (mime, ext) => (mime || "").startsWith("text/") || ["csv","txt","log"].includes((ext||"").toLowerCase());
  const isBlobLike = (u) => (u || "").startsWith("blob:") || (u || "").startsWith("data:");
  const isHttp = (u) => /^https?:\/\//i.test(u || "");

  const getMime = (file) => file?.mimeType || file?.mimetype || file?.mime || file?.contentType || "";
  const getPreviewUrl = (file) => file?.previewUrl || file?.url || null;

  // cerrar menú al click fuera
  React.useEffect(() => {
    if (!menuItem) return;
    const onDocClick = () => setMenuItem(null);
    const t = setTimeout(() => window.addEventListener('click', onDocClick), 0);
    return () => { clearTimeout(t); window.removeEventListener('click', onDocClick); };
  }, [menuItem]);

  const closeAll = () => { setMenuItem(null); setModal(null); setInputVal(""); };

  const humanDownload = (name, url) => {
    if (url) { const a = document.createElement("a"); a.href = url; a.target="_blank"; a.rel="noreferrer"; a.download = name || "archivo"; a.click(); return; }
    const blob = new Blob([`Descarga simulada de ${name}\n(placeholder)`], { type: "text/plain;charset=utf-8" });
    const mockUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = mockUrl; a.download = name || "archivo.txt"; a.click();
    URL.revokeObjectURL(mockUrl);
  };

  const doCreateFolder = () => {
    const name = (inputVal || "").trim();
    if (!name) return;
    try {
      if (typeof onNuevaCarpeta === "function") {
        if (onNuevaCarpeta.length >= 1) onNuevaCarpeta(name); else onNuevaCarpeta();
      }
    } finally { closeAll(); }
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

  // ===== Resolver URL (Drive / Supabase / genérico)
  const guessBucket = (it) => it?.bucket || it?.bucketName || it?.storageBucket || it?.bucket_id || null;
  const guessPath   = (it) => it?.path   || it?.filePath   || it?.storagePath   || it?.key       || it?.objectKey || null;
  const supabaseUrl = (() => {
    try { return import.meta.env?.VITE_SUPABASE_URL || ""; } catch { return ""; }
  })();
  const buildPublicSupabaseUrl = (bucket, path) => {
    const base = (supabaseUrl || "").replace(/\/$/, "");
    if (!base || !bucket || !path) return null;
    return `${base}/storage/v1/object/public/${encodeURIComponent(bucket)}/${encodeURIComponent(path)}`;
  };

  const resolvePreview = async (it) => {
    if (it.previewUrl || it.url) return { ...it, previewUrl: it.previewUrl || it.url };

    // Google Drive (PREVIEW embebible)
    if (it?.driveId) {
      return { ...it, previewUrl: `https://drive.google.com/file/d/${encodeURIComponent(it.driveId)}/preview` };
    }

    // Supabase
    const bucket = guessBucket(it);
    const path = guessPath(it);
    if (bucket && path) {
      // Si hay cliente, intento firmada
      if (window?.supabase?.storage?.from) {
        try {
          const { data } = await window.supabase.storage.from(bucket).createSignedUrl(path, 3600);
          if (data?.signedUrl) return { ...it, previewUrl: data.signedUrl };
        } catch {/* noop */}
      }
      // Bucket público
      const pub = buildPublicSupabaseUrl(bucket, path);
      if (pub) return { ...it, previewUrl: pub };
    }

    if (it?.publicUrl) return { ...it, previewUrl: it.publicUrl };
    if (it?.link)      return { ...it, previewUrl: it.link };

    console.warn("[Tictiva] Doc sin URL accesible para preview:", it);
    return it;
  };

  const openDoc = async (it) => {
    setLoadingPreview(true);
    const withUrl = await resolvePreview(it);
    setLoadingPreview(false);
    setModal({ type: 'doc', data: withUrl });
  };

  return (
    <div className="ed-card" style={{ overflow:'visible' }}>
      {/* Header */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
        <h3 className="ed-card-title" style={{margin:0}}>Documentos</h3>
        <div style={{display:'flex', gap:8}}>
          <button className="ed-btn" type="button" onClick={()=>{ setModal({type:'create'}); setInputVal(""); }}>Nueva Carpeta</button>

          <input
            ref={topFileRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.csv"
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
              <td>{isFolder(it) ? "—" : humanSize(it.tam)}</td>
              <td className="mini-actions-cell" style={{ textAlign:'right', position:'relative' }}>
                <button className="ed-btn" type="button" aria-label="Acciones"
                  onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); setMenuItem(it); }}>⋯</button>

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
                        <button className="mini-menu-item" onClick={()=>{ openDoc(it); setMenuItem(null); }}>Ver</button>
                        <button className="mini-menu-item" onClick={()=>{ humanDownload(it.nombre, getPreviewUrl(it)); setMenuItem(null); }}>Descargar</button>
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

      {/* Crear carpeta */}
      {modal?.type === "create" && (
        <PushPop title="Nueva carpeta" onClose={closeAll}>
          <input className="pushpop-input" placeholder="Ej. Contratos 2025" value={inputVal} onChange={(e)=>setInputVal(e.target.value)} />
          <div className="pushpop-actions">
            <button className="ed-btn" onClick={closeAll}>Cancelar</button>
            <button className="ed-btn primary" onClick={doCreateFolder} disabled={!inputVal.trim()}>Crear</button>
          </div>
        </PushPop>
      )}

      {/* Carpeta */}
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
                  <th>Fecha</th>
                  <th>Tamaño</th>
                  <th style={{width:120, textAlign:'right'}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {childrenOf(modal.data?.id).map(child => (
                  <tr key={child.id}>
                    <td style={{fontWeight:600}}>📄 {child.nombre}</td>
                    <td>{child.mod || "—"}</td>
                    <td>{humanSize(child.tam) || "—"}</td>
                    <td style={{textAlign:'right'}}>
                      <button className="ed-btn" onClick={()=>openDoc(child)}>Ver</button>
                      <button className="ed-btn" onClick={()=>humanDownload(child.nombre, getPreviewUrl(child))}>Descargar</button>
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

      {/* Visor de documento */}
      {modal?.type === "doc" && (
        <PushPop title={`Documento: ${modal.data?.nombre || ""}`} onClose={closeAll}>
          {(() => {
            const file = modal.data || {};
            const mime = getMime(file);
            const ext = getExt(file);
            const rawUrl = getPreviewUrl(file);
            const blobLike = isBlobLike(rawUrl);
            const httpLike = isHttp(rawUrl);

            // Visores
            const officeUrl = httpLike && isOffice(ext)
              ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(rawUrl)}`
              : null;

            const googleViewerUrl = httpLike
              ? `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(rawUrl)}`
              : null;

            return (
              <>
                <div className="muted" style={{marginBottom:8}}>
                  Últ. mod: {file.mod || "—"} · Tamaño: {humanSize(file.tam)}<br/>
                  <span style={{fontSize:11}}>
                    <b>Debug:</b> ext=<code>{ext || "—"}</code> · mime=<code>{mime || "—"}</code> · url={rawUrl ? <a href={rawUrl} target="_blank" rel="noreferrer">abrir</a> : "—"}
                  </span>
                </div>

                <div style={{border:'1px solid #E5E7EB', borderRadius:12, padding:12, background:'#fff'}}>
                  {loadingPreview && (
                    <div style={{height:120, display:'grid', placeItems:'center'}} className="muted">Cargando previsualización…</div>
                  )}

                  {/* 1) Imágenes */}
                  {!loadingPreview && isImage(mime) && rawUrl && (
                    <img
                      src={rawUrl}
                      alt={file.nombre}
                      style={{maxHeight:'60vh', width:'auto', display:'block', margin:'0 auto', borderRadius:10, objectFit:'contain'}}
                      onError={(e)=>{ e.currentTarget.style.display='none'; }}
                    />
                  )}

                  {/* 2) Office: solo http(s) */}
                  {!loadingPreview && officeUrl && (
                    <iframe title="Office viewer" src={officeUrl}
                      style={{width:'100%', height:'60vh', border:'1px solid #E5E7EB', borderRadius:10}} />
                  )}

                  {/* 3) PDF: si es blob/data -> embeber directo */}
                  {!loadingPreview && isPDF(mime, ext) && blobLike && rawUrl && (
                    <iframe title="PDF" src={rawUrl}
                      style={{width:'100%', height:'60vh', border:'1px solid #E5E7EB', borderRadius:10}} />
                  )}

                  {/* 4) PDF http(s): intento directo primero */}
                  {!loadingPreview && isPDF(mime, ext) && httpLike && rawUrl && (
                    <iframe title="PDF directo" src={rawUrl}
                      style={{width:'100%', height:'60vh', border:'1px solid #E5E7EB', borderRadius:10}} />
                  )}

                  {/* 5) Fallback Google Viewer para http(s) */}
                  {!loadingPreview && isPDF(mime, ext) && httpLike && googleViewerUrl && (
                    <div style={{marginTop:8}}>
                      <iframe title="PDF (Google viewer)" src={googleViewerUrl}
                        style={{width:'100%', height:'60vh', border:'1px solid #E5E7EB', borderRadius:10}} />
                    </div>
                  )}

                  {/* 6) Texto / CSV */}
                  {!loadingPreview && isTextLike(mime, ext) && rawUrl && (
                    <iframe title="Texto" src={rawUrl}
                      style={{width:'100%', height:'60vh', border:'1px solid #E5E7EB', borderRadius:10, background:'#fff'}} />
                  )}

                  {/* 7) Sin URL */}
                  {!loadingPreview && !rawUrl && (
                    <div style={{height:160, display:'grid', placeItems:'center'}} className="muted">
                      No hay previsualización disponible (este documento no tiene URL accesible).
                    </div>
                  )}
                </div>

                <div className="pushpop-actions">
                  {rawUrl && <button className="ed-btn" onClick={()=>humanDownload(file.nombre || "archivo", rawUrl)}>Descargar</button>}
                  <div style={{flex:1}} />
                  {rawUrl && <a className="ed-btn" href={rawUrl} target="_blank" rel="noreferrer">Abrir en nueva pestaña</a>}
                  <button className="ed-btn" onClick={closeAll}>Cerrar</button>
                </div>
              </>
            );
          })()}
        </PushPop>
      )}

      {/* Renombrar */}
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
        .pushpop-input{ width:100%; border:1px solid #E5E7EB; background:#fff; color:#111827; border-radius:10px; padding:10px 12px; outline:none; font-size:14px; }
        .pushpop-input:focus{ border-color:#93C5FD; box-shadow:0 0 0 3px rgba(59,130,246,.15) }
        .pushpop-actions{ display:flex; justify-content:flex-end; gap:8px; margin-top:14px }
        .mini-actions-cell{ position:relative; overflow:visible; }
        .mini-menu{ position:absolute; top: calc(100% + 6px); right:0; width:220px; background:#fff; border:1px solid #E5E7EB; border-radius:10px; box-shadow:0 10px 20px rgba(0,0,0,.08); padding:6px; z-index:9999; }
        .mini-menu-item{ width:100%; text-align:left; background:transparent; border:none; padding:8px 10px; border-radius:8px; font-weight:600; color:#111827; cursor:pointer; }
        .mini-menu-item:hover{ background:#F9FAFB; }
        .mini-menu-item.danger{ color:#B91C1C; }
      `}</style>
    </div>
  );
};

export default DocumentosTab;
