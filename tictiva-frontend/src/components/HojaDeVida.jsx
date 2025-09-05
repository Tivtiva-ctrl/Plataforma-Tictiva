const HojaDeVida = ({ empleado }) => {
  // helpers
  const get = (obj, path) => {
    try {
      return path.split(".").reduce((a, k) => (a && a[k] !== undefined ? a[k] : undefined), obj);
    } catch { return undefined; }
  };
  const daysTo = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d)) return null;
    const ms = d.setHours(23,59,59,999) - Date.now();
    return Math.ceil(ms / 86400000);
  };
  const has = (...paths) => paths.some(p => {
    const v = get(empleado, p);
    return v !== undefined && v !== null && String(v).trim() !== "" && v !== false;
  });

  // Ítems de Cumplimiento DT (ajusta rutas según tu backend)
  const dtItems = [
    { label: "Contrato",            ok: has("documentos.contrato", "datosContractuales.contratoFirmado") },
    { label: "Reglamento Interno",  ok: has("documentos.reglamentoInterno") },
    { label: "Anexos",              ok: has("documentos.anexos", "datosContractuales.anexosFirmados") },
    { label: "Política de Teletrabajo", ok: has("documentos.politicaTeletrabajo") },
    { label: "Mutual/ISL",          ok: has("prevision.mutual", "prevision.mutualDeSeguridad", "mutual") },
    { label: "Seguro de Cesantía (AFC)", ok: has("prevision.afc") },
    // Seguridad y Salud
    { label: "Inducción de Seguridad", ok: has("seguridad.induccion.fecha"), exp: get(empleado, "seguridad.induccion.vencimiento") },
    { label: "Entrega de EPP",      ok: has("seguridad.epp.acta"), exp: get(empleado, "seguridad.epp.vencimiento") },
    { label: "Examen Ocupacional",  ok: has("salud.examen.preocupacional.fecha"), exp: get(empleado, "salud.examen.vencimiento") },
  ].map(it => {
    const d = daysTo(it.exp);
    let status = it.ok ? "ok" : "miss";
    if (it.ok && typeof d === "number" && d <= 30) status = "warn";
    return { ...it, status, d };
  });

  const printPage = () => window.print();

  const contactos = Array.isArray(get(empleado, "emergencia")) ? empleado.emergencia : [
    { nombre: "—", relacion: "—", telefono: "—" },
  ];

  const ficha = {
    grupo: get(empleado, "medico.grupo") || "N/D",
    transfusion: get(empleado, "medico.transfusion") === true ? "Sí" : (get(empleado, "medico.transfusion") === false ? "No" : "N/D"),
    alergias: get(empleado, "medico.alergias") || "N/D",
    cronicas: get(empleado, "medico.cronicas") || "N/D",
    medicamentos: get(empleado, "medico.medicamentos") || "N/D",
    observaciones: get(empleado, "medico.observaciones") || "—",
  };

  const trayectoria = Array.isArray(get(empleado, "trayectoria")) ? empleado.trayectoria : [];
  const educacion   = Array.isArray(get(empleado, "educacion")) ? empleado.educacion : [];
  const experiencia = Array.isArray(get(empleado, "experiencia")) ? empleado.experiencia : [];

  return (
    <div className="hv-wrap" style={{ display: "grid", gap: 16 }}>
      {/* Head */}
      <div className="ed-card hv-head">
        <div className="hv-title">
          <div className="hv-avatar">{(empleado?.nombre || " ").split(" ").map(s=>s[0]).join("").slice(0,2).toUpperCase()}</div>
          <div>
            <h3 className="ed-card-title" style={{ margin: 0 }}>Hoja de Vida y Ficha Médica</h3>
            <div className="ed-sub light">{empleado?.nombre || "—"}</div>
          </div>
        </div>
        <button className="ed-btn" onClick={printPage}>Imprimir / Exportar</button>
      </div>

      {/* Cumplimiento DT */}
      <div className="ed-card">
        <h4 className="ed-card-title" style={{ marginBottom: 8 }}>Cumplimiento DT</h4>
        <div className="dt-grid">
          {dtItems.map((it, idx) => (
            <div key={idx} className="dt-row">
              <div className="dt-label">{it.label}</div>
              <div className={`dt-badge ${it.status}`}>
                {it.status === "ok"   && "Completo"}
                {it.status === "warn" && `Por vencer (${it.d} días)`}
                {it.status === "miss" && "Pendiente"}
              </div>
            </div>
          ))}
        </div>
        <div className="dt-note">Tip: adjunta respaldos (PDF/imagen) a cada ítem para la carpeta DT.</div>
      </div>

      {/* Contactos de Emergencia */}
      <div className="ed-card">
        <h4 className="ed-card-title">Contactos de Emergencia</h4>
        <div className="hv-2col">
          {contactos.map((c, i) => (
            <div key={i} className="hv-box">
              <div className="hv-name">{c.nombre || "—"}</div>
              <div className="hv-muted">{c.relacion || "—"}</div>
              <div className="hv-tel">{c.telefono || "—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ficha Médica (contenido sensible: controla visibilidad en tu app real) */}
      <div className="ed-card">
        <h4 className="ed-card-title">Ficha Médica</h4>
        <div className="ed-kv">
          <div className="ed-kv-row"><span className="ed-kv-label">Grupo Sanguíneo:</span><span className="ed-kv-value">{ficha.grupo}</span></div>
          <div className="ed-kv-row"><span className="ed-kv-label">Acepta Transfusión:</span><span className="ed-kv-value">{ficha.transfusion}</span></div>
          <div className="ed-kv-row"><span className="ed-kv-label">Alergias Conocidas:</span><span className="ed-kv-value">{ficha.alergias}</span></div>
          <div className="ed-kv-row"><span className="ed-kv-label">Condiciones Crónicas:</span><span className="ed-kv-value">{ficha.cronicas}</span></div>
          <div className="ed-kv-row"><span className="ed-kv-label">Medicamentos Habituales:</span><span className="ed-kv-value">{ficha.medicamentos}</span></div>
          <div className="ed-kv-row"><span className="ed-kv-label">Observaciones:</span><span className="ed-kv-value" style={{ whiteSpace: "pre-wrap" }}>{ficha.observaciones}</span></div>
        </div>
      </div>

      {/* Trayectoria */}
      {trayectoria.length > 0 && (
        <div className="ed-card">
          <h4 className="ed-card-title">Trayectoria en la Empresa</h4>
          <ul className="hv-timeline">
            {trayectoria.map((t, i) => (
              <li key={i} className="hv-tl-item">
                <div className="hv-tl-dot" />
                <div className="hv-tl-body">
                  <div className="hv-tl-title">{t.cargo || "—"}</div>
                  <div className="hv-muted">{t.desde ? `Desde el ${t.desde}` : "—"}</div>
                  {t.detalle ? <div className="hv-tl-det">{t.detalle}</div> : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Educación */}
      {educacion.length > 0 && (
        <div className="ed-card">
          <h4 className="ed-card-title">Educación y Formación</h4>
          <ul className="hv-list">
            {educacion.map((e, i) => (
              <li key={i}>
                <div className="hv-strong">{e.titulo || "—"}</div>
                <div className="hv-muted">{e.institucion || "—"}</div>
                <div className="hv-range">{[e.desde, e.hasta].filter(Boolean).join(" - ")}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Experiencia previa */}
      {experiencia.length > 0 && (
        <div className="ed-card">
          <h4 className="ed-card-title">Experiencia Laboral Previa</h4>
          <ul className="hv-list">
            {experiencia.map((x, i) => (
              <li key={i}>
                <div className="hv-strong">{x.cargo || "—"}</div>
                <div className="hv-muted">{x.empresa || "—"}</div>
                <div className="hv-range">{[x.desde, x.hasta].filter(Boolean).join(" - ")}</div>
                {x.descripcion ? <div className="hv-tl-det">{x.descripcion}</div> : null}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* estilos locales */}
      <style>{`
        .hv-head{display:flex; align-items:center; justify-content:space-between; gap:12px}
        .hv-title{display:flex; align-items:center; gap:12px}
        .hv-avatar{width:48px;height:48px;border-radius:12px;background:#E0E7FF;color:#1E3A8A;font-weight:800;display:flex;align-items:center;justify-content:center}

        .dt-grid{display:grid; grid-template-columns:1fr 1fr; gap:8px 16px}
        @media (max-width:780px){ .dt-grid{grid-template-columns:1fr} }
        .dt-row{display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-top:1px solid #F3F4F6}
        .dt-row:first-child{border-top:none}
        .dt-label{color:#374151; font-weight:600}
        .dt-badge{font-size:12px; padding:4px 10px; border-radius:999px; border:1px solid #E5E7EB}
        .dt-badge.ok{background:#ECFDF5; color:#065F46; border-color:#A7F3D0}
        .dt-badge.warn{background:#FEF3C7; color:#92400E; border-color:#FDE68A}
        .dt-badge.miss{background:#FEE2E2; color:#991B1B; border-color:#FCA5A5}
        .dt-note{color:#6B7280; font-size:12px; margin-top:8px}

        .hv-2col{display:grid; grid-template-columns:1fr 1fr; gap:12px}
        @media (max-width:780px){ .hv-2col{grid-template-columns:1fr} }
        .hv-box{border:1px solid #E5E7EB; border-radius:12px; padding:12px}
        .hv-name{font-weight:800; color:#111827}
        .hv-muted{color:#6B7280}
        .hv-tel{margin-top:6px; font-weight:600}

        .hv-timeline{list-style:none;margin:0;padding:0;position:relative}
        .hv-tl-item{display:flex; gap:12px; padding:10px 0; border-top:1px solid #F3F4F6}
        .hv-tl-item:first-child{border-top:none}
        .hv-tl-dot{width:10px;height:10px;border-radius:999px;background:#3B82F6; margin-top:8px; flex-shrink:0}
        .hv-tl-title{font-weight:800; color:#111827}
        .hv-tl-det{color:#374151; margin-top:4px}
        .hv-list{list-style:none; margin:0; padding:0}
        .hv-list li{padding:10px 0; border-top:1px solid #F3F4F6}
        .hv-list li:first-child{border-top:none}
        .hv-strong{font-weight:800; color:#111827}
        .hv-range{color:#6B7280; font-size:12px}
      `}</style>
    </div>
  );
};
