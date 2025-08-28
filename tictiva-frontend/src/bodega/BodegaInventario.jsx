// src/bodega/pages/BodegaInventario.jsx
import React from "react";

// Reemplaza este placeholder por tu componente real (tabla/lista)
const Placeholder = () => (
  <div className="b-card">Coloca aquí tu componente de “EPP e Inventario”.</div>
);

export default function BodegaInventario() {
  const onFilter = (e) => {
    e.preventDefault();
    // TODO: leer valores del form y ejecutar filtro
  };

  return (
    <div>
      <h1 className="b-title">Inventario por Instalación</h1>
      <p className="b-muted">Gestión de stock y ubicaciones por instalación.</p>

      <form className="b-card" style={{ marginBottom: 12 }} onSubmit={onFilter} role="search">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr auto",
            gap: 8,
          }}
        >
          <select className="b-btn" defaultValue="all-sites" aria-label="Instalación">
            <option value="all-sites">Todas las instalaciones</option>
          </select>

          <select className="b-btn" defaultValue="all-cats" aria-label="Categoría">
            <option value="all-cats">Todas las categorías</option>
          </select>

          <select className="b-btn" defaultValue="all-states" aria-label="Estado">
            <option value="all-states">Todos los estados</option>
          </select>

          <input
            className="b-btn"
            name="q"
            placeholder="Buscar SKU / Nombre"
            aria-label="Buscar SKU o nombre"
          />

          <button type="submit" className="b-btn primary">
            Filtrar
          </button>
        </div>
      </form>

      {/* 🔗 Tu tabla/listado existente va aquí */}
      <Placeholder />
    </div>
  );
}
