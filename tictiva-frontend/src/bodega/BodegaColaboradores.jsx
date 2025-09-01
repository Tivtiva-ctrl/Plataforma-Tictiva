// src/bodega/pages/BodegaColaboradores.jsx
import React, { useMemo, useState } from "react";

export default function BodegaColaboradores() {
  // ===== Mock de datos (conecta a tu API cuando quieras) =====
  const colaborador = {
    nombre: "Juan Pérez Díaz",
    inic: "JD",
    cargo: "Operario de Planta",
    id: "EMP-001",
    centroCosto: "Producción",
  };

  const [asignaciones] = useState([
    { sku: "EPP-001", desc: "Casco Blanco",        talla: "Universal", costo: 45_00,   entregado: "15/01/2024", vence: "15/01/2025", vida: 75, estado: "Activo" },
    { sku: "EPP-015", desc: "Zapatos Seguridad",   talla: "42",        costo: 120_00,  entregado: "10/03/2024", vence: "25/12/2024", vida: 15, estado: "Por vencer" },
    { sku: "EPP-008", desc: "Guantes Nitrilo",     talla: "L",         costo: 25_00,   entregado: "05/08/2024", vence: "05/12/2024", vida: 0,  estado: "Vencido" },
  ]);

  // ===== Derivados =====
  const totalAsignado = useMemo(
    () => asignaciones.reduce((s,a)=> s + (a.costo||0), 0),
    [asignaciones]
  );

  // % “EPP al día”: (activos + por vencer) / total  (ajústalo a tu regla real)
  const pctAlDia = useMemo(() => {
    if (!asignaciones.length) return 0;
    const ok = asignaciones.filter(a => norm(a.estado) !== "vencido").length;
    return Math.round((ok / asignaciones.length) * 100);
  }, [asignaciones]);

  // ===== Acciones (placeholders para conectar) =====
  const onEntregar = (a) => console.log("Entregar", a);
  const onDevRecambio = (a) => console.log("Dev/Recambio", a);
  const onCambiarTalla = (a) => console.log("Cambiar Talla", a);
  const onBaja = (a) => console.log("Baja", a);
  const onEntregarKit = () => console.log("Entregar Kit predefinido");

  return (
    <div style={{ padding: 16 }}>
      <h1 className="c-title">Ficha EPP - Colaboradores</h1>
      <p className="c-muted">Gestión de equipos de protección personal por colaborador</p>

      {/* Header colaborador */}
      <div className="c-card c-header">
        <div className="c-header-left">
          <div className="c-avatar">{colaborador.inic || iniciales(colaborador.nombre)}</div>
          <div>
            <div className="c-name">{colaborador.nombre}</div>
            <div className="c-sub"> {colaborador.cargo} · ID: {colaborador.id}</div>
            <div className="c-sub"> Centro de Costo: {colaborador.centroCosto}</div>
          </div>
        </div>
        <div className="c-header-right">
          <div className="c-total">{formatCLP(totalAsignado)}</div>
          <div className="c-sub">Total Asignado</div>
          <div className="c-chip c-chip-ok">{pctAlDia}% EPP al día</div>
        </div>
      </div>

      {/* Grid de cards */}
      <div className="c-grid">
        {asignaciones.map((a)=>(
          <div className="c-card c-item" key={a.sku}>
            <div className="c-item-head">
              <div className={`c-bullet ${colorPorItem(a.desc)}`}>{iconoPorItem(a.desc)}</div>
              <div className="c-item-title">
                <div className="c-item-name">{a.desc}</div>
                <div className="c-item-sub">Talla: {a.talla}</div>
              </div>
              <span className={`c-badge ${badgeClase(a.estado)}`}>{a.estado}</span>
            </div>

            <div className="c-rows">
              <Lado label="Costo:" value={formatUSD(a.costo)} />
              <Lado label="Entregado:" value={a.entregado} />
              <Lado label="Vence:" value={a.vence} valueClass={norm(a.estado)==="por vencer" ? "c-warn" : norm(a.estado)==="vencido" ? "c-danger" : ""}/>
            </div>

            <div className="c-life">
              <div className="c-life-label">Vida útil</div>
              <div className="c-life-bar">
                <div className={`c-life-in ${barClase(a.estado)}`} style={{width: `${clamp(a.vida)}%`}}/>
              </div>
              <div className="c-life-pct">{clamp(a.vida)}%</div>
            </div>

            <div className="c-actions">
              <button className="btn-blue" onClick={()=>onEntregar(a)}>Entregar</button>
              {norm(a.estado)==="vencido"
                ? <button className="btn-red" onClick={()=>onBaja(a)}>Baja</button>
                : <>
                    {incluye(a.desc,"zapato") && <button className="btn-purple" onClick={()=>onCambiarTalla(a)}>Cambiar Talla</button>}
                    {a.vida<=30 && a.vida>0 && <button className="btn-amber" onClick={()=>onDevRecambio(a)}>Dev/Recambio</button>}
                  </>
              }
            </div>
          </div>
        ))}
      </div>

      {/* Entrega de Kit por Cargo */}
      <div className="c-card c-kit">
        <div className="c-kit-title">Entrega de Kit por Cargo</div>
        <div className="c-sub">Kit Predefinido</div>
        <div className="c-kit-row">
          <select className="c-input">
            <option>Operario Planta (Casco + Guantes + Zapatos)</option>
            <option>Supervisor (Casco + Lentes + Guantes)</option>
          </select>
          <button className="btn-green" onClick={onEntregarKit}>
            <span className="c-ico">🟩</span> Entregar Kit
          </button>
        </div>
      </div>

      {/* estilos */}
      <style>{`
        .c-title{font-size:28px;font-weight:800;margin:0 0 6px}
        .c-muted{color:#6B7280;margin:0 0 12px}
        .c-card{background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:16px}

        /* header */
        .c-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
        .c-header-left{display:flex;gap:12px;align-items:center}
        .c-avatar{width:56px;height:56px;border-radius:50%;background:#1A56DB;color:#fff;display:grid;place-items:center;font-weight:800}
        .c-name{font-weight:800;font-size:18px}
        .c-sub{color:#6B7280;font-size:12px}
        .c-header-right{display:grid;justify-items:end;gap:6px}
        .c-total{font-weight:800;font-size:24px}
        .c-chip{border-radius:999px;padding:4px 10px;font-size:12px;font-weight:700;display:inline-block}
        .c-chip-ok{background:#E6F6EA;color:#166534;border:1px solid #86EFAC}

        /* grid */
        .c-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
        .c-item{display:flex;flex-direction:column;gap:12px}
        .c-item-head{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px}
        .c-bullet{width:40px;height:40px;border-radius:12px;display:grid;place-items:center;color:#fff;font-size:18px}
        .b-blue{background:#3B82F6}.b-yellow{background:#F59E0B}.b-red{background:#EF4444}.b-purple{background:#8B5CF6}.b-green{background:#10B981}
        .c-item-name{font-weight:800}
        .c-item-sub{color:#6B7280;font-size:12px}
        .c-badge{border-radius:999px;padding:4px 10px;font-size:12px;font-weight:700}
        .bad-ok{background:#E6F6EA;color:#166534;border:1px solid #86EFAC}
        .bad-warn{background:#FEF9C3;color:#854D0E;border:1px solid #FDE68A}
        .bad-danger{background:#FEE2E2;color:#991B1B;border:1px solid #FCA5A5}

        .c-rows{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px}
        .c-row{font-size:14px}
        .c-label{color:#6B7280}
        .c-value{font-weight:700}
        .c-warn{color:#D97706}.c-danger{color:#DC2626}

        .c-life{display:grid;grid-template-columns:1fr auto;align-items:center;gap:10px}
        .c-life-label{color:#6B7280;font-size:12px;grid-column:1/-1}
        .c-life-bar{height:10px;background:#E5E7EB;border-radius:999px;overflow:hidden;grid-column:1/2}
        .c-life-in{height:100%}
        .bar-ok{background:#22C55E}.bar-warn{background:#F59E0B}.bar-danger{background:#EF4444}
        .c-life-pct{font-size:12px;color:#6B7280;justify-self:end}

        .c-actions{display:flex;gap:8px;flex-wrap:wrap}
        .btn{border-radius:10px;padding:10px 12px;border:1px solid #E5E7EB;background:#fff;cursor:pointer}
        .btn-blue{background:#1A56DB;color:#fff;border:1px solid #1A56DB}
        .btn-amber{background:#D97706;color:#fff;border:1px solid #D97706}
        .btn-purple{background:#6D28D9;color:#fff;border:1px solid #6D28D9}
        .btn-red{background:#DC2626;color:#fff;border:1px solid #DC2626}
        .btn-green{background:#16A34A;color:#fff;border:1px solid #16A34A;border-radius:10px;padding:10px 14px}

        .c-kit{margin-top:16px}
        .c-kit-title{font-weight:800;margin-bottom:10px}
        .c-kit-row{display:grid;grid-template-columns:1fr auto;gap:12px;margin-top:10px}
        .c-input{height:44px;border:1px solid #E5E7EB;border-radius:10px;padding:0 12px;background:#fff}

        @media (max-width:1100px){ .c-grid{grid-template-columns:repeat(2,1fr)} }
        @media (max-width:700px){
          .c-grid{grid-template-columns:1fr}
          .c-rows{grid-template-columns:1fr 1fr}
          .c-kit-row{grid-template-columns:1fr}
        }
      `}</style>
    </div>
  );
}

/* ====== Helpers ====== */
function iniciales(n=""){ const p=n.split(/\s+/); return ((p[0]?.[0]||"")+(p[1]?.[0]||"")).toUpperCase() }
function norm(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"") }
function incluye(txt,sub){ return norm(txt).includes(norm(sub)) }
function clamp(v){ v = Number.isFinite(v)? v : 0; return Math.max(0, Math.min(100, v)); }
function formatUSD(n){ return `$${Number(n||0).toFixed(2)}` }
function formatCLP(n){ return n.toLocaleString("es-CL", { style:"currency", currency:"CLP" }) }
function iconoPorItem(desc=""){ const d=norm(desc); if(d.includes("casco"))return "🪖"; if(d.includes("zapato"))return "👟"; if(d.includes("guante"))return "🖐️"; return "👓"; }
function colorPorItem(desc=""){ const d=norm(desc); if(d.includes("casco"))return "b-blue"; if(d.includes("zapato"))return "b-yellow"; if(d.includes("guante"))return "b-red"; return "b-purple"; }
function badgeClase(e){ e=norm(e); if(e==="vencido")return "bad-danger"; if(e==="por vencer"||e==="porvencer")return "bad-warn"; return "bad-ok"; }
function barClase(e){ e=norm(e); if(e==="vencido")return "bar-danger"; if(e==="por vencer"||e==="porvencer")return "bar-warn"; return "bar-ok"; }

function Lado({label, value, valueClass}) {
  return (
    <div className="c-row">
      <div className="c-label">{label}</div>
      <div className={`c-value ${valueClass||""}`}>{value}</div>
    </div>
  );
}
