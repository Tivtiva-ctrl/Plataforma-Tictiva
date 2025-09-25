// src/components/Dashboard.jsx
import { Link } from "react-router-dom";
import { ROUTES } from "../router/routes";

// Tarjeta simple para mosaico
function Card({ to, title, subtitle }) {
  return (
    <Link
      to={to}
      style={{
        display: "block",
        padding: 16,
        borderRadius: 12,
        background: "#FFFFFF",
        border: "1px solid #E5E7EB",
        textDecoration: "none",
        color: "#111827",
        boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: "#6B7280" }}>{subtitle}</div>
    </Link>
  );
}

export default function Dashboard({ onLogout }) {
  // ❗ Nunca retornes null: si hay loading/errores, muestra algo visible
  // (Si usas context/empresa y puede no estar aún, no hagas `return null`)
  // const { empresa, loading } = useEmpresa(); // si lo usas
  // if (loading) return <div style={{ padding: 24 }}>Cargando dashboard…</div>;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>Plataforma Tictiva</h1>
        {onLogout && (
          <button
            onClick={onLogout}
            style={{
              background: "#1A56DB",
              color: "#fff",
              border: "none",
              padding: "8px 12px",
              borderRadius: 8,
              cursor: "pointer",
            }}
          >
            Cerrar sesión
          </button>
        )}
      </div>

      {/* Mosaico de módulos */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: 12,
        }}
      >
        {/* RRHH */}
        <Card
          to={ROUTES.listadoFichas}
          title="Fichas de Personal"
          subtitle="Listado y detalle de colaboradores"
        />
        <Card
          to={ROUTES.rrhhPermisos}
          title="Permisos & Justificaciones"
          subtitle="Solicitudes, aprobaciones y control"
        />
        <Card
          to={`${ROUTES.rrhhValidacionDT}`}
          title="Validación DT"
          subtitle="Validación de documentos"
        />
        <Card
          to={ROUTES.rrhhDocumentos}
          title="Repositorio de Documentos"
          subtitle="Contratos, anexos y más"
        />

        {/* Asistencia */}
        <Card
          to={ROUTES.asistenciaSupervision}
          title="Supervisión Integral"
          subtitle="Monitoreo de asistencia"
        />
        <Card
          to={ROUTES.asistenciaMarcas}
          title="Marcas Registradas"
          subtitle="Entradas y salidas"
        />
        <Card
          to={ROUTES.asistenciaMapa}
          title="Mapa de Cobertura"
          subtitle="Geolocalización"
        />
        <Card
          to={ROUTES.asistenciaDispositivos}
          title="Gestión de Dispositivos"
          subtitle="Relojes/Apps"
        />
        <Card
          to={ROUTES.asistenciaTurnos}
          title="Gestión de Turnos"
          subtitle="Turnos y jornadas"
        />

        {/* Bodega */}
        <Card
          to={ROUTES.rrhhBodegaDashboard}
          title="Bodega — Dashboard"
          subtitle="Resumen general"
        />
        <Card
          to={ROUTES.rrhhBodegaInventario}
          title="Bodega — Inventario"
          subtitle="EPP y materiales"
        />
        <Card
          to={ROUTES.rrhhBodegaColaboradores}
          title="Bodega — Colaboradores"
          subtitle="Entregas y recepciones"
        />
        <Card
          to={ROUTES.rrhhBodegaOperaciones}
          title="Bodega — Operaciones"
          subtitle="Movimientos y control"
        />
      </div>
    </div>
  );
}
