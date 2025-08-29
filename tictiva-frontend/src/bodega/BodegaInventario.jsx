// src/bodega/pages/BodegaInventario.jsx
import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function BodegaInventario() {
  const [sp, setSp] = useSearchParams();
  const modoUrl = sp.get("modo"); // 'instalacion' | 'colaborador'
  const [modo, setModo] = useState(modoUrl === "colaborador" ? "colaborador" : "instalacion");

  // ---------- MOCK DATA (puedes cablearlo a tu API) ----------
  const items = [
    { sku: "EPP-001", desc: "Casco Blanco", categoria: "EPP", instalacion: "Planta Norte", stock: 45, min: 20, max: 100, estado: "OK", ubic: "A-01-15" },
    { sku: "EPP-015", desc: "Zapatos Seguridad T42", categoria: "EPP", instalacion: "Bodega Central", stock: 3, min: 10, max: 50, estado: "Crítico", ubic: "B-03-08" },
    { sku: "EPP-008", desc: "Guantes Nitrilo", categoria: "EPP", instalacion: "Planta Sur", stock: 8, min: 15, max: 80, estado: "Bajo", ubic: "A-02-12" },
  ];

  const asignaciones = [
    { rut: "12.345.678-9", nombre: "Juan Pérez Díaz", sku: "EPP-001", desc: "Casco Blanco", talla: "U", entregado: "15/01/2024", vence: "15/01/2025", vida: 75, estado: "Activo" },
    { rut: "11.222.333-4", nombre: "Carlos Silva", sku: "EPP-015", desc: "Zapatos Seguridad", talla: "42", entregado: "10/12/2023", vence: "10/01/2024", vida: 0, estado: "Vencido" },
    { rut: "98.765.432-1", nombre: "María Rodríguez", sku: "EPP-008", desc: "Guantes Nitrilo", talla: "L", entregado: "20/01/2024", vence: "20/06/2024", vida: 85, estado: "Activo" },
  ];

  // ---------- FILTROS BÁSICOS ----------
  const [q, setQ] = useState("");

  const itemsFiltrados = useMemo(() => {
    if (!q) return items;
    const x = q.toLowerCase();
    return items.filter(i => `${i.sku} ${i.desc} ${i.instalacion}`.toLowerCase().includes(x));
  }, [q, items]);

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

  return (
    <div style={{ padding: 16 }}>
      <h1 className="b-title">Inventario</h1>
      <p className="b-muted">Visualiza stock por instalación o por colaborador.</p>

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

      {/* Barra de filtros simple */}
      <div className="b-card" style={{ marginBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 8 }}>
          <input
            className="b-input"
            placeholder={modo === "instalacion" ? "Buscar SKU / Descripción / Instalación" : "Buscar nombre / RUT / SKU"}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="b-btn">Filtrar</button>
        </div>
      </div>

      {/* Contenido según modo */}
      {modo === "instalacion" ? (
        <div className="b-card">
          <div className="b-table">
            <div className="b-tr b-th">
              <div>SKU</div>
              <div>Descripción</div>
              <div>Instalación</div>
              <div>Stock</div>
              <div>Min/Max</div>
              <div>Estado</div>
              <div>Ubicación</div>
              <div style={{ textAlign: "right" }}>Acciones</div>
            </div>
            {itemsFiltrados.map((i) => (
              <div className="b-tr" key={i.sku}>
                <div className="mono">{i.sku}</div>
                <div>{i.desc}</div>
                <div>{i.instalacion}</div>
                <div>{i.stock}</div>
                <div>{i.min} / {i.max}</div>
                <div>
                  <span className={`b-pill ${i.estado === "OK" ? "b-pill-ok" : i.estado === "Crítico" ? "b-pill-danger" : "b-pill-warn"}`}>
                    {i.estado}
                  </span>
                </div>
                <div>{i.ubic}</div>
                <div style={{ textAlign: "right" }}>
                  <button className="b-btn small">Ver QR</button>{" "}
                  <button className="b-btn small">Reabastecer</button>
                </div>
              </div>
            ))}
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

      {/* Estilos mínimos (si no están en tu CSS) */}
      <style>{`
        .b-title{font-size:22px;font-weight:800;margin:0 0 4px}
        .b-muted{color:#64748b;margin:0 0 8px}
        .b-card{background:#fff;border:1px solid #E5E7EB;border-radius:12px;padding:12px}
        .b-input{border:1px solid #E5E7EB;border-radius:10px;padding:10px 12px}
        .b-btn{background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:10px 12px;cursor:pointer}
        .b-btn.small{padding:6px 10px;border-radius:8px}
        .b-subtabs{display:flex;gap:8px;margin:6px 0 10px}
        .b-subtab{border:1px solid #E5E7EB;background:#fff;border-radius:999px;padding:8px 12px;font-weight:600;cursor:pointer}
        .b-subtab.is-active{background:#111827;color:#fff;border-color:#111827}
        .b-table{display:grid;gap:6px}
        .b-tr{display:grid;grid-template-columns: 140px 1fr 180px 100px 120px 110px 110px 140px;align-items:center;gap:8px}
        .b-th{font-weight:700;color:#111827}
        .mono{font-family: ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace}
        .b-pill{border:1px solid #CBD5E1;border-radius:999px;padding:3px 8px;font-size:12px}
        .b-pill-ok{background:#DCFCE7;border-color:#86EFAC}
        .b-pill-warn{background:#FEF9C3;border-color:#FDE68A}
        .b-pill-danger{background:#FEE2E2;border-color:#FCA5A5}
        .bar{height:8px;border-radius:999px;background:#F1F5F9;overflow:hidden}
        .bar-in{height:100%;background:#22c55e}
        /* Tabla modo colaborador (más columnas) */
        .b-tr:nth-child(n+2){grid-template-columns: 220px 130px 100px 1fr 70px 110px 110px 140px 100px 140px;}
      `}</style>
    </div>
  );
}
