import React, { useMemo, useState } from "react";
import "./Dashboard.css";

/** Datos de ejemplo (reemplazar luego por datos reales) */
const KPIS = [
  { key: "mensajes", label: "Mensajes", value: 3 },
  { key: "marcas", label: "Marcas hoy", value: 128 },
  { key: "dispositivos", label: "Dispositivos activos", value: 5 },
];

const MODULES = [
  {
    key: "rrhh",
    title: "RRHH",
    desc: "Gestión humana, clara y cercana",
    items: ["Listado de fichas", "Permisos y justificaciones", "Gestión de turnos", "Validación DT"],
  },
  {
    key: "asistencia",
    title: "Asistencia",
    desc: "Control preciso, en tiempo real",
    items: ["Supervisión integral", "Marcas registradas", "Mapa de cobertura", "Gestión de dispositivos"],
  },
  {
    key: "comunicaciones",
    title: "Comunicaciones",
    desc: "Mensajes y encuestas sin fricción",
    items: ["Envío de mensajes", "Plantillas", "Encuestas de clima", "Dashboard"],
  },
  {
    key: "reporteria",
    title: "Reportería",
    desc: "Datos que cuentan historias",
    items: ["Informes gerenciales", "Dashboards y presentaciones", "Gestión de documentos", "Integraciones"],
  },
  {
    key: "cuida",
    title: "Tictiva Cuida",
    desc: "Bienestar con ADIA integrado",
    items: ["ADIA (IA central)", "Test psicológicos", "Dashboard de bienestar", "+ Integrado con RRHH"],
  },
  {
    key: "bodega",
    title: "Bodega & EPP",
    desc: "Inventario al servicio del equipo",
    items: ["Inventario", "Colaboradores", "Operaciones", "Alertas"],
  },
];

const ADIA_TIPS = {
  rrhh: "ADIA: Mantén actualizadas las fichas para agilizar permisos y procesos.",
  asistencia: "ADIA: Revisa el mapa de cobertura para detectar puntos ciegos en terreno.",
  comunicaciones: "ADIA: Usa plantillas para unificar el tono y ahorrar tiempo.",
  reporteria: "ADIA: Programa tus informes para que se envíen automáticamente cada lunes.",
  cuida: "ADIA: Un check-in breve semanal mejora el clima sin saturar a tu equipo.",
  bodega: "ADIA: Define mínimos por EPP para evitar quiebres de stock inesperados.",
};

function AdiaTip({ moduleKey }) {
  const tip = ADIA_TIPS[moduleKey] || "ADIA: Consejos contextuales aparecerán aquí.";
  return (
    <div className="adiaTip">
      <div className="adiaTipIcon">💡</div>
      <div>
        <div className="adiaTipTitle">Tip de ADIA</div>
        <div className="adiaTipText">{tip}</div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [open, setOpen] = useState(null); // moduleKey o null
  const selected = useMemo(() => MODULES.find(m => m.key === open), [open]);

  return (
    <div className="dashboardPage">
      <div className="dashboardContainer">
        {/* Encabezado */}
        <header className="dashHeader">
          <div className="dashBrand">
            <span className="brandDot" />
            <span className="brandName">Tictiva Plataforma</span>
          </div>
          <div className="dashGreetings">
            <h1 className="dashTitle">Buenas tardes, Verónica Mateo</h1>
            <p className="dashMotto">“Creemos en la fuerza del trabajo bien hecho, incluso cuando nadie lo ve”.</p>
          </div>
          {/* Barra de búsqueda (no funcional por ahora) */}
          <div className="dashSearch">
            <input className="dashSearchInput" placeholder="Buscar módulos o escribe / para comandos" />
          </div>
        </header>

        {/* KPIs superiores */}
        <section className="kpis">
          {KPIS.map(k => (
            <div key={k.key} className="kpiCard">
              <div className="kpiLabel">{k.label}</div>
              <div className="kpiValue">{k.value}</div>
            </div>
          ))}
        </section>

        {/* Texto guía */}
        <section className="dashSubtitleCard">
          <div>
            <div className="dashSubtitleTitle">Humanizamos la gestión, digitalizamos tu tranquilidad</div>
            <div className="dashSubtitleText">Accede a tus módulos. Todo es simple, rápido y consistente.</div>
          </div>
        </section>

        {/* Grid de módulos (sin chips “Juvenil/Empresarial/Moderno”) */}
        <section className="modulesGrid">
          {MODULES.map(m => (
            <article key={m.key} className="moduleCard">
              <div className="moduleIcon" />
              <div className="moduleHeader">
                <h3 className="moduleTitle">{m.title}</h3>
                <p className="moduleDesc">{m.desc}</p>
              </div>
              <ul className="moduleList">
                {m.items.map(it => <li key={it}>{it}</li>)}
              </ul>
              <button className="moduleOpen" onClick={() => setOpen(m.key)}>
                Abrir módulo <span className="arrow">›</span>
              </button>
            </article>
          ))}
        </section>
      </div>

      {/* Push panel derecho con Tip de ADIA */}
      <div className={`backdrop ${open ? "show" : ""}`} onClick={() => setOpen(null)} />
      <aside className={`sidePanel ${open ? "open" : ""}`} aria-hidden={!open}>
        <header className="panelHeader">
          <div className="panelTitle">{selected?.title || "Módulo"}</div>
          <button className="panelClose" onClick={() => setOpen(null)}>✕</button>
        </header>
        <div className="panelBody">
          {selected && (
            <>
              <p className="panelDesc">{selected.desc}</p>
              <h4 className="panelSubtitle">Accesos rápidos</h4>
              <ul className="panelLinks">
                {selected.items.map(it => (
                  <li key={it}>
                    <a href="#" onClick={e => e.preventDefault()}>{it}</a>
                  </li>
                ))}
              </ul>

              {/* Tip contextual de ADIA */}
              <AdiaTip moduleKey={selected.key} />
            </>
          )}
        </div>
        <footer className="panelFooter">
          <button className="btnPrimary" onClick={() => alert("Navegación real se conectará luego")}>
            Entrar al módulo
          </button>
        </footer>
      </aside>
    </div>
  );
}
