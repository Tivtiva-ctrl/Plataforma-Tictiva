// src/pages/BodegaEPP.jsx
import React, { useMemo, useState } from "react";
import HRSubnav from "../components/HRSubnav";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";

// Utils
const initials = (s = "") =>
  s
    .trim()
    .split(/\s+/)
    .map((p) => p[0] || "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

const pct = (n) => Math.max(0, Math.min(100, Math.round(n)));

const pill = (t, c) => (
  <span className={`epp-pill ${c || ""}`}>{t}</span>
);

// === Demo seeds ===
const SEED_ROWS = [
  {
    id: "r1",
    trabajador: { nombre: "Juan González", rut: "12.345.678-9" },
    instalacion: "Planta Norte",
    categoria: "EPP",
    sku: "EPP-001",
    descripcion: "Casco de seguridad",
    talla: "M",
    entregado: "2024-01-15",
    vence: "2024-02-15",
    vidaPct: 25,
    estado: "Por vencer",
    costo: 12500,
  },
  {
    id: "r2",
    trabajador: { nombre: "María Rodríguez", rut: "98.765.432-1" },
    instalacion: "Planta Norte",
    categoria: "EPP",
    sku: "EPP-015",
    descripcion: "Guantes Nitrilo",
    talla: "L",
    entregado: "2024-01-20",
    vence: "2024-06-20",
    vidaPct: 85,
    estado: "Activo",
    costo: 8900,
  },
  {
    id: "r3",
    trabajador: { nombre: "Carlos Silva", rut: "11.222.333-4" },
    instalacion: "Planta Sur",
    categoria: "Calzado",
    sku: "EPP-008",
    descripcion: "Zapatos de seguridad",
    talla: "42",
    entregado: "2023-12-10",
    vence: "2024-01-10",
    vidaPct: 0,
    estado: "Vencido",
    costo: 45000,
  },
];

export default function BodegaEPP() {
  // Fuente de verdad (en real vendrá del backend)
  const [rows, setRows] = useState(SEED_ROWS);

  // UI: filtros
  const [instalacion, setInstalacion] = useState("Todas");
  const [categoria, setCategoria] = useState("Todas");
  const [estado, setEstado] = useState("Todos");
  const [q, setQ] = useState("");
  const [fDesde, setFDesde] = useState("");
  const [fHasta, setFHasta] = useState("");

  // UI: modales/pushpop
  const [side, setSide] = useState(null); // row para panel lateral
  const [modalEntrega, setModalEntrega] = useState(false);
  const [modalMov, setModalMov] = useState(null); // {row, tipo:'devolucion'|'baja'}

  // Opciones
  const instalaciones = useMemo(
    () => ["Todas", ...Array.from(new Set(rows.map((r) => r.instalacion)))],
    [rows]
  );
  const categorias = useMemo(
    () => ["Todas", ...Array.from(new Set(rows.map((r) => r.categoria)))],
    [rows]
  );
  const estados = ["Todos", "Activo", "Por vencer", "Vencido"];

  // KPIs (simples)
  const kpiPendientes = rows.filter((r) => r.estado === "Activo" && r.vidaPct < 15).length + 21; // demo 24
  const kpiPorVencer = rows.filter((r) => r.estado === "Por vencer").length + 11; // demo 12
  const kpiVencidos = rows.filter((r) => r.estado === "Vencido").length + 7; // demo 8
  const kpiRepo = rows.filter((r) => r.estado !== "Activo").length + 14; // demo 16

  // Filtrado
  const data = useMemo(() => {
    return rows.filter((r) => {
      const okInst = instalacion === "Todas" || r.instalacion === instalacion;
      const okCat = categoria === "Todas" || r.categoria === categoria;
      const okEst = estado === "Todos" || r.estado === estado;
      const okQ = q
        ? `${r.trabajador?.nombre} ${r.trabajador?.rut} ${r.sku} ${r.descripcion}`
            .toLowerCase()
            .includes(q.toLowerCase())
        : true;

      const okDesde = fDesde ? r.entregado >= fDesde : true;
      const okHasta = fHasta ? r.entregado <= fHasta : true;

      return okInst && okCat && okEst && okQ && okDesde && okHasta;
    });
  }, [rows, instalacion, categoria, estado, q, fDesde, fHasta]);

  // Acciones de tabla (demo)
  const doEntrega = (row) => setModalEntrega(true);
  const doDevolver = (row) => setModalMov({ row, tipo: "devolucion" });
  const doBaja = (row) => setModalMov({ row, tipo: "baja" });

  return (
    <div className="epp-wrap">
      <HRSubnav />

      <div className="epp-headbar">
        <h1 className="epp-title">EPP e Inventario</h1>
        <div className="epp-actions">
          <button className="epp-btn" onClick={() => alert("QR/NFC (demo)")}>
            ⌁ Escanear QR/NFC
          </button>
          <button className="epp-btn primary" onClick={() => setModalEntrega(true)}>
            + Entrega manual
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="epp-kpis">
        <div className="epp-kpi">
          <div className="l">Pendientes de entrega</div>
          <div className="v">{kpiPendientes}</div>
          {pill("Pendientes", "success")}
        </div>
        <div className="epp-kpi">
          <div className="l">Por vencer (≤30d)</div>
          <div className="v">{kpiPorVencer}</div>
          {pill("Por vencer", "warn")}
        </div>
        <div className="epp-kpi">
          <div className="l">Vencidos</div>
          <div className="v">{kpiVencidos}</div>
          {pill("Vencidos", "danger")}
        </div>
        <div className="epp-kpi">
          <div className="l">Reposición requerida</div>
          <div className="v">{kpiRepo}</div>
          {pill("Reposición", "indigo")}
        </div>
      </div>

      {/* Filtros */}
      <div className="epp-filters">
        <div className="f">
          <label>Instalación</label>
          <select value={instalacion} onChange={(e) => setInstalacion(e.target.value)}>
            {instalaciones.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </div>
        <div className="f">
          <label>Categoría</label>
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {categorias.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="f">
          <label>Estado</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            {estados.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="f grow">
          <label>Buscar</label>
          <input
            placeholder="Nombre, RUT o SKU"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="f">
          <label>Fecha desde</label>
          <input type="date" value={fDesde} onChange={(e) => setFDesde(e.target.value)} />
        </div>
        <div className="f">
          <label>Fecha hasta</label>
          <input type="date" value={fHasta} onChange={(e) => setFHasta(e.target.value)} />
        </div>
        <div className="right">
          <button className="epp-btn" onClick={() => { setInstalacion("Todas"); setCategoria("Todas"); setEstado("Todos"); setQ(""); setFDesde(""); setFHasta(""); }}>
            Limpiar filtros
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="epp-card">
        <div className="epp-thead">
          <div>TRABAJADOR</div>
          <div>SKU / DESCRIPCIÓN</div>
          <div>TALLA</div>
          <div>ENTREGADO</div>
          <div>VENCE</div>
          <div>VIDA ÚTIL</div>
          <div>ESTADO</div>
          <div>COSTO</div>
          <div>ACCIONES</div>
        </div>

        {data.map((r) => (
          <div key={r.id} className="epp-tr">
            <div className="td worker">
              <div className="avatar">{initials(r.trabajador?.nombre)}</div>
              <div className="wmeta">
                <div className="wname">{r.trabajador?.nombre}</div>
                <div className="wrut">{r.trabajador?.rut}</div>
              </div>
            </div>
            <div className="td">
              <div className="sku">{r.sku}</div>
              <div className="desc">{r.descripcion}</div>
            </div>
            <div className="td">{r.talla}</div>
            <div className="td">{r.entregado}</div>
            <div className="td">{r.vence}</div>
            <div className="td">
              <div className="bar">
                <div className="fill" style={{ width: `${pct(r.vidaPct)}%` }} />
              </div>
              <div className="pct">{pct(r.vidaPct)}%</div>
            </div>
            <div className="td">{pill(r.estado, r.estado === "Activo" ? "success" : r.estado === "Por vencer" ? "warn" : "danger")}</div>
            <div className="td">${(r.costo / 100).toFixed(2).replace(".", ",")}00</div>
            <div className="td actions">
              <button className="link" onClick={() => doEntrega(r)}>Entregar</button>
              <button className="link" onClick={() => doDevolver(r)}>Devolver</button>
              <button className="link danger" onClick={() => doBaja(r)}>Baja</button>
              <button className="link" onClick={() => setSide(r)}>Ver ficha</button>
            </div>
          </div>
        ))}

        {data.length === 0 && <div className="epp-empty">Sin resultados</div>}
      </div>

      {/* Push-pop lateral (ficha) */}
      {side && (
        <>
          <div className="epp-backdrop" onClick={() => setSide(null)} />
          <aside className="epp-side">
            <div className="side-head">
              <div className="avatar lg">{initials(side.trabajador?.nombre)}</div>
              <div className="col">
                <div className="wname">{side.trabajador?.nombre}</div>
                <div className="wrut">{side.trabajador?.rut}</div>
                <div className="muted">{side.instalacion}</div>
              </div>
              <button className="x" onClick={() => setSide(null)}>✖</button>
            </div>

            <div className="side-body">
              <div className="side-card">
                <div className="row">
                  <div>
                    <div className="sku">{side.sku}</div>
                    <div className="desc">{side.descripcion}</div>
                  </div>
                  {pill(side.estado, side.estado === "Activo" ? "success" : side.estado === "Por vencer" ? "warn" : "danger")}
                </div>
                <div className="grid2">
                  <div><div className="label">Talla</div><div>{side.talla}</div></div>
                  <div><div className="label">Costo</div><div>${(side.costo/100).toFixed(2).replace(".", ",")}00</div></div>
                  <div><div className="label">Entregado</div><div>{side.entregado}</div></div>
                  <div><div className="label">Vence</div><div>{side.vence}</div></div>
                </div>
                <div style={{marginTop:8}}>
                  <div className="label">Vida útil</div>
                  <div className="bar big"><div className="fill" style={{width:`${pct(side.vidaPct)}%`}}/></div>
                </div>
                <div className="btnrow">
                  <button className="epp-btn" onClick={() => setModalEntrega(true)}>Entregar</button>
                  <button className="epp-btn" onClick={() => setModalMov({row: side, tipo:"devolucion"})}>Devolver</button>
                  <button className="epp-btn danger" onClick={() => setModalMov({row: side, tipo:"baja"})}>Baja</button>
                </div>
              </div>

              <div className="side-card">
                <div className="label">Historial (demo)</div>
                <div className="mini-row"><b>10/03/2024</b> • Entrega • Usuario: Admin</div>
                <div className="mini-row"><b>25/06/2024</b> • Devolución • Usuario: Supervisor</div>
              </div>

              <button className="epp-btn primary" onClick={() => alert("Ir a ficha del colaborador (demo)")}>Ir a ficha del colaborador</button>
            </div>
          </aside>
        </>
      )}

      {/* Modal Entrega manual */}
      {modalEntrega && (
        <>
          <div className="epp-backdrop" onClick={() => setModalEntrega(false)} />
          <div className="epp-modal">
            <div className="m-head">
              <h3>Entrega manual</h3>
              <button className="x" onClick={() => setModalEntrega(false)}>✖</button>
            </div>
            <div className="m-body grid2">
              <div>
                <label className="label">Trabajador</label>
                <input className="inp" placeholder="Nombre o RUT" />
              </div>
              <div>
                <label className="label">Instalación</label>
                <select className="inp">
                  {instalaciones.filter(i=>i!=="Todas").map((i)=><option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="label">SKU</label>
                <input className="inp" placeholder="Ej: EPP-001" />
              </div>
              <div>
                <label className="label">Talla</label>
                <input className="inp" placeholder="Ej: 42 / M / L" />
              </div>
              <div>
                <label className="label">Cantidad</label>
                <input className="inp" type="number" min="1" defaultValue="1" />
              </div>
              <div>
                <label className="label">Costo unitario</label>
                <input className="inp" type="number" min="0" placeholder="Ej: 12000" />
              </div>
              <div>
                <label className="label">Fecha entrega</label>
                <input className="inp" type="date" />
              </div>
              <div>
                <label className="label">Vida útil (meses)</label>
                <input className="inp" type="number" min="0" placeholder="Ej: 12" />
              </div>
              <div className="full">
                <label className="label">Observación</label>
                <textarea className="inp" rows={2} />
              </div>
            </div>
            <div className="m-foot">
              <button className="epp-btn" onClick={() => setModalEntrega(false)}>Cancelar</button>
              <button className="epp-btn primary" onClick={() => { setModalEntrega(false); alert("Entrega registrada (demo)"); }}>Entregar</button>
            </div>
          </div>
        </>
      )}

      {/* Modal Devolución / Baja */}
      {modalMov && (
        <>
          <div className="epp-backdrop" onClick={() => setModalMov(null)} />
          <div className="epp-modal">
            <div className="m-head">
              <h3>{modalMov.tipo === "devolucion" ? "Devolución" : "Baja"} de ítem</h3>
              <button className="x" onClick={() => setModalMov(null)}>✖</button>
            </div>
            <div className="m-body grid2">
              <div className="full muted">
                {modalMov.row?.sku} — {modalMov.row?.descripcion} / {modalMov.row?.talla}
              </div>
              <div>
                <label className="label">Motivo</label>
                <select className="inp">
                  <option>Desgaste normal</option>
                  <option>Pérdida</option>
                  <option>Talla incorrecta</option>
                  <option>Vencimiento</option>
                </select>
              </div>
              {modalMov.tipo === "devolucion" ? (
                <div>
                  <label className="label">Ubicación de retorno</label>
                  <input className="inp" placeholder="Ej: B-03-08" />
                </div>
              ) : (
                <div>
                  <label className="label">Tipo de baja</label>
                  <select className="inp">
                    <option>Vencido</option>
                    <option>Dañado</option>
                    <option>Perdido</option>
                  </select>
                </div>
              )}
              <div className="full">
                <label className="label">Observación</label>
                <textarea className="inp" rows={2} />
              </div>
            </div>
            <div className="m-foot">
              <button className="epp-btn" onClick={() => setModalMov(null)}>Cancelar</button>
              <button
                className={`epp-btn ${modalMov.tipo === "baja" ? "danger" : "primary"}`}
                onClick={() => { setModalMov(null); alert(`${modalMov.tipo === "devolucion" ? "Devolución" : "Baja"} registrada (demo)`); }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </>
      )}

      {/* estilos locales */}
      <style>{`
        .epp-wrap{padding:16px}
        .epp-headbar{display:flex;align-items:center;justify-content:space-between;margin:4px 0 12px}
        .epp-title{margin:0;font-size:24px;font-weight:800;color:#14213d}
        .epp-actions{display:flex;gap:8px}
        .epp-btn{background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:8px 12px;cursor:pointer}
        .epp-btn.primary{background:#1A56DB;color:#fff;border-color:#1A56DB}
        .epp-btn.danger{background:#dc2626;color:#fff;border-color:#dc2626}
        .epp-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px}
        .epp-kpi{background:#fff;border:1px solid #E6EAF0;border-radius:12px;padding:12px}
        .epp-kpi .l{color:#6b7280;font-size:12px}
        .epp-kpi .v{font-size:26px;font-weight:800;margin:4px 0}
        .epp-pill{display:inline-block;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:700;border:1px solid #E5E7EB;background:#F9FAFB}
        .epp-pill.success{background:#dcfce7;border-color:#bbf7d0;color:#166534}
        .epp-pill.warn{background:#fff7ed;border-color:#ffedd5;color:#b45309}
        .epp-pill.danger{background:#fee2e2;border-color:#fecaca;color:#b91c1c}
        .epp-pill.indigo{background:#eef2ff;border-color:#e0e7ff;color:#3730a3}
        .epp-filters{display:grid;grid-template-columns:220px 220px 180px 1fr 170px 170px auto;gap:10px;margin-bottom:10px;align-items:end}
        .epp-filters .f{display:flex;flex-direction:column;gap:6px}
        .epp-filters label{font-size:12px;color:#6b7280}
        .epp-filters input,.epp-filters select{border:1px solid #E5E7EB;border-radius:10px;padding:8px 10px;outline:none}
        .epp-filters .grow{grid-column:auto/span 1}
        .epp-filters .right{display:flex;justify-content:flex-end}
        .epp-card{background:#fff;border:1px solid #E6EAF0;border-radius:12px;overflow:hidden}
        .epp-thead,.epp-tr{display:grid;grid-template-columns:1.5fr 1.6fr 0.6fr 1fr 1fr 1fr 0.9fr 0.9fr 1.2fr;gap:8px;align-items:center}
        .epp-thead{padding:10px 12px;background:#F9FAFB;border-bottom:1px solid #E6EAF0;font-weight:700;color:#374151}
        .epp-tr{padding:12px;border-top:1px solid #F1F5F9}
        .td.worker{display:flex;align-items:center;gap:10px}
        .avatar{width:32px;height:32px;border-radius:999px;background:#E5EDFF;color:#1E3A8A;display:flex;align-items:center;justify-content:center;font-weight:700}
        .avatar.lg{width:44px;height:44px;font-size:16px}
        .wmeta .wrut{color:#6b7280;font-size:12px}
        .sku{font-weight:700}
        .desc{color:#6b7280;font-size:13px}
        .bar{height:8px;background:#eef2ff;border-radius:999px;overflow:hidden;position:relative}
        .bar .fill{position:absolute;left:0;top:0;bottom:0;background:#2563eb}
        .bar.big{height:10px}
        .pct{font-size:12px;color:#6b7280;margin-top:2px}
        .actions{display:flex;gap:8px;flex-wrap:wrap}
        .link{background:transparent;border:none;color:#1A56DB;cursor:pointer;padding:0}
        .link.danger{color:#b91c1c}
        .epp-empty{padding:16px;color:#6b7280}
        .epp-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:60}
        .epp-side{position:fixed;right:0;top:0;bottom:0;width:min(420px,92vw);background:#fff;border-left:1px solid #E6EAF0;z-index:80;display:flex;flex-direction:column}
        .side-head{display:flex;gap:12px;align-items:center;border-bottom:1px solid #E6EAF0;padding:12px}
        .side-body{padding:12px;display:grid;gap:12px;overflow:auto}
        .side-card{border:1px solid #E6EAF0;border-radius:12px;padding:12px}
        .side-card .row{display:flex;justify-content:space-between;align-items:center}
        .label{font-size:12px;color:#6b7280}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px}
        .btnrow{display:flex;gap:8px;margin-top:10px}
        .epp-modal{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(760px,94vw);background:#fff;border:1px solid #E6EAF0;border-radius:12px;z-index:90;box-shadow:0 12px 32px rgba(0,0,0,.16)}
        .m-head{display:flex;justify-content:space-between;align-items:center;padding:12px;border-bottom:1px solid #E6EAF0}
        .m-body{padding:12px}
        .grid2{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .full{grid-column:1/-1}
        .inp{border:1px solid #E5E7EB;border-radius:10px;padding:8px 10px;outline:none;width:100%}
        .muted{color:#6b7280}
        .m-foot{padding:12px;border-top:1px solid #E6EAF0;display:flex;justify-content:flex-end;gap:8px}
        @media (max-width:1020px){
          .epp-kpis{grid-template-columns:repeat(2,1fr)}
          .epp-filters{grid-template-columns:1fr 1fr 1fr 1fr}
          .epp-thead,.epp-tr{grid-template-columns:1.4fr 1.4fr 0.6fr 1fr 1fr 1fr 1fr 1fr 1.2fr}
        }
        @media (max-width:720px){
          .epp-kpis{grid-template-columns:1fr}
          .epp-filters{grid-template-columns:1fr 1fr}
          .epp-thead,.epp-tr{grid-template-columns:1.6fr 1.2fr 0.6fr 0.9fr 0.9fr 1fr 1fr}
        }
      `}</style>
    </div>
  );
}
