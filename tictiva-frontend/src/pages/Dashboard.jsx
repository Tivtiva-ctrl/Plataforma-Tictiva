import React, { useMemo, useState, useRef, useEffect } from "react";
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

/* ===== Utilidades de búsqueda ===== */
const normalize = (s) =>
  (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const buildSearchIndex = (modules) => {
  const rows = [];
  modules.forEach((m) => {
    rows.push({
      id: `m:${m.key}`,
      type: "module",
      moduleKey: m.key,
      title: m.title,
      subtitle: m.desc,
      tokens: `${m.title} ${m.desc}`,
    });
    (m.items || []).forEach((it, i) => {
      rows.push({
        id: `i:${m.key}:${i}`,
        type: "item",
        moduleKey: m.key,
        title: it,
        subtitle: m.title,
        tokens: `${m.title} ${it}`,
      });
    });
  });
  return rows.map((r) => ({ ...r, norm: normalize(r.tokens) }));
};

const index = buildSearchIndex(MODULES);

export default function Dashboard({ userName = "Verónica Mateo", onLogout }) {
  const [open, setOpen] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const selected = useMemo(() => MODULES.find((m) => m.key === open), [open]);

  /* Saludo dinámico */
  const [saludo, setSaludo] = useState(getSaludo());
  useEffect(() => {
    const id = setInterval(() => setSaludo(getSaludo()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  /* Cerrar menú usuario al hacer click fuera o con Esc */
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

  /* ===== Buscador ===== */
  const [query, setQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const searchWrapRef = useRef(null);
  const searchInputRef = useRef(null);

  // Abrir foco con "/"
  useEffect(() => {
    const onSlash = (e) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        const el = e.target;
        const typingInInput =
          el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
        if (!typingInInput) {
          e.preventDefault();
          searchInputRef.current?.focus();
          setShowSearch(true);
        }
      }
    };
    document.addEventListener("keydown", onSlash);
    return () => document.removeEventListener("keydown", onSlash);
  }, []);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const onDocClick = (e) => {
      if (!searchWrapRef.current) return;
      if (!searchWrapRef.current.contains(e.target)) {
        setShowSearch(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const results = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return [];
    return index
      .filter((r) => r.norm.includes(q))
      .slice(0, 8); // top 8
  }, [query]);

  const openResult = (r) => {
    setOpen(r.moduleKey); // abre panel del módulo
    setShowSearch(false);
    setActiveIdx(-1);
    // Si es un acceso específico, aquí podrías navegar realmente:
    if (r.type === "item") {
      console.log("Abrir acceso:", r.title, "de", r.subtitle);
    } else {
      console.log("Abrir módulo:", r.title);
    }
  };

  const onSearchKeyDown = (e) => {
    if (!showSearch && ["ArrowDown", "ArrowUp"].includes(e.key)) {
      setShowSearch(true);
    }
    if (e.key === "Escape") {
      setShowSearch(false);
      setActiveIdx(-1);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (results[activeIdx]) {
        e.preventDefault();
        openResult(results[activeIdx]);
      }
    }
  };

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

          <div className="topbarRight" ref={searchWrapRef}>
            <div className="searchBox">
              <input
                ref={searchInputRef}
                className="topSearch"
                placeholder="Buscar módulos o escribe / para comandos"
                aria-label="Buscar módulos"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSearch(true);
                }}
                onFocus={() => setShowSearch(query.trim().length > 0)}
                onKeyDown={onSearchKeyDown}
              />
              {/* Dropdown resultados */}
              {showSearch && (
                <div className="searchDropdown" role="listbox">
                  {results.length === 0 ? (
                    <div className="searchEmpty">Escribe para buscar módulos y accesos…</div>
                  ) : (
                    results.map((r, i) => (
                      <button
                        key={r.id}
                        role="option"
                        className={`searchItem ${i === activeIdx ? "active" : ""}`}
                        onMouseEnter={() => setActiveIdx(i)}
                        onMouseLeave={() => setActiveIdx(-1)}
                        onClick={() => openResult(r)}
                      >
                        <div className="searchPrimary">{r.title}</div>
                        <div className="searchSecondary">
                          {r.type === "item" ? r.subtitle : "Módulo"}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

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
          <h1 className="dashTitle">{saludo}, {userName}</h1>
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
