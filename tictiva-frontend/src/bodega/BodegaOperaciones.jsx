import React from "react";

export default function BodegaOperaciones(){
  return (
    <div>
      <h1 className="b-title">Operaciones</h1>
      <p className="b-muted">Gestión de entregas, devoluciones y operaciones diarias.</p>

      <div className="b-grid-3">
        <div className="b-card">
          <div className="b-h2">Escanear QR/NFC</div>
          <div className="b-muted">Escanea el código del producto o colaborador.</div>
          <div className="b-actions" style={{marginTop:8}}>
            <button className="b-btn primary">Simular Escaneo</button>
          </div>
        </div>

        <div className="b-card">
          <div className="b-h2">Solicitudes & Aprobaciones</div>
          <div className="b-muted">SOL-001 · Zapatos Seg. T40 — María González</div>
          <div className="b-actions" style={{marginTop:6}}>
            <button className="b-btn primary">Aprobar</button>
            <button className="b-btn">Rechazar</button>
          </div>
          <hr style={{border:"0", borderTop:"1px solid #F3F4F6", margin:"12px 0"}}/>
          <div className="b-muted">SOL-002 · Guantes Nitrilo — Carlos Ruiz (Aprobado)</div>
        </div>

        <div className="b-card">
          <div className="b-h2">Recuentos Cíclicos</div>
          <div className="b-muted">Zona A — Cascos · Programado para hoy</div>
          <div className="b-actions" style={{marginTop:6}}>
            <button className="b-btn primary">Iniciar</button>
          </div>
        </div>
      </div>

      <div className="b-card" style={{marginTop:12}}>
        <div className="b-h2">Proveedores & Compras</div>
        <div className="b-muted">OC #2024-001 — En tránsito (SafetyPro)</div>
        <div className="b-muted">OC #2024-002 — Entregado (EquipMax)</div>
      </div>
    </div>
  );
}
