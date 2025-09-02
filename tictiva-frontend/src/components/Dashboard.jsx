import React from "react";
// Quitamos Link de react-router-dom para evitar el error de contexto.
// Usaremos etiquetas <a> estándar en su lugar.
// import { Link } from "react-router-dom";

// Asumo que tu archivo de rutas sigue una estructura similar
const ROUTES = {
  listadoFichas: "/rrhh/fichas",
  rrhhPermisos: "/rrhh/permisos",
  rrhhValidacionDT: "/rrhh/validacion-dt",
  rrhhDocumentos: "/rrhh/documentos",
  rrhhBodegaInventario: "/rrhh/bodega",
  asistenciaSupervision: "/asistencia/supervision",
  asistenciaMarcas: "/asistencia/marcas",
  asistenciaMapa: "/asistencia/mapa",
  asistenciaGestionDispositivos: "/asistencia/dispositivos",
  asistenciaGestionTurnos: "/asistencia/turnos",
};

/* Tus componentes de Iconos (los he mantenido intactos) */
const IconWrap = ({ fg = "#1f2937", bg = "#eef2ff", children }) => (
  <div className="new-ico" style={{ background: bg, color: fg }}>
    {children}
  </div>
);
const IUsers = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const IClock = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
const IMessage = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
const IChart = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
const IBrain = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v0A2.5 2.5 0 0 1 9.5 7h0A2.5 2.5 0 0 1 7 4.5v0A2.5 2.5 0 0 1 9.5 2m0 15A2.5 2.5 0 0 1 12 19.5v0a2.5 2.5 0 0 1-2.5 2.5h0A2.5 2.5 0 0 1 7 19.5v0a2.5 2.5 0 0 1 2.5-2.5m5 0A2.5 2.5 0 0 1 17 19.5v0a2.5 2.5 0 0 1-2.5 2.5h0A2.5 2.5 0 0 1 12 19.5v0a2.5 2.5 0 0 1 2.5-2.5m0-15A2.5 2.5 0 0 1 17 4.5v0A2.5 2.5 0 0 1 14.5 7h0A2.5 2.5 0 0 1 12 4.5v0A2.5 2.5 0 0 1 14.5 2z" /><path d="M12 7v10" /></svg>;
const ICalendar = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const IClipboard = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /></svg>;
const IBox = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;
const ISearch = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>;
const ICheck = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
const IPin = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const IDevice = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>;
const ITurns = () => <ICalendar />;

export default function Dashboard() {
  return (
    <div className="new-dashboard-container">
      {/* Saludo */}
      <header className="new-header">
        <h1 className="new-title">
          Buenas tardes, Verónica Mateo <span>👋</span>
        </h1>
        <p className="new-quote">
          "Creemos en la fuerza del trabajo bien hecho, incluso cuando nadie lo ve."
        </p>
      </header>

      {/* Tip de VictorIA */}
      <section className="new-tip-card">
        <div className="new-tip-bulb">💡</div>
        <div>
          <div className="new-tip-title">Tip de VictorIA</div>
          <div className="new-tip-text">
            ¡Es fin de mes! Revisa <b>Permisos</b> y <b>Validación DT</b> en RR.HH.
          </div>
        </div>
      </section>

      {/* Grid de Módulos */}
      <div className="new-grid">
        {/* RRHH */}
        <section className="new-card">
          <div className="new-card-top new-bar-blue" />
          <div className="new-card-head">
            <IconWrap fg="#1e40af" bg="#e0e7ff"><IUsers /></IconWrap>
            <h3 className="new-card-title">Recursos Humanos</h3>
          </div>
          <p className="new-card-desc">Gestiona fichas, contratos y documentación legal.</p>
          <div className="new-links-grid">
            <a href={ROUTES.listadoFichas} className="new-link-item"><ICalendar /><span>Listado y Fichas</span></a>
            <a href={ROUTES.rrhhPermisos} className="new-link-item"><IClipboard /><span>Permisos y Justificaciones</span></a>
            <a href={ROUTES.rrhhValidacionDT} className="new-link-item"><ICheck /><span>Validación DT</span></a>
            <a href={ROUTES.rrhhDocumentos} className="new-link-item"><IClipboard /><span>Repositorio Documental</span></a>
            <a href={ROUTES.rrhhBodegaInventario || "/rrhh/bodega"} className="new-link-item"><IBox /><span>Bodega y EPP</span></a>
          </div>
        </section>

        {/* Asistencia */}
        <section className="new-card">
          <div className="new-card-top new-bar-green" />
          <div className="new-card-head">
            <IconWrap fg="#065f46" bg="#d1fae5"><IClock /></IconWrap>
            <h3 className="new-card-title">Asistencia</h3>
          </div>
          <p className="new-card-desc">Control de horarios, marcas y gestión de turnos.</p>
          <div className="new-links-grid">
            <a href={ROUTES.asistenciaSupervision} className="new-link-item"><ISearch /><span>Supervisión Integral</span></a>
            <a href={ROUTES.asistenciaMarcas} className="new-link-item"><ICheck /><span>Marcas Registradas</span></a>
            <a href={ROUTES.asistenciaMapa} className="new-link-item"><IPin /><span>Mapa de Cobertura</span></a>
            <a href={ROUTES.asistenciaGestionDispositivos} className="new-link-item"><IDevice /><span>Gestión de Dispositivos</span></a>
            <a href={ROUTES.asistenciaGestionTurnos} className="new-link-item"><ITurns /><span>Gestión de Turnos y Jornadas</span></a>
          </div>
        </section>

        {/* Comunicaciones */}
        <section className="new-card">
            <div className="new-card-top new-bar-violet" />
            <div className="new-card-head">
              <IconWrap fg="#5b21b6" bg="#ede9fe"><IMessage /></IconWrap>
              <h3 className="new-card-title">Comunicaciones</h3>
            </div>
            <p className="new-card-desc">Mensajería, encuestas y comunicados para tu equipo.</p>
            <div className="new-links-grid">
              <span className="new-link-item new-disabled"><IMessage /><span>Enviar mensaje</span></span>
              <span className="new-link-item new-disabled"><IClipboard /><span>Plantillas</span></span>
              <span className="new-link-item new-disabled"><ICheck /><span>Encuestas</span></span>
            </div>
          </section>

          {/* Reportes */}
          <section className="new-card">
            <div className="new-card-top new-bar-pink" />
            <div className="new-card-head">
              <IconWrap fg="#9d174d" bg="#fce7f3"><IChart /></IconWrap>
              <h3 className="new-card-title">Reportes</h3>
            </div>
            <p className="new-card-desc">Informes gerenciales y análisis de datos.</p>
            <div className="new-links-grid">
              <span className="new-link-item new-disabled"><IChart /><span>Informes Gerenciales</span></span>
              <span className="new-link-item new-disabled"><IChart /><span>Dashboards</span></span>
              <span className="new-link-item new-disabled"><IClipboard /><span>Documentos</span></span>
            </div>
          </section>

           {/* Tictiva Cuida */}
           <section className="new-card">
            <div className="new-card-top new-bar-orange" />
            <div className="new-card-head">
              <IconWrap fg="#9a3412" bg="#ffedd5"><IBrain /></IconWrap>
              <h3 className="new-card-title">Tictiva Cuida</h3>
            </div>
            <p className="new-card-desc">Bienestar psicoemocional y salud organizacional.</p>
            <div className="new-links-grid">
              <span className="new-link-item new-disabled"><IBrain /><span>Test Psicológicos</span></span>
              <span className="new-link-item new-disabled"><IChart /><span>Dashboard de Bienestar</span></span>
              <span className="new-link-item new-disabled"><IMessage /><span>VictorIA</span></span>
            </div>
          </section>

      </div>

      {/* Estilos locales. */}
      <style>{`
        .new-dashboard-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 32px;
            font-family: 'Inter', sans-serif;
        }
        .new-header {
            margin-bottom: 24px;
        }
        .new-title {
            font-size: 2.25rem;
            font-weight: 800;
            color: #111827;
            margin: 0;
        }
        .new-quote {
            color: #6b7280;
            font-size: 1rem;
            margin-top: 4px;
        }
        .new-tip-card {
            display: flex;
            gap: 16px;
            align-items: center;
            background-color: #eff6ff;
            border: 1px solid #dbeafe;
            border-radius: 1rem;
            padding: 16px;
            margin-bottom: 32px;
        }
        .new-tip-bulb {
            font-size: 1.5rem;
            background-color: #fef08a;
            border-radius: 9999px;
            padding: 8px;
            display: grid;
            place-items: center;
            flex-shrink: 0;
        }
        .new-tip-title {
            font-weight: 700;
            color: #1e3a8a;
        }
        .new-tip-text {
            color: #1e40af;
        }
        .new-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 24px;
        }
        .new-card {
            position: relative;
            background-color: white;
            border: 1px solid #e5e7eb;
            border-radius: 1.25rem;
            padding: 24px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .new-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08);
        }
        .new-card-top {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 8px;
            border-top-left-radius: 1.25rem;
            border-top-right-radius: 1.25rem;
        }
        .new-bar-blue { background-color: #3b82f6; }
        .new-bar-green { background-color: #22c55e; }
        .new-bar-violet { background-color: #8b5cf6; }
        .new-bar-pink { background-color: #ec4899; }
        .new-bar-orange { background-color: #f97316; }
        .new-card-head {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-top: 8px;
        }
        .new-ico {
            width: 48px;
            height: 48px;
            border-radius: 0.75rem;
            display: grid;
            place-items: center;
        }
        .new-card-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #1f2937;
        }
        .new-card-desc {
            margin-top: 8px;
            margin-bottom: 16px;
            color: #4b5563;
        }
        .new-links-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
        }
        .new-link-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px;
            border-radius: 0.5rem;
            color: #374151;
            text-decoration: none;
            font-weight: 500;
            transition: background-color 0.2s;
        }
        .new-link-item:hover {
            background-color: #f3f4f6;
            color: #111827;
        }
        .new-link-item svg {
            color: #6b7280;
        }
        .new-disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        .new-disabled:hover {
            background-color: transparent;
        }
      `}</style>
    </div>
  );
}

