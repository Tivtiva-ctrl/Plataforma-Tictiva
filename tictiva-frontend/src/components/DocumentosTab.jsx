// src/components/DocumentosTab.jsx
import React, { useMemo } from "react";

/* ===== Iconos SVG livianos (sin dependencias) ===== */
const IcoFolder = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const IcoFile = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" stroke="currentColor" strokeWidth="2" />
    <path d="M14 2v6h6" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const IcoDots = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
    <circle cx="6" cy="12" r="1.5" fill="currentColor" />
    <circle cx="18" cy="12" r="1.5" fill="currentColor" />
  </svg>
);
const IcoPlusFolder = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M4 7h6l2 2h8v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="2" />
    <path d="M12 11v6M9 14h6" stroke="currentColor" strokeWidth="2" />
  </svg>
);
const IcoUpload = (props) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" />
    <path d="M7 9l5-5 5 5M12 4v12" stroke="currentColor" strokeWidth="2" />
  </svg>
);

/* ===== Datos demo (si no llegan por props) ===== */
const demoItems = [
  { id: "f1", type: "folder", name: "Contratos", modified: "2025-08-15", size: null },
  { id: "f2", type: "folder", name: "Liquidaciones de Sueldo", modified: "2025-09-01", size: null },
  { id: "f3", type: "folder", name: "Certificados", modified: "2025-07-30", size: null },
  { id: "d1", type: "file",   name: "Reglamento Interno 2025.pdf", modified: "2025-01-10", size: "1.2 MB" },
  { id: "d2", type: "file",   name: "Política de Teletrabajo.docx", modified: "2025-06-22", size: "256 KB" },
];

/**
 * Card de Documentos para la ficha de empleado.
 * - Se muestra como una ed-card (igual que Personales).
 * - No usa cabecera de “Repositorio Documental”.
 * - Tabla simple: Nombre / Fecha de Modificación / Tamaño / …
 *
 * Props:
 *   - rut?: string           (por si luego filtras por trabajador)
 *   - items?: Item[]         (puedes pasar tu arreglo real; si no, se usa demoItems)
 */
export default function DocumentosTab({ rut, items }) {
  const rows = useMemo(() => Array.isArray(items) && items.length ? items : demoItems, [items]);

  return (
    <div className="ed-card doc-card">
      <div className="doc-head">
        <h3 className="ed-card-title" style={{ margin: 0 }}>Documentos</h3>
        <div className="doc-actions">
          <button type="button" className="doc-btn">
            <IcoPlusFolder /> <span>Nueva Carpeta</span>
          </button>
          <button type="button" className="doc-btn primary">
            <IcoUpload /> <span>Subir Archivo</span>
          </button>
        </div>
      </div>

      <div className="doc-tablewrap">
        <table className="doc-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Fecha de Modificación</th>
              <th>Tamaño</th>
              <th aria-label="acciones"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((it) => (
              <tr key={it.id}>
                <td>
                  <div className="doc-namecell">
                    {it.type === "folder" ? <IcoFolder /> : <IcoFile />}
                    <span className="doc-name">{it.name}</span>
                  </div>
                </td>
                <td className="doc-dim">{it.modified || "—"}</td>
                <td className="doc-dim">{it.size || "—"}</td>
                <td className="doc-actions-cell">
                  <button type="button" className="doc-morebtn" title="Más acciones">
                    <IcoDots />
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="doc-empty">Sin documentos por ahora.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Estilos locales de la card de Documentos */}
      <style>{`
        .doc-card{ padding:16px; }
        .doc-head{
          display:flex; align-items:center; justify-content:space-between;
          margin-bottom:10px;
        }
        .doc-actions{ display:flex; gap:8px; }
        .doc-btn{
          display:inline-flex; align-items:center; gap:8px;
          border:1px solid #E5E7EB; background:#fff; color:#111827;
          padding:8px 10px; border-radius:10px; font-weight:700; cursor:pointer;
        }
        .doc-btn.primary{ background:#1A56DB; color:#fff; border-color:#1A56DB; }
        .doc-btn:hover{ background:#F9FAFB; }
        .doc-btn.primary:hover{ background:#1744B3; }

        .doc-tablewrap{
          border:1px solid #E5E7EB; border-radius:12px; overflow:hidden; background:#fff;
        }
        .doc-table{ width:100%; border-collapse:collapse; }
        .doc-table thead th{
          text-align:left; padding:12px 14px; font-size:12px; font-weight:800;
          text-transform:uppercase; color:#6B7280; background:#F9FAFB;
          border-bottom:1px solid #F3F4F6;
        }
        .doc-table tbody td{
          padding:12px 14px; border-bottom:1px solid #F3F4F6; color:#111827;
        }
        .doc-table tbody tr:hover{ background:#FAFBFF; }
        .doc-namecell{ display:flex; align-items:center; gap:10px; font-weight:700; color:#111827; }
        .doc-name{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; display:inline-block; max-width:520px; }
        .doc-dim{ color:#374151; font-weight:600; }
        .doc-actions-cell{ width:48px; text-align:right; }
        .doc-morebtn{
          background:transparent; border:none; border-radius:999px; padding:4px; cursor:pointer;
          color:#374151;
        }
        .doc-morebtn:hover{ background:#EEF2FF; color:#1E3A8A; }
        .doc-empty{ text-align:center; color:#6B7280; padding:18px; }
        @media (max-width: 900px){
          .doc-name{ max-width:220px; }
        }
      `}</style>
    </div>
  );
}
