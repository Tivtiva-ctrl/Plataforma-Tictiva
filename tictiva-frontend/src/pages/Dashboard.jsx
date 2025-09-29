import React, { useMemo, useState, useRef, useEffect } from "react";
import "./DashboardTopbar.css";

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

/* ===== Iconitos de trazo (estilo campana) para cada módulo ===== */
const IconUser = ({ className = "moduleEmoji" }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="7.5" r="3.5" />
    <path d="M5 19a7 7 0 0 1 14 0" />
  </svg>
);
const IconClock = ({ className = "moduleEmoji" }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="8" />
    <path d="M12 8v5l3 2" />
  </svg>
);
const IconChat = ({ className = "moduleEmoji" }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20 15a3 3 0 0 1-3 3H8l-4 3V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3z" />
  </svg>
);
const IconBars = ({ className = "moduleEmoji" }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 19h16" />
    <path d="M7 17V10h3v7" />
    <path d="M12 17V6h3v11" />
    <path d="M17 17v-5h3v5" />
  </svg>
);
const IconHeart = ({ className = "moduleEmoji" }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20.8 8.6a5.5 5.5 0 0 0-9-1.6 5.5 5.5 0 0 0-9 1.6C2.8 12.8 12 19 12 19s9.2-6.2 8.8-10.4z" />
  </svg>
);
const IconBox = ({ className = "moduleEmoji" }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3l9 4.5v9L12 21 3 16.5v-9L12 3z" />
    <path d="M12 3v18" />
    <path d="M21 7.5 12 12 3 7.5" />
  </svg>
);

const MODULE_ICONS = {
  rrhh: IconUser,
  asistencia: IconClock,
  comunicaciones: IconChat,
  reporteria: IconBars,
  cuida: IconHeart,
  bodega: IconBox,
};

const ADIA_TIPS = {
  rrhh: "ADIA: Mantén actualizadas las fichas para agilizar permisos y procesos.",
  asistencia: "ADIA: Revisa el mapa de cobertura para detectar puntos ciegos en terreno.",
  comunicaciones: "ADIA: Usa plantillas para unificar el tono y ahorrar tiempo.",
  reporteria: "ADIA: Programa tus informes para que se envíen automáticamente cada lunes.",
  cuida: "ADIA: Un check-in breve semanal mejora el clima sin saturar a tu equipo.",
  bodega: "ADIA: Define mínimos por EPP para evitar quiebres de stock inesperados.",
};

export default function Dashboard({ userName = "Verónica Mateo", onLogout }) {
  const [open, setOpen] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const selected = useMemo(() => MODULES.find((m) => m.key === open), [open]);

  /* Cerrar menú al hacer click fuera o con Esc */
  const userWrapRef = useRef(null);
  useEffect(() => {
    const onDocClick = (e) => {
      if (!userWrapRef.current) return;
      if (!userWrapRef.current.contains(e.target)) setShowUserMenu(false);
    };
    const onKey = (e) => e.key === "Escape" && setShowUserMenu(false);
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="dashboardPage">
      <div className="dashboardContainer">
        {/* ===== TOPBAR ===== */}
        <div className="topbar">
          <div className="brandBlock">
            <img src="/assets/tictiva-logo.png" alt="Tictiva" className="brandLogo" width={36} height={36} />
            <div className="brandText">
              <div className="brandWelcome">Bienvenido de nuevo</div>
              <div className="brandName">Tictiva Plataforma</div>
            </div>
          </div>

          <div className="topbarRight">
            <input
              className="topSearch"
              placeholder="Buscar módulos o escribe / para comandos"
              aria-label="Buscar módulos"
            />

            {/* Campana */}
            <button className="iconBtn" aria-label="Notificaciones">
              <svg className="bellIcon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 17H9a1 1 0 0 1-1-1V11a4 4 0 0 1 8 0v5a1 1 0 0 1-1 1Z" fill="none" />
                <path d="M5 17h14" />
                <path d="M10 21h4" />
              </svg>
              <span className="badge">3</span>
            </button>

            {/* Chip usuario + dropdown */}
            <div className="userWrap" ref={userWrapRef}>
              <button
                className="userChip"
                onClick={() => setShowUserMenu((v) => !v)}
                aria-expanded={showUserMenu}
                aria-haspopup="menu"
              >
                <span className="userAvatar">VM</span>
                <span className="userName">{userName}</span>
              </button>

              <div className={`userMenu ${showUserMenu ? "open" : ""}`} role="menu">
                <button className="menuItem" disabled>Configuraciones (pronto)</button>
                <button
                  className="menuItem danger"
                  onClick={() => {
                    setShowUserMenu(false);
                    if (typeof onLogout === "function") onLogout();
                  }}
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Saludo ===== */}
        <header className="pageHead">
          <h1 className="dashTitle">Buenas tardes, {userName}</h1>
          <p className="dashMotto">“Creemos en la fuerza del trabajo bien hecho, incluso cuando nadie lo ve”.</p>
        </header>

        {/* ===== Intro + KPIs a la derecha ===== */}
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

        {/* ===== Grid de módulos ===== */}
        <section className="modulesGrid">
          {MODULES.map((m) => {
            const Ico = MODULE_ICONS[m.key] || IconBars;
            return (
              <article key={m.key} className="moduleCard">
                <div className="moduleHeaderRow">
                  <div className="moduleIcon">
                    <Ico />
                  </div>
                  <h3 className="moduleTitle">{m.title}</h3>
                </div>

                <p className="moduleDesc">{m.desc}</p>
                <ul className="moduleList">
                  {m.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
                <button className="moduleOpen" onClick={() => setOpen(m.key)}>
                  Abrir módulo <span className="arrow">›</span>
                </button>
              </article>
            );
          })}
        </section>
      </div>

      {/* ===== Side panel + Tip ADIA ===== */}
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
                {selected.items.map((it) => (
                  <li key={it}>
                    <button type="button" className="panelLinkBtn" onClick={() => console.log("Acceso rápido:", it)}>
                      {it}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="adiaTip">
                <div className="adiaTipIcon">💡</div>
                <div>
                  <div className="adiaTipTitle">Tip de ADIA</div>
                  <div className="adiaTipText">
                    {ADIA_TIPS[selected.key] || "ADIA: Consejos contextuales aparecerán aquí."}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <footer className="panelFooter">
          <button className="btnPrimary" onClick={() => selected && console.log("Entrar:", selected.title)}>
            Entrar al módulo
          </button>
        </footer>
      </aside>
    </div>
  );
}
