import React from "react";

const Item = ({title, badge, costo, entregado, vence, barra, acciones}) => (
  <div className="b-card">
    <div style={{display:"flex", justifyContent:"space-between"}}>
      <div style={{fontWeight:700}}>{title}</div>
      <span className="b-btn" style={{padding:"4px 8px"}}>{badge}</span>
    </div>
    <div className="b-muted">Costo: {costo}</div>
    <div className="b-muted">Entregado: {entregado}</div>
    <div className="b-muted">Vence: {vence}</div>
    <div style={{height:8, background:"#E5E7EB", borderRadius:999, margin:"8px 0"}}>
      <div style={{width: barra, height:"100%", background:"#10B981", borderRadius:999}}/>
    </div>
    <div className="b-actions">{acciones}</div>
  </div>
);

export default function BodegaColaboradores(){
  return (
    <div>
      <h1 className="b-title">Ficha EPP — Colaboradores</h1>
      <p className="b-muted">Gestión de EPP por colaborador.</p>

      <div className="b-card" style={{marginBottom:12}}>
        <strong>Juan Pérez Díaz</strong> · Operario de Planta · ID: EMP-001
        <div className="b-muted">Centro de costo: Producción</div>
      </div>

      <div className="b-grid-3">
        <Item
          title="Casco Blanco"
          badge="Activo"
          costo="$45.00"
          entregado="15/01/2024"
          vence="15/01/2025"
          barra="75%"
          acciones={<>
            <button className="b-btn primary">Entregar</button>
            <button className="b-btn">Dev/Recambio</button>
          </>}
        />
        <Item
          title="Zapatos Seguridad"
          badge="Por vencer"
          costo="$120.00"
          entregado="10/03/2024"
          vence="25/12/2024"
          barra="15%"
          acciones={<>
            <button className="b-btn primary">Entregar</button>
            <button className="b-btn">Cambiar Talla</button>
          </>}
        />
        <Item
          title="Guantes Nitrilo"
          badge="Vencido"
          costo="$25.00"
          entregado="05/08/2024"
          vence="05/12/2024"
          barra="0%"
          acciones={<>
            <button className="b-btn primary">Entregar</button>
            <button className="b-btn">Baja</button>
          </>}
        />
      </div>

      <div className="b-card" style={{marginTop:12}}>
        <div className="b-h2">Entrega de Kit por Cargo</div>
        <div className="b-actions">
          <select className="b-btn" style={{minWidth:320}}>
            <option>Operario Planta (Casco + Guantes + Zapatos)</option>
          </select>
          <button className="b-btn primary">Entregar Kit</button>
        </div>
      </div>
    </div>
  );
}
