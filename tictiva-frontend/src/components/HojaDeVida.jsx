/* =================== Hoja de Vida (editable) ================== */
function HojaDeVida({ empleado, modoEdicion, onChange }) {
  const hv = empleado?.hojaVida || empleado || {};
  const emergencia = Array.isArray(hv.emergencia) ? hv.emergencia : [];
  const md = hv.medico || {};
  const trayectoria = Array.isArray(hv.trayectoria) ? hv.trayectoria : [];
  const educacion  = Array.isArray(hv.educacion)  ? hv.educacion  : [];
  const experiencia = Array.isArray(hv.experiencia) ? hv.experiencia : [];

  const setHv  = (k, v) => onChange?.("hojaVida", { ...hv, [k]: v });
  const setMed = (k, v) => setHv("medico", { ...(hv.medico || {}), [k]: v });
  const setEmerg = (idx, k, v) => {
    const arr = [...(emergencia.length ? emergencia : [{},{},])];
    arr[idx] = { ...(arr[idx] || {}), [k]: v };
    setHv("emergencia", arr);
  };

  // ——— helpers para listas editables ———
  const updIn = (arr, idx, k, v) => {
    const copy = [...arr];
    copy[idx] = { ...(copy[idx] || {}), [k]: v };
    return copy;
  };
  const rmAt = (arr, idx) => arr.filter((_, i) => i !== idx);

  const addTraj = () => setHv("trayectoria", [...trayectoria, { cargo: "", desde: "", detalle: "" }]);
  const chgTraj = (i, k, v) => setHv("trayectoria", updIn(trayectoria, i, k, v));
  const delTraj = (i) => setHv("trayectoria", rmAt(trayectoria, i));

  const addEdu = () => setHv("educacion", [...educacion, { titulo: "", institucion: "", desde: "", hasta: "" }]);
  const chgEdu = (i, k, v) => setHv("educacion", updIn(educacion, i, k, v));
  const delEdu = (i) => setHv("educacion", rmAt(educacion, i));

  const addExp = () => setHv("experiencia", [...experiencia, { cargo: "", empresa: "", desde: "", hasta: "", descripcion: "" }]);
  const chgExp = (i, k, v) => setHv("experiencia", updIn(experiencia, i, k, v));
  const delExp = (i) => setHv("experiencia", rmAt(experiencia, i));

  const imprimir = () => {
    const html = `
      <html><head><meta charset="utf-8" />
      <title>Hoja de Vida - ${empleado?.nombre || ""}</title>
      <style>
        body{font-family: Inter, Arial; margin:24px; color:#111827}
        h1{margin:0 0 6px;font-size:22px}
        .sub{color:#6B7280;margin-bottom:14px}
        .card{border:1px solid #E5E7EB;border-radius:12px;padding:12px;margin-top:12px}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .row{padding:10px 0;border-top:1px solid #F3F4F6}
        .row:first-child{border-top:none}
        .lbl{color:#6B7280}
        .val{font-weight:700}
        ul.tl{list-style:none;margin:0;padding:0}
        li.tl-it{border-left:2px solid #E5E7EB;padding:8px 12px;margin-left:6px}
        .muted{color:#6B7280}
      </style></head>
      <body>
        <h1>Hoja de Vida</h1>
        <div class="sub">${empleado?.nombre || "—"} · RUT ${empleado?.rut || "—"}</div>

        ${hv.alertaMedica ? `<div class="card" style="background:#FFFBEB;border-color:#FDE68A"><b>Alerta Médica:</b> ${hv.alertaMedica}</div>`:""}

        <div class="card">
          <h3>Contactos de Emergencia</h3>
          <div class="grid2">
            ${(emergencia.length?emergencia:[{nombre:"N/D",relacion:"",telefono:""}]).slice(0,2).map(c=>`
              <div class="card" style="margin:0">
                <div class="val">${c.nombre||"N/D"}</div>
                <div class="muted">${c.relacion||""}</div>
                <div class="row"><span class="lbl">Teléfono: </span><span class="val">${c.telefono||"—"}</span></div>
              </div>`).join("")}
          </div>
        </div>

        <div class="card">
          <h3>Ficha Médica</h3>
          <div class="grid2">
            <div class="row"><span class="lbl">Grupo Sanguíneo: </span><span class="val">${md.grupoSanguineo||"N/D"}</span></div>
            <div class="row"><span class="lbl">Acepta Transfusión: </span><span class="val">${md.aceptaTransfusion? "Sí":"No"}</span></div>
          </div>
          <div class="row"><span class="lbl">Alergias: </span><span class="val">${Array.isArray(md.alergias)?md.alergias.join(", "): (md.alergias||"N/D")}</span></div>
          <div class="row"><span class="lbl">Condiciones Crónicas: </span><span class="val">${Array.isArray(md.condicionesCronicas)?md.condicionesCronicas.join(", "): (md.condicionesCronicas||"N/D")}</span></div>
          <div class="row"><span class="lbl">Medicamentos Habituales: </span><span class="val">${md.medicamentos||"N/D"}</span></div>
          <div class="row"><span class="lbl">Observaciones: </span><span class="val">${md.observaciones||"N/D"}</span></div>
        </div>

        <div class="card">
          <h3>Trayectoria en la Empresa</h3>
          <ul class="tl">
            ${(trayectoria.length?trayectoria:[{cargo:"N/D",desde:"",detalle:""}]).map(t=>`<li class="tl-it"><div class="val">${t.cargo}</div><div class="muted">Desde el ${t.desde||"—"}</div><div>${t.detalle||""}</div></li>`).join("")}
          </ul>
        </div>

        <div class="card">
          <h3>Educación y Formación</h3>
          <ul class="tl">
            ${(educacion.length?educacion:[{titulo:"N/D",institucion:"",desde:"",hasta:""}]).map(e=>`<li class="tl-it"><div class="val">${e.titulo}</div><div>${e.institucion||""}</div><div class="muted">${e.desde||"—"} - ${e.hasta||"—"}</div></li>`).join("")}
          </ul>
        </div>

        <div class="card">
          <h3>Experiencia Laboral Previa</h3>
          <ul class="tl">
            ${(experiencia.length?experiencia:[{cargo:"N/D",empresa:"",desde:"",hasta:"",descripcion:""}]).map(x=>`<li class="tl-it"><div class="val">${x.cargo}</div><div>${x.empresa||""}</div><div class="muted">${x.desde||"—"} - ${x.hasta||"—"}</div><div>${x.descripcion||""}</div></li>`).join("")}
          </ul>
        </div>

        <script>window.onload = () => setTimeout(() => window.print(), 150);</script>
      </body></html>`;
    const w = window.open("", "_blank");
    w.document.open(); w.document.write(html); w.document.close();
  };

  return (
    <div className="ed-card hv-wrap">
      <div className="hv-head">
        <div>
          <h3 className="ed-card-title" style={{margin:0}}>Hoja de Vida y Ficha Médica</h3>
          <div className="ed-sub light" style={{marginTop:2}}>Información integral del colaborador</div>
        </div>
        <button className="ed-btn" onClick={imprimir}>Imprimir / Exportar</button>
      </div>

      {/* Alerta médica */}
      <div className="hv-alert" style={{display: (hv.alertaMedica ? 'block':'none')}}>
        <b>Alerta Médica Importante</b>
        <div>{hv.alertaMedica}</div>
      </div>
      {modoEdicion && (
        <div className="hv-card">
          <h4 className="hv-title">Editar Alerta Médica</h4>
          <input
            type="text"
            value={hv.alertaMedica ?? ""}
            onChange={(e)=>setHv("alertaMedica", e.target.value)}
            style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:10, padding:'8px'}}
          />
        </div>
      )}

      {/* Emergencia */}
      <div className="hv-card">
        <h4 className="hv-title">Contactos de Emergencia</h4>
        <div className="hv-grid2">
          {[0,1].map((i)=>(
            <div key={i} className="hv-contact">
              {modoEdicion ? (
                <>
                  <div className="hv-row"><span className="hv-label">Nombre:</span><input className="hv-val"
                    value={(emergencia[i]?.nombre)||""}
                    onChange={(e)=>setEmerg(i,"nombre",e.target.value)}
                    style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 8px'}}/></div>
                  <div className="hv-row"><span className="hv-label">Relación:</span><input className="hv-val"
                    value={(emergencia[i]?.relacion)||""}
                    onChange={(e)=>setEmerg(i,"relacion",e.target.value)}
                    style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 8px'}}/></div>
                  <div className="hv-row"><span className="hv-label">Teléfono:</span><input className="hv-val"
                    value={(emergencia[i]?.telefono)||""}
                    onChange={(e)=>setEmerg(i,"telefono",e.target.value)}
                    style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 8px'}}/></div>
                </>
              ) : (
                <>
                  <div className="hv-strong">{emergencia[i]?.nombre||"N/D"}</div>
                  <div className="hv-muted">{emergencia[i]?.relacion||""}</div>
                  <div className="hv-row"><span className="hv-label">Teléfono:</span><span className="hv-val">{emergencia[i]?.telefono||"—"}</span></div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ficha Médica */}
      <div className="hv-card">
        <h4 className="hv-title">Ficha Médica</h4>
        <div className="hv-grid2">
          <div className="hv-row"><span className="hv-label">Grupo Sanguíneo:</span>
            {modoEdicion ? (
              <input className="hv-val" value={md.grupoSanguineo||""} onChange={(e)=>setMed("grupoSanguineo", e.target.value)}
                style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 8px'}}/>
            ) : <span className="hv-val">{md.grupoSanguineo||"N/D"}</span>}
          </div>
          <div className="hv-row"><span className="hv-label">Acepta Transfusión:</span>
            {modoEdicion ? (
              <select value={md.aceptaTransfusion ? "si":"no"} onChange={(e)=>setMed("aceptaTransfusion", e.target.value==="si")}
                style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 8px'}}>
                <option value="si">Sí</option>
                <option value="no">No</option>
              </select>
            ) : <span className="hv-val">{md.aceptaTransfusion? "Sí":"No"}</span>}
          </div>
        </div>
        <div className="hv-row"><span className="hv-label">Alergias:</span>
          {modoEdicion ? (
            <input className="hv-val" value={Array.isArray(md.alergias)?md.alergias.join(", "):(md.alergias||"")}
              onChange={(e)=>setMed("alergias", e.target.value.split(",").map(s=>s.trim()).filter(Boolean))}
              style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 8px'}}/>
          ) : <span className="hv-val">{Array.isArray(md.alergias)?md.alergias.join(", "):(md.alergias||"N/D")}</span>}
        </div>
        <div className="hv-row"><span className="hv-label">Condiciones Crónicas:</span>
          {modoEdicion ? (
            <input className="hv-val" value={Array.isArray(md.condicionesCronicas)?md.condicionesCronicas.join(", "):(md.condicionesCronicas||"")}
              onChange={(e)=>setMed("condicionesCronicas", e.target.value.split(",").map(s=>s.trim()).filter(Boolean))}
              style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 8px'}}/>
          ) : <span className="hv-val">{Array.isArray(md.condicionesCronicas)?md.condicionesCronicas.join(", "):(md.condicionesCronicas||"N/D")}</span>}
        </div>
        <div className="hv-row"><span className="hv-label">Medicamentos Habituales:</span>
          {modoEdicion ? (
            <input className="hv-val" value={md.medicamentos||""} onChange={(e)=>setMed("medicamentos", e.target.value)}
              style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 8px'}}/>
          ) : <span className="hv-val">{md.medicamentos||"N/D"}</span>}
        </div>
        <div className="hv-row"><span className="hv-label">Observaciones:</span>
          {modoEdicion ? (
            <input className="hv-val" value={md.observaciones||""} onChange={(e)=>setMed("observaciones", e.target.value)}
              style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 8px'}}/>
          ) : <span className="hv-val">{md.observaciones||"N/D"}</span>}
        </div>
      </div>

      {/* Trayectoria — ahora editable */}
      <div className="hv-card">
        <h4 className="hv-title">Trayectoria en la Empresa</h4>
        {modoEdicion ? (
          <>
            <ul className="hv-tl">
              {trayectoria.map((t,i)=>(
                <li key={i} className="hv-tl-it">
                  <div className="hv-grid2">
                    <div className="hv-row">
                      <span className="hv-label">Cargo:</span>
                      <input className="hv-val" value={t.cargo||""} onChange={(e)=>chgTraj(i,"cargo",e.target.value)}
                        style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 8px'}}/>
                    </div>
                    <div className="hv-row">
                      <span className="hv-label">Desde:</span>
                      <input className="hv-val" value={t.desde||""} onChange={(e)=>chgTraj(i,"desde",e.target.value)}
                        placeholder="YYYY-MM-DD"
                        style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 8px'}}/>
                    </div>
                  </div>
                  <div className="hv-row">
                    <span className="hv-label">Detalle:</span>
                    <input className="hv-val" value={t.detalle||""} onChange={(e)=>chgTraj(i,"detalle",e.target.value)}
                      style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 8px'}}/>
                  </div>
                  <div className="hv-item-actions">
                    <button className="ed-btn danger" onClick={()=>delTraj(i)}>Eliminar</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="hv-actions">
              <button className="ed-btn" onClick={addTraj}>+ Agregar cargo</button>
            </div>
          </>
        ) : (
          <ul className="hv-tl">
            {(trayectoria.length?trayectoria:[{cargo:"N/D",desde:"",detalle:""}]).map((t,i)=>(
              <li key={i} className="hv-tl-it">
                <div className="hv-strong">{t.cargo}</div>
                <div className="hv-muted">Desde el {t.desde||"—"}</div>
                {t.detalle ? <div>{t.detalle}</div> : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Educación — ahora editable */}
      <div className="hv-card">
        <h4 className="hv-title">Educación y Formación</h4>
        {modoEdicion ? (
          <>
            <ul className="hv-tl">
              {educacion.map((e,i)=>(
                <li key={i} className="hv-tl-it">
                  <div className="hv-row">
                    <span className="hv-label">Título:</span>
                    <input className="hv-val" value={e.titulo||""} onChange={(ev)=>chgEdu(i,"titulo",ev.target.value)}
                      style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 8px'}}/>
                  </div>
                  <div className="hv-row">
                    <span className="hv-label">Institución:</span>
                    <input className="hv-val" value={e.institucion||""} onChange={(ev)=>chgEdu(i,"institucion",ev.target.value)}
                      style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 8px'}}/>
                  </div>
                  <div className="hv-grid2">
                    <div className="hv-row">
                      <span className="hv-label">Desde:</span>
                      <input className="hv-val" value={e.desde||""} onChange={(ev)=>chgEdu(i,"desde",ev.target.value)}
                        placeholder="YYYY"
                        style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 8px'}}/>
                    </div>
                    <div className="hv-row">
                      <span className="hv-label">Hasta:</span>
                      <input className="hv-val" value={e.hasta||""} onChange={(ev)=>chgEdu(i,"hasta",ev.target.value)}
                        placeholder="YYYY"
                        style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 8px'}}/>
                    </div>
                  </div>
                  <div className="hv-item-actions">
                    <button className="ed-btn danger" onClick={()=>delEdu(i)}>Eliminar</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="hv-actions">
              <button className="ed-btn" onClick={addEdu}>+ Agregar estudio</button>
            </div>
          </>
        ) : (
          <ul className="hv-tl">
            {(educacion.length?educacion:[{titulo:"N/D",institucion:"",desde:"",hasta:""}]).map((e,i)=>(
              <li key={i} className="hv-tl-it">
                <div className="hv-strong">{e.titulo}</div>
                <div>{e.institucion||""}</div>
                <div className="hv-muted">{e.desde||"—"} - {e.hasta||"—"}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Experiencia — ahora editable */}
      <div className="hv-card">
        <h4 className="hv-title">Experiencia Laboral Previa</h4>
        {modoEdicion ? (
          <>
            <ul className="hv-tl">
              {experiencia.map((x,i)=>(
                <li key={i} className="hv-tl-it">
                  <div className="hv-row">
                    <span className="hv-label">Cargo:</span>
                    <input className="hv-val" value={x.cargo||""} onChange={(ev)=>chgExp(i,"cargo",ev.target.value)}
                      style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 8px'}}/>
                  </div>
                  <div className="hv-row">
                    <span className="hv-label">Empresa:</span>
                    <input className="hv-val" value={x.empresa||""} onChange={(ev)=>chgExp(i,"empresa",ev.target.value)}
                      style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 8px'}}/>
                  </div>
                  <div className="hv-grid2">
                    <div className="hv-row">
                      <span className="hv-label">Desde:</span>
                      <input className="hv-val" value={x.desde||""} onChange={(ev)=>chgExp(i,"desde",ev.target.value)}
                        placeholder="YYYY"
                        style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 8px'}}/>
                    </div>
                    <div className="hv-row">
                      <span className="hv-label">Hasta:</span>
                      <input className="hv-val" value={x.hasta||""} onChange={(ev)=>chgExp(i,"hasta",ev.target.value)}
                        placeholder="YYYY"
                        style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 8px'}}/>
                    </div>
                  </div>
                  <div className="hv-row">
                    <span className="hv-label">Descripción:</span>
                    <input className="hv-val" value={x.descripcion||""} onChange={(ev)=>chgExp(i,"descripcion",ev.target.value)}
                      style={{width:'100%', border:'1px solid #E5E7EB', borderRadius:8, padding:'6px 8px'}}/>
                  </div>
                  <div className="hv-item-actions">
                    <button className="ed-btn danger" onClick={()=>delExp(i)}>Eliminar</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="hv-actions">
              <button className="ed-btn" onClick={addExp}>+ Agregar experiencia</button>
            </div>
          </>
        ) : (
          <ul className="hv-tl">
            {(experiencia.length?experiencia:[{cargo:"N/D",empresa:"",desde:"",hasta:"",descripcion:""}]).map((x,i)=>(
              <li key={i} className="hv-tl-it">
                <div className="hv-strong">{x.cargo}</div>
                <div>{x.empresa||""}</div>
                <div className="hv-muted">{x.desde||"—"} - {x.hasta||"—"}</div>
                {x.descripcion ? <div>{x.descripcion}</div> : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      <style>{`
        .hv-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px}
        .hv-alert{background:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:12px;margin-bottom:12px}
        .hv-card{border:1px solid #E5E7EB;border-radius:12px;padding:12px;margin-top:12px;background:#fff}
        .hv-title{margin:0 0 8px;font-size:16px;font-weight:800;color:#111827}
        .hv-grid2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        @media (max-width: 860px){ .hv-grid2{grid-template-columns:1fr} }
        .hv-contact{border:1px solid #F3F4F6;border-radius:10px;padding:10px}
        .hv-row{display:flex;justify-content:space-between;gap:12px;padding:10px 0;border-top:1px solid #F3F4F6}
        .hv-row:first-child{border-top:none}
        .hv-label{color:#6B7280}
        .hv-val{font-weight:700}
        .hv-strong{font-weight:800}
        .hv-muted{color:#6B7280}
        .hv-tl{list-style:none;margin:0;padding:0}
        .hv-tl-it{border-left:2px solid #E5E7EB;margin-left:8px;padding:8px 12px}
        .hv-actions{margin-top:10px; display:flex; justify-content:flex-end}
        .hv-item-actions{margin-top:8px; display:flex; justify-content:flex-end}
        .ed-btn.danger{border-color:#FCA5A5; color:#B91C1C}
      `}</style>
    </div>
  );
}
