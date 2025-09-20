// src/components/Dashboard.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../router/routes"; 
import "./Dashboard.css";

// --- COMPONENTES INTERNOS ---

const Icon = ({ name, size = 24, className = "" }) => {
  // ... (tu código de íconos completo va aquí, no es necesario cambiarlo) ...
};

// --- CORRECCIÓN ARQUITECTURA: El Drawer ahora recibe 'onNavigate' ---
function Drawer({ module, onClose, onNavigate }) {
  if (!module) return null;

  const go = (to) => {
    if (typeof to === "string" && to.length) {
      // Usa la función que viene del padre
      onNavigate(to);
      onClose();
    } else {
      alert("Este submódulo estará disponible pronto.");
    }
  };

  return (
    <>
      <div className="drawer__backdrop" onClick={onClose} />
      <aside className="drawer">
        {/* ... El resto de tu código del Drawer no cambia ... */}
        {/* ... Solo nos aseguramos que el onClick llame a la función 'go' correcta ... */}
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

// --- COMPONENTE PRINCIPAL ---

export default function Dashboard({ onLogout }) {
  const navigate = useNavigate(); // Hook de navegación se define aquí, en el padre
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
    // ... (Todo tu array de Módulos va aquí, no cambia) ...
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
        {/* ... (Todo tu JSX del hero va aquí, no cambia) ... */}
      </section>

      <div className="grid">
        {MODULES.map((m) => (
          <article key={m.id} className={`card ${m.id}`}>
            <header className="card__head" onClick={() => setOpenModule(m)}>
              {/* ... */}
            </header>
            {/* ... */}
            <footer className="card__foot">
              <button className="card__open" onClick={() => setOpenModule(m)}>Abrir módulo →</button>
            </footer>
          </article>
        ))}
      </div>

      {/* --- CORRECCIÓN ARQUITECTURA: Pasa 'navigate' como prop al Drawer --- */}
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