// src/components/Dashboard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { ROUTES } from "../routes";

/* ===== Iconos SVG (outline, sin emojis) ===== */
const Icon = ({ name, size = 24 }) => {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: "2",
    strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true
  };
  switch (name) {
    case "users":
      return (<svg {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
    case "clock":
      return (<svg {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>);
    case "chat":
      return (<svg {...p}><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 19v2l3-2"/></svg>);
    case "chart":
      return (<svg {...p}><path d="M3 3v18h18"/><rect x="7" y="13" width="3" height="5" rx="1"/><rect x="12" y="9" width="3" height="9" rx="1"/><rect x="17" y="5" width="3" height="13" rx="1"/></svg>);
    case "heart":
      return (<svg {...p}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-.9-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21.3l8.8-8.8a5.5 5.5 0 0 0 0-7.9z"/></svg>);
    case "building":
      return (<svg {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 7h.01M9 11h.01M9 15h.01M15 7h.01M15 11h.01M15 15h.01M12 21v-4"/></svg>);
    case "search":
      return (<svg {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>);
    default:
      return null;
  }
};

function safeGo(navigate, to) {
  if (typeof to === "string" && to.length) navigate(to);
  else {
    alert("Este submódulo estará disponible pronto.");
    console.warn("[Dashboard] Ruta no disponible:", to);
  }
}

export default function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const [openModule, setOpenModule] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setOpenMenu(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const MODULES = useMemo(
    () => [
      {
        id: "rrhh",
        color: "#336DFF",
        title: "RRHH",
        icon: "users",
        description: "Fichas, turnos y validación DT",
        quick: [
          { label: "Fichas", to: ROUTES.listadoFichas },
          { label: "Permisos • Instalaciones", to: ROUTES.rrhhPermisos },
        ],
        all: [
          { label: "Listado y Fichas", to: ROUTES.listadoFichas },
          { label: "Permisos y Justificaciones", to: ROUTES.rrhhPermisos },
          { label: "Validación DT", to: ROUTES.rrhhValidacionDT },
          { label: "Repositorio Documental", to: ROUTES.rrhhDocumentos },
          { label: "Bodega y EPP", to: "/rrhh/bodega/dashboard" },
        ],
      },
      {
        id: "asistencia",
        color: "#16A34A",
        title: "Asistencia",
        icon: "clock",
        description: "Marcas, mapas y dispositivos",
        quick: [
          { label: "Supervisión", to: ROUTES.asistenciaSupervision },
          { label: "Mapa de cobertura • Dispositivos", to: ROUTES.asistenciaMapa },
        ],
        all: [
          { label: "Supervisión Integral", to: ROUTES.asistenciaSupervision },
          { label: "Marcas Registradas", to: ROUTES.asistenciaMarcas },
          { label: "Mapa de Cobertura", to: ROUTES.asistenciaMapa },
          { label: "Gestión de Dispositivos", to: ROUTES.asistenciaDispositivos },
          { label: "Gestión de Turnos y Jornadas", to: ROUTES.asistenciaTurnos },
        ],
      },
      {
        id: "comunicaciones",
        color: "#7C3AED",
        title: "Comunicaciones",
        icon: "chat",
        description: "Mensajes, plantillas y encuestas",
        quick: [
          { label: "Mensajes", to: null },
          { label: "Plantillas", to: null },
        ],
        all: [
          { label: "Enviar mensaje", to: null },
          { label: "Plantillas", to: null },
          { label: "Encuestas", to: null },
        ],
      },
      {
        id: "reporteria",
        color: "#EC4899",
        title: "Reportería",
        icon: "chart",
        description: "Dashboards y descargas",
        quick: [{ label: "Dashboards y descargas", to: null }],
        all: [
          { label: "Informes Gerenciales", to: null },
          { label: "Dashboards", to: null },
          { label: "Documentos", to: ROUTES.rrhhDocumentos },
        ],
      },
      {
        id: "cuida",
        color: "#0284C7",
        title: "Tictiva Cuida",
        icon: "heart",
        description: "Bienestar y VictorIA",
        quick: [{ label: "Bienestar y VictorIA", to: null }],
        all: [
          { label: "Test Psicológicos", to: null },
          { label: "Dashboard de Bienestar", to: null },
          { label: "VictorIA", to: null },
        ],
      },
      {
        id: "instalaciones",
        color: "#3B82F6",
        title: "Instalaciones",
        icon: "building",
        description: "Centros y ubicaciones",
        quick: [{ label: "Centros y ubicaciones", to: null }],
        all: [
          { label: "Centros", to: null },
          { label: "Ubicaciones", to: null },
        ],
      },
    ],
    []
  );

  return (
    <div className="dash">
      {/* HERO grande con barra superior y línea divisoria */}
      <section className="hero">
        <div className="hero__rail">
          <div className="hero__brand">
            <span className="hero__logo" aria-hidden />
            <span className="hero__brandText">Tictiva</span>
          </div>

          <div className="hero__tools" ref={menuRef}>
            <div className="hero__search">
              <Icon name="search" size={18} />
              <input placeholder="Buscar en Tictiva…" />
            </div>
            <button className="hero__avatar" onClick={() => setOpenMenu(v => !v)} aria-label="Perfil">V</button>
            {openMenu && (
              <div className="hero__menu">
                <button className="hero__menuItem">Configuración</button>
                <button className="hero__menuItem hero__menuItem--danger" onClick={onLogout}>Cerrar sesión</button>
              </div>
            )}
          </div>
        </div>

        <div className="hero__content">
          <h1 className="hero__title">Hola, Verónica</h1>
          <p className="hero__subtitle">Elige un módulo para comenzar</p>

          <div className="hero__stats">
            <span><strong>Hoy:</strong> 154 marcas</span>
            <span><strong>Mensajes:</strong> 3 nuevos</span>
            <span><strong>Encuestas:</strong> 2 activas</span>
          </div>
        </div>
      </section>

      {/* Tip de VictorIA */}
      <div className="tip">
        <div className="tip__icon">💡</div>
        <div className="tip__text">
          <strong>Tip de VictorIA:</strong> ¡Es fin de mes! Revisa{" "}
          <button className="linkBtn" onClick={() => safeGo(navigate, ROUTES.rrhhPermisos)}>Permisos</button>{" "}
          y{" "}
          <button className="linkBtn" onClick={() => safeGo(navigate, ROUTES.rrhhValidacionDT)}>Validación DT</button>{" "}
          en RR.HH.
        </div>
      </div>

      {/* Grid de tarjetas — compactas como el mock */}
      <div className="grid">
        {MODULES.map((m) => (
          <article key={m.id} className="card">
            <header className="card__head" onClick={() => setOpenModule(m.id)} role="button" tabIndex={0}>
              <div className="card__icon" style={{ borderColor: m.color, color: m.color }}>
                <Icon name={m.icon} />
              </div>
              <div>
                <h3 className="card__title">{m.title}</h3>
                <p className="card__desc">{m.description}</p>
              </div>
            </header>

            <ul className="card__list">
              {m.quick.map((q, i) => (
                <li key={i}>
                  <button className="card__pill" onClick={() => safeGo(navigate, q.to)}>
                    <span className="card__bullet" /> {q.label}
                  </button>
                </li>
              ))}
            </ul>

            <footer className="card__foot">
              <button className="card__open" onClick={() => setOpenModule(m.id)}>Abrir módulo →</button>
            </footer>
          </article>
        ))}
      </div>

      {openModule && (
        <Drawer
          module={MODULES.find(m => m.id === openModule)}
          onClose={() => setOpenModule(null)}
          onGo={(to) => safeGo(navigate, to)}
        />
      )}
    </div>
  );
}

/* ===== Panel lateral ===== */
function Drawer({ module, onClose, onGo }) {
  if (!module) return null;
  return (
    <>
      <div className="drawer__backdrop" onClick={onClose} />
      <aside className="drawer">
        <div className="drawer__head" style={{ borderTopColor: module.color }}>
          <div className="drawer__icon" style={{ color: module.color, borderColor: module.color }}>
            <Icon name={module.icon} size={22} />
          </div>
          <div className="drawer__titwrap">
            <div className="drawer__label">Módulo</div>
            <h3 className="drawer__title">{module.title}</h3>
            <p className="drawer__desc">{module.description}</p>
          </div>
          <button className="drawer__close" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>

        <ul className="drawer__list">
          {module.all.map((it, idx) => (
            <li key={idx}>
              <button className="drawer__item" onClick={() => onGo(it.to)}>
                <span className="drawer__dot" />
                <span className="drawer__text">{it.label}</span>
                <span className="drawer__chev">›</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}
