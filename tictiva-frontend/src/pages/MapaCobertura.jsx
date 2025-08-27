// src/pages/MapaCobertura.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import AsistenciaSubnav from "../components/AsistenciaSubnav";
import "./MapaCobertura.css";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";

/* Estados (etiquetas/colores) */
const STATES = {
  completa:    { key: "completa",    label: "Dotación Completa",    color: "#22c55e" },
  parcial:     { key: "parcial",     label: "Dotación Parcial",     color: "#f59e0b" },
  sin:         { key: "sin",         label: "Sin Dotación",         color: "#ef4444" },
  desconocida: { key: "desconocida", label: "Dotación Desconocida", color: "#6b7280" },
};

/* Regiones y comunas (catálogo estático) */
const CHILE_DPA = {
  "Arica y Parinacota": ["Arica","Camarones","General Lagos","Putre"],
  "Tarapacá": ["Alto Hospicio","Camiña","Colchane","Huara","Iquique","Pica","Pozo Almonte"],
  "Antofagasta": ["Antofagasta","Calama","María Elena","Mejillones","Ollagüe","San Pedro de Atacama","Sierra Gorda","Taltal","Tocopilla"],
  "Atacama": ["Alto del Carmen","Caldera","Chañaral","Copiapó","Diego de Almagro","Freirina","Huasco","Tierra Amarilla","Vallenar"],
  "Coquimbo": ["Andacollo","Canela","Combarbalá","Coquimbo","Illapel","La Higuera","La Serena","Los Vilos","Monte Patria","Ovalle","Paihuano","Punitaqui","Río Hurtado","Salamanca","Vicuña"],
  "Valparaíso": ["Cabildo","Calle Larga","Cartagena","Casablanca","Catemu","Concón","El Quisco","El Tabo","Hijuelas","Isla de Pascua","Juan Fernández","La Calera","La Cruz","La Ligua","Limache","Llaillay","Los Andes","Nogales","Olmué","Panquehue","Papudo","Petorca","Puchuncaví","Putaendo","Quillota","Quilpué","Quintero","Rinconada","San Antonio","San Esteban","San Felipe","Santa María","Santo Domingo","Valparaíso","Villa Alemana","Viña del Mar","Zapallar"],
  "Metropolitana de Santiago": ["Alhué","Buin","Calera de Tango","Cerrillos","Cerro Navia","Colina","Conchalí","Curacaví","El Bosque","El Monte","Estación Central","Huechuraba","Independencia","Isla de Maipo","La Cisterna","La Florida","La Granja","La Pintana","La Reina","Lampa","Las Condes","Lo Barnechea","Lo Espejo","Lo Prado","Macul","Maipú","María Pinto","Melipilla","Ñuñoa","Padre Hurtado","Paine","Pedro Aguirre Cerda","Peñaflor","Peñalolén","Pirque","Providencia","Pudahuel","Puente Alto","Quilicura","Quinta Normal","Recoleta","Renca","San Bernardo","San Joaquín","San José de Maipo","San Miguel","San Pedro","San Ramón","Santiago","Talagante","Tiltil","Vitacura"],
  "Libertador General Bernardo O'Higgins": ["Chépica","Chimbarongo","Codegua","Coinco","Coltauco","Doñihue","Graneros","La Estrella","Las Cabras","Litueche","Lolol","Machalí","Malloa","Marchihue","Mostazal","Navidad","Nancagua","Olivar","Palmilla","Paredones","Peralillo","Peumo","Pichidegua","Pichilemu","Placilla","Pumanque","Quinta de Tilcoco","Rancagua","Rengo","Requínoa","San Fernando","San Vicente","Santa Cruz"],
  "Maule": ["Cauquenes","Chanco","Colbún","Constitución","Curepto","Curicó","Empedrado","Hualañé","Licantén","Linares","Longaví","Maule","Molina","Parral","Pelarco","Pencahue","Rauco","Retiro","Río Claro","Romeral","Sagrada Familia","San Clemente","San Javier","Talca","Teno","Vichuquén","Villa Alegre","Yerbas Buenas","Pelluhue"],
  "Ñuble": ["Bulnes","Cobquecura","Coelemu","Coihueco","El Carmen","Ninhue","Ñiquén","Pemuco","Pinto","Portezuelo","Quillón","Quirihue","Ránquil","San Carlos","San Fabián","San Ignacio","San Nicolás","Treguaco","Yungay","Chillán","Chillán Viejo"],
  "Biobío": ["Alto Biobío","Antuco","Arauco","Cabrero","Cañete","Chiguayante","Concepción","Contulmo","Coronel","Curanilahue","Florida","Hualpén","Hualqui","Laja","Lebu","Los Álamos","Los Ángeles","Lota","Mulchén","Nacimiento","Negrete","Penco","Quilaco","Quilleco","San Pedro de la Paz","San Rosendo","Santa Bárbara","Santa Juana","Talcahuano","Tirúa","Tomé","Tucapel","Yumbel"],
  "La Araucanía": ["Angol","Carahue","Cholchol","Collipulli","Cunco","Curacautín","Curarrehue","Ercilla","Freire","Galvarino","Gorbea","Lautaro","Loncoche","Lonquimay","Los Sauces","Lumaco","Melipeuco","Nueva Imperial","Padre Las Casas","Perquenco","Pitrufquén","Pucón","Purén","Renaico","Saavedra","Teodoro Schmidt","Temuco","Toltén","Traiguén","Villarrica","Victoria"],
  "Los Ríos": ["Corral","Futrono","La Unión","Lago Ranco","Lanco","Los Lagos","Máfil","Paillaco","Panguipulli","Río Bueno","Valdivia","Mariquina"],
  "Los Lagos": ["Ancud","Calbuco","Castro","Chaitén","Chonchi","Cochamó","Curaco de Vélez","Dalcahue","Fresia","Frutillar","Futaleufú","Hualaihué","Llanquihue","Los Muermos","Maullín","Osorno","Palena","Puerto Montt","Puerto Octay","Puerto Varas","Puqueldón","Purranque","Puyehue","Queilén","Quellón","Quemchi","Quinchao","Río Negro","San Juan de la Costa","San Pablo"],
  "Aysén del General Carlos Ibáñez del Campo": ["Aysén","Chile Chico","Cisnes","Cochrane","Coyhaique","Guaitecas","Lago Verde","O'Higgins","Río Ibáñez","Tortel"],
  "Magallanes y de la Antártica Chilena": ["Antártica","Cabo de Hornos","Laguna Blanca","Natales","Porvenir","Primavera","Punta Arenas","Río Verde","San Gregorio","Timaukel","Torres del Paine"]
};

/* Demo (si backend no responde) */
const DEMO_POINTS = [
  { id:"s-1", nombre:"Kiosko Mall Arauco (Tictiva)", direccion:"Mall Arauco Maipú, Local K-10",
    region:"Metropolitana de Santiago", comuna:"Maipú", lat:-33.5137, lng:-70.7579,
    estado:"completa", asignados:1, marcadosHoy:1,
    colaboradores:[{ nombre:"Patricia García", detalle:"Marcó a las 09:55:00" }] },
  { id:"s-2", nombre:"Sucursal Bilbao", direccion:"Av. Bilbao 1234",
    region:"Metropolitana de Santiago", comuna:"Providencia", lat:-33.4285, lng:-70.6048,
    estado:"completa", asignados:2, marcadosHoy:2,
    colaboradores:[{ nombre:"J. Díaz", detalle:"Marcó 08:58" }, { nombre:"M. Pérez", detalle:"Marcó 09:03" }] },
  { id:"s-3", nombre:"Bodega Quilicura", direccion:"Camino A", region:"Metropolitana de Santiago",
    comuna:"Quilicura", lat:-33.358, lng:-70.728, estado:"parcial", asignados:3, marcadosHoy:1,
    colaboradores:[{ nombre:"C. Rodríguez", detalle:"Pendiente" }] },
  { id:"s-4", nombre:"Punto Ñuñoa", direccion:"Plaza Ñuñoa", region:"Metropolitana de Santiago",
    comuna:"Ñuñoa", lat:-33.457, lng:-70.6, estado:"sin", asignados:1, marcadosHoy:0,
    colaboradores:[{ nombre:"Vacante", detalle:"Sin marca" }] },
  { id:"s-5", nombre:"Kiosko Viña", direccion:"Centro Viña", region:"Valparaíso", comuna:"Viña del Mar",
    lat:-33.0245, lng:-71.5518, estado:"desconocida", asignados:1, marcadosHoy:0, colaboradores:[] },
];

/* Pin CSS (sin imágenes) */
function makePin(colorHex) {
  return L.divIcon({
    className: "mc-pin",
    html: `<div class="mc-pin-inner" style="--pin:${colorHex}"></div>`,
    iconSize: [26, 36],
    iconAnchor: [13, 36],
    popupAnchor: [0, -28],
  });
}

export default function MapaCobertura() {
  const mapRef = useRef(null);
  const layerRef = useRef(null);

  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Filtros
  const [filterState, setFilterState] = useState("todas");
  const [region, setRegion] = useState("");
  const [comuna, setComuna] = useState("");
  const [query, setQuery] = useState("");

  /** fetch reutilizable (y SIEMPRE cambia la referencia del array) */
  const fetchPoints = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API}/sucursales`).catch(() => null);
      if (!r || !r.ok) {
        // ← clon para forzar cambio de referencia aunque sean los mismos datos
        setPoints(DEMO_POINTS.map(p => ({ ...p })));
        setLastRefresh(new Date());
        return;
      }
      const data = await r.json();
      const rows = (data || [])
        .map((d, i) => ({
          id: d.id ?? `s-${i}`,
          nombre: d.nombre ?? d.titulo ?? "Sucursal",
          direccion: d.direccion ?? "",
          region: d.region ?? "",
          comuna: d.comuna ?? "",
          lat: Number(d.lat), lng: Number(d.lng),
          estado: String(d.estado ?? "desconocida").toLowerCase(),
          asignados: Number(d.asignados ?? 0),
          marcadosHoy: Number(d.marcadosHoy ?? 0),
          colaboradores: Array.isArray(d.colaboradores) ? d.colaboradores : [],
        }))
        .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lng));

      const payload = rows.length ? rows : DEMO_POINTS;
      // ← clon profundo ligero para que React vuelva a renderizar
      setPoints(payload.map(p => ({ ...p })));
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  };

  /* Carga inicial */
  useEffect(() => { fetchPoints(); /* eslint-disable-next-line */ }, []);

  /* Opciones región/comuna */
  const regions = useMemo(() => Object.keys(CHILE_DPA), []);
  const comunasForRegion = useMemo(
    () => (region ? [...(CHILE_DPA[region] || [])] : []),
    [region]
  );

  /* Filtrado por ubicación/búsqueda */
  const filteredByGeo = useMemo(() => {
    const q = query.trim().toLowerCase();
    return points.filter(p => {
      if (region && p.region !== region) return false;
      if (comuna && p.comuna !== comuna) return false;
      if (!q) return true;
      const hay = `${p.nombre} ${p.direccion} ${p.region} ${p.comuna}`.toLowerCase();
      return hay.includes(q);
    });
  }, [points, region, comuna, query]);

  /* Filtrado por estado */
  const filtered = useMemo(() => {
    if (filterState === "todas") return filteredByGeo;
    return filteredByGeo.filter(p => p.estado === filterState);
  }, [filteredByGeo, filterState]);

  /* Render de marcadores */
  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    if (!filtered.length) return;

    const bounds = [];
    filtered.forEach((p) => {
      const cfg = STATES[p.estado] || STATES.desconocida;
      const porcentaje = p.asignados > 0 ? Math.round((p.marcadosHoy / p.asignados) * 100) : 0;

      const marker = L.marker([p.lat, p.lng], { icon: makePin(cfg.color), title: p.nombre });
      const colaboradoresHTML =
        (p.colaboradores || []).length
          ? p.colaboradores.map(c => `<li>✅ <b>${c.nombre}</b> <span class="mc-muted">— ${c.detalle || ""}</span></li>`).join("")
          : "<li class='mc-muted'>Sin registros</li>";

      marker.bindPopup(
        `
        <div class="mc-popup">
          <div class="mc-popup-title">${p.nombre}</div>
          <div class="mc-popup-sub">${p.direccion || ""}</div>
          <div class="mc-popup-sub">Región: ${p.region || "-"}, Comuna: ${p.comuna || "-"}</div>
          <div class="mc-popup-block">
            <div class="mc-popup-kv"><span>Estado (hoy)</span><span><b>${STATES[p.estado]?.label || "Desconocida"}</b> (${porcentaje}%)</span></div>
            <div class="mc-popup-kv"><span>Asignados</span><span>${p.asignados}</span></div>
            <div class="mc-popup-kv"><span>Marcados hoy</span><span>${p.marcadosHoy}</span></div>
          </div>
          <div class="mc-popup-sec">Lista de Colaboradores:</div>
          <ul class="mc-list">${colaboradoresHTML}</ul>
        </div>
        `,
        { minWidth: 320 }
      );

      marker.addTo(layer);
      bounds.push([p.lat, p.lng]);
    });

    if (bounds.length === 1) {
      map.setView(bounds[0], 14, { animate: true });
    } else {
      map.fitBounds(L.latLngBounds(bounds).pad(0.15), { animate: true });
    }
  }, [filtered]);

  /* Inicializar mapa 1 vez */
  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map("mc-map", { center: [-33.45, -70.66], zoom: 11, scrollWheelZoom: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    mapRef.current = map;
    layerRef.current = L.layerGroup().addTo(map);
  }, []);

  /* Contadores de chips según filtros geo + búsqueda */
  const counts = useMemo(() => {
    const c = { todas: filteredByGeo.length, completa: 0, parcial: 0, sin: 0, desconocida: 0 };
    filteredByGeo.forEach(p => { c[p.estado] = (c[p.estado] || 0) + 1; });
    return c;
  }, [filteredByGeo]);

  const clearGeo = () => { setRegion(""); setComuna(""); setQuery(""); };

  /** Exportar CSV de la vista actual */
  const exportCSV = () => {
    const rows = filtered;
    const now = new Date();
    const header = [
      "Nombre","Dirección","Región","Comuna","Lat","Lng","Estado","Asignados","MarcadosHoy","% Dotación"
    ];
    const csv = [
      header.join(","),
      ...rows.map(p => {
        const pct = p.asignados > 0 ? Math.round((p.marcadosHoy / p.asignados) * 100) : 0;
        const safe = (v) => `"${String(v ?? "").replaceAll('"','""')}"`;
        return [
          safe(p.nombre), safe(p.direccion), safe(p.region), safe(p.comuna),
          p.lat, p.lng, p.estado, p.asignados, p.marcadosHoy, pct
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mapa_cobertura_${now.toISOString().slice(0,19).replace(/[:T]/g,"-")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mc-wrap">
      <AsistenciaSubnav />

      {/* Card de título */}
      <div className="mc-card mc-head">
        <div>
          <div className="mc-head-title">📍 Mapa de Cobertura de Dotación</div>
          <div className="mc-head-sub">
            Visualiza el estado de la dotación de personal en tus instalaciones asignadas (calculado para hoy).
          </div>
        </div>
        <div className="mc-head-actions">
          <button className="mc-btn" onClick={fetchPoints} disabled={loading}>
            {loading ? "Actualizando…" : "↻ Actualizar Ahora"}
          </button>
          <button className="mc-btn" onClick={exportCSV} disabled={filtered.length === 0}>
            ⬇ Exportar Vista (Sim.)
          </button>
        </div>
      </div>

      {/* Pildorita de “actualizado” */}
      {lastRefresh && (
        <div style={{color:"#64748b", fontSize:12, margin:"-6px 0 8px 4px"}}>
          Última actualización: {lastRefresh.toLocaleTimeString()}
        </div>
      )}

      {/* Card de filtros (Ubicación + Estado) */}
      <div className="mc-card">
        <div className="mc-filter-title">🧭 Filtrar por Ubicación</div>
        <div className="mc-geo">
          <div className="mc-field">
            <label className="mc-label">Región</label>
            <select
              className="mc-input"
              value={region}
              onChange={(e)=>{ setRegion(e.target.value); setComuna(""); }}
            >
              <option value="">Todas las regiones</option>
              {regions.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="mc-field">
            <label className="mc-label">Comuna</label>
            <select
              className="mc-input"
              value={comuna}
              onChange={(e)=>setComuna(e.target.value)}
              disabled={!region}
              title={!region ? "Selecciona una región primero" : ""}
            >
              <option value="">{region ? "Todas las comunas" : "— Selecciona región —"}</option>
              {comunasForRegion.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="mc-field mc-field--grow">
            <label className="mc-label">Buscar</label>
            <input
              className="mc-input"
              placeholder="Nombre o dirección de instalación…"
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
            />
          </div>

          <div className="mc-actions-right">
            <button className="mc-btn" onClick={clearGeo}>Limpiar</button>
          </div>
        </div>

        <div className="mc-filter-title" style={{marginTop:10}}>⚑ Filtrar por Estado de Dotación</div>
        <div className="mc-filterbar">
          <button
            className={`mc-filter ${filterState === "todas" ? "is-active" : ""}`}
            onClick={() => setFilterState("todas")}
          >
            Todas <span className="mc-count">{counts.todas}</span>
          </button>
          {Object.values(STATES).map(s => (
            <button
              key={s.key}
              className={`mc-filter is-${s.key} ${filterState === s.key ? "is-active" : ""}`}
              onClick={() => setFilterState(s.key)}
            >
              <span className="mc-dot" style={{ background: s.color }} />
              {s.label.replace("Dotación ", "")}
              <span className="mc-count">{counts[s.key] || 0}</span>
            </button>
        ))}
        </div>
      </div>

      {/* Mapa */}
      <div id="mc-map" className="mc-map">
        {loading && <div className="mc-loading">Cargando mapa…</div>}
      </div>

      {/* Leyenda */}
      <div className="mc-legend">
        <div className="mc-legend-title">Leyenda de Dotación</div>
        <div className="mc-legend-row"><span className="mc-dot" style={{ background: STATES.completa.color }} />{STATES.completa.label}</div>
        <div className="mc-legend-row"><span className="mc-dot" style={{ background: STATES.parcial.color }} />{STATES.parcial.label}</div>
        <div className="mc-legend-row"><span className="mc-dot" style={{ background: STATES.sin.color }} />{STATES.sin.label}</div>
        <div className="mc-legend-row"><span className="mc-dot" style={{ background: STATES.desconocida.color }} />{STATES.desconocida.label}</div>
      </div>

      {/* Estilos locales */}
      <style>{`
        .mc-wrap { position: relative; padding: 12px 16px 20px; }

        .mc-card {
          background:#fff; border:1px solid #e5e7eb; border-radius:12px;
          padding:12px 14px; box-shadow:0 2px 10px rgba(0,0,0,.04); margin-bottom:12px;
        }
        .mc-head { display:flex; align-items:center; justify-content:space-between; gap:12px; }
        .mc-head-title { font-weight:800; font-size:18px; color:#0f172a; }
        .mc-head-sub { color:#6b7280; font-size:13px; margin-top:2px; }
        .mc-head-actions { display:flex; gap:8px; }
        .mc-btn { background:#fff; border:1px solid #e5e7eb; border-radius:10px; padding:8px 12px; font-weight:700; color:#334155; cursor:pointer; }
        .mc-btn:disabled { opacity:.6; cursor:not-allowed; }
        .mc-btn:hover:not(:disabled) { background:#f9fafb; }

        .mc-filter-title { font-weight:800; color:#0f172a; margin:2px 0 8px; }
        .mc-geo { display:grid; grid-template-columns: 1fr 1fr 2fr auto; gap:10px; align-items:end; }
        .mc-field { display:flex; flex-direction:column; gap:6px; }
        .mc-field--grow { grid-column: span 1; }
        .mc-label { font-size:12px; color:#6b7280; }
        .mc-input { background:#fff; border:1px solid #e5e7eb; border-radius:10px; padding:9px 10px; outline:none; }
        .mc-input:focus { border-color:#c7d2fe; box-shadow: 0 0 0 4px rgba(37,99,235,.10); }
        .mc-actions-right { display:flex; justify-content:flex-end; align-items:center; }

        .mc-filterbar { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
        .mc-filter {
          background:#fff; border:1px solid #e5e7eb; border-radius:999px;
          padding:8px 12px; font-weight:700; color:#334155; cursor:pointer;
          display:inline-flex; align-items:center; gap:8px;
        }
        .mc-filter.is-active { box-shadow: inset 0 -2px 0 #2563eb; border-color:#c7d2fe; color:#1f2937; }
        .mc-filter .mc-count {
          background:#f3f4f6; border:1px solid #e5e7eb; border-radius:999px; padding:2px 8px; font-weight:700; font-size:12px;
        }

        .mc-map {
          position: relative; height: 560px; border-radius: 12px; overflow: hidden;
          box-shadow: 0 2px 12px rgba(50,80,100,.08); border:1px solid #e5e7eb;
        }
        .mc-loading { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; color:#6b7280; background:rgba(255,255,255,.65); z-index:10; }

        /* Pin CSS */
        .mc-pin-inner{
          width:24px;height:24px;border-radius:50% 50% 50% 0; background:var(--pin, #6b7280);
          transform:rotate(-45deg); position:relative; box-shadow:0 0 0 2px rgba(0,0,0,.05), 0 6px 10px rgba(0,0,0,.15);
        }
        .mc-pin-inner::after{ content:""; position:absolute; width:10px; height:10px; border-radius:50%; background:#fff; top:7px; left:7px; }

        /* Leyenda tipo tarjeta */
        .mc-legend {
          position: absolute; right: 18px; bottom: 14px;
          background:#ffffff; border:1px solid #e5e7eb; border-radius:12px;
          padding:12px 16px; box-shadow:0 10px 24px rgba(0,0,0,.10);
          z-index: 1200;
        }
        .mc-legend-title{ font-weight:900; font-size:18px; color:#1f2937; margin:2px 0 8px; }
        .mc-legend-row{ display:flex; align-items:center; gap:10px; color:#111827; font-size:16px; padding:6px 0; }
        .mc-dot{ width:12px; height:12px; border-radius:999px; display:inline-block; }

        /* Popup */
        .mc-popup { font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; min-width:300px; }
        .mc-popup-title { font-weight:800; color:#1f2937; margin-bottom:4px; }
        .mc-popup-sub { color:#6b7280; font-size:12px; }
        .mc-popup-block { margin:8px 0; padding:8px 0; border-top:1px solid #f1f5f9; border-bottom:1px solid #f1f5f9; }
        .mc-popup-kv { display:flex; justify-content:space-between; gap:10px; padding:3px 0; }
        .mc-popup-sec { font-weight:700; margin:8px 0 4px; }
        .mc-list { margin:0; padding-left:18px; }
        .mc-muted { color:#9ca3af; }

        @media (max-width: 900px) {
          .mc-geo { grid-template-columns: 1fr 1fr; }
          .mc-actions-right { grid-column: 1 / -1; justify-content: flex-end; }
        }
      `}</style>
    </div>
  );
}
