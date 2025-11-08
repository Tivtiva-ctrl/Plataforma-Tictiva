import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import styles from './DatosAsistencia.module.css';
import {
  FiCheckSquare,
  FiAlertTriangle,
  FiClock,
  FiCamera,
} from 'react-icons/fi';

function DatosAsistencia({ rut }) {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]); // marcas de asistencia
  const [viewType, setViewType] = useState('mensual'); // 'mensual' o 'semanal'
  const [currentDate, setCurrentDate] = useState(new Date()); // referencia de período
  const [error, setError] = useState(null);

  // Helpers de rango de fechas según vista
  const getPeriodRange = (baseDate, type) => {
    const start = new Date(baseDate);
    const end = new Date(baseDate);

    if (type === 'mensual') {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      end.setMonth(end.getMonth() + 1);
      end.setDate(1);
      end.setHours(0, 0, 0, 0);
    } else {
      // semanal: desde lunes de esa semana
      const day = start.getDay(); // 0 = domingo, 1 = lunes...
      const diffToMonday = (day + 6) % 7; // transforma domingo (0) en 6, lunes (1) en 0, etc.
      start.setDate(start.getDate() - diffToMonday);
      start.setHours(0, 0, 0, 0);

      end.setTime(start.getTime());
      end.setDate(end.getDate() + 7); // semana completa
    }

    return { start, end };
  };

  // Texto del selector de fecha
  const formatDisplayDate = () => {
    if (viewType === 'mensual') {
      return currentDate.toLocaleDateString('es-ES', {
        month: 'long',
        year: 'numeric',
      });
    }
    const { start, end } = getPeriodRange(currentDate, 'semanal');
    const startStr = start.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
    });
    const endStr = new Date(end.getTime() - 1).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
    });
    return `Semana ${startStr} – ${endStr}`;
  };

  // Navegación de período
  const handlePrevPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'mensual') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const handleNextPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'mensual') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  // Cargar datos de Supabase
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!rut) {
        setRecords([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { start, end } = getPeriodRange(currentDate, viewType);

        const { data, error: dbError } = await supabase
          .from('employee_attendance') // 👈 nombre de la tabla
          .select('*')
          .eq('rut', rut)
          .gte('timestamp', start.toISOString())
          .lt('timestamp', end.toISOString())
          .order('timestamp', { ascending: false });

        if (dbError) throw dbError;

        setRecords(data || []);
      } catch (err) {
        console.error('Error al cargar asistencia:', err.message);
        setError('No se pudieron cargar los registros de asistencia.');
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [rut, viewType, currentDate]);

  // Stats sencillos (podemos mejorarlos después)
  const tardies = records.filter(
    (r) => r.estado && r.estado.toLowerCase() === 'atraso'
  ).length;
  const uniqueDays = new Set(
    records.map((r) =>
      new Date(r.timestamp).toISOString().substring(0, 10)
    )
  ).size;

  const summaryStats = {
    asistencia: uniqueDays === 0 ? '—' : '100%', // luego lo afinamos cuando tengas reglas claras
    ausencias: 0, // lo podremos calcular más adelante
    atrasos: tardies,
  };

  return (
    <div className={styles.attendanceContainer}>
      {/* === 1. HEADER CON SELECTORES === */}
      <div className={styles.header}>
        <h2>Asistencia del Empleado</h2>
        <div className={styles.controls}>
          {/* Selector Semanal/Mensual */}
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
            className={styles.viewSelect}
          >
            <option value="mensual">Vista Mensual</option>
            <option value="semanal">Vista Semanal</option>
          </select>

          {/* Selector de Fecha */}
          <div className={styles.datePicker}>
            <button type="button" onClick={handlePrevPeriod}>
              &lt;
            </button>
            <span>{formatDisplayDate()}</span>
            <button type="button" onClick={handleNextPeriod}>
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* === 2. TARJETAS DE RESUMEN === */}
      <div className={styles.summaryGrid}>
        <div
          className={styles.summaryCard}
          style={{ '--color': 'var(--verde-claro-tictiva)' }}
        >
          <div className={styles.cardIcon}>
            <FiCheckSquare />
          </div>
          <div className={styles.cardInfo}>
            <span className={styles.cardNumber}>{summaryStats.asistencia}</span>
            <span className={styles.cardLabel}>Asistencia</span>
          </div>
        </div>
        <div
          className={styles.summaryCard}
          style={{ '--color': 'var(--naranja-tictiva)' }}
        >
          <div className={styles.cardIcon}>
            <FiAlertTriangle />
          </div>
          <div className={styles.cardInfo}>
            <span className={styles.cardNumber}>{summaryStats.ausencias}</span>
            <span className={styles.cardLabel}>Días de Ausencia</span>
          </div>
        </div>
        <div
          className={styles.summaryCard}
          style={{ '--color': 'var(--rojo-tictiva)' }}
        >
          <div className={styles.cardIcon}>
            <FiClock />
          </div>
          <div className={styles.cardInfo}>
            <span className={styles.cardNumber}>{summaryStats.atrasos}</span>
            <span className={styles.cardLabel}>Llegadas Tarde</span>
          </div>
        </div>
      </div>

      {/* Mensaje de error si algo falló */}
      {error && <p className={styles.errorText}>{error}</p>}

      {/* === 3. TABLA DE DETALLE DE MARCAS === */}
      <div className={styles.tableContainer}>
        <h3>Detalle de Marcas Registradas</h3>
        <table className={styles.detailsTable}>
          <thead>
            <tr>
              <th>FECHA</th>
              <th>HORA</th>
              <th>TIPO</th>
              <th>ESTADO</th>
              <th>MÉTODO</th>
              <th>IP</th>
              <th>FOTO</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">Cargando marcas...</td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan="7">No hay marcas para este período.</td>
              </tr>
            ) : (
              records.map((rec) => {
                const date = new Date(rec.timestamp);
                return (
                  <tr key={rec.id}>
                    <td>{date.toLocaleDateString('es-ES')}</td>
                    <td>
                      {date.toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td>
                      <span
                        className={`${styles.tag} ${
                          rec.tipo === 'Entrada'
                            ? styles.tagEntrada
                            : styles.tagSalida
                        }`}
                      >
                        {rec.tipo}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.tag} ${
                          rec.estado === 'Válida'
                            ? styles.tagValida
                            : styles.tagAtraso
                        }`}
                      >
                        {rec.estado}
                      </span>
                    </td>
                    <td>{rec.metodo || '—'}</td>
                    <td>{rec.ip || '—'}</td>
                    <td>
                      {rec.foto_url ? (
                        <button
                          type="button"
                          className={styles.photoButton}
                          // más adelante podemos abrir el visor de fotos
                          onClick={() => window.open(rec.foto_url, '_blank')}
                        >
                          <FiCamera />
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DatosAsistencia;
