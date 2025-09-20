// imports (colócalos junto a tus otros imports arriba del archivo)
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../router/routes.js"; // ✅ faltaba este import

/* ===== Drawer: submódulos ACTIVOS (clic navega y cierra) ===== */
function Drawer({ module, onClose }) {
  const navigate = useNavigate();
  if (!module) return null;

  const go = (to) => {
    if (typeof to === "string" && to.length) {
      onClose();                          // 1) cerrar el drawer
      setTimeout(() => navigate(to), 0);  // 2) navegar en el próximo tick
    } else {
      alert("Este submódulo estará disponible pronto.");
    }
  };

  return (
    <>
      <div className="drawer__backdrop" onClick={onClose} />
      <aside className="drawer">
        <div className="drawer__head" style={{ borderTopColor: module.color }}>
          <div
            className="drawer__icon"
            style={{ color: module.color, borderColor: module.color }}
          >
            <Icon name={module.icon} size={22} />
          </div>
          <div className="drawer__titwrap">
            <div className="drawer__label">Módulo</div>
            <h3 className="drawer__title">{module.title}</h3>
            <p className="drawer__desc">{module.description}</p>
          </div>
          <button className="drawer__close" onClick={onClose} aria-label="Cerrar">
            ✕
          </button>
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
