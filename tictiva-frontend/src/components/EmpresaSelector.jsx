import React, { useEffect, useRef, useState } from "react";
import { useEmpresa } from "../context/EmpresaContext";
import "./EmpresaSelector.css";

export default function EmpresaSelector() {
  const { empresaSeleccionada, setEmpresaSeleccionada, empresas } = useEmpresa();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const contRef = useRef(null);
  const triggerRef = useRef(null);

  const listaEmpresas = Array.isArray(empresas) ? empresas : [];

  const handleSelect = (empresa) => {
    setEmpresaSeleccionada(empresa);
    setMenuAbierto(false);
    // Devuelve el foco al trigger para mejor UX/Accesibilidad
    requestAnimationFrame(() => {
      try { triggerRef.current?.focus(); } catch {}
    });
  };

  // Inicial de la empresa seleccionada
  const inicial =
    (empresaSeleccionada?.nombre?.charAt(0) || "?").toUpperCase();

  // Cerrar al hacer click fuera
  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuAbierto) return;
      if (contRef.current && !contRef.current.contains(e.target)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, [menuAbierto]);

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e) => {
      if (!menuAbierto) return;
      if (e.key === "Escape") {
        setMenuAbierto(false);
        try { triggerRef.current?.focus(); } catch {}
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuAbierto]);

  // Teclado en el trigger (Enter/Espacio)
  const onTriggerKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setMenuAbierto((v) => !v);
    }
  };

  // Teclado en item (Enter/Espacio)
  const onItemKeyDown = (e, empresa) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSelect(empresa);
    }
  };

  return (
    <div className="empresa-selector-container" ref={contRef}>
      <div
        className="empresa-selector-trigger"
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={menuAbierto}
        onClick={() => setMenuAbierto((v) => !v)}
        onKeyDown={onTriggerKeyDown}
      >
        <div className="empresa-avatar" aria-hidden>{inicial}</div>
        <span className="empresa-nombre">
          {empresaSeleccionada ? empresaSeleccionada.nombre : "Sin empresa"}
        </span>
        <span className="empresa-arrow" aria-hidden>
          {menuAbierto ? "▲" : "▼"}
        </span>
      </div>

      {menuAbierto && (
        <div className="empresa-dropdown" role="listbox">
          {listaEmpresas.length === 0 ? (
            <div className="empresa-item empresa-item--empty" aria-disabled="true">
              <span>Sin resultados</span>
            </div>
          ) : (
            listaEmpresas.map((empresa) => {
              const activa = empresaSeleccionada?.id === empresa.id;
              return (
                <div
                  key={empresa.id}
                  role="option"
                  aria-selected={activa}
                  className={`empresa-item ${activa ? "seleccionada" : ""}`}
                  tabIndex={0}
                  onClick={() => handleSelect(empresa)}
                  onKeyDown={(e) => onItemKeyDown(e, empresa)}
                >
                  <div className="empresa-avatar" aria-hidden>
                    {(empresa.nombre?.charAt(0) || "?").toUpperCase()}
                  </div>
                  <span>{empresa.nombre}</span>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
