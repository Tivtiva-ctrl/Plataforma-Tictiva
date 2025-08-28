// src/bodega/pages/BodegaDashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes";

export default function BodegaDashboard() {
  const navigate = useNavigate();
  const base = ROUTES?.rrhhBodega?.root || "/rrhh/bodega";

  // Helper para volver cualquier tarjeta "clickeable" y accesible con teclado
  const asButton = (onActivate) => ({
    role: "button",
    tabIndex: 0,
    onClick: onActivate,
    onKeyDown: (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onActivate();
      }
    },
    style: { cursor: "pointer" },
  });

  return (
    <div style={{ padding: 16 }}>
      <h2 style={{ margin: "8px 0 4px" }}>Dashboard Bodega & EPP</h2>
      <p style={{ margin: 0, color: "#64748b" }}>
        Resumen general del sistema de inventario y equipos de protección personal
      </p>

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(210px, 1fr))",
          gap: 12,
          marginTop: 14,
        }}
      >
        <div className="b-card" {...asButton(() => navigate(`${base}/inventario`))} title="Ir a Inventario">
          <div className="b-kpi">
            <div className="b-kpi-ico">📦</div>
            <div className="b-kpi-meta">
              <div className="b-kpi-val">2,847</div>
              <div className="b-kpi-label">Stock Total</div>
            </div>
          </div>
        </div>

        <div
          className="b-card"
          {...asButton(() =>
            navigate(`${base}/operaciones?view=entregas&date=today`)
          )}
          title="Ver entregas de hoy"
        >
          <div className="b-kpi">
            <div className="b-kpi-ico">🚚</div>
            <div className="b-kpi-meta">
              <div className="b-kpi-val">23</div>
              <div className="b-kpi-label">Entregas Hoy</div>
            </div>
          </div>
        </div>

        <div
          className="b-card"
          {...asButton(() => navigate(`${base}/inventario?estado=alerta`))}
          title="Ver ítems con alerta de stock"
        >
          <div className="b-kpi">
            <div className="b-kpi-ico">⚠️</div>
            <div className="b-kpi-meta">
              <div className="b-kpi-val">7</div>
              <div className="b-kpi-label">Alertas Stock</div>
            </div>
          </div>
        </div>

        <div
          className="b-card"
          {...asButton(() => navigate(`${base}/operaciones?view=compras`))}
          title="Ir a compras/costos"
        >
          <div className="b-kpi">
            <div className="b-kpi-ico">💵</div>
            <div className="b-kpi-meta">
              <div className="b-kpi-val">$45.2K</div>
              <div className="b-kpi-label">Costo Mensual</div>
            </div>
          </div>
        </div>

        <div
          className="b-card"
          {...asButton(() => navigate(`${base}/colaboradores`))}
          title="Ver EPP por colaborador"
        >
          <div className="b-kpi">
            <div className="b-kpi-ico">🛡️</div>
            <div className="b-kpi-meta">
              <div className="b-kpi-val">87%</div>
              <div className="b-kpi-label">% EPP al Día</div>
            </div>
          </div>
        </div>
      </div>

      {/* Secciones (tu contenido actual) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr 1fr",
          gap: 12,
          marginTop: 12,
        }}
      >
        <div className="b-card">
          <div className="b-card-title">Próximos Vencimientos</div>
          <div className="b-list">
            <div className="b-row">
              <div>Cascos Blancos</div>
              <div className="b-pill b-pill-warn">Por vencer</div>
            </div>
            <div className="b-sub">Vence en 5 días</div>

            <div className="b-row" style={{ marginTop: 10 }}>
              <div>Guantes Nitrilo</div>
              <div className="b-pill b-pill-danger">Vencido</div>
            </div>
            <div className="b-sub">Vencido hace 2 días</div>
          </div>
        </div>

        <div className="b-card">
          <div className="b-card-title">Stock Bajo</div>
          <div className="b-list">
            <div className="b-row">
              <div>Zapatos Seguridad T42</div>
              <div className="b-pill b-pill-danger">Crítico</div>
            </div>
            <div className="b-sub">Stock: 3 / Min: 10</div>

            <div className="b-row" style={{ marginTop: 10 }}>
              <div>Lentes Protección</div>
              <div className="b-pill b-pill-warn">Bajo</div>
            </div>
            <div className="b-sub">Stock: 8 / Min: 15</div>
          </div>
        </div>

        <div className="b-card">
          <div className="b-card-title">Reposiciones Pendientes</div>
          <div className="b-list">
            <div className="b-row">
              <div>OC #2024-001</div>
              <div className="b-pill">Pendiente</div>
            </div>
            <div className="b-sub">Proveedor: SafetyPro</div>

            <div className="b-row" style={{ marginTop: 10 }}>
              <div>OC #2024-002</div>
              <div className="b-pill b-pill-ok">Aprobado</div>
            </div>
            <div className="b-sub">Proveedor: EquipMax</div>
          </div>
        </div>
      </div>

      <div className="b-card" style={{ marginTop: 12 }}>
        <div className="b-card-title">Acciones Rápidas</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="b-btn">Entregar por QR</button>
          <button className="b-btn success">Generar OC</button>
          <button className="b-btn info">Reconteo</button>
        </div>
      </div>

      {/* Estilos mínimos por si no están en tu CSS */}
      <style>{`
        .b-card{background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:12px}
        .b-card-title{font-weight:700;margin-bottom:8px}
        .b-kpi{display:flex;align-items:center;gap:10px}
        .b-kpi-ico{font-size:22px;background:#EEF2FF;border-radius:10px;padding:8px;line-height:1}
        .b-kpi-val{font-size:20px;font-weight:800}
        .b-kpi-label{color:#6B7280}
        .b-list .b-row{display:flex;justify-content:space-between;align-items:center}
        .b-sub{color:#6B7280;font-size:12px}
        .b-pill{border:1px solid #CBD5E1;border-radius:999px;padding:3px 8px;font-size:12px}
        .b-pill-ok{background:#DCFCE7;border-color:#86EFAC}
        .b-pill-warn{background:#FEF9C3;border-color:#FDE68A}
        .b-pill-danger{background:#FEE2E2;border-color:#FCA5A5}
        .b-btn{background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:8px 12px;cursor:pointer}
        .b-btn:hover{background:#F9FAFB}
        .b-btn.success{background:#16A34A;color:#fff;border-color:#16A34A}
        .b-btn.info{background:#4F46E5;color:#fff;border-color:#4F46E5}
      `}</style>
    </div>
  );
}
