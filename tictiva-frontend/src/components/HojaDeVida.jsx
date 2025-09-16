// src/components/HojaDeVida.jsx
import React from "react";

export default function HojaDeVida({ empleado, modoEdicion, onChange }) {
  const hv = empleado?.hojaVida ?? {};
  const emergencia = Array.isArray(hv.emergencia) ? hv.emergencia : [];
  const trayectoria = Array.isArray(hv.trayectoria) ? hv.trayectoria : [];
  const educacion = Array.isArray(hv.educacion) ? hv.educacion : [];
  const experiencia = Array.isArray(hv.experiencia) ? hv.experiencia : [];
  const md = hv.medico ?? {};

  const setHv = (k, v) => onChange?.("hojaVida", { ...hv, [k]: v });
  const upsertArray = (arr, idx, patch) => arr.map((it, i) => (i === idx ? { ...it, ...patch } : it));
  const removeIdx = (arr, idx) => arr.filter((_, i) => i !== idx);

  const addTrayectoria = () =>
    setHv("trayectoria", [...trayectoria, { cargo: "", desde: "", detalle: "" }]);

  const addEducacion = () =>
    setHv("educacion", [...educacion, { titulo: "", institucion: "", desde: "", hasta: "" }]);

  const addExperiencia = () =>
    setHv("experiencia", [
      ...experiencia,
      { cargo: "", empresa: "", desde: "", hasta: "", descripcion: "" },
    ]);

  const fmt = (s) => (s ? s : "—");

  return (
    <div className="ed-card hv-wrap">
      <div className="hv-head">
        <div>
          <h3 className="ed-card-title" style={{ margin: 0 }}>
            Hoja de Vida y Ficha Médica
          </h3>
          <div className="ed-sub light" style={{ marginTop: 2 }}>
            Información integral del colaborador
          </div>
        </div>
      </div>

      {/* Alerta médica */}
      {hv.alertaMedica ? (
        <div className="hv-alert">
          <b>Alerta Médica Importante</b>
          <div>{hv.alertaMedica}</div>
        </div>
      ) : null}

      <div className="hv-card">
        <h4 className="hv-title">Editar Alerta Médica</h4>
        <input
          type="text"
          value={hv.alertaMedica ?? ""}
          onChange={(e) => setHv("alertaMedica", e.target.value)}
          style={{
            width: "100%",
            border: "1px solid #E5E7EB",
            borderRadius: 10,
            padding: "8px",
          }}
        />
      </div>

      {/* Contactos de emergencia */}
      <div className="hv-card">
        <h4 className="hv-title">Contactos de Emergencia</h4>
        <div className="hv-grid2">
          {(emergencia.length ? emergencia : [{}, {}]).slice(0, 2).map((c, i) => (
            <div key={i} className="hv-contact">
              {modoEdicion ? (
                <>
                  <div className="hv-row">
                    <span className="hv-label">Nombre:</span>
                    <input
                      className="hv-val"
                      value={c.nombre ?? ""}
                      onChange={(e) =>
                        setHv("emergencia", upsertArray(emergencia.length ? emergencia : [{}, {}], i, { nombre: e.target.value }))
                      }
                      style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 8px" }}
                    />
                  </div>
                  <div className="hv-row">
                    <span className="hv-label">Relación:</span>
                    <input
                      className="hv-val"
                      value={c.relacion ?? ""}
                      onChange={(e) =>
                        setHv("emergencia", upsertArray(emergencia.length ? emergencia : [{}, {}], i, { relacion: e.target.value }))
                      }
                      style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 8px" }}
                    />
                  </div>
                  <div className="hv-row">
                    <span className="hv-label">Teléfono:</span>
                    <input
                      className="hv-val"
                      value={c.telefono ?? ""}
                      onChange={(e) =>
                        setHv("emergencia", upsertArray(emergencia.length ? emergencia : [{}, {}], i, { telefono: e.target.value }))
                      }
                      style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 8px" }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="hv-strong">{fmt(c.nombre)}</div>
                  <div className="hv-muted">{fmt(c.relacion)}</div>
                  <div className="hv-row">
                    <span className="hv-label">Teléfono:</span>
                    <span className="hv-val">{fmt(c.telefono)}</span>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Ficha médica */}
      <div className="hv-card">
        <h4 className="hv-title">Ficha Médica</h4>
        <div className="hv-grid2">
          <div className="hv-row">
            <span className="hv-label">Grupo Sanguíneo:</span>
            <input
              className="hv-val"
              value={md.grupoSanguineo ?? ""}
              onChange={(e) => setHv("medico", { ...md, grupoSanguineo: e.target.value })}
              style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 8px" }}
            />
          </div>
          <div className="hv-row">
            <span className="hv-label">Acepta Transfusión:</span>
            <select
              value={md.aceptaTransfusion ? "si" : "no"}
              onChange={(e) => setHv("medico", { ...md, aceptaTransfusion: e.target.value === "si" })}
              style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 8px" }}
            >
              <option value="si">Sí</option>
              <option value="no">No</option>
            </select>
          </div>
        </div>

        <div className="hv-row">
          <span className="hv-label">Alergias:</span>
          <input
            className="hv-val"
            value={Array.isArray(md.alergias) ? md.alergias.join(", ") : md.alergias ?? ""}
            onChange={(e) =>
              setHv("medico", { ...md, alergias: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
            }
            style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 8px" }}
          />
        </div>

        <div className="hv-row">
          <span className="hv-label">Condiciones Crónicas:</span>
          <input
            className="hv-val"
            value={Array.isArray(md.condicionesCronicas) ? md.condicionesCronicas.join(", ") : md.condicionesCronicas ?? ""}
            onChange={(e) =>
              setHv("medico", { ...md, condicionesCronicas: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })
            }
            style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 8px" }}
          />
        </div>

        <div className="hv-row">
          <span className="hv-label">Medicamentos Habituales:</span>
          <input
            className="hv-val"
            value={md.medicamentos ?? ""}
            onChange={(e) => setHv("medico", { ...md, medicamentos: e.target.value })}
            style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 8px" }}
          />
        </div>

        <div className="hv-row">
          <span className="hv-label">Observaciones:</span>
          <input
            className="hv-val"
            value={md.observaciones ?? ""}
            onChange={(e) => setHv("medico", { ...md, observaciones: e.target.value })}
            style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 8px" }}
          />
        </div>
      </div>

      {/* Trayectoria */}
      <div className="hv-card">
        <h4 className="hv-title">Trayectoria en la Empresa</h4>

        {modoEdicion ? (
          <>
            {(trayectoria.length ? trayectoria : [{ cargo: "", desde: "", detalle: "" }]).map((t, i) => (
              <div key={i} className="hv-tl-it">
                <div className="hv-grid2">
                  <div className="hv-row">
                    <span className="hv-label">Cargo:</span>
                    <input
                      className="hv-val"
                      value={t.cargo ?? ""}
                      onChange={(e) =>
                        setHv("trayectoria", upsertArray(trayectoria.length ? trayectoria : [{},], i, { cargo: e.target.value }))
                      }
                      style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 8px" }}
                    />
                  </div>
                  <div className="hv-row">
                    <span className="hv-label">Desde:</span>
                    <input
                      className="hv-val"
                      type="date"
                      value={t.desde ?? ""}
                      onChange={(e) =>
                        setHv("trayectoria", upsertArray(trayectoria.length ? trayectoria : [{},], i, { desde: e.target.value }))
                      }
                      style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 8px" }}
                    />
                  </div>
                </div>
                <div className="hv-row">
                  <span className="hv-label">Detalle:</span>
                  <input
                    className="hv-val"
                    value={t.detalle ?? ""}
                    onChange={(e) =>
                      setHv("trayectoria", upsertArray(trayectoria.length ? trayectoria : [{},], i, { detalle: e.target.value }))
                    }
                    style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 8px" }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button className="ed-btn" onClick={() => setHv("trayectoria", removeIdx(trayectoria, i))}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="ed-btn" onClick={addTrayectoria}>Agregar cargo</button>
            </div>
          </>
        ) : (
          <ul className="hv-tl">
            {(trayectoria.length ? trayectoria : [{ cargo: "N/D", desde: "", detalle: "" }]).map((t, i) => (
              <li key={i} className="hv-tl-it">
                <div className="hv-strong">{fmt(t.cargo)}</div>
                <div className="hv-muted">Desde el {fmt(t.desde)}</div>
                {t.detalle ? <div>{t.detalle}</div> : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Educación */}
      <div className="hv-card">
        <h4 className="hv-title">Educación y Formación</h4>

        {modoEdicion ? (
          <>
            {(educacion.length ? educacion : [{ titulo: "", institucion: "", desde: "", hasta: "" }]).map((e, i) => (
              <div key={i} className="hv-tl-it">
                <div className="hv-grid2">
                  <div className="hv-row">
                    <span className="hv-label">Título:</span>
                    <input
                      className="hv-val"
                      value={e.titulo ?? ""}
                      onChange={(ev) =>
                        setHv("educacion", upsertArray(educacion.length ? educacion : [{},], i, { titulo: ev.target.value }))
                      }
                      style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 8px" }}
                    />
                  </div>
                  <div className="hv-row">
                    <span className="hv-label">Institución:</span>
                    <input
                      className="hv-val"
                      value={e.institucion ?? ""}
                      onChange={(ev) =>
                        setHv("educacion", upsertArray(educacion.length ? educacion : [{},], i, { institucion: ev.target.value }))
                      }
                      style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 8px" }}
                    />
                  </div>
                </div>
                <div className="hv-grid2">
                  <div className="hv-row">
                    <span className="hv-label">Desde:</span>
                    <input
                      className="hv-val"
                      value={e.desde ?? ""}
                      onChange={(ev) =>
                        setHv("educacion", upsertArray(educacion.length ? educacion : [{},], i, { desde: ev.target.value }))
                      }
                      style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 8px" }}
                    />
                  </div>
                  <div className="hv-row">
                    <span className="hv-label">Hasta:</span>
                    <input
                      className="hv-val"
                      value={e.hasta ?? ""}
                      onChange={(ev) =>
                        setHv("educacion", upsertArray(educacion.length ? educacion : [{},], i, { hasta: ev.target.value }))
                      }
                      style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 8px" }}
                    />
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                  <button className="ed-btn" onClick={() => setHv("educacion", removeIdx(educacion, i))}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="ed-btn" onClick={addEducacion}>Agregar estudio</button>
            </div>
          </>
        ) : (
          <ul className="hv-tl">
            {(educacion.length ? educacion : [{ titulo: "N/D", institucion: "", desde: "", hasta: "" }]).map((e, i) => (
              <li key={i} className="hv-tl-it">
                <div className="hv-strong">{fmt(e.titulo)}</div>
                <div>{fmt(e.institucion)}</div>
                <div className="hv-muted">
                  {fmt(e.desde)} - {fmt(e.hasta)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Experiencia */}
      <div className="hv-card">
        <h4 className="hv-title">Experiencia Laboral Previa</h4>

        {modoEdicion ? (
          <>
            {(experiencia.length ? experiencia : [{ cargo: "", empresa: "", desde: "", hasta: "", descripcion: "" }]).map(
              (x, i) => (
                <div key={i} className="hv-tl-it">
                  <div className="hv-grid2">
                    <div className="hv-row">
                      <span className="hv-label">Cargo:</span>
                      <input
                        className="hv-val"
                        value={x.cargo ?? ""}
                        onChange={(ev) =>
                          setHv("experiencia", upsertArray(experiencia.length ? experiencia : [{},], i, { cargo: ev.target.value }))
                        }
                        style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 8px" }}
                      />
                    </div>
                    <div className="hv-row">
                      <span className="hv-label">Empresa:</span>
                      <input
                        className="hv-val"
                        value={x.empresa ?? ""}
                        onChange={(ev) =>
                          setHv("experiencia", upsertArray(experiencia.length ? experiencia : [{},], i, { empresa: ev.target.value }))
                        }
                        style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 8px" }}
                      />
                    </div>
                  </div>

                  <div className="hv-grid2">
                    <div className="hv-row">
                      <span className="hv-label">Desde:</span>
                      <input
                        className="hv-val"
                        value={x.desde ?? ""}
                        onChange={(ev) =>
                          setHv("experiencia", upsertArray(experiencia.length ? experiencia : [{},], i, { desde: ev.target.value }))
                        }
                        style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 8px" }}
                      />
                    </div>
                    <div className="hv-row">
                      <span className="hv-label">Hasta:</span>
                      <input
                        className="hv-val"
                        value={x.hasta ?? ""}
                        onChange={(ev) =>
                          setHv("experiencia", upsertArray(experiencia.length ? experiencia : [{},], i, { hasta: ev.target.value }))
                        }
                        style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 8px" }}
                      />
                    </div>
                  </div>

                  <div className="hv-row">
                    <span className="hv-label">Descripción:</span>
                    <input
                      className="hv-val"
                      value={x.descripcion ?? ""}
                      onChange={(ev) =>
                        setHv("experiencia", upsertArray(experiencia.length ? experiencia : [{},], i, { descripcion: ev.target.value }))
                      }
                      style={{ width: "100%", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 8px" }}
                    />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button className="ed-btn" onClick={() => setHv("experiencia", removeIdx(experiencia, i))}>
                      Eliminar
                    </button>
                  </div>
                </div>
              )
            )}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="ed-btn" onClick={addExperiencia}>Agregar experiencia</button>
            </div>
          </>
        ) : (
          <ul className="hv-tl">
            {(experiencia.length
              ? experiencia
              : [{ cargo: "N/D", empresa: "", desde: "", hasta: "", descripcion: "" }]
            ).map((x, i) => (
              <li key={i} className="hv-tl-it">
                <div className="hv-strong">{fmt(x.cargo)}</div>
                <div>{fmt(x.empresa)}</div>
                <div className="hv-muted">
                  {fmt(x.desde)} - {fmt(x.hasta)}
                </div>
                {x.descripcion ? <div>{x.descripcion}</div> : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* estilos mínimos */}
      <style>{`
        .hv-wrap{--pad-card:16px}
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
      `}</style>
    </div>
  );
}
