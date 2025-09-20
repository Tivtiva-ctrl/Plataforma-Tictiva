// src/components/Dashboard.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../router/routes"; 
import "./Dashboard.css";

/* ===== Iconos SVG ===== */
const Icon = ({ name, size = 24, className = "" }) => {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24",
    fill: "none", stroke: "currentColor", strokeWidth: "2",
    strokeLinecap: "round", strokeLinejoin: "round",
    "aria-hidden": true, className: `icon ${className}`
  };
  switch (name) {
    case "lightbulb": return (<svg {...p}><path d="M12 2a9 9 0 0 0-9 9c0 4.4 3.6 8 8 8v3a1 1 0 0 0 2 0v-3c4.4 0 8-3.6 8-8a9 9 0 0 0-9-9zM12 14a3 3 0 0 1-3-3h6a3 3 0 0 1-3 3z"/></svg>);
    case "id-card": return (<svg {...p}><rect x="3" y="4" width="18" height="16" rx="2" ry="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="7" y1="15" x2="9" y2="15"/></svg>);
    case "file-signature": return (<svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M16 18h-4"/><path d="M12 12v6"/></svg>);
    case "users": return (<svg {...p}><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>);
    case "clock": return (<svg {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>);
    case "eye": return (<svg {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>);
    case "map-pin": return (<svg {...p}><path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0"/><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>);
    case "smartphone": return (<svg {...p}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>);
    case "mail": return (<svg {...p}><rect x="2" y="5" width="20" height="14" rx="2" ry="2"/><path d="M22 7L12 13 2 7"/></svg>);
    case "file-text": return (<svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>);
    case "pie-chart": return (<svg {...p}><path d="M12 20v-8h8"/><path d="M12 20a8 8 0 1 0-8-8c0 .7.1 1.4.2 2"/><path d="M12 20c-4.4 0-8-3.6-8-8a8 8 0 0 1 8-8"/></svg>);
    case "bar-chart": return (<svg {...p}><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>);
    case "heart": return (<svg {...p}><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-.9-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21.3l8.8-8.8a5.5 5.5 0 0 0 0-7.9z"/></svg>);
    case "search": return (<svg {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>);
    case "info": return (<svg {...p}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>);
    case "chat": return (<svg {...p}><path d="M21 15a4 4 0 0 1-4 4H8l-4 3v-3a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4h13a4 4 0 0 1 4 4z"/></svg>);
    case "chart": return (<svg {...p}><path d="M3 20h18"/><path d="M7 20V10"/><path d="M12 20V4"/><path d="M17 20v-7"/></svg>);
    default: return null;
  }
};

/* ===== Componente Drawer Corregido ===== */
// Acepta 'onNavigate' del componente padre para asegurar que la navegación funcione
function Drawer({ module, onClose, onNavigate }) {
  if (!module) return null;

  const go = (to) => {
    if (typeof to === "string" && to.length) {
      // 1. Navega usando la función del padre
      onNavigate(to);
      // 2. Cierra el panel
      onClose();
    } else {
      alert("Este submódulo estará disponible pronto.");
    }
  };

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
          {(module.all ?? []).map((it, idx) => {
            const clickable = !!it.to;
            return (
              <li key={idx}>
                <button
                  className={`drawer__item ${clickable ? "" : "drawer__item--disabled"}`}
                  onClick={() => clickable && go(it.to)}
                  disabled={!clickable}
                  aria-disabled={!clickable}
                >
                  <span className="drawer__dot" />
                  <span className="drawer__text">{it.label}</span>
                  <span className="drawer__chev">{clickable ? "›" : "•"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
    </>
  );
}


/* ===== Componente Principal del Dashboard ===== */
export default function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const [openModule, setOpenModule] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const MODULES = useMemo(() => [
    { id: "rrhh", title: "RRHH", icon: "users", description: "Gestiona fichas, contratos, permisos y documentación legal.",
      quick: [
        { label: "Fichas", to: ROUTES.listadoFichas, icon: "id-card" },
        { label: "Permisos", to: ROUTES.rrhhPermisos, icon: "file-signature" },
        { label: "Turnos", to: ROUTES.asistenciaTurnos, icon: "clock" },
        { label: "Validación DT", to: ROUTES.rrhhValidacionDT, icon: "users" },
      ],
      all: [
        { label: "Listado y Fichas", to: ROUTES.listadoFichas },
        { label: "Permisos y Justificaciones", to: ROUTES.rrhhPermisos },
        { label: "Validación DT", to: ROUTES.rrhhValidacionDT },
        { label: "Repositorio Documental", to: ROUTES.rrhhDocumentos },
        { label: "Bodega y EPP", to: null },
      ],
    },
    { id: "asistencia", title: "Asistencia", icon: "clock", description: "Controla horarios, marcas, dispositivos y turnos.",
      quick: [
        { label: "Supervisión", to: ROUTES.asistenciaSupervision, icon: "eye" },
        { label: "Marcas registradas", to: ROUTES.asistenciaMarcas, icon: "map-pin" },
        { label: "Mapa de cobertura", to: ROUTES.asistenciaMapa, icon: "map-pin" },
        { label: "Dispositivos", to: ROUTES.asistenciaDispositivos, icon: "smartphone" },
      ],
      all: [
        { label: "Supervisión Integral", to: ROUTES.asistenciaSupervision },
        { label: "Marcas Registradas", to: ROUTES.asistenciaMarcas },
        { label: "Mapa de Cobertura", to: ROUTES.asistenciaMapa },
        { label: "Gestión de Dispositivos", to: ROUTES.asistenciaDispositivos },
        { label: "Gestión de Turnos y Jornadas", to: ROUTES.asistenciaTurnos },
      ],
    },
    { id: "comunicaciones", title: "Comunicaciones", icon: "chat", description: "Envía mensajes, encuestas y comunicados a tu equipo.",
      quick: [
        { label: "Mensajes", to: null, icon: "mail" },
        { label: "Plantillas", to: null, icon: "file-text" },
        { label: "Encuestas de clima", to: null, icon: "pie-chart" },
      ],
      all: [
        { label: "Enviar mensaje", to: null },
        { label: "Plantillas", to: null },
        { label: "Encuestas", to: null },
      ],
    },
    { id: "reporteria", title: "Reportería", icon: "chart", description: "Genera informes, dashboards y comparte resultados.",
      quick: [{ label: "Dashboards y descargas", to: null, icon: "bar-chart" }],
      all: [
        { label: "Informes Gerenciales", to: null },
        { label: "Dashboards", to: null },
        { label: "Documentos", to: ROUTES.rrhhDocumentos },
      ],
    },
    { id: "cuida", title: "Tictiva Cuida", icon: "heart", description: "Monitorea bienestar, aplica tests y recibe apoyo de VictorIA.",
      quick: [{ label: "Bienestar y VictorIA", to: null, icon: "heart" }],
      all: [
        { label: "Test Psicológicos", to: null },
        { label: "Dashboard de Bienestar", to: null },
        { label: "VictorIA", to: null },
      ],
    },
  ], []);

  const safeGo = (to) => {
    if (typeof to === 'string' && to.length) {
        navigate(to);
    } else {
        alert("Este submódulo estará disponible pronto.");
    }
  };

  return (
    <div className="dash">
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
          <h1 className="hero__title">Hola, Verónica 👋</h1>
          <p className="hero__subtitle">Elige un módulo para comenzar</p>
          <div className="tip">
            <div className="tip__icon">
              <Icon name="lightbulb" size={18} />
            </div>
            <div className="tip__text">
              <strong>Tip de VictorIA:</strong> ¡Es fin de mes! Revisa{" "}
              <button className="linkBtn" onClick={() => safeGo(ROUTES.rrhhPermisos)}>Permisos</button>{" "}
              y{" "}
              <button className="linkBtn" onClick={() => safeGo(ROUTES.rrhhValidacionDT)}>Validación DT</button>{" "}
              en RR.HH.
            </div>
            <button className="tip__cta" onClick={() => safeGo(ROUTES.rrhhPermisos)}>Ir ahora →</button>
          </div>
          <div className="hero__stats">
            <span><strong>Hoy:</strong> 154 marcas</span>
            <span><strong>Mensajes:</strong> 3 nuevos</span>
            <span><strong>Encuestas:</strong> 2 activas</span>
          </div>
        </div>
      </section>

      <div className="grid">
        {MODULES.map((m) => (
          <article key={m.id} className={`card ${m.id}`}>
            <header className="card__head" onClick={() => setOpenModule(m)}>
              <div className="card__icon">
                <Icon name={m.icon} size={24} />
              </div>
              <h3 className="card__title">{m.title}</h3>
            </header>
            <p className="card__desc">{m.description}</p>
            <ul className="card__list">
              {m.quick.map((q, i) => (
                <li key={i} onClick={() => safeGo(q.to)}>
                  <Icon name={q.icon || "info"} size={16} />
                  <span>{q.label}</span>
                </li>
              ))}
            </ul>
            <footer className="card__foot">
              <button className="card__open" onClick={() => setOpenModule(m)}>Abrir módulo →</button>
            </footer>
          </article>
        ))}
      </div>

      {openModule && (
        <Drawer
          module={openModule}
          onClose={() => setOpenModule(null)}
          onNavigate={navigate} 
        />
      )}
    </div>
  );
}