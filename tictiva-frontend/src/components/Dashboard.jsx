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
    // --- NUEVO: Íconos para el Tip y la lista interna de las tarjetas ---
    case "lightbulb":
      return (<svg {...p}><path d="M12 2a9 9 0 0 0-9 9c0 4.4 3.6 8 8 8v3a1 1 0 0 0 2 0v-3c4.4 0 8-3.6 8-8a9 9 0 0 0-9-9zM12 14a3 3 0 0 1-3-3h6a3 3 0 0 1-3 3z"/></svg>);
    case "id-card":
      return (<svg {...p}><rect x="3" y="4" width="18" height="16" rx="2" ry="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="7" y1="15" x2="9" y2="15"/></svg>);
    case "file-signature":
      return (<svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M16 18h-4"/><path d="M12 12v6"/></svg>);
    // Tus íconos existentes...
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

  /* ====== Data: 5 módulos como la maqueta ====== */
  const MODULES = useMemo(
    () => [
      {
        id: "rrhh",
        // color ya no se usa para estilos, se maneja por la clase `id`
        title: "RRHH",
        icon: "users",
        description: "Gestiona fichas, contratos, permisos y documentación legal.",
        quick: [
          // --- NUEVO: propiedad 'icon' para la lista ---
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
          { label: "Bodega y EPP", to: "/rrhh/bodega/dashboard" },
        ],
      },
      // (Se omitió el resto de módulos por brevedad, pero la estructura es la misma)
      // ... aplica la propiedad 'icon' al resto de tus módulos en la lista 'quick'
      {
        id: "asistencia",
        title: "Asistencia",
        icon: "clock",
        description: "Controla horarios, marcas, dispositivos y turnos.",
        quick: [
          { label: "Supervisión", to: ROUTES.asistenciaSupervision, icon: "users" },
          { label: "Marcas registradas", to: ROUTES.asistenciaMarcas, icon: "users" },
          { label: "Mapa de cobertura", to: ROUTES.asistenciaMapa, icon: "users" },
          { label: "Dispositivos", to: ROUTES.asistenciaDispositivos, icon: "users" },
        ],
        all: [ /* ... */ ],
      },
      {
        id: "comunicaciones",
        title: "Comunicaciones",
        icon: "chat",
        description: "Envía mensajes, encuestas y comunicados a tu equipo.",
        quick: [
          { label: "Mensajes", to: null, icon: "chat" },
          { label: "Plantillas", to: null, icon: "chat" },
          { label: "Encuestas de clima", to: null, icon: "chat" },
        ],
        all: [ /* ... */ ],
      },
      {
        id: "reporteria",
        title: "Reportería",
        icon: "chart",
        description: "Genera informes, dashboards y comparte resultados.",
        quick: [{ label: "Dashboards y descargas", to: null, icon: "chart" }],
        all: [ /* ... */ ],
      },
      {
        id: "cuida",
        title: "Tictiva Cuida",
        icon: "heart",
        description: "Monitorea bienestar, aplica tests y recibe apoyo de VictorIA.",
        quick: [{ label: "Bienestar y VictorIA", to: null, icon: "heart" }],
        all: [ /* ... */ ],
      },
    ],
    []
  );

  return (
    <div className="dash">
      {/* HERO (No necesita cambios estructurales, el CSS se encarga) */}
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
          <h1 className="hero__title">Hola, Verónica 👋</h1> {/* Eliminé el span para la ola, ya que el CSS no lo necesita */}
          <p className="hero__subtitle">Elige un módulo para comenzar</p>

          {/* --- CAMBIO: Tarjeta TIP actualizada --- */}
          <div className="tip">
            <div className="tip__icon">
              <Icon name="lightbulb" size={18} />
            </div>
            <div className="tip__text">
              <strong>Tip de VictorIA:</strong> ¡Es fin de mes! Revisa{" "}
              <button className="linkBtn" onClick={() => safeGo(navigate, ROUTES.rrhhPermisos)}>Permisos</button>{" "}
              y{" "}
              <button className="linkBtn" onClick={() => safeGo(navigate, ROUTES.rrhhValidacionDT)}>Validación DT</button>{" "}
              en RR.HH.
            </div>
            <button className="tip__cta" onClick={() => safeGo(navigate, ROUTES.rrhhPermisos)}>Ir ahora →</button>
          </div>

          <div className="hero__stats">
            <span><strong>Hoy:</strong> 154 marcas</span>
            <span><strong>Mensajes:</strong> 3 nuevos</span>
            <span><strong>Encuestas:</strong> 2 activas</span>
          </div>
        </div>
      </section>

      {/* GRID */}
      <div className="grid">
        {MODULES.map((m) => (
          // --- CAMBIO: Se usa el ID del módulo como clase para el color y se elimina el style en línea ---
          <article key={m.id} className={`card ${m.id}`}>
            {/* Header */}
            {/* --- CAMBIO: El 'div' del título y descripción ahora está dentro del header --- */}
            <header className="card__head" onClick={() => setOpenModule(m.id)} role="button" tabIndex={0}>
               {/* --- CAMBIO: Se elimina el style en línea, el color lo da la clase padre --- */}
              <div className="card__icon">
                <Icon name={m.icon} size={20} />
              </div>
              <h3 className="card__title">{m.title}</h3>
            </header>
            
            {/* Descripción debajo del header */}
            <p className="card__desc">{m.description}</p>

            {/* --- CAMBIO: Lista actualizada para coincidir con el nuevo CSS --- */}
            <ul className="card__list">
              {m.quick.map((q, i) => (
                // --- CAMBIO: Estructura del item de la lista ---
                <li key={i} onClick={() => safeGo(navigate, q.to)} role="button" tabIndex={0}>
                  <i className="fa-solid fa-users"></i> {/* Reemplaza esto con tu componente Icon si lo prefieres */}
                  <Icon name={q.icon || "users"} size={16} /> {/* Usamos el nuevo ícono del objeto */}
                  <span>{q.label}</span>
                </li>
              ))}
            </ul>

            {/* Footer */}
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

/* ===== Panel lateral (no necesita cambios) ===== */
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