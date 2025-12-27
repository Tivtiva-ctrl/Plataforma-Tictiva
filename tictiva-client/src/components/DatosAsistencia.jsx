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
  const [records, setRecords] = useState([]); // marcas (attendance_marks)
  const [viewType, setViewType] = useState('mensual'); // 'mensual' o 'semanal'
  const [currentDate, setCurrentDate] = useState(new Date()); // referencia de período
  const [error, setError] = useState(null);

  // ✅ Normaliza RUT para que calce entre app y web
  const normalizeRut = (r = '') =>
    r.replace(/\./g, '').replace(/\s/g, '').toUpperCase();

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
      const diffToMonday = (day + 6) % 7;
      start.setDate(start.getDate() - diffToMonday);
      start.setHours(0, 0, 0, 0);

      end.setTime(start.getTime());
      end.setDate(end.getDate() + 7);
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

  // ✅ Cargar MARCAS desde Supabase
  useEffect(() => {
    const fetchMarks = async () => {
      if (!rut) {
        setRecords([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { start, end } = getPeriodRange(currentDate, viewType);
        const rutNorm = normalizeRut(rut);

        const { data, error: dbError } = await supabase
          .from('attendance_marks') // ✅ tabla de marcas
          .select(
            'id, rut, mark_type, mark_time, status, method, ip_address, photo_url, created_at'
          )
          .eq('rut', rutNorm)
          .gte('created_at', start.toISOString())
          .lt('created_at', end.toISOString())
          .order('created_at', { ascending: false });

        if (dbError) throw dbError;

        setRecords(data || []);
      } catch (err) {
        console.error('Error al cargar marcas:', err?.message || err);
        setError('No se pudieron cargar las marcas de asistencia.');
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, [rut, viewType, currentDate]);

  // ✅ Stats (básicos para MVP)
  // - "Llegadas tarde": si status contiene "atraso" (por ahora)
  const tardies = records.filter((r) =>
    String(r.status || '').toLowerCase().includes('atraso')
  ).length;

  // - días con al menos 1 marca (unique days)
  const uniqueDays = new Set(
    records.map((r) =>
      new Date(r.created_at).toISOString().substring(0, 10)
    )
  ).size;

  const summaryStats = {
    asistencia: uniqueDays === 0 ? '—' : uniqueDays, // aquí mostramos días con marcas (más real que 100%)
    ausencias: 0, // más adelante lo calculamos con turnos/horarios
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
            <span className={styles.cardLabel}>Días con marcas</span>
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
                const date = new Date(rec.created_at);

                // Para hora mostramos mark_time si existe, sino hora de created_at
                const hora =
                  rec.mark_time ||
                  date.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                // Tipo: mark_type (Entrada/Salida/Colación)
                const tipo = rec.mark_type || '—';

                // Estado: status (Identidad verificada, etc.)
                const estado = rec.status || '—';

                // Tags: mantenemos tu lógica Entrada vs Salida sin romper
                const isEntrada = String(tipo).toLowerCase().includes('entrada');

                return (
                  <tr key={rec.id}>
                    <td>{date.toLocaleDateString('es-ES')}</td>
                    <td>{hora}</td>
                    <td>
                      <span
                        className={`${styles.tag} ${
                          isEntrada ? styles.tagEntrada : styles.tagSalida
                        }`}
                      >
                        {tipo}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.tag} ${
                          String(estado).toLowerCase().includes('verificada') ||
                          String(estado).toLowerCase().includes('válida')
                            ? styles.tagValida
                            : styles.tagAtraso
                        }`}
                      >
                        {estado}
                      </span>
                    </td>
                    <td>{rec.method || '—'}</td>
                    <td>{rec.ip_address || '—'}</td>
                    <td>
                      {rec.photo_url ? (
                        <button
                          type="button"
                          className={styles.photoButton}
                          onClick={() => window.open(rec.photo_url, '_blank')}
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
