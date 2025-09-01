// src/bodega/pages/BodegaInventario.jsx
import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function BodegaInventario() {
  const [sp, setSp] = useSearchParams();
  const modoUrl = sp.get("modo"); // 'instalacion' | 'colaborador'
  const [modo, setModo] = useState(modoUrl === "colaborador" ? "colaborador" : "instalacion");

  // ---------- DATA (ahora en estado para poder editar) ----------
  const [items, setItems] = useState([
    { sku: "EPP-001", desc: "Casco Blanco", categoria: "EPP", instalacion: "Planta Norte", stock: 45, min: 20, max: 100, estado: "OK",    ubic: "A-01-15" },
    { sku: "EPP-015", desc: "Zapatos Seguridad T42", categoria: "EPP", instalacion: "Bodega Central", stock: 3,  min: 10, max: 50,  estado: "Crítico", ubic: "B-03-08" },
    { sku: "EPP-008", desc: "Guantes Nitrilo", categoria: "EPP", instalacion: "Planta Sur",   stock: 8,  min: 15, max: 80,  estado: "Bajo",  ubic: "A-02-12" },
  ]);

  const asignaciones = [
    { rut: "12.345.678-9", nombre: "Juan Pérez Díaz", sku: "EPP-001", desc: "Casco Blanco", talla: "U",  entregado: "15/01/2024", vence: "15/01/2025", vida: 75, estado: "Activo" },
    { rut: "11.222.333-4", nombre: "Carlos Silva",    sku: "EPP-015", desc: "Zapatos Seguridad", talla: "42", entregado: "10/12/2023", vence: "10/01/2024", vida: 0,  estado: "Vencido" },
    { rut: "98.765.432-1", nombre: "María Rodríguez", sku: "EPP-008", desc: "Guantes Nitrilo", talla: "L",  entregado: "20/01/2024", vence: "20/06/2024", vida: 85, estado: "Activo" },
  ];

  // ---------- FILTROS ----------
  const [q, setQ] = useState("");
  const [f, setF] = useState({
    instalacion: "Todas las instalaciones",
    categoria: "Todas las categorías",
    estado: "Todos los estados",
  });

  // opciones derivadas de los datos (sin duplicados)
  const opcionesInstalacion = useMemo(() => [
    "Todas las instalaciones",
    ...Array.from(new Set(items.map(i => i.instalacion)))
  ], [items]);

  const opcionesCategoria = useMemo(() => [
    "Todas las categorías",
    ...Array.from(new Set(items.map(i => i.categoria)))
  ], [items]);

  const opcionesEstado = ["Todos los estados", "OK", "Bajo", "Crítico"];

  const itemsFiltrados = useMemo(() => {
    let out = items;
    if (q) {
      const x = q.toLowerCase();
      out = out.filter(i => `${i.sku} ${i.desc} ${i.instalacion}`.toLowerCase().includes(x));
    }
    if (f.instalacion !== "Todas las instalaciones") out = out.filter(i => i.instalacion === f.instalacion);
    if (f.categoria !== "Todas las categorías") out = out.filter(i => i.categoria === f.categoria);
    if (f.estado !== "Todos los estados") out = out.filter(i => normalizaEstado(i.estado) === normalizaEstado(f.estado));
    return out;
  }, [q, f, items]);

  const asignacionesFiltradas = useMemo(() => {
    if (!q) return asignaciones;
    const x = q.toLowerCase();
    return asignaciones.filter(a => `${a.nombre} ${a.rut} ${a.sku} ${a.desc}`.toLowerCase().includes(x));
  }, [q, asignaciones]);

  const setModoUrl = (nuevo) => {
    setModo(nuevo);
    sp.set("modo", nuevo);
    setSp(sp, { replace: true });
  };

  // ---------- MODALES DE ACCIÓN ----------
  const [modal, setModal] = useState({ open: false, tipo: null, item: null });
  const openModal = (tipo, item) => setModal({ open: true, tipo, item });
  const closeModal = () => setModal({ open: false, tipo: null, item: null });

  const handleGuardarEdicion = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const sku = form.get("sku");
    setItems(prev => prev.map(it => it.sku === sku ? ({
      ...it,
      desc: form.get("desc"),
      categoria: form.get("categoria"),
      instalacion: form.get("instalacion"),
      stock: Number(form.get("stock") || 0),
      min: Number(form.get("min") || 0),
      max: Number(form.get("max") || 0),
      estado: form.get("estado"),
      ubic: form.get("ubic")
    }) : it));
    closeModal();
  };

  const copyQRLink = async (sku) => {
    try {
      await navigator.clipboard.writeText(`https://tictiva.com/qr/${sku}`);
      setCopyOk(true);
      setTimeout(() => setCopyOk(false), 1200);
    } catch {}
  };
  const [copyOk, setCopyOk] = useState(false);

  return (
    <div style={{ padding: 16 }}>
      <h1 className="b-title">{modo === "instalacion" ? "Inventario por Instalación" : "Inventario"}</h1>
      <p className="b-muted">
        {modo === "instalacion" ? "Gestión de stock y ubicaciones por instalación" : "Visualiza stock por instalación o por colaborador."}
      </p>

      {/* Sub-tabs del inventario */}
      <div className="b-subtabs">
        <button
          className={`b-subtab${modo === "instalacion" ? " is-active" : ""}`}
          onClick={() => setModoUrl("instalacion")}
        >
          Por instalación
        </button>
        <button
          className={`b-subtab${modo === "colaborador" ? " is-active" : ""}`}
          onClick={() => setModoUrl("colaborador")}
        >
          Por colaborador
        </button>
      </div>

      {/* Barra de filtros (mejorada solo para modo instalación) */}
      <div className="b-card" style={{ marginBottom: 12 }}>
        {modo === "instalacion" ? (
          <div className="inv2-filtros">
            <div className="inv2-field">
              <label>Instalación</label>
              <select
                value={f.instalacion}
                onChange={(e) => setF((s) => ({ ...s, instalacion: e.target.value }))}
              >
                {opcionesInstalacion.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="inv2-field">
              <label>Categoría</label>
              <select
                value={f.categoria}
                onChange={(e) => setF((s) => ({ ...s, categoria: e.target.value }))}
              >
                {opcionesCategoria.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="inv2-field">
              <label>Estado</label>
              <select
                value={f.estado}
                onChange={(e) => setF((s) => ({ ...s, estado: e.target.value }))}
              >
                {opcionesEstado.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="inv2-search">
              <input
                className="b-input"
                placeholder="Buscar SKU / Descripción / Instalación"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <button className="inv2-btn">
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M21 21l-4.35-4.35m1.18-5.33a7.5 7.5 0 11-15 0 7.5 7.5 0 0115 0z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>Filtrar</span>
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 8 }}>
            <input
              className="b-input"
              placeholder="Buscar nombre / RUT / SKU"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button className="b-btn">Filtrar</button>
          </div>
        )}
      </div>

      {/* Contenido según modo */}
      {modo === "instalacion" ? (
        <div className="b-card">
          {/* Cabecera de tabla estilo Tictiva */}
          <div className="inv2-thead">
            <div>SKU</div>
            <div>STOCK ACTUAL</div>
            <div>MIN/MAX</div>
            <div>ESTADO</div>
            <div>UBICACIÓN</div>
            <div>ACCIONES</div>
          </div>

          {/* Filas */}
          <div className="inv2-rows">
            {itemsFiltrados.map((i) => (
              <div className="inv2-row" key={i.sku}>
                {/* SKU + Nombre con avatar/ícono */}
                <div className="inv2-sku">
                  <div className={`inv2-avatar ${colorPorNombre(i.desc)}`} aria-hidden="true">
                    {iconoPorNombre(i.desc)}
                  </div>
                  <div className="inv2-sku-text">
                    <div className="inv2-prod">{i.desc}</div>
                    <div className="inv2-code mono">{i.sku}</div>
                  </div>
                </div>

                <div className="inv2-cell">{i.stock}</div>
                <div className="inv2-cell">{i.min} / {i.max}</div>
                <div className="inv2-cell">
                  <span className={`b-pill ${badgeClass(i.estado)}`}>{i.estado}</span>
                </div>
                <div className="inv2-cell">{i.ubic}</div>

                {/* Acciones con íconos */}
                <div className="inv2-actions">
                  <button
                    className="inv2-icon"
                    title="Ver QR"
                    aria-label="Ver QR"
                    onClick={() => openModal("qr", i)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path d="M3 3h6v6H3zM15 3h6v6h-6zM3 15h6v6H3zM15 15h3v3h-3zM21 21h-3v-3h3z" fill="currentColor"/>
                    </svg>
                  </button>
                  <button
                    className="inv2-icon"
                    title="Ver detalle"
                    aria-label="Ver detalle"
                    onClick={() => openModal("ver", i)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path d="M12 5c-7.633 0-10 7-10 7s2.367 7 10 7 10-7 10-7-2.367-7-10-7zm0 11a4 4 0 110-8 4 4 0 010 8z" fill="currentColor"/>
                    </svg>
                  </button>
                  <button
                    className="inv2-icon"
                    title="Editar"
                    aria-label="Editar"
                    onClick={() => openModal("editar", i)}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path d="M3 17.25V21h3.75l11.06-11.06-3.75-3.75L3 17.25zM20.71 7.04a1.003 1.003 0 000-1.42l-2.34-2.34a1.003 1.003 0 00-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            {itemsFiltrados.length === 0 && (
              <div className="inv2-empty">
                <div className="inv2-empty-illus">📦</div>
                <div>No hay resultados para los filtros seleccionados.</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="b-card">
          <div className="b-table">
            <div className="b-tr b-th">
              <div>Colaborador</div>
              <div>RUT</div>
              <div>SKU</div>
              <div>Descripción</div>
              <div>Talla</div>
              <div>Entregado</div>
              <div>Vence</div>
              <div>Vida útil</div>
              <div>Estado</div>
              <div style={{ textAlign: "right" }}>Acciones</div>
            </div>
            {asignacionesFiltradas.map((a, idx) => (
              <div className="b-tr" key={`${a.rut}-${idx}`}>
                <div>{a.nombre}</div>
                <div className="mono">{a.rut}</div>
                <div className="mono">{a.sku}</div>
                <div>{a.desc}</div>
                <div>{a.talla}</div>
                <div>{a.entregado}</div>
                <div>{a.vence}</div>
                <div>
                  <div className="bar">
                    <div className="bar-in" style={{ width: `${a.vida}%` }} />
                  </div>
                </div>
                <div>
                  <span className={`b-pill ${a.estado === "Activo" ? "b-pill-ok" : a.estado === "Vencido" ? "b-pill-danger" : "b-pill-warn"}`}>
                    {a.estado}
                  </span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <button className="b-btn small">Entregar</button>{" "}
                  <button className="b-btn small">Baja</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== Modales ===== */}
      {modal.open && modal.item && (
        <div className="inv2-overlay" onClick={closeModal}>
          <div className="inv2-modal" onClick={(e)=>e.stopPropagation()}>
            {modal.tipo === "qr" && (
              <>
                <h3 className="inv2-modal-title">QR del artículo</h3>
                <p className="inv2-modal-sub">
                  {modal.item.sku} — {modal.item.desc}
                </p>
                <div className="inv2-qr-box">🔳</div>
                <div className="inv2-qr-link mono">https://tictiva.com/qr/{modal.item.sku}</div>
                <div className="inv2-modal-actions">
                  <button className="inv2-btn" onClick={()=>copyQRLink(modal.item.sku)}>
                    {copyOk ? "¡Copiado!" : "Copiar enlace"}
                  </button>
                  <button className="b-btn" onClick={closeModal}>Cerrar</button>
                </div>
              </>
            )}

            {modal.tipo === "ver" && (
              <>
                <h3 className="inv2-modal-title">Detalle de artículo</h3>
                <p className="inv2-modal-sub mono">{modal.item.sku}</p>
                <div className="inv2-grid2">
                  <div><b>Descripción:</b> {modal.item.desc}</div>
                  <div><b>Categoría:</b> {modal.item.categoria}</div>
                  <div><b>Instalación:</b> {modal.item.instalacion}</div>
                  <div><b>Ubicación:</b> {modal.item.ubic}</div>
                  <div><b>Stock:</b> {modal.item.stock}</div>
                  <div><b>Mín/Máx:</b> {modal.item.min} / {modal.item.max}</div>
                  <div><b>Estado:</b> {modal.item.estado}</div>
                </div>
                <div className="inv2-modal-actions">
                  <button className="b-btn" onClick={closeModal}>Cerrar</button>
                </div>
              </>
            )}

            {modal.tipo === "editar" && (
              <>
                <h3 className="inv2-modal-title">Editar artículo</h3>
                <form onSubmit={handleGuardarEdicion} className="inv2-form">
                  <input type="hidden" name="sku" defaultValue={modal.item.sku}/>
                  <label>Descripción<input name="desc" defaultValue={modal.item.desc} className="b-input"/></label>
                  <label>Categoría<input name="categoria" defaultValue={modal.item.categoria} className="b-input"/></label>
                  <label>Instalación<input name="instalacion" defaultValue={modal.item.instalacion} className="b-input"/></label>
                  <label>Ubicación<input name="ubic" defaultValue={modal.item.ubic} className="b-input"/></label>
                  <label>Stock<input name="stock" type="number" defaultValue={modal.item.stock} className="b-input"/></label>
                  <div className="inv2-grid2">
                    <label>Mín<input name="min" type="number" defaultValue={modal.item.min} className="b-input"/></label>
                    <label>Máx<input name="max" type="number" defaultValue={modal.item.max} className="b-input"/></label>
                  </div>
                  <label>Estado
                    <select name="estado" defaultValue={modal.item.estado} className="b-input">
                      <option>OK</option>
                      <option>Bajo</option>
                      <option>Crítico</option>
                    </select>
                  </label>

                  <div className="inv2-modal-actions">
                    <button type="submit" className="inv2-btn">Guardar</button>
                    <button type="button" className="b-btn" onClick={closeModal}>Cancelar</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===== Estilos ===== */}
      <style>{`
        .b-title{font-size:22px;font-weight:800;margin:0 0 4px}
        .b-muted{color:#64748b;margin:0 0 8px}
        .b-card{background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:12px}
        .b-input{border:1px solid #E5E7EB;border-radius:10px;padding:10px 12px;width:100%}
        .b-btn{background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:10px 12px;cursor:pointer}
        .b-btn.small{padding:6px 10px;border-radius:8px}
        .b-subtabs{display:flex;gap:8px;margin:6px 0 10px}
        .b-subtab{border:1px solid #E5E7EB;background:#fff;border-radius:999px;padding:8px 12px;font-weight:600;cursor:pointer}
        .b-subtab.is-active{background:#1A56DB;color:#fff;border-color:#1A56DB} /* azul activo */
        .b-table{display:grid;gap:6px}
        .b-tr{display:grid;grid-template-columns: 140px 1fr 180px 100px 120px 110px 110px 140px;align-items:center;gap:8px}
        .b-th{font-weight:700;color:#111827}
        .mono{font-family: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}
        .b-pill{border:1px solid #CBD5E1;border-radius:999px;padding:3px 8px;font-size:12px;font-weight:700}
        .b-pill-ok{background:#DCFCE7;border-color:#86EFAC;color:#166534}
        .b-pill-warn{background:#FEF9C3;border-color:#FDE68A;color:#854D0E}
        .b-pill-danger{background:#FEE2E2;border-color:#FCA5A5;color:#991B1B}
        .bar{height:8px;border-radius:999px;background:#F1F5F9;overflow:hidden}
        .bar-in{height:100%;background:#22c55e}
        .b-tr:nth-child(n+2){grid-template-columns: 220px 130px 100px 1fr 70px 110px 110px 140px 100px 140px;}

        /* ===== Lista Instalación ===== */
        .inv2-filtros{display:grid;grid-template-columns: 1fr 1fr 1fr 1.2fr auto;gap:10px;align-items:end}
        .inv2-field label{display:block;font-size:12px;color:#6B7280;margin:0 0 6px}
        .inv2-field select{width:100%;height:40px;border:1px solid #E5E7EB;border-radius:10px;background:#fff;padding:0 10px;font-size:14px}
        .inv2-search input{height:40px}
        .inv2-btn{height:40px;border:none;border-radius:10px;background:#1A56DB;color:#fff;display:inline-flex;align-items:center;gap:8px;padding:0 16px;cursor:pointer;font-weight:700}
        .inv2-thead{display:grid;grid-template-columns: 2.2fr 1fr 1fr 1fr 1fr 1fr;gap:8px;background:#F3F4F6;color:#6B7280;border-radius:10px;padding:12px 16px;font-size:12px;font-weight:700;margin-bottom:6px}
        .inv2-rows{display:grid;gap:6px}
        .inv2-row{
          display:grid;
          grid-template-columns: 2.2fr 1fr 1fr 1fr 1fr 1fr;
          gap:8px;
          align-items:center;
          padding:12px 16px;
          border:1px solid #E5E7EB;
          border-radius:12px;
        }
        .inv2-row:hover{background:#FAFAFB}

        .inv2-sku{display:flex;align-items:center;gap:12px}
        .inv2-avatar{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;font-size:18px;color:#fff}
        .inv2-blue{background:#4F46E5}.inv2-yellow{background:#F59E0B}.inv2-purple{background:#8B5CF6}
        .inv2-sku-text .inv2-prod{font-weight:700}.inv2-sku-text .inv2-code{font-size:12px;color:#6B7280}
        .inv2-cell{font-weight:600}
        .inv2-actions{display:inline-flex;gap:8px;justify-self:end}
        .inv2-icon{width:34px;height:34px;border:1px solid #E5E7EB;border-radius:10px;background:#fff;color:#1A56DB;display:grid;place-items:center;cursor:pointer}
        .inv2-icon:hover{background:#F3F6FF}
        .inv2-empty{text-align:center;padding:32px 12px;color:#6B7280}.inv2-empty-illus{font-size:40px;margin-bottom:8px}

        /* ===== Modal ===== */
        .inv2-overlay{position:fixed;inset:0;background:rgba(17,24,39,.5);display:grid;place-items:center;z-index:50}
        .inv2-modal{background:#fff;border:1px solid #E5E7EB;border-radius:14px;max-width:560px;width:92vw;padding:18px}
        .inv2-modal-title{margin:0 0 4px;font-size:18px;font-weight:800}
        .inv2-modal-sub{margin:0 0 12px;color:#6B7280}
        .inv2-modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:12px}
        .inv2-grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .inv2-form{display:grid;gap:10px}
        .inv2-qr-box{display:grid;place-items:center;height:160px;border:2px dashed #CBD5E1;border-radius:12px;font-size:42px;margin-bottom:8px}
        .inv2-qr-link{background:#F3F4F6;border:1px solid #E5E7EB;border-radius:10px;padding:8px 10px;margin-top:6px}

        /* Responsive */
        @media (max-width: 900px){
          .inv2-filtros{grid-template-columns: 1fr 1fr}
          .inv2-thead, .inv2-row{grid-template-columns: 2.2fr 1fr 1fr 1fr}
          .inv2-thead > :nth-child(5), .inv2-thead > :nth-child(6),
          .inv2-row > :nth-child(5), .inv2-row > :nth-child(6){display:none}
          .inv2-grid2{grid-template-columns:1fr}
        }
        @media (max-width: 640px){
          .inv2-filtros{grid-template-columns:1fr}
          .inv2-thead, .inv2-row{grid-template-columns: 2fr 1fr 1fr}
          .inv2-thead > :nth-child(3), .inv2-row > :nth-child(3){display:none}
        }
      `}</style>
    </div>
  );
}

/* ===== Helpers ===== */
function normalizaEstado(e){
  return String(e||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
}

/* Mapeo FIJO por nombre: evita descalces de emoji/color */
function iconoPorNombre(nombre=""){
  const n = nombre.toLowerCase();
  if (n.includes("casco")) return "🪖";
  if (n.includes("zapato")) return "👟";
  if (n.includes("guante")) return "🧤";
  return "📦";
}

function colorPorNombre(nombre=""){
  const n = nombre.toLowerCase();
  if (n.includes("casco")) return "inv2-blue";
  if (n.includes("zapato")) return "inv2-yellow";
  if (n.includes("guante")) return "inv2-purple";
  return "inv2-blue";
}

function badgeClass(estado){
  const e = normalizaEstado(estado);
  if (e==="ok") return "b-pill-ok";
  if (e==="bajo") return "b-pill-warn";
  if (e==="critico") return "b-pill-danger";
  return "";
}
