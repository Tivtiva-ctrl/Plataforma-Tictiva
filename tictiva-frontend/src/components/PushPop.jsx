import React from "react";

export default function PushPop({ title, onClose, children }) {
  React.useEffect(() => {
    const onEsc = (e) => { if (e.key === "Escape") onClose?.(); };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" className="pp-wrap" onMouseDown={onClose}>
      <div className="pp-card" onMouseDown={(e)=>e.stopPropagation()}>
        <div className="pp-head">
          <div className="pp-title">{title || "Acciones"}</div>
          <button className="ed-btn" type="button" onClick={onClose}>✕</button>
        </div>
        <div className="pp-body">{children}</div>
      </div>
      <style>{`
        .pp-wrap{ position:fixed; inset:0; background:rgba(17,24,39,.45); display:grid; place-items:center; z-index:9999 }
        .pp-card{ width:min(520px, 92vw); background:#fff; border:1px solid #E5E7EB; border-radius:16px; box-shadow:0 20px 40px rgba(0,0,0,.25); }
        .pp-head{ display:flex; align-items:center; justify-content:space-between; padding:12px 12px 0 16px }
        .pp-title{ font-weight:800; color:#111827; font-size:16px }
        .pp-body{ padding:12px 16px 16px; }
      `}</style>
    </div>
  );
}
