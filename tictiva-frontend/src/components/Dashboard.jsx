// src/components/Dashboard.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { ROUTES } from "../routes"; // desde /components sube 1 nivel

// Pequeño helper seguro: navega si hay ruta, si no, avisa.
function safeGo(navigate, to) {
  if (typeof to === "string" && to.length > 0) {
    navigate(to);
  } else {
    // No rompemos la app si ese submódulo aún no existe en las rutas.
    alert("Este submódulo estará disponible pronto.");
    console.warn("[Dashboard] Ruta no disponible para este submódulo:", to);
  }
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [openModule, setOpenModule] = useState(null); // id del módulo abierto en el panel

  // Define aquí los módulos y submódulos que verás en tarjetas y en el panel
  const MODULES = useMemo(
    () => [
      {
        id: "rrhh",
        color: "#2E6CF6",
        title: "Recursos Humanos",
        icon: "👥",
        description: "Gestiona fichas, contratos y documentación legal.",
        quick: [
          { label: "Listado y Fichas", to: ROUTES.listadoFichas },
          { label: "Permisos y Justificaciones", to: ROUTES.rrhhPermisos },
          { label: "Validación DT", to: ROUTES.rrhhValidacionDT },
          { label: "Repositorio Documental", to: ROUTES.rrhhDocumentos },
          { label: "Bodega y EPP", to: "/rrhh/bodega/dashboard" }, // existe vía BODEGA en App.jsx
        ],
        all: [
          { label: "Listado y Fichas", to: ROUTES.listadoFichas, icon: "🗂️" },
          { label: "Permisos y Justificaciones", to: ROUTES.rrhhPermisos, icon: "📝" },
          { label: "Validación DT", to: ROUTES.rrhhValidacionDT, icon: "✅" },
          { label: "Repositorio Documental", to: ROUTES.rrhhDocumentos, icon: "📁" },
          { label: "Bodega y EPP", to: "/rrhh/bodega/dashboard", icon: "📦" },
        ],
      },
      {
        id: "asistencia",
        color: "#16A34A",
        title: "Asistencia",
        icon: "🕒",
        description: "Control de horarios, marcas y gestión de turnos.",
        quick: [
          { label: "Supervisión Integral", to: ROUTES.asistenciaSupervision },
          { label: "Marcas Registradas", to: ROUTES.asistenciaMarcas },
          { label: "Mapa de Cobertura", to: ROUTES.asistenciaMapa },
          { label: "Gestión de Dispositivos", to: ROUTES.asistenciaDispositivos },
          { label: "Gestión de Turnos y Jornadas", to: ROUTES.asistenciaTurnos },
        ],
        all: [
          { label: "Supervisión Integral", to: ROUTES.asistenciaSupervision, icon: "📊" },
          { label: "Marcas Registradas", to: ROUTES.asistenciaMarcas, icon: "✅" },
          { label: "Mapa de Cobertura", to: ROUTES.asistenciaMapa, icon: "🗺️" },
          { label: "Gestión de Dispositivos", to: ROUTES.asistenciaDispositivos, icon: "📱" },
          { label: "Gestión de Turnos y Jornadas", to: ROUTES.asistenciaTurnos, icon: "📅" },
        ],
      },
      {
        id: "comunicaciones",
        color: "#7C3AED",
        title: "Comunicaciones",
        icon: "💬",
        description: "Mensajería, encuestas y comunicados para tu equipo.",
        quick: [
          { label: "Enviar mensaje", to: null },
          { label: "Plantillas", to: null },
          { label: "Encuestas", to: null },
        ],
        all: [
          { label: "Enviar mensaje", to: null, icon: "✉️" },
          { label: "Plantillas", to: null, icon: "📑" },
          { label: "Encuestas", to: null, icon: "📝" },
        ],
      },
      {
        id: "reporteria",
        color: "#EC4899",
        title: "Reportes",
        icon: "📈",
        description: "Informes gerenciales y análisis de datos.",
        quick: [
          { label: "Informes Gerenciales", to: null },
          { label: "Dashboards", to: null },
          { label: "Documentos", to: ROUTES.rrhhDocumentos },
        ],
        all: [
          { label: "Informes Gerenciales", to: null, icon: "📊" },
          { label: "Dashboards", to: null, icon: "📉" },
          { label: "Documentos", to: ROUTES.rrhhDocumentos, icon: "📁" },
        ],
      },
      {
        id: "cuida",
        color: "#F97316",
        title: "Tictiva Cuida",
        icon: "🧠",
        description: "Bienestar psicoemocional y salud organizacional.",
        quick: [
          { label: "Test Psicológicos", to: null },
          { label: "Dashboard de Bienestar", to: null },
          { label: "VictorIA", to: null },
        ],
        all: [
          { label: "Test Psicológicos", to: null, icon: "🧩" },
          { label: "Dashboard de Bienestar", to: null, icon: "❤️" },
          { label: "VictorIA", to: null, icon: "🤖" },
        ],
      },
    ],
    []
  );

  return (
    <div className="dash">
      {/* Encabezado */}
      <div className="dash__header">
        <div className="dash__brand">
          <span className="dash__logo" aria-hidden="true" />
          <span className="dash__brandText">Tictiva</span>
        </div>
        <h1 className="dash__title">Buenas tardes, Verónica Mateo 👋</h1>
        <p className="dash__subtitle">
          "Creemos en la fuerza del trabajo bien hecho, incluso cuando nadie lo ve."
        </p>

        <div className="dash__tip">
          <span className="dash__tipIcon">💡</span>
          <span className="dash__tipText">
            <strong>Tip de VictorIA:</strong> ¡Es fin de mes! Revisa <button
              className="dash__linkBtn"
              onClick={() => safeGo(navigate, ROUTES.rrhhPermisos)}
            >Permisos</button> y <button
              className="dash__linkBtn"
              onClick={() => safeGo(navigate, ROUTES.rrhhValidacionDT)}
            >Validación DT</button> en RR.HH.
          </span>
        </div>
      </div>

      {/* Grid de módulos */}
      <div className="dash__grid">
        {MODULES.map((mod) => (
          <article key={mod.id} className="modCard">
            <div
              className="modCard__header"
              onClick={() => setOpenModule(mod.id)}
              role="button"
              tabIndex={0}
            >
              <div className="modCard__bar" style={{ background: mod.color }} />
              <div className="modCard__icon">{mod.icon}</div>
              <h3 className="modCard__title">{mod.title}</h3>
            </div>

            <p className="modCard__desc">{mod.description}</p>

            <ul className="modCard__quick">
              {mod.quick.map((q, i) => (
                <li key={i}>
                  <button
                    className="modCard__quickBtn"
                    onClick={() => safeGo(navigate, q.to)}
                    title={q.label}
                  >
                    {q.label}
                  </button>
                </li>
              ))}
            </ul>

            <div className="modCard__footer">
              <button
                className="modCard__enter"
                onClick={() => setOpenModule(mod.id)}
              >
                Ingresar al módulo →
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Panel lateral con submódulos */}
      {openModule && (
        <ModuleDrawer
          module={MODULES.find((m) => m.id === openModule)}
          onClose={() => setOpenModule(null)}
          onGo={(to) => safeGo(navigate, to)}
        />
      )}
    </div>
  );
}

function ModuleDrawer({ module, onClose, onGo }) {
  if (!module) return null;
  return (
    <>
      <div className="drawer__backdrop" onClick={onClose} />
      <aside className="drawer">
        <header className="drawer__header" style={{ borderTopColor: module.color }}>
          <div className="drawer__icon" aria-hidden>{module.icon}</div>
          <div>
            <div className="drawer__label">Módulo</div>
            <h3 className="drawer__title">{module.title}</h3>
          </div>
          <button className="drawer__close" onClick={onClose} aria-label="Cerrar">✕</button>
        </header>

        <div className="drawer__content">
          <p className="drawer__desc">{module.description}</p>
          <ul className="drawer__list">
            {module.all.map((it, idx) => (
              <li key={idx}>
                <button className="drawer__item" onClick={() => onGo(it.to)}>
                  <span className="drawer__itemIcon">{it.icon}</span>
                  <span className="drawer__itemText">{it.label}</span>
                  <span className="drawer__chev">›</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </>
  );
}
