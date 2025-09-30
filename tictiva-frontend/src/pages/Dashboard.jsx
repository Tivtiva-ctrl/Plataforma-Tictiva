import React, { useMemo, useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ROUTES, MODULE_ROUTES } from "../router/routes";
import "./DashboardTopbar.css";

/* ===== Helper saludo según hora local ===== */
const getSaludo = (d = new Date()) => {
  const h = d.getHours();
  if (h < 12) return "Buenos días";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
};

/* ===== KPIs (demo) ===== */
const KPIS = [
  { key: "mensajes", label: "Mensajes", value: 3 },
  { key: "marcas", label: "Marcas hoy", value: 128 },
  { key: "dispositivos", label: "Dispositivos activos", value: 5 },
];

/* ===== Módulos ===== */
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

/* ===== Iconitos ===== */
const IconUser = ({ className = "moduleEmoji" }) => (
  <svg className={className} viewBox="0 0 24 24"><circle cx="12" cy="7.5" r="3.5" /><path d="M5 19a7 7 0 0 1 14 0" /></svg>
);
const IconClock = ({ className = "moduleEmoji" }) => (
  <svg className={className} viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><path d="M12 8v5l3 2" /></svg>
);
const IconChat = ({ className = "moduleEmoji" }) => (
  <svg className={className} viewBox="0 0 24 24"><path d="M20 15a3 3 0 0 1-3 3H8l-4 3V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3z" /></svg>
);
const IconBars = ({ className = "moduleEmoji" }) => (
  <svg className={className} viewBox="0 0 24 24"><path d="M4 19h16" /><path d="M7 17V10h3v7" /><path d="M12 17V6h3v11" /><path d="M17 17v-5h3v5" /></svg>
);
const IconHeart = ({ className = "moduleEmoji" }) => (
  <svg className={className} viewBox="0 0 24 24"><path d="M20.8 8.6a5.5 5.5 0 0 0-9-1.6 5.5 5.5 0 0 0-9 1.6C2.8 12.8 12 19 12 19s9.2-6.2 8.8-10.4z" /></svg>
);
const IconBox = ({ className = "moduleEmoji" }) => (
  <svg className={className} viewBox="0 0 24 24"><path d="M12 3l9 4.5v9L12 21 3 16.5v-9L12 3z" /><path d="M12 3v18" /><path d="M21 7.5 12 12 3 7.5" /></svg>
);

const MODULE_ICONS = { rrhh: IconUser, asistencia: IconClock, comunicaciones: IconChat, reporteria: IconBars, cuida: IconHeart, bodega: IconBox };

const ADIA_TIPS = {
  rrhh: "ADIA: Mantén actualizadas las fichas para agilizar permisos y procesos.",
  asistencia: "ADIA: Revisa el mapa de cobertura para detectar puntos ciegos en terreno.",
  comunicaciones: "ADIA: Usa plantillas para unificar el tono y ahorrar tiempo.",
  reporteria: "ADIA: Programa tus informes para que se envíen automáticamente cada lunes.",
  cuida: "ADIA: Un check-in breve semanal mejora el clima sin saturar a tu equipo.",
  bodega: "ADIA: Define mínimos por EPP para evitar quiebres de stock inesperados.",
};

/* ===== Utils buscador ===== */
const normalize = (s) =>
  (s || "").toString().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

const buildSearchIndex = (modules) => {
  const rows = [];
  modules.forEach((m) => {
    rows.push({ id: `m:${m.key}`, type: "module", moduleKey: m.key, title: m.title, subtitle: m.desc, tokens: `${m.title} ${m.desc}` });
    (m.items || []).forEach((it, i) => {
      rows.push({ id: `i:${m.key}:${i}`, type: "item", moduleKey: m.key, title: it, subtitle: m.title, tokens: `${m.title} ${it}` });
    });
  });
  return rows.map((r) => ({ ...r, norm: normalize(r.tokens) }));
};
const index = buildSearchIndex(MODULES);

export default function Dashboard({ userName = "Verónica Mateo", onLogout }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);
  const selected = useMemo(() => MODULES.find((m) => m.key === open), [open]);

  const [saludo, setSaludo] = useState(getSaludo());
  useEffect(() => {
    const id = setInterval(() => setSaludo(getSaludo()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="dashboardPage">
      <div className="dashboardContainer">
        {/* Saludo */}
        <header className="pageHead">
          <h1 className="dashTitle">{saludo}, {userName}</h1>
          <p className="dashMotto">“Creemos en la fuerza del trabajo bien hecho, incluso cuando nadie lo ve”.</p>
        </header>

        {/* KPIs */}
        <section className="dashIntro">
          <div className="introText">
            <div className="dashSubtitleTitle">Humanizamos la gestión, digitalizamos tu tranquilidad</div>
            <div className="dashSubtitleText">Accede a tus módulos. Todo es simple, rápido y consistente.</div>
          </div>
          <div className="introKpis">
            {KPIS.map((k) => (
              <div key={k.key} className="introKpiCard">
                <div className="introKpiLabel">{k.label}</div>
                <div className="introKpiValue">{k.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Grid módulos */}
        <section className="modulesGrid">
          {MODULES.map((m) => {
            const Ico = MODULE_ICONS[m.key] || IconBars;
            return (
              <article key={m.key} className="moduleCard">
                <div className="moduleHeaderRow">
                  <div className="moduleIcon"><Ico /></div>
                  <h3 className="moduleTitle">{m.title}</h3>
                </div>
                <p className="moduleDesc">{m.desc}</p>
                <ul className="moduleList">
                  {m.items.map((it) => (<li key={it}>{it}</li>))}
                </ul>
                <button className="moduleOpen" onClick={() => setOpen(m.key)}>Abrir módulo ›</button>
              </article>
            );
          })}
        </section>
      </div>

      {/* Panel lateral */}
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

              {selected.key === "rrhh" ? (
                <ul className="panelLinks">
                  <li>
                    <Link to={ROUTES.rrhh.listadoFichas} className="panelLinkBtn" onClick={() => setOpen(null)}>Listado de fichas</Link>
                  </li>
                  <li><button className="panelLinkBtn" disabled>Permisos y justificaciones</button></li>
                  <li><button className="panelLinkBtn" disabled>Gestión de turnos</button></li>
                  <li><button className="panelLinkBtn" disabled>Validación DT</button></li>
                </ul>
              ) : (
                <ul className="panelLinks">
                  {(selected.items || []).map((it) => (
                    <li key={it}><button className="panelLinkBtn" disabled>{it}</button></li>
                  ))}
                </ul>
              )}

              <div className="adiaTip">
                <div className="adiaTipIcon">💡</div>
                <div>
                  <div className="adiaTipTitle">Tip de ADIA</div>
                  <div className="adiaTipText">{ADIA_TIPS[selected.key] || "ADIA: Consejos contextuales aparecerán aquí."}</div>
                </div>
              </div>
            </>
          )}
        </div>
        <footer className="panelFooter">
          <button className="btnEmbossed" onClick={() => setOpen(null)}>Cerrar</button>
        </footer>
      </aside>
    </div>
  );
}
