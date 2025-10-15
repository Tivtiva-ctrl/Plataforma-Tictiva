// src/components/DocumentosTab.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

/* ------------------- Utils ------------------- */
const fmtFecha = (v) => {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const iconFor = (mime = "", name = "") => {
  const n = (name || "").toLowerCase();
  if (mime.includes("pdf") || n.endsWith(".pdf")) return "📄";
  if (mime.includes("image/") || /\.(png|jpg|jpeg|gif|webp|heic)$/.test(n)) return "🖼️";
  if (/\.(doc|docx)$/.test(n)) return "📝";
  if (/\.(xls|xlsx|csv)$/.test(n)) return "📊";
  if (/\.(ppt|pptx)$/.test(n)) return "📽️";
  return "📎";
};

const guessCategory = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("contrato")) return "Contractuales";
  if (n.includes("anexo")) return "Contractuales";
  if (n.includes("certificado")) return "Legal";
  if (n.includes("licencia") || n.includes("permiso")) return "RRHH";
  if (n.includes("liquidación") || n.includes("liquidacion") || n.includes("pago")) return "Remuneraciones";
  if (n.includes("titulo") || n.includes("diploma") || n.includes("curso")) return "Formación";
  return "Otros";
};

const normalizeTitle = (s = "") =>
  s.trim().replace(/\.[a-z0-9]+$/i, "").replace(/\s+/g, " ").toLowerCase();

/* ------------------- UI helpers ------------------- */
function Kebab({ onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="lf-btn lf-btn-ghost"
      style={{ border: "1px solid #D1D5DB", padding: "6px 10px", borderRadius: 10 }}
      aria-label="Más acciones"
      title="Más acciones"
    >
      ⋯
    </button>
  );
}

/* Menú ⋯: texto puro, flotante, sin empujar la card */
function Menu({ anchorRef, onClose, onView, onEdit, onDownload, onDelete }) {
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (!ref.current) return;
      if (ref.current.contains(e.target)) return;
      if (anchorRef.current?.contains(e.target)) return;
      onClose?.();
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [onClose, anchorRef]);

  const itemBase = {
    display: "block",
    width: "100%",
    textAlign: "left",
    padding: "8px 12px",
    background: "transparent",
    border: "none",
    outline: "none",
    fontSize: 14,
    cursor: "pointer",
  };

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: 38,                 // bajo el botón ⋯
        right: 0,
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        borderRadius: 10,
        boxShadow: "0 12px 40px rgba(0,0,0,.12)",
        minWidth: 160,
        zIndex: 1000,           // debajo del modal (que va en 20000)
        padding: 6,
      }}
    >
      <button onClick={() => { onView?.(); onClose?.(); }} style={{ ...itemBase, color: "#111827" }}>Ver</button>
      <button onClick={() => { onEdit?.(); onClose?.(); }} style={{ ...itemBase, color: "#111827" }}>Editar</button>
      <button onClick={() => { onDownload?.(); onClose?.(); }} style={{ ...itemBase, color: "#111827" }}>Descargar</button>
      <div style={{ height: 6 }} />
      <button onClick={() => { onDelete?.(); onClose?.(); }} style={{ ...itemBase, color: "#B91C1C" }}>Eliminar</button>
    </div>
  );
}

function Modal({ open, title, onClose, children, wide = false }) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 20000, // <-- elevamos el modal por sobre cualquier card flotante
      }}
      onMouseDown={onClose}
    >
      <div
        className="ef-card p20"
        style={{ width: wide ? "80vw" : 560, maxHeight: "85vh", overflow: "auto", background: "white" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 className="ef-title-sm" style={{ margin: 0 }}>{title}</h3>
          <button className="lf-btn lf-btn-ghost" onClick={onClose}>Cerrar</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ------------------- Main ------------------- */
export default function DocumentosTab({ employee }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todos");

  const [menuFor, setMenuFor] = useState(null);
  const menuAnchor = useRef(null);

  const [viewer, setViewer] = useState({ open: false, url: "", name: "" });
  const [editor, setEditor] = useState({ open: false, row: null });

  const fileInputRef = useRef(null);

  const loadDocs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("employee_documents")
      .select("*")
      .eq("employee_id", employee.id)
      .order("uploaded_at", { ascending: false });
    if (!error) setDocs(data || []);
    setLoading(false);
  };

  useEffect(() => { if (employee?.id) loadDocs(); }, [employee?.id]);

  const cats = useMemo(() => {
    const base = ["Todos"];
    for (const d of docs) if (d.categoria_detectada && !base.includes(d.categoria_detectada)) base.push(d.categoria_detectada);
    return base;
  }, [docs]);

  const filtered = useMemo(() => {
    let arr = docs;
    if (cat !== "Todos") arr = arr.filter((d) => d.categoria_detectada === cat);
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      arr = arr.filter((d) => (d.title ?? d.name ?? "").toLowerCase().includes(s));
    }
    return arr;
  }, [docs, q, cat]);

  const askUpload = () => fileInputRef.current?.click();

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    for (const file of files) {
      await uploadOne(file);
    }
    await loadDocs();
    e.target.value = ""; // reset
  };

  const uploadOne = async (file) => {
    const origName = file.name;
    const titleBase = normalizeTitle(origName);
    const categoria_detectada = guessCategory(origName);

    // next version
    const { data: existing } = await supabase
      .from("employee_documents")
      .select("id,version,title_norm")
      .eq("employee_id", employee.id)
      .eq("title_norm", titleBase)
      .order("version", { ascending: false })
      .limit(1);
    const nextVersion = existing && existing.length ? (existing[0].version || 1) + 1 : 1;

    // upload storage
    const storagePath = `${employee.tenant_id ?? "default"}/${employee.id}/${Date.now()}_${origName}`;
    const up = await supabase.storage.from("employee-docs").upload(storagePath, file, { upsert: false });
    if (up.error) { alert(up.error.message || "No se pudo subir"); return; }

    // insert row
    const payload = {
      employee_id: employee.id,
      tenant_id: employee.tenant_id ?? null,
      title: origName.replace(/\.[a-z0-9]+$/i, ""),
      title_norm: titleBase,
      categoria_detectada,
      storage_path: storagePath,
      mime_type: file.type || null,
      size_bytes: file.size || null,
      version: nextVersion,
      visibility: "empleado_rrhh",
      uploaded_at: new Date().toISOString(),
    };
    const ins = await supabase.from("employee_documents").insert(payload).select("*").single();
    if (ins.error) {
      await supabase.storage.from("employee-docs").remove([storagePath]); // rollback file
      alert(ins.error.message || "No se pudo registrar el documento");
    }
  };

  const openView = async (row) => {
    const { data, error } = await supabase.storage.from("employee-docs").createSignedUrl(row.storage_path, 60 * 60);
    if (error) { alert(error.message); return; }
    setViewer({ open: true, url: data.signedUrl, name: row.title || row.name });
  };

  const download = async (row) => {
    const { data, error } = await supabase.storage.from("employee-docs").createSignedUrl(row.storage_path, 60);
    if (error) { alert(error.message); return; }
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = row.title || "documento";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const removeDoc = async (row) => {
    const ok = confirm(`¿Eliminar "${row.title}"? Esta acción no se puede deshacer.`);
    if (!ok) return;
    await supabase.storage.from("employee-docs").remove([row.storage_path]); // ignorar error si no existe
    const del = await supabase.from("employee_documents").delete().eq("id", row.id);
    if (del.error) { alert(del.error.message || "No se pudo eliminar"); return; }
    await loadDocs();
  };

  const openEdit = (row) => setEditor({ open: true, row });

  const saveEdit = async (changes) => {
    const { row } = editor;
    const upd = await supabase
      .from("employee_documents")
      .update(changes)
      .eq("id", row.id)
      .select("*")
      .single();
    if (upd.error) { alert(upd.error.message || "No se pudo actualizar"); return; }
    setEditor({ open: false, row: null });
    await loadDocs();
  };

  return (
    <div className="ef-main">
      <div className="ef-card p20" style={{ marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "space-between", flexWrap: "wrap" }}>
          <h3 className="ef-title-sm" style={{ margin: 0 }}>Documentos del Empleado</h3>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar documento…"
              style={{ height: 36, border: "1px solid #E5E7EB", borderRadius: 10, padding: "0 10px" }}
            />
            <select
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              style={{ height: 36, border: "1px solid #E5E7EB", borderRadius: 10, padding: "0 10px" }}
            >
              {cats.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <button className="lf-btn lf-btn-primary" onClick={askUpload}>+ Subir Documento</button>
            <input ref={fileInputRef} type="file" multiple style={{ display: "none" }} onChange={handleUpload} />
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          {loading ? (
            <div className="text-gray-500">Cargando documentos…</div>
          ) : filtered.length === 0 ? (
            <div className="text-gray-500">No hay documentos para mostrar</div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 10 }}>
              {filtered.map((d) => (
                <li
                  key={d.id}
                  className="ef-card"
                  style={{
                    padding: 14,
                    border: "1px solid #E5E7EB",
                    borderRadius: 14,
                    position: "relative",          // anclaje del menú
                    overflow: "visible",            // que el menú pueda sobresalir
                    zIndex: menuFor === d.id ? 50 : 1, // elevar la card activa
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
                      <div style={{ fontSize: 22 }}>{iconFor(d.mime_type, d.title)}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <strong style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 420 }}>
                            {d.title || "Documento"}
                          </strong>
                          <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 999, background: "#EEF2FF", color: "#4F46E5" }}>
                            v{d.version ?? 1}
                          </span>
                          {d.categoria_detectada && (
                            <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 999, background: "#F3F4F6", color: "#374151" }}>
                              {d.categoria_detectada}
                            </span>
                          )}
                          {d.expires_at && new Date(d.expires_at) < new Date() && (
                            <span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 999, background: "#FEF2F2", color: "#B91C1C" }}>
                              Vencido
                            </span>
                          )}
                        </div>
                        <div style={{ color: "#6B7280", fontSize: 13, marginTop: 2 }}>
                          Subido el {fmtFecha(d.uploaded_at)}
                          {d.size_bytes ? ` · ${(d.size_bytes/1024/1024).toFixed(2)} MB` : ""}
                        </div>
                      </div>
                    </div>

                    <div style={{ position: "relative" }}>
                      <span ref={menuAnchor} />
                      <Kebab onOpen={() => setMenuFor(d.id)} />
                      {menuFor === d.id && (
                        <Menu
                          anchorRef={menuAnchor}
                          onClose={() => setMenuFor(null)}
                          onView={() => openView(d)}
                          onEdit={() => openEdit(d)}
                          onDownload={() => download(d)}
                          onDelete={() => removeDoc(d)}
                        />
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Visor */}
      <Modal open={viewer.open} onClose={() => setViewer({ open: false, url: "", name: "" })} title={viewer.name} wide>
        {viewer.url ? (
          <iframe title="preview" src={viewer.url} style={{ width: "100%", height: "70vh", border: "1px solid #E5E7EB", borderRadius: 10 }} />
        ) : (
          <div className="text-gray-500">No se pudo generar vista previa.</div>
        )}
      </Modal>

      {/* Editor */}
      <EditDocModal
        open={editor.open}
        row={editor.row}
        onClose={() => setEditor({ open: false, row: null })}
        onSave={saveEdit}
      />
    </div>
  );
}

/* ------------------- Modal de Edición ------------------- */
function EditDocModal({ open, row, onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState("empleado_rrhh");
  const [expires, setExpires] = useState("");

  useEffect(() => {
    if (!open) return;
    setTitle(row?.title ?? "");
    setVisibility(row?.visibility ?? "empleado_rrhh");
    setExpires(row?.expires_at ? row.expires_at.substring(0, 10) : "");
  }, [open, row]);

  const submit = (e) => {
    e.preventDefault();
    onSave?.({
      title: title?.trim() || row.title,
      visibility,
      expires_at: expires || null,
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Editar documento">
      {!row ? (
        <div className="text-gray-500">Sin datos</div>
      ) : (
        <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
          <div>
            <label style={{ display: "block", color: "#374151", marginBottom: 4 }}>Título</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: "100%", height: 36, border: "1px solid #E5E7EB", borderRadius: 10, padding: "0 10px" }}
            />
          </div>
          <div>
            <label style={{ display: "block", color: "#374151", marginBottom: 4 }}>Visibilidad</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              style={{ width: "100%", height: 36, border: "1px solid #E5E7EB", borderRadius: 10, padding: "0 10px" }}
            >
              <option value="empleado_rrhh">Empleado y RRHH</option>
              <option value="solo_rrhh">Solo RRHH</option>
              <option value="solo_empleado">Solo Empleado</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", color: "#374151", marginBottom: 4 }}>Fecha de expiración</label>
            <input
              type="date"
              value={expires}
              onChange={(e) => setExpires(e.target.value)}
              style={{ width: "100%", height: 36, border: "1px solid #E5E7EB", borderRadius: 10, padding: "0 10px" }}
            />
          </div>

          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
            <button type="button" className="lf-btn lf-btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="lf-btn lf-btn-primary">Guardar</button>
          </div>
        </form>
      )}
    </Modal>
  );
}
