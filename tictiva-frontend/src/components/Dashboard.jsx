import React from "react";
import { BrowserRouter, Link } from "react-router-dom";
import { 
    Users, 
    Clock, 
    MessageSquare, 
    BarChart2, 
    HeartPulse, 
    Contact, 
    CalendarCheck, 
    Package, 
    MousePointerClick,
    MapPin, 
    CalendarDays,
    Lightbulb,
    Cake
} from 'lucide-react';

// Asumo que tu archivo de rutas se ve algo así
const ROUTES = {
    listadoFichas: "/rrhh/fichas",
    rrhhPermisos: "/rrhh/permisos",
    rrhhBodegaInventario: "/rrhh/bodega",
    asistenciaMarcas: "/asistencia/marcas",
    asistenciaMapa: "/asistencia/mapa",
    asistenciaGestionTurnos: "/asistencia/turnos",
    // ...y así sucesivamente
};

export default function Dashboard() {
  const linkStyle = "flex items-center gap-3 text-gray-700 hover:text-blue-600 cursor-pointer transition-colors";
  const disabledLinkStyle = "flex items-center gap-3 text-gray-400 cursor-not-allowed";

  return (
    <BrowserRouter>
      <div className="bg-[#f7faff] p-4 sm:p-6 md:p-8 font-['Inter',_sans-serif] min-h-screen">
          <div className="max-w-7xl mx-auto">
              {/* Encabezado */}
              <header className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-800">Buenas tardes, Verónica Mateo 👋</h1>
                  <p className="text-gray-500 mt-1">"Creemos en la fuerza del trabajo bien hecho, incluso cuando nadie lo ve."</p>
              </header>

              {/* Tip de VictorIA */}
              <div className="mb-8 p-5 rounded-2xl flex items-start gap-4 bg-blue-50 border border-blue-200">
                  <div className="flex-shrink-0">
                     <div className="w-10 h-10 bg-yellow-300 rounded-full flex items-center justify-center ring-4 ring-yellow-200">
                         <Lightbulb className="text-yellow-700" />
                     </div>
                  </div>
                  <div>
                      <h2 className="text-lg font-semibold text-blue-900">Tip de VictorIA</h2>
                      <p className="text-blue-800 mt-1">
                          ¡Es fin de mes! Es un buen momento para revisar los permisos pendientes y la Validación DT.
                      </p>
                  </div>
              </div>

              {/* Grid de Módulos - Ahora ocupa todo el ancho y tiene 3 columnas en pantallas grandes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  
                  {/* Recursos Humanos */}
                  <div className="card card-border-blue">
                      <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><Users /></div>
                          <h3 className="text-xl font-bold text-gray-900">Recursos Humanos</h3>
                      </div>
                      <p className="module-desc">Gestiona fichas, contratos y documentación legal.</p>
                      <nav className="module-links">
                        <Link to={ROUTES.listadoFichas} className={linkStyle}><Contact className="w-5 h-5 text-gray-400"/><span>Listado y Fichas</span></Link>
                        <Link to={ROUTES.rrhhPermisos} className={linkStyle}><CalendarCheck className="w-5 h-5 text-gray-400"/><span>Permisos y Justificaciones</span></Link>
                        <Link to={ROUTES.rrhhValidacionDT || "/rrhh/validacion"} className={linkStyle}><span className="text-xl">✅</span><span>Validación DT</span></Link>
                        <Link to={ROUTES.rrhhDocumentos || "/rrhh/documentos"} className={linkStyle}><span className="text-xl">📁</span><span>Repositorio Documental</span></Link>
                        <Link to={ROUTES.rrhhBodegaInventario || "/rrhh/bodega"} className={linkStyle}><Package className="w-5 h-5 text-gray-400"/><span>Bodega y EPP</span></Link>
                      </nav>
                  </div>
                  
                  {/* Asistencia */}
                  <div className="card card-border-green">
                      <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-green-100 rounded-lg text-green-600"><Clock /></div>
                          <h3 className="text-xl font-bold text-gray-900">Asistencia</h3>
                      </div>
                      <p className="module-desc">Control de horarios, marcas y gestión de turnos.</p>
                      <nav className="module-links">
                        <Link to={ROUTES.asistenciaSupervision || "/asistencia/supervision"} className={linkStyle}><span className="text-xl">🔎</span><span>Supervisión Integral</span></Link>
                        <Link to={ROUTES.asistenciaMarcas} className={linkStyle}><MousePointerClick className="w-5 h-5 text-gray-400"/><span>Marcas Registradas</span></Link>
                        <Link to={ROUTES.asistenciaMapa} className={linkStyle}><MapPin className="w-5 h-5 text-gray-400"/><span>Mapa de Cobertura</span></Link>
                        <Link to={ROUTES.asistenciaGestionDispositivos || "/asistencia/dispositivos"} className={linkStyle}><span className="text-xl">📟</span><span>Gestión de Dispositivos</span></Link>
                        <Link to={ROUTES.asistenciaGestionTurnos} className={linkStyle}><CalendarDays className="w-5 h-5 text-gray-400"/><span>Gestión de Turnos y Jornadas</span></Link>
                      </nav>
                  </div>

                  {/* Comunicaciones */}
                  <div className="card card-border-violet">
                      <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-violet-100 rounded-lg text-violet-600"><MessageSquare /></div>
                          <h3 className="text-xl font-bold text-gray-900">Comunicaciones</h3>
                      </div>
                      <p className="module-desc">Mensajería, encuestas y comunicados para tu equipo.</p>
                      <nav className="module-links">
                        <span className={disabledLinkStyle}><span className="text-xl">✉️</span><span>Enviar mensaje</span></span>
                        <span className={disabledLinkStyle}><span className="text-xl">📝</span><span>Plantillas</span></span>
                        <span className={disabledLinkStyle}><span className="text-xl">⭐</span><span>Encuestas</span></span>
                      </nav>
                  </div>

                  {/* Reportes */}
                  <div className="card card-border-pink">
                       <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-pink-100 rounded-lg text-pink-600"><BarChart2 /></div>
                          <h3 className="text-xl font-bold text-gray-900">Reportes</h3>
                      </div>
                      <p className="module-desc">Informes gerenciales y análisis de datos.</p>
                       <nav className="module-links">
                        <span className={disabledLinkStyle}><span className="text-xl">📄</span><span>Informes Gerenciales</span></span>
                        <span className={disabledLinkStyle}><span className="text-xl">📈</span><span>Dashboards</span></span>
                        <span className={disabledLinkStyle}><span className="text-xl">📁</span><span>Documentos</span></span>
                      </nav>
                  </div>
                  
                  {/* Tictiva Cuida */}
                  <div className="card card-border-orange">
                       <div className="flex items-center gap-4 mb-4">
                          <div className="p-3 bg-orange-100 rounded-lg text-orange-600"><HeartPulse /></div>
                          <h3 className="text-xl font-bold text-gray-900">Tictiva Cuida</h3>
                      </div>
                      <p className="module-desc">Bienestar psicoemocional y salud organizacional.</p>
                      <nav className="module-links">
                        <span className={disabledLinkStyle}><span className="text-xl">🧑‍⚕️</span><span>Test Psicológicos</span></span>
                        <span className={disabledLinkStyle}><span className="text-xl">📊</span><span>Dashboard de Bienestar</span></span>
                        <span className={disabledLinkStyle}><span className="text-xl">🤖</span><span>VictorIA</span></span>
                      </nav>
                  </div>
              </div>
          </div>

          {/* Estilos para las tarjetas y links (para no usar un archivo CSS aparte en este ejemplo) */}
          <style>{`
              .card {
                  background-color: white;
                  border-radius: 1rem;
                  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05);
                  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                  border: 1px solid #eef2f9;
                  overflow: hidden;
                  padding: 1.5rem;
              }
              .card:hover {
                  transform: translateY(-5px);
                  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -2px rgb(0 0 0 / 0.05);
              }
              .card-border-blue { border-top: 4px solid #3b82f6; }
              .card-border-green { border-top: 4px solid #22c55e; }
              .card-border-violet { border-top: 4px solid #8b5cf6; }
              .card-border-pink { border-top: 4px solid #ec4899; }
              .card-border-orange { border-top: 4px solid #f97316; }

              .module-desc {
                  margin-bottom: 1.5rem;
                  font-size: 0.875rem;
                  color: #6b7280;
              }
              .module-links {
                  display: flex;
                  flex-direction: column;
                  gap: 0.75rem;
              }
          `}</style>
      </div>
    </BrowserRouter>
  );
}

