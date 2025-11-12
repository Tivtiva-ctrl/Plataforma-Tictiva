// src/components/DatosBitacora.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import styles from './DatosBitacora.module.css';
import {
  FiCalendar,
  FiFilter,
  FiCheckCircle,
  FiPlus,
  FiMoreHorizontal,
  FiDownload, // ✅ lo estabas usando pero no estaba importado
} from 'react-icons/fi';

// Helpers para mostrar los ENUM de forma linda
const formatEntryType = (entryType) => {
  if (!entryType) return '-';
  switch (entryType) {
    case 'ANOTACION':
      return 'Anotación';
    case 'OBSERVACION':
      return 'Observación';
    case 'ENTREVISTA':
      return 'Entrevista';
    default:
      return entryType;
  }
};

const formatImpact = (impact) => {
  if (!impact) return '-';
  switch (impact) {
    case 'LEVE':
      return 'Leve';
    case 'MODERADO':
      return 'Moderado';
    case 'CRITICO':
      return 'Crítico';
    default:
      return impact;
  }
};

const formatStatus = (status) => {
  if (!status) return '-';
  switch (status) {
    case 'ABIERTO':
      return 'Abierto';
    case 'EN_SEGUIMIENTO':
      return 'En seguimiento';
    case 'CERRADO':
      return 'Cerrado';
    default:
      return status;
  }
};

// Map de filtros UI → valores ENUM en la BD
const tipoFilterToEnum = {
  Anotación: 'ANOTACION',
  Observación: 'OBSERVACION',
  Entrevista: 'ENTREVISTA',
};

const estadoFilterToEnum = {
  Abierto: 'ABIERTO',
  'En seguimiento': 'EN_SEGUIMIENTO',
  Cerrado: 'CERRADO',
};

// --- Componente Principal de Bitácora Laboral ---
function DatosBitacora({ rut }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false); // Dropdown "Registrar"
  const [openActionMenuId, setOpenActionMenuId] = useState(null); // Dropdown "Acciones"

  // Estados para los filtros
  const [periodo, setPeriodo] = useState('2025');
  const [tipo, setTipo] = useState('Todos');
  const [estado, setEstado] = useState('Todos');

  // Cargar datos de Supabase
  useEffect(() => {
    const fetchLogbook = async () => {
      try {
        setLoading(true);
        setLogs([]);

        if (!rut) {
          setLoading(false);
          return;
        }

        // 1) Buscar al empleado por RUT en employee_personal
        const { data: employee, error: employeeError } = await supabase
          .from('employee_personal')
          .select('id')
          .eq('rut', rut)
          .single(); // asumo que el rut es único

        if (employeeError) {
          console.error('Error buscando employee_personal por rut:', employeeError);
          setLoading(false);
          return;
        }

        if (!employee) {
          console.warn('No se encontró empleado con ese RUT');
          setLoading(false);
          return;
        }

        const employeeId = employee.id;

        // 2) Armar el query para bitacora_entries
        const startDate = `${periodo}-01-01`;
        const endDate = `${periodo}-12-31`;

        let query = supabase
          .from('bitacora_entries')
          .select('*')
          .eq('employee_id', employeeId)
          .gte('entry_date', startDate)
          .lte('entry_date', endDate)
          .order('entry_date', { ascending: false });

        // Filtro por tipo
        if (tipo !== 'Todos') {
          const enumValue = tipoFilterToEnum[tipo];
          if (enumValue) {
            query = query.eq('entry_type', enumValue);
          }
        }

        // Filtro por estado
        if (estado !== 'Todos') {
          const enumStatus = estadoFilterToEnum[estado];
          if (enumStatus) {
            query = query.eq('status', enumStatus);
          }
        }

        const { data: bitacoraData, error: bitacoraError } = await query;

        if (bitacoraError) {
          console.error('Error cargando bitacora_entries:', bitacoraError);
          setLogs([]);
        } else {
          setLogs(bitacoraData || []);
        }
      } catch (err) {
        console.error('Error inesperado en fetchLogbook:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogbook();
  }, [rut, periodo, tipo, estado]);

  // === Resumen dinámico según los registros cargados ===
  const summaryStats = (() => {
    const total = logs.length;

    // Para simplificar:
    // - Consideramos "de alerta" los de impacto MODERADO o CRITICO.
    // - "Positivos" el resto.
    const alerta = logs.filter(
      (log) => log.impact === 'MODERADO' || log.impact === 'CRITICO'
    ).length;

    const positivos = total - alerta;

    const seguimiento = logs.filter(
      (log) => log.status === 'EN_SEGUIMIENTO'
    ).length;

    return {
      total,
      positivos,
      alerta,
      seguimiento,
    };
  })();

  return (
    <div className={styles.logbookContainer}>
      {/* === 1. HEADER Y FILTROS === */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h2>Bitácora Laboral – Registro 360 del Colaborador</h2>
          <p>Anotaciones, observaciones y entrevistas laborales en un solo lugar.</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.actionButton}>
            <FiDownload size={14} /> Descargar
          </button>
          {/* Menú Registrar */}
          <div className={styles.registerMenuContainer}>
            <button
              className={styles.registerButton}
              onClick={() => setIsRegisterOpen(!isRegisterOpen)}
            >
              <FiPlus size={14} /> Registrar
            </button>
            {isRegisterOpen && (
              <div className={styles.registerDropdown}>
                <button>
                  <strong>Anotación</strong>
                  <small>Observaciones positivas o negativas</small>
                </button>
                <button>
                  <strong>Observación</strong>
                  <small>Comentarios formales sobre desempeño</small>
                </button>
                <button>
                  <strong>Entrevista</strong>
                  <small>Entrevistas individuales con el colaborador</small>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- Filtros --- */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <FiCalendar />
          <label>Periodo:</label>
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value)}>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <FiFilter />
          <label>Tipo:</label>
          <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="Todos">Todos</option>
            <option value="Anotación">Anotación</option>
            <option value="Observación">Observación</option>
            <option value="Entrevista">Entrevista</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <FiCheckCircle />
          <label>Estado:</label>
          <select value={estado} onChange={(e) => setEstado(e.target.value)}>
            <option value="Todos">Todos</option>
            <option value="Abierto">Abierto</option>
            <option value="En seguimiento">En seguimiento</option>
            <option value="Cerrado">Cerrado</option>
          </select>
        </div>
      </div>

      {/* === 2. TARJETAS DE RESUMEN === */}
      <div className={styles.summaryGrid}>
        {/* Tarjetas de Stats */}
        <div className={styles.statCard}>
          <h3>Registros totales</h3>
          <p>{summaryStats.total}</p>
          <small>Últimos 12 meses</small>
        </div>
        <div className={styles.statCard}>
          <h3>Registros positivos</h3>
          <p>{summaryStats.positivos}</p>
          <small>Estimado según impacto</small>
        </div>
        <div className={styles.statCard}>
          <h3>Registros de alerta</h3>
          <p>{summaryStats.alerta}</p>
          <small>Impacto moderado o crítico</small>
        </div>
        <div className={styles.statCard}>
          <h3>En seguimiento</h3>
          <p>{summaryStats.seguimiento}</p>
          <small>Casos activos</small>
        </div>

        {/* Semáforo Laboral (por ahora estático visual, luego lo podemos hacer dinámico) */}
        <div className={styles.semaforoCard}>
          <h3>Semáforo Laboral</h3>
          <p>Estado actual del colaborador</p>
          <div className={`${styles.semaforoItem} ${styles.semaforoEstable}`}>Estable</div>
          <div className={`${styles.semaforoItem} ${styles.semaforoSeguimiento}`}>
            Requiere seguimiento
          </div>
          <div className={`${styles.semaforoItem} ${styles.semaforoRiesgo}`}>Riesgo alto</div>
        </div>
      </div>

      {/* === 3. TABLA DE DETALLE === */}
      <div className={styles.tableContainer}>
        <table className={styles.detailsTable}>
          <thead>
            <tr>
              <th>FECHA</th>
              <th>TIPO</th>
              <th>ÁREA / EQUIPO</th>
              <th>MOTIVO</th>
              <th>DETALLE</th>
              <th>IMPACTO</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8">Cargando bitácora...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan="8">No hay registros para este período.</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    {log.entry_date
                      ? new Date(log.entry_date).toLocaleDateString('es-ES')
                      : '-'}
                  </td>
                  <td>{formatEntryType(log.entry_type)}</td>
                  <td>{log.area_name || '-'}</td>
                  <td>{log.motive || '-'}</td>
                  <td>{log.detail || '-'}</td>
                  <td>{formatImpact(log.impact)}</td>
                  <td>{formatStatus(log.status)}</td>
                  <td>
                    {/* Menú Acciones */}
                    <div className={styles.actionsCell}>
                      <button
                        className={styles.actionsButton}
                        onClick={() =>
                          setOpenActionMenuId(
                            openActionMenuId === log.id ? null : log.id
                          )
                        }
                      >
                        <FiMoreHorizontal />
                      </button>
                      {openActionMenuId === log.id && (
                        <div className={styles.actionsDropdown}>
                          <button>Ver detalle</button>
                          <button>Editar</button>
                          <button>Subir evidencia</button>
                          <button>Descargar acta</button>
                          <button>Registrar seguimiento</button>
                          <button className={styles.actionDelete}>Eliminar</button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DatosBitacora;
