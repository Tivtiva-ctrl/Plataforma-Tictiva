import React from "react";

export default function BodegaDashboard(){
  return (
    <div>
      <h1 className="b-title">Dashboard Bodega & EPP</h1>
      <p className="b-muted">Resumen general del sistema de inventario y EPP.</p>

      <div className="b-kpis">
        {[
          {k:"Stock Total", v:"2,847"},
          {k:"Entregas Hoy", v:"23"},
          {k:"Alertas Stock", v:"7"},
          {k:"Costo Mensual", v:"$45.2K"},
          {k:"% EPP al Día", v:"87%"},
        ].map(x=>(
          <div key={x.k} className="b-card">
            <div className="b-muted">{x.k}</div>
            <div style={{fontSize:24,fontWeight:800}}>{x.v}</div>
          </div>
        ))}
      </div>

      <div className="b-grid-3">
        <div className="b-card">
          <div className="b-h2">Próximos Vencimientos</div>
          <div className="b-muted">Cascos Blancos — vence en 5 días</div>
          <div className="b-muted">Guantes Nitrilo — vencido hace 2 días</div>
        </div>

        <div className="b-card">
          <div className="b-h2">Stock Bajo</div>
          <div className="b-muted">Zapatos Seg. T42 — Crítico</div>
          <div className="b-muted">Lentes Protección — Bajo</div>
        </div>

        <div className="b-card">
          <div className="b-h2">Reposiciones Pendientes</div>
          <div className="b-muted">OC #2024-001 — Pendiente</div>
          <div className="b-muted">OC #2024-002 — Aprobado</div>
        </div>
      </div>

      <div className="b-card" style={{marginTop:12}}>
        <div className="b-h2">Acciones Rápidas</div>
        <div className="b-actions">
          <button className="b-btn primary">Entregar por QR</button>
          <button className="b-btn primary">Generar OC</button>
          <button className="b-btn primary">Reconteo</button>
        </div>
      </div>
    </div>
  );
}
