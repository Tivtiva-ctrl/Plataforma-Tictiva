// src/components/Dashboard.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { ROUTES } from "../routes";

/* ===== Iconografía (sin emojis) ===== */
const Icon = ({ name }) => {
  const size = 22;
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true };
  switch (name) {
    case "users": return (
      <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    );
    case "clock": return (
      <svg {...common}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
    );
    case "chat": return (
      <svg {...common}><path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/></svg>
    );
    case "chart": return (
      <svg {...common}><path d="M3 3v18h18"/><rect x="7" y="13" width="3" height="5"/><rect x="12" y="9" width="3" height="9"/><rect x="17" y="5" width="3" height="13"/></svg>
    );
    case "heart": return (
      <svg {...common}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-.94-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.35 20.84 12.5a5.5 5.5 0 0 0 0-7.89z"/></svg>
    );
    default: return null;
  }
};

/* Navegación segura */
function safeGo(navigate, to) {
  if (typeof to === "string" && to.length > 0) navigate(to);
  else {
    alert("Este submódulo estará disponible pronto.");
    // eslint-disable-next-line no-console
    console.warn("[Dashboard] Ruta no disponible:", to);
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [openModule, setOpenModule] = useState(null);

  const MODULES = useMemo(
    () => [
      {
        id: "rrhh",
        color: "#2E6CF6",
        title: "Recursos Humanos",
        icon: "users",
        description: "Gestiona fichas, contratos y documentación legal.",
        quick: [
          { label: "Listado y Fichas", to: ROUTES.listadoFichas },
          { label: "Permisos y Justificaciones", to: ROUTES.rrhhPermisos },
          { label: "Validación DT", to: ROUTES.rrhhValidacionDT },
          { label: "Repositorio Documental", to: ROUTES.rrhhDocumentos },
          { label: "Bodega y EPP", to: "/rrhh/bodega/dashboard" },
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
        description: "Control de horarios, marcas y gestión de turnos.",
        quick: [
          { label: "Supervisión Integral", to: ROUTES.asistenciaSupervision },
          { label: "Marcas Registradas", to: ROUTES.asistenciaMarcas },
          { label: "Mapa de Cobertura", to: ROUTES.asistenciaMapa },
          { label: "Gestión de Dispositivos", to: ROUTES.asistenciaDispositivos },
          { label: "Gestión de Turnos y Jornadas", to: ROUTES.asistenciaTurnos },
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
        description: "Mensajería, encuestas y comunicados para tu equipo.",
        quick: [
          { label: "Enviar mensaje", to: null },
          { label: "Plantillas", to: null },
          { label: "Encuestas", to: null },
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
        title: "Reportes",
        icon: "chart",
        description: "Informes gerenciales y análisis de datos.",
        quick: [
          { label: "Informes Gerenciales", to: null },
          { label: "Dashboards", to: null },
          { label: "Documentos", to: ROUTES.rrhhDocumentos },
        ],
        all: [
          { label: "Informes Gerenciales", to: null },
          { label: "Dashboards", to: null },
          { label: "Documentos", to: ROUTES.rrhhDocumentos },
        ],
      },
      {
        id: "cuida",
        color: "#F97316",
        title: "Tictiva Cuida",
        icon: "heart",
        description: "Bienestar psicoemocional y salud organizacional.",
        quick: [
          { label: "Test Psicológicos", to: null },
          { label: "Dashboard de Bienestar", to: null },
          { label: "VictorIA", to: null },
        ],
        all: [
          { label: "Test Psicológicos", to: null },
          { label: "Dashboard de Bienestar", to: null },
          { label: "VictorIA", to: null },
        ],
      },
    ],
    []
  );

  return (
    <div className="dash">
      <div className="dash__header">
        <div className="dash__brand">
          <span className="dash__logo" aria-hidden="true" />
          <span className="dash__brandText">Tictiva</span>
        </div>
        <h1 className="dash__title">Buenas tardes, Verónica Mateo</h1>
        <p className="dash__subtitle">"Creemos en la fuerza del trabajo bien hecho, incluso cuando nadie lo ve."</p>

        <div className="dash__tip">
          <span className="dash__tipIcon">💡</span>
          <span className="dash__tipText">
            <strong>Tip de VictorIA:</strong> Revisa{" "}
            <button className="dash__linkBtn" onClick={() => safeGo(navigate, ROUTES.rrhhPermisos)}>Permisos</button>{" "}
            y{" "}
            <button className="dash__linkBtn" onClick={() => safeGo(navigate, ROUTES.rrhhValidacionDT)}>Validación DT</button>{" "}
            en RR.HH.
          </span>
        </div>
      </div>

      <div className="dash__grid">
        {MODULES.map((mod) => (
          <article key={mod.id} className="mod">
            <div className="mod__topBar" style={{ background: mod.color }} />
            <header className="mod__header" onClick={() => setOpenModule(mod.id)} role="button" tabIndex={0}>
              <div className="mod__badge" style={{ color: mod.color }}>
                <Icon name={mod.icon} />
              </div>
              <div>
                <h3 className="mod__title">{mod.title}</h3>
                <p className="mod__desc">{mod.description}</p>
              </div>
            </header>

            <ul className="mod__quick">
              {mod.quick.map((q, i) => (
                <li key={i}>
                  <button className="mod__quickBtn" onClick={() => safeGo(navigate, q.to)}>
                    <span className="mod__dot" /> {q.label}
                  </button>
                </li>
              ))}
            </ul>

            <footer className="mod__footer">
              <button className="mod__enter" onClick={() => setOpenModule(mod.id)}>
                Abrir módulo →
              </button>
            </footer>
          </article>
        ))}
      </div>

      {openModule && (
        <Drawer
          module={MODULES.find((m) => m.id === openModule)}
          onClose={() => setOpenModule(null)}
          onGo={(to) => safeGo(navigate, to)}
        />
      )}
    </div>
  );
}

function Drawer({ module, onClose, onGo }) {
  if (!module) return null;
  return (
    <>
      <div className="drawer__backdrop" onClick={onClose} />
      <aside className="drawer">
        <div className="drawer__head" style={{ borderTopColor: module.color }}>
          <div className="drawer__badge" style={{ color: module.color }}>
            <Icon name={module.icon} />
          </div>
          <div>
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
