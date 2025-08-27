// src/components/HojaDeVida.jsx
import React, { useEffect, useState } from 'react';
import './HojaDeVida.css';

/**
 * Hoja de Vida (editable) — Tictiva
 * - Mantiene tu API de props: { empleado, modoEdicion, onNestedChange }
 * - Agrega secciones editables: Experiencias, Educación, Certificaciones, Habilidades, Idiomas, Observaciones
 * - Usa onNestedChange("hojaDeVida", next) para sincronizar el objeto completo (seguro y simple)
 * - Mantiene tus secciones existentes (Información sensible, Contacto, Asistencia y Evaluación, etc.)
 */

const HV_DEFAULT = {
  experiencias: [],        // {empresa, cargo, desde, hasta, descripcion}
  educacion: [],           // {institucion, grado, desde, hasta}
  certificaciones: [],     // {nombre, entidad, fecha, documentoNombre, documentoUrl}
  habilidades: [],         // ["React", "Comunicación", ...]
  idiomas: [],             // {idioma, nivel}
  observaciones: "",       // texto libre
};

const noop = () => {};

const HojaDeVida = ({ empleado, modoEdicion, onNestedChange = noop }) => {
  if (!empleado) return null;

  // =========================
  // Estado local de Hoja de Vida
  // =========================
  const [hv, setHv] = useState(HV_DEFAULT);

  useEffect(() => {
    const base = (empleado?.hojaDeVida && typeof empleado.hojaDeVida === 'object')
      ? empleado.hojaDeVida
      : {};
    setHv({ ...HV_DEFAULT, ...base });
  }, [empleado]);

  const pushHV = (next) => {
    setHv(next);
    onNestedChange('hojaDeVida', next); // sincroniza con el padre
  };

  // ====== Helpers de edición HV ======
  // Experiencias
  const addExp = () =>
    pushHV({
      ...hv,
      experiencias: [
        ...hv.experiencias,
        { empresa: '', cargo: '', desde: '', hasta: '', descripcion: '' },
      ],
    });
  const rmExp = (idx) =>
    pushHV({ ...hv, experiencias: hv.experiencias.filter((_, i) => i !== idx) });
  const setExp = (idx, field, val) =>
    pushHV({
      ...hv,
      experiencias: hv.experiencias.map((e, i) => (i === idx ? { ...e, [field]: val } : e)),
    });

  // Educación
  const addEdu = () =>
    pushHV({
      ...hv,
      educacion: [
        ...hv.educacion,
        { institucion: '', grado: '', desde: '', hasta: '' },
      ],
    });
  const rmEdu = (idx) =>
    pushHV({ ...hv, educacion: hv.educacion.filter((_, i) => i !== idx) });
  const setEdu = (idx, field, val) =>
    pushHV({
      ...hv,
      educacion: hv.educacion.map((e, i) => (i === idx ? { ...e, [field]: val } : e)),
    });

  // Certificaciones
  const addCert = () =>
    pushHV({
      ...hv,
      certificaciones: [
        ...hv.certificaciones,
        { nombre: '', entidad: '', fecha: '', documentoNombre: '', documentoUrl: '' },
      ],
    });
  const rmCert = (idx) =>
    pushHV({ ...hv, certificaciones: hv.certificaciones.filter((_, i) => i !== idx) });
  const setCert = (idx, field, val) =>
    pushHV({
      ...hv,
      certificaciones: hv.certificaciones.map((c, i) => (i === idx ? { ...c, [field]: val } : c)),
    });

  // Habilidades
  const addSkill = () => pushHV({ ...hv, habilidades: [...hv.habilidades, ''] });
  const rmSkill = (idx) =>
    pushHV({ ...hv, habilidades: hv.habilidades.filter((_, i) => i !== idx) });
  const setSkill = (idx, val) =>
    pushHV({ ...hv, habilidades: hv.habilidades.map((s, i) => (i === idx ? val : s)) });

  // Idiomas
  const addLang = () => pushHV({ ...hv, idiomas: [...hv.idiomas, { idioma: '', nivel: '' }] });
  const rmLang = (idx) =>
    pushHV({ ...hv, idiomas: hv.idiomas.filter((_, i) => i !== idx) });
  const setLang = (idx, field, val) =>
    pushHV({
      ...hv,
      idiomas: hv.idiomas.map((l, i) => (i === idx ? { ...l, [field]: val } : l)),
    });

  // ====== Inputs simples reutilizables ======
  const Input = ({ label, value, onChange, type = 'text', placeholder }) => (
    <div className="hv-field">
      <label className="hv-label">{label}</label>
      <input
        className="hv-input"
        type={type}
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );

  const TextArea = ({ label, value, onChange, placeholder, rows = 3 }) => (
    <div className="hv-field">
      <label className="hv-label">{label}</label>
      <textarea
        className="hv-input"
        rows={rows}
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );

  return (
    <div className="hoja-vida-container">
      {/* Título simple (encabezado grande ya está en la ficha) */}
      <h2 className="titulo-seccion">📄 Hoja de Vida Laboral</h2>

      {/* =========================== */}
      {/* Secciones EDITABLES nuevas */}
      {/* =========================== */}

      {/* EXPERIENCIA LABORAL */}
      <section className="tarjeta-section">
        <h3>💼 Experiencia Laboral</h3>

        {hv.experiencias?.length === 0 && !modoEdicion && (
          <div className="hv-empty">Sin experiencias registradas.</div>
        )}

        {hv.experiencias?.map((exp, idx) => (
          <div className="hv-card" key={`exp-${idx}`}>
            <div className="hv-row-2">
              <Input
                label="Empresa"
                value={exp.empresa}
                onChange={(v) => setExp(idx, 'empresa', v)}
              />
              <Input
                label="Cargo"
                value={exp.cargo}
                onChange={(v) => setExp(idx, 'cargo', v)}
              />
            </div>
            <div className="hv-row-2">
              <Input
                label="Desde"
                type="month"
                value={exp.desde}
                onChange={(v) => setExp(idx, 'desde', v)}
              />
              <Input
                label="Hasta"
                type="month"
                value={exp.hasta}
                onChange={(v) => setExp(idx, 'hasta', v)}
              />
            </div>
            <TextArea
              label="Descripción"
              value={exp.descripcion}
              onChange={(v) => setExp(idx, 'descripcion', v)}
              placeholder="Logros, responsabilidades, tecnologías, etc."
            />

            {modoEdicion && (
              <div className="hv-actions-right">
                <button className="hv-btn-danger" onClick={() => rmExp(idx)}>🗑️ Eliminar</button>
              </div>
            )}
          </div>
        ))}

        {modoEdicion && (
          <button className="hv-btn-add" onClick={addExp}>➕ Agregar experiencia</button>
        )}
      </section>

      {/* EDUCACIÓN */}
      <section className="tarjeta-section">
        <h3>🎓 Educación</h3>

        {hv.educacion?.length === 0 && !modoEdicion && (
          <div className="hv-empty">Sin estudios registrados.</div>
        )}

        {hv.educacion?.map((ed, idx) => (
          <div className="hv-card" key={`edu-${idx}`}>
            <div className="hv-row-2">
              <Input
                label="Institución"
                value={ed.institucion}
                onChange={(v) => setEdu(idx, 'institucion', v)}
              />
              <Input
                label="Grado / Título"
                value={ed.grado}
                onChange={(v) => setEdu(idx, 'grado', v)}
              />
            </div>
            <div className="hv-row-2">
              <Input
                label="Desde"
                type="month"
                value={ed.desde}
                onChange={(v) => setEdu(idx, 'desde', v)}
              />
              <Input
                label="Hasta"
                type="month"
                value={ed.hasta}
                onChange={(v) => setEdu(idx, 'hasta', v)}
              />
            </div>

            {modoEdicion && (
              <div className="hv-actions-right">
                <button className="hv-btn-danger" onClick={() => rmEdu(idx)}>🗑️ Eliminar</button>
              </div>
            )}
          </div>
        ))}

        {modoEdicion && (
          <button className="hv-btn-add" onClick={addEdu}>➕ Agregar educación</button>
        )}
      </section>

      {/* CERTIFICACIONES */}
      <section className="tarjeta-section">
        <h3>📜 Certificaciones</h3>

        {hv.certificaciones?.length === 0 && !modoEdicion && (
          <div className="hv-empty">Sin certificaciones registradas.</div>
        )}

        {hv.certificaciones?.map((c, idx) => (
          <div className="hv-card" key={`cert-${idx}`}>
            <div className="hv-row-2">
              <Input
                label="Nombre"
                value={c.nombre}
                onChange={(v) => setCert(idx, 'nombre', v)}
              />
              <Input
                label="Entidad"
                value={c.entidad}
                onChange={(v) => setCert(idx, 'entidad', v)}
              />
            </div>
            <div className="hv-row-2">
              <Input
                label="Fecha"
                type="date"
                value={c.fecha}
                onChange={(v) => setCert(idx, 'fecha', v)}
              />
              <Input
                label="Documento (nombre)"
                value={c.documentoNombre}
                onChange={(v) => setCert(idx, 'documentoNombre', v)}
                placeholder="Certificado.pdf"
              />
            </div>
            <Input
              label="Documento (URL)"
              value={c.documentoUrl}
              onChange={(v) => setCert(idx, 'documentoUrl', v)}
              placeholder="https://..."
            />
            {!!c.documentoNombre && !!c.documentoUrl && (
              <div className="hv-docline">
                📎 <a href={c.documentoUrl} target="_blank" rel="noreferrer" className="hv-link">
                  {c.documentoNombre}
                </a>
              </div>
            )}

            {modoEdicion && (
              <div className="hv-actions-right">
                <button className="hv-btn-danger" onClick={() => rmCert(idx)}>🗑️ Eliminar</button>
              </div>
            )}
          </div>
        ))}

        {modoEdicion && (
          <button className="hv-btn-add" onClick={addCert}>➕ Agregar certificación</button>
        )}
      </section>

      {/* HABILIDADES */}
      <section className="tarjeta-section">
        <h3>🧠 Habilidades</h3>

        {hv.habilidades?.length === 0 && !modoEdicion && (
          <div className="hv-empty">Sin habilidades registradas.</div>
        )}

        {modoEdicion ? (
          <div className="hv-chips-edit">
            {hv.habilidades?.map((s, idx) => (
              <div className="hv-chip-edit" key={`skill-${idx}`}>
                <input
                  className="hv-chip-input"
                  value={s || ''}
                  placeholder="Ej: React"
                  onChange={(e) => setSkill(idx, e.target.value)}
                />
                <button className="hv-chip-del" onClick={() => rmSkill(idx)}>✖</button>
              </div>
            ))}
            <button className="hv-btn-add" onClick={addSkill}>➕ Agregar habilidad</button>
          </div>
        ) : (
          <div className="hv-chips">
            {hv.habilidades?.map((s, idx) => (
              <span className="hv-chip" key={`skillv-${idx}`}>{s}</span>
            ))}
          </div>
        )}
      </section>

      {/* IDIOMAS */}
      <section className="tarjeta-section">
        <h3>🌎 Idiomas</h3>

        {hv.idiomas?.length === 0 && !modoEdicion && (
          <div className="hv-empty">Sin idiomas registrados.</div>
        )}

        {hv.idiomas?.map((l, idx) => (
          <div className="hv-card" key={`lang-${idx}`}>
            <div className="hv-row-2">
              <Input
                label="Idioma"
                value={l.idioma}
                onChange={(v) => setLang(idx, 'idioma', v)}
                placeholder="Ej: Inglés"
              />
              <Input
                label="Nivel"
                value={l.nivel}
                onChange={(v) => setLang(idx, 'nivel', v)}
                placeholder="Básico / Intermedio / Avanzado / Nativo"
              />
            </div>

            {modoEdicion && (
              <div className="hv-actions-right">
                <button className="hv-btn-danger" onClick={() => rmLang(idx)}>🗑️ Eliminar</button>
              </div>
            )}
          </div>
        ))}

        {modoEdicion && (
          <button className="hv-btn-add" onClick={addLang}>➕ Agregar idioma</button>
        )}
      </section>

      {/* OBSERVACIONES */}
      <section className="tarjeta-section">
        <h3>📝 Observaciones</h3>
        {modoEdicion ? (
          <TextArea
            label="Notas internas / reseña"
            value={hv.observaciones}
            onChange={(v) => pushHV({ ...hv, observaciones: v })}
            rows={4}
            placeholder="Resumen profesional, fortalezas, hitos, etc."
          />
        ) : (
          <div className="hv-observe">
            {hv.observaciones ? hv.observaciones : <span className="hv-empty">Sin observaciones.</span>}
          </div>
        )}
      </section>

      {/* =========================== */}
      {/* Tus secciones ORIGINALES    */}
      {/* (se mantienen y respetan)   */}
      {/* =========================== */}

      {/* Historial Laboral simple (muestra breve si no hay experiencias cargadas) */}
      <section className="tarjeta-section">
        <h3>📜 Historial Laboral</h3>
        {hv.experiencias?.length > 0 ? (
          <ul className="tarjeta-lista">
            {hv.experiencias.map((e, i) => (
              <li key={`hexp-${i}`}>
                <b>{e.empresa || 'Empresa'}</b> – {e.cargo || 'Cargo'}
                <span className="fecha">
                  {(e.desde || '').toString()} {e.hasta ? `— ${e.hasta}` : ''}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="tarjeta-lista">
            <li>
              <b>Ingreso a la empresa</b> – Contratación como {empleado.cargo || "—"}
              <span className="fecha">{empleado.fechaIngreso || "—"}</span>
              <a href="/">📎 Contrato_Inicial.pdf</a>
            </li>
            <li>
              <b>Promoción</b> – Ejemplo de promoción cargada
              <span className="fecha">01/06/2023</span>
              <a href="/">📎 Promocion_Senior.pdf</a>
            </li>
          </ul>
        )}
      </section>

      {/* Información Sensible */}
      <section className="tarjeta-section confidencial">
        <h3>⚕️ Información Sensible <span className="etiqueta">Solo RR.HH.</span></h3>

        <p><b>Condiciones médicas:</b></p>
        {!modoEdicion ? (
          <p>{empleado.salud?.condiciones || "No declaradas"}</p>
        ) : (
          <textarea
            value={empleado.salud?.condiciones || ""}
            onChange={(e) => onNestedChange("salud.condiciones", e.target.value)}
            placeholder="Ej: Diabetes tipo II, alergia a penicilina…"
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", marginBottom: 10 }}
          />
        )}

        <p><b>Accidentes laborales:</b></p>
        {!modoEdicion ? (
          <p>{empleado.salud?.accidentes || "Sin registros"}</p>
        ) : (
          <textarea
            value={empleado.salud?.accidentes || ""}
            onChange={(e) => onNestedChange("salud.accidentes", e.target.value)}
            placeholder="Ej: Corte menor 15/03/2023…"
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", marginBottom: 10 }}
          />
        )}

        <p><b>Religión declarada:</b></p>
        {!modoEdicion ? (
          <p>{empleado.salud?.religion || "No especificada"}</p>
        ) : (
          <input
            type="text"
            value={empleado.salud?.religion || ""}
            onChange={(e) => onNestedChange("salud.religion", e.target.value)}
            placeholder="Ej: Testigo de Jehová"
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", marginBottom: 10 }}
          />
        )}

        <p><b>Indicaciones médicas:</b></p>
        {!modoEdicion ? (
          <p>{empleado.salud?.indicaciones || "Ninguna"}</p>
        ) : (
          <textarea
            value={empleado.salud?.indicaciones || ""}
            onChange={(e) => onNestedChange("salud.indicaciones", e.target.value)}
            placeholder="Ej: No transfusiones de sangre"
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", marginBottom: 10 }}
          />
        )}
      </section>

      {/* Contacto de emergencia */}
      <section className="tarjeta-section">
        <h3>👥 Contacto de Emergencia</h3>

        <p><b>Nombre:</b></p>
        {!modoEdicion ? (
          <p>{empleado.contacto?.nombre || "—"}</p>
        ) : (
          <input
            type="text"
            value={empleado.contacto?.nombre || ""}
            onChange={(e) => onNestedChange("contacto.nombre", e.target.value)}
            placeholder="Nombre del contacto"
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", marginBottom: 10 }}
          />
        )}

        <p><b>Relación:</b></p>
        {!modoEdicion ? (
          <p>{empleado.contacto?.relacion || "—"}</p>
        ) : (
          <input
            type="text"
            value={empleado.contacto?.relacion || ""}
            onChange={(e) => onNestedChange("contacto.relacion", e.target.value)}
            placeholder="Parentesco o relación"
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", marginBottom: 10 }}
          />
        )}

        <p><b>Teléfono:</b></p>
        {!modoEdicion ? (
          <p>{empleado.contacto?.telefono || "—"}</p>
        ) : (
          <input
            type="tel"
            value={empleado.contacto?.telefono || ""}
            onChange={(e) => onNestedChange("contacto.telefono", e.target.value)}
            placeholder="+56 9 ..."
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", marginBottom: 10 }}
          />
        )}

        <p><b>Dirección:</b></p>
        {!modoEdicion ? (
          <p>{empleado.contacto?.direccion || "—"}</p>
        ) : (
          <input
            type="text"
            value={empleado.contacto?.direccion || ""}
            onChange={(e) => onNestedChange("contacto.direccion", e.target.value)}
            placeholder="Dirección"
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e5e7eb", marginBottom: 10 }}
          />
        )}
      </section>

      {/* Asistencia y Evaluación (dejamos edición de comentario) */}
      <section className="tarjeta-section">
        <h3>📊 Asistencia y Evaluación</h3>
        <div className="resumen-boxes">
          <div className="box verde">96%<br />Asistencia</div>
          <div className="box rojo">2<br />Inasistencias</div>
          <div className="box gris">8<br />Licencias</div>
          <div className="box gris">4.8<br />Evaluación</div>
        </div>

        <p style={{ marginTop: 12 }}><b>Comentarios jefatura:</b></p>
        {!modoEdicion ? (
          <p>{empleado.evaluacion?.comentarios || "—"}</p>
        ) : (
          <textarea
            value={empleado.evaluacion?.comentarios || ""}
            onChange={(e) => onNestedChange("evaluacion.comentarios", e.target.value)}
            placeholder="Comentarios de jefatura…"
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #e5e7eb" }}
          />
        )}
      </section>

      {/* Reconocimientos y formación (visual) */}
      <section className="tarjeta-section">
        <h3>🏅 Reconocimientos y Formación</h3>
        <ul>
          <li>📘 React Advanced Patterns – Dic 2023</li>
          <li>📘 Liderazgo Técnico – Jun 2023</li>
          <li>🏆 Empleado/a del Mes – Oct 2023</li>
        </ul>
      </section>

      {/* Indicadores (solo visual) */}
      <section className="tarjeta-section resumen-final">
        <div className="indicador">⏳ 3a 11m<br />Antigüedad</div>
        <div className="indicador">📄 {(hv.experiencias?.length || 0) + 2}<br />Movimientos</div>
        <div className="indicador">⚠️ 1<br />Accidente</div>
        <div className="indicador">🏅 2<br />Reconocimientos</div>
        <div className="indicador">🚫 0<br />Sanciones</div>
      </section>

      {/* Acciones finales (guardar general está en el encabezado) */}
      <div className="acciones-hoja">
        <button className="btn-descargar">⬇️ Descargar Hoja de Vida (PDF)</button>
        <button className="btn-ver">👁️ Vista Previa Completa</button>
      </div>
    </div>
  );
};

export default HojaDeVida;
