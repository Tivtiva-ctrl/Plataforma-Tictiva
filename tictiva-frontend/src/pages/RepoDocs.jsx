// src/pages/RepoDocs.jsx
import React, { useEffect, useMemo, useState } from "react";
import HRSubnav from "../components/HRSubnav";

const LS_KEYS = {
  folders: "repo_folders",
  docs: "repo_docs",
};

const loadLS = (k) => {
  try {
    const v = JSON.parse(localStorage.getItem(k));
    if (Array.isArray(v)) return v;
  } catch {}
  return null;
};
const saveLS = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};

const normalize = (s = "") =>
  s.toString().normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

export default function RepoDocs() {
  const [loading, setLoading] = useState(true);
  const [folders, setFolders] = useState([]);
  const [docs, setDocs] = useState([]);

  // Filtros
  const [q, setQ] = useState("");
  const [folderFilter, setFolderFilter] = useState("Todas");
  const [catFilter, setCatFilter] = useState("Todas");

  // Modal documento
  const [openDoc, setOpenDoc] = useState(false);
  const [savingDoc, setSavingDoc] = useState(false);
  const [docForm, setDocForm] = useState({
    nombre: "",
    descripcion: "",
    carpeta: "",
    categoria: "",
    etiquetas: "",
    version: "",
    vence: "",
    url: "",
  });

  // Modal carpeta
  const [openFolder, setOpenFolder] = useState(false);
  const [savingFolder, setSavingFolder] = useState(false);
  const [folderName, setFolderName] = useState("");

  // Carga inicial: localStorage → fallback a /data/db.json
  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      let f = loadLS(LS_KEYS.folders);
      let d = loadLS(LS_KEYS.docs);

      if (!f || !d) {
        try {
          const r = await fetch("/data/db.json");
          if (r.ok) {
            const j = await r.json();
            if (!f) f = Array.isArray(j.repo_folders) ? j.repo_folders : [];
            if (!d) d = Array.isArray(j.repo_docs) ? j.repo_docs : [];
          }
        } catch {
          // no-op, quedará vacío pero sin romper
          if (!f) f = [];
          if (!d) d = [];
        }
      }

      if (!cancel) {
        setFolders(f || []);
        setDocs(d || []);
        setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, []);

  // Persistencia al vuelo
  useEffect(() => saveLS(LS_KEYS.folders, folders), [folders]);
  useEffect(() => saveLS(LS_KEYS.docs, docs), [docs]);

  const allFolders = useMemo(
    () => ["Todas", ...folders.map((f) => f.nombre)],
    [folders]
  );
  const allCats = useMemo(() => {
    const set = new Set(docs.map((d) => (d.categoria || "").trim()).filter(Boolean));
    return ["Todas", ...Array.from(set)];
  }, [docs]);

  const filtered = useMemo(() => {
    const t = normalize(q);
    return docs.filter((d) => {
      if (folderFilter !== "Todas" && d.carpeta !== folderFilter) return false;
      if (catFilter !== "Todas" && (d.categoria || "") !== catFilter) return false;

      if (!t) return true;
      const haystack = normalize(
        `${d.nombre} ${d.descripcion} ${d.carpeta} ${d.categoria} ${(d.etiquetas || []).join(",")}`
      );
      return haystack.includes(t);
    });
  }, [docs, q, folderFilter, catFilter]);

  // Crear/editar carpeta
  const createFolder = async () => {
    const name = folderName.trim();
    if (!name) {
      alert("Ingresa un nombre de carpeta.");
      return;
    }
    setSavingFolder(true);
    const exists = folders.some((f) => normalize(f.nombre) === normalize(name));
    if (exists) {
      alert("Ya existe una carpeta con ese nombre.");
      setSavingFolder(false);
      return;
    }
    const nuevo = { id: `f-${Date.now()}`, nombre: name };
    setFolders((p) => [...p, nuevo]);
    setFolderName("");
    setSavingFolder(false);
    setOpenFolder(false);
  };

  // Subir/crear documento
  const openDocModal = () => {
    setDocForm({
      nombre: "",
      descripcion: "",
      carpeta: folders[0]?.nombre || "",
      categoria: "",
      etiquetas: "",
      version: "",
      vence: "",
      url: "",
    });
    setOpenDoc(true);
  };

  const saveDoc = async () => {
    const f = docForm;
    if (!f.nombre.trim()) return alert("Ingresa un nombre de documento.");
    if (!f.carpeta?.trim()) return alert("Selecciona una carpeta.");
    setSavingDoc(true);

    const nuevo = {
      id: `r-${Date.now()}`,
      nombre: f.nombre.trim(),
      descripcion: f.descripcion.trim(),
      carpeta: f.carpeta.trim(),
      categoria: f.categoria.trim(),
      etiquetas: f.etiquetas
        ? f.etiquetas
            .split(",")
            .map((e) => e.trim())
            .filter(Boolean)
        : [],
      version: f.version.trim(),
      vence: f.vence.trim(),
      url: f.url.trim(),
      actualizadoTs: new Date().toISOString().slice(0, 16).replace("T", " "),
    };

    setDocs((p) => [nuevo, ...p]);
    setSavingDoc(false);
    setOpenDoc(false);
  };

  const removeDoc = (id) => {
    if (!confirm("¿Eliminar documento? Esta acción no se puede deshacer.")) return;
    setDocs((p) => p.filter((d) => d.id !== id));
  };

  const editDocName = (id) => {
    const d = docs.find((x) => x.id === id);
    const nuevo = prompt("Renombrar documento:", d?.nombre || "");
    if (!nuevo) return;
    setDocs((p) =>
      p.map((x) => (x.id === id ? { ...x, nombre: nuevo.trim() } : x))
    );
  };

  return (
    <div className="dashboard-bg" style={{ padding: 16 }}>
      <HRSubnav />

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 28 }}>📚</div>
          <div>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>Repositorio Documental</h1>
            <p style={{ margin: "6px 0 0", color: "#6B7280" }}>
              Archivador de documentos de la empresa (políticas, reglamentos, plantillas, contratos tipo, comunicados y más).
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button
            className="btn"
            onClick={() => setOpenFolder(true)}
            style={{ border: "1px solid #E5E7EB", background: "#fff", padding: "10px 12px", borderRadius: 10 }}
          >
            + Carpeta
          </button>
          <button
            className="btn primary"
            onClick={openDocModal}
            style={{ background: "#1A56DB", color: "#fff", padding: "10px 14px", borderRadius: 10, border: 0 }}
          >
            + Subir documento
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <select
          value={folderFilter}
          onChange={(e) => setFolderFilter(e.target.value)}
          style={{ height: 40, border: "1px solid #E5E7EB", borderRadius: 10, padding: "0 10px", background: "#fff" }}
        >
          {allFolders.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>

        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          style={{ height: 40, border: "1px solid #E5E7EB", borderRadius: 10, padding: "0 10px", background: "#fff" }}
        >
          {allCats.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nombre, texto, etiqueta…"
          style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", outline: "none", width: 280, background: "#fff" }}
        />

        <button
          onClick={() => { setQ(""); setFolderFilter("Todas"); setCatFilter("Todas"); }}
          className="btn"
          style={{ border: "1px solid #E5E7EB", background: "#fff", padding: "10px 12px", borderRadius: 10 }}
        >
          Limpiar filtros
        </button>
      </div>

      {/* Tabla */}
      <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 12, overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 0.7fr 0.7fr 1fr",
            gap: 8,
            padding: "12px 16px",
            fontWeight: 700,
            color: "#374151",
            background: "#F9FAFB",
            borderBottom: "1px solid #E5E7EB",
          }}
        >
          <div>Nombre / Descripción</div>
          <div>Carpeta</div>
          <div>Categoría</div>
          <div>Etiquetas</div>
          <div>Versión</div>
          <div>Vence</div>
          <div>Acciones</div>
        </div>

        {loading ? (
          <div style={{ padding: 16, color: "#6B7280" }}>Cargando…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 16, color: "#6B7280" }}>Sin documentos que coincidan.</div>
        ) : (
          filtered.map((d) => (
            <div
              key={d.id}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 0.7fr 0.7fr 1fr",
                gap: 8,
                padding: "14px 16px",
                borderTop: "1px solid #E5E7EB",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: 700 }}>{d.nombre}</div>
                <div style={{ color: "#6B7280", fontSize: 12 }}>{d.descripcion || "—"}</div>
              </div>
              <div>{d.carpeta || "—"}</div>
              <div>{d.categoria || "—"}</div>
              <div>{(d.etiquetas || []).join(", ") || "—"}</div>
              <div>{d.version || "—"}</div>
              <div>{d.vence || "—"}</div>
              <div style={{ display: "flex", gap: 8 }}>
                {d.url ? (
                  <a href={d.url} target="_blank" rel="noreferrer" style={{ color: "#1A56DB", textDecoration: "none" }}>
                    Abrir
                  </a>
                ) : (
                  <span style={{ color: "#9CA3AF" }}>Sin URL</span>
                )}
                <button className="btn" onClick={() => editDocName(d.id)} style={{ padding: "6px 10px", borderRadius: 8 }}>
                  Renombrar
                </button>
                <button
                  className="btn"
                  onClick={() => removeDoc(d.id)}
                  style={{ padding: "6px 10px", borderRadius: 8, borderColor: "#FCA5A5", color: "#B91C1C" }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Carpeta */}
      {openFolder && (
        <>
          <div
            onClick={() => !savingFolder && setOpenFolder(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 60 }}
          />
          <div
            style={{
              position: "fixed",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: 480,
              maxWidth: "92vw",
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 12,
              boxShadow: "0 12px 32px rgba(0,0,0,.18)",
              zIndex: 80,
            }}
          >
            <div style={{ padding: 12, borderBottom: "1px solid #E5E7EB", fontWeight: 700 }}>Crear Carpeta</div>
            <div style={{ padding: 12, display: "grid", gap: 10 }}>
              <label style={{ fontSize: 12, color: "#6B7280" }}>Nombre</label>
              <input
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                style={{ border: "1px solid #E5E7EB", borderRadius: 10, padding: "10px 12px", outline: "none" }}
              />
            </div>
            <div style={{ padding: 12, borderTop: "1px solid #E5E7EB", display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="btn" onClick={() => setOpenFolder(false)} disabled={savingFolder}>
                Cancelar
              </button>
              <button
                className="btn primary"
                onClick={createFolder}
                disabled={savingFolder}
                style={{ background: "#1A56DB", color: "#fff", border: 0 }}
              >
                {savingFolder ? "Guardando…" : "Crear"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal Documento */}
      {openDoc && (
        <>
          <div
            onClick={() => !savingDoc && setOpenDoc(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 60 }}
          />
          <div
            style={{
              position: "fixed",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: 640,
              maxWidth: "92vw",
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 12,
              boxShadow: "0 12px 32px rgba(0,0,0,.18)",
              zIndex: 80,
            }}
          >
            <div style={{ padding: 12, borderBottom: "1px solid #E5E7EB", fontWeight: 700 }}>Subir documento</div>
            <div style={{ padding: 12, display: "grid", gap: 10 }}>
              <Field label="Nombre">
                <input
                  value={docForm.nombre}
                  onChange={(e) => setDocForm({ ...docForm, nombre: e.target.value })}
                  className="repo-input"
                />
              </Field>
              <Field label="Descripción">
                <input
                  value={docForm.descripcion}
                  onChange={(e) => setDocForm({ ...docForm, descripcion: e.target.value })}
                  className="repo-input"
                />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Carpeta">
                  <select
                    value={docForm.carpeta}
                    onChange={(e) => setDocForm({ ...docForm, carpeta: e.target.value })}
                    className="repo-input"
                  >
                    {folders.map((f) => (
                      <option key={f.id} value={f.nombre}>{f.nombre}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Categoría">
                  <input
                    value={docForm.categoria}
                    onChange={(e) => setDocForm({ ...docForm, categoria: e.target.value })}
                    className="repo-input"
                  />
                </Field>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <Field label="Etiquetas (coma)">
                  <input
                    value={docForm.etiquetas}
                    onChange={(e) => setDocForm({ ...docForm, etiquetas: e.target.value })}
                    className="repo-input"
                  />
                </Field>
                <Field label="Versión">
                  <input
                    value={docForm.version}
                    onChange={(e) => setDocForm({ ...docForm, version: e.target.value })}
                    className="repo-input"
                  />
                </Field>
                <Field label="Vence">
                  <input
                    type="date"
                    value={docForm.vence}
                    onChange={(e) => setDocForm({ ...docForm, vence: e.target.value })}
                    className="repo-input"
                  />
                </Field>
              </div>
              <Field label="URL (opcional)">
                <input
                  value={docForm.url}
                  onChange={(e) => setDocForm({ ...docForm, url: e.target.value })}
                  className="repo-input"
                  placeholder="https://…"
                />
              </Field>
            </div>
            <div style={{ padding: 12, borderTop: "1px solid #E5E7EB", display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button className="btn" onClick={() => setOpenDoc(false)} disabled={savingDoc}>
                Cancelar
              </button>
              <button
                className="btn primary"
                onClick={saveDoc}
                disabled={savingDoc || folders.length === 0}
                style={{ background: "#1A56DB", color: "#fff", border: 0 }}
              >
                {savingDoc ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* estilos mínimos locales */}
      <style>{`
        .btn{border:1px solid #E5E7EB;background:#fff;padding:8px 12px;border-radius:10px;cursor:pointer}
        .btn.primary{background:#1A56DB;color:#fff;border-color:#1A56DB}
        .repo-input{background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:10px 12px;outline:none}
        .repo-input:focus{border-color:#C7D2FE;box-shadow:0 0 0 4px rgba(26,86,219,.10)}
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}
