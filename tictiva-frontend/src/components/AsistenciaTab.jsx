import React from "react";

export default function AsistenciaTab({ empleado }) {
  return (
    <div className="asistencia-container">
      {/* Encabezado con botones */}
      <div className="asistencia-header">
        <div className="asistencia-title">
          <span className="icono-title">🕒</span>
          <div>
            <h2>Resumen de Últimas Marcaciones</h2>
            <p>
              Últimas 10 marcas registradas. Para un historial completo y filtros,
              usa el botón 'Ver Historial Detallado'.
            </p>
          </div>
        </div>
        <div className="asistencia-buttons">
          <button className="btn-detalle">Ver Historial Detallado</button>
          <button className="btn-exportar">Exportar Resumen (Sim.)</button>
        </div>
      </div>

      {/* Tarjetas métricas */}
      <div className="metricas-grid">
        <div className="metric-card">
          <div className="metric-info">
            <p className="metric-label">Horas Trabajadas (Mes)</p>
            <p className="metric-value">{empleado.horasTrabajadas || "0h"}</p>
          </div>
          <div className="metric-icon">🕑</div>
        </div>
        <div className="metric-card">
          <div className="metric-info">
            <p className="metric-label">Asistencia</p>
            <p className="metric-value green">{empleado.porcentajeAsistencia || "0%"}</p>
          </div>
          <div className="metric-icon">📅</div>
        </div>
        <div className="metric-card">
          <div className="metric-info">
            <p className="metric-label">Atrasos (Mes)</p>
            <p className="metric-value yellow">{empleado.atrasosMes || "0"}</p>
          </div>
          <div className="metric-icon">⚠️</div>
        </div>
        <div className="metric-card">
          <div className="metric-info">
            <p className="metric-label">Horas Extra</p>
            <p className="metric-value blue">{empleado.horasExtra || "0h"}</p>
          </div>
          <div className="metric-icon">➕</div>
        </div>
      </div>

      {/* Tabla de marcas */}
      <table className="asistencia-tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Tipo</th>
            <th>Estado</th>
            <th>Método</th>
            <th>IP</th>
            <th>Foto</th>
          </tr>
        </thead>
        <tbody>
          {empleado.marcas?.slice(0, 10).map((marca, index) => (
            <tr key={index}>
              <td>{marca.fecha}</td>
              <td>{marca.hora}</td>
              <td className="tipo-marca">{marca.tipo}</td>
              <td>
                <span className={`estado-badge ${marca.estado.toLowerCase()}`}>
                  {marca.estado}
                </span>
              </td>
              <td>{marca.metodo}</td>
              <td>{marca.ip}</td>
              <td>
                <span className="foto-icono">📷</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="asistencia-paginacion">Mostrando 10 de 45 registros</p>
    </div>
  );
}
