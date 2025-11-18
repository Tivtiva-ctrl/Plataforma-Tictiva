// DatosHistorial.jsx
// ==========================================
//  HISTORIAL DEL COLABORADOR – TODOS LOS MOVIMIENTOS
// ==========================================

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../supabaseClient';
import styles from './DatosHistorial.module.css';
import {
  FiClock,
  FiFileText,
  FiSettings,
  FiCheckCircle,
  FiSearch,
} from 'react-icons/fi';

// ==========================================
// === COMPONENTE PRINCIPAL
// ==========================================
function DatosHistorial({ rut }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros (arriba, estilo Canva)
  const [periodFilter, setPeriodFilter] = useState('hoy'); // hoy | 7d | 30d | year | all
  const [categoryFilter, setCategoryFilter] = useState('TODAS'); // TODAS | ASISTENCIA | RRHH | BITACORA | DOCUMENTOS | SISTEMA
  const [actorFilter, setActorFilter] = useState('TODOS'); // TODOS | ADMINISTRADOR | SUPERVISOR | SISTEMA
  const [searchQuery, setSearchQuery] = useState('');

  // ==============================
  // CARGA DESDE SUPABASE
  // ==============================
  useEffect(() => {
    const fetchHistory = async () => {
      if (!rut) return;

      setLoading(true);

      const { data, error } = await supabase
        .from('employee_history')
        .select('*')
        .eq('rut', rut)
        .order('fecha', { ascending: false });

      if (error) {
        console.error('Error cargando historial:', error);
        setHistory([]);
      } else {
        setHistory(data || []);
      }

      setLoading(false);
    };

    fetchHistory();
  }, [rut]);

  // ==============================
  // HELPERS
  // ==============================

  // Ícono según tipo / categoría
  const getIcon = (tipo, categoria) => {
    const tipoUpper = (tipo || '').toUpperCase();
    const catUpper = (categoria || '').toUpperCase();

    if (tipoUpper === 'ASISTENCIA' || catUpper === 'ASISTENCIA') return <FiClock />;
    if (tipoUpper === 'DOCUMENTOS' || catUpper === 'DOCUMENTOS') return <FiFileText />;
    if (tipoUpper === 'SISTEMA' || catUpper === 'SISTEMA') return <FiSettings />;
    return <FiCheckCircle />;
  };

  // Formatea fecha → "15/11/2025 10:22"
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return '';
    return `${date.toLocaleDateString('es-CL')} ${date.toLocaleTimeString(
      'es-CL',
      { hour: '2-digit', minute: '2-digit' }
    )}`;
  };

  // Etiqueta de grupo → HOY / AYER / "13 NOV"
  const getGroupLabel = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const sameDay = (a, b) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (sameDay(date, today)) return 'HOY';
    if (sameDay(date, yesterday)) return 'AYER';

    return date
      .toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
      })
      .toUpperCase();
  };

  // ==============================
  // APLICAR FILTROS EN MEMORIA
  // ==============================
  const filteredHistory = useMemo(() => {
    const now = new Date();

    const matchesPeriod = (item) => {
      if (!item.fecha) return false;
      const d = new Date(item.fecha);
      if (Number.isNaN(d.getTime())) return false;

      const startOfToday = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      const diffMs = startOfToday - new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      switch (periodFilter) {
        case 'hoy':
          return d.toDateString() === now.toDateString();
        case '7d':
          return diffDays <= 7 && diffDays >= 0;
        case '30d':
          return diffDays <= 30 && diffDays >= 0;
        case 'year':
          return d.getFullYear() === now.getFullYear();
        case 'all':
        default:
          return true;
      }
    };

    const matchesCategory = (item) => {
      if (categoryFilter === 'TODAS') return true;
      const cat =
        (item.categoria ||
          item.category ||
          item.origen ||
          item.tipo ||
          ''
        ).toUpperCase();
      return cat === categoryFilter;
    };

    const matchesActor = (item) => {
      if (actorFilter === 'TODOS') return true;
      const rol =
        (item.autor_rol ||
          item.actor_role ||
          item.actor_type ||
          ''
        ).toUpperCase();
      return rol === actorFilter;
    };

    const matchesSearch = (item) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        (item.titulo || '').toLowerCase().includes(q) ||
        (item.descripcion || '').toLowerCase().includes(q)
      );
    };

    return (history || [])
      .filter(matchesPeriod)
      .filter(matchesCategory)
      .filter(matchesActor)
      .filter(matchesSearch);
  }, [history, periodFilter, categoryFilter, actorFilter, searchQuery]);

  // ==============================
  // AGRUPAR POR FECHA (HOY / AYER / 13 NOV)
// ==============================
  const groupedHistory = useMemo(() => {
    const groups = [];
    filteredHistory.forEach((item) => {
      const label = getGroupLabel(item.fecha);
      let group = groups.find((g) => g.label === label);
      if (!group) {
        group = { label, items: [] };
        groups.push(group);
      }
      group.items.push(item);
    });
    return groups;
  }, [filteredHistory]);

  return (
    <div className={styles.historyContainer}>
      {/* HEADER */}
      <header className={styles.header}>
        <h2>Historial del Colaborador</h2>
        <p className={styles.subtitle}>
          Registro detallado de todos los movimientos y acciones realizadas en la
          plataforma.
        </p>
      </header>

      {/* FILTROS SUPERIORES (PERÍODO / CATEGORÍA / REALIZADO POR / BUSCAR) */}
      <section className={styles.filtersSection}>
        {/* Filtro: Periodo */}
        <div className={styles.filterBlock}>
          <h4>Periodo</h4>
          <div className={styles.filterPillsRow}>
            <button
              type="button"
              className={`${styles.pillButton} ${
                periodFilter === 'hoy' ? styles.pillActive : ''
              }`}
              onClick={() => setPeriodFilter('hoy')}
            >
              Hoy
            </button>
            <button
              type="button"
              className={`${styles.pillButton} ${
                periodFilter === '7d' ? styles.pillActive : ''
              }`}
              onClick={() => setPeriodFilter('7d')}
            >
              Últimos 7 días
            </button>
            <button
              type="button"
              className={`${styles.pillButton} ${
                periodFilter === '30d' ? styles.pillActive : ''
              }`}
              onClick={() => setPeriodFilter('30d')}
            >
              Últimos 30 días
            </button>
            <button
              type="button"
              className={`${styles.pillButton} ${
                periodFilter === 'year' ? styles.pillActive : ''
              }`}
              onClick={() => setPeriodFilter('year')}
            >
              Este año
            </button>
            <button
              type="button"
              className={`${styles.pillButton} ${
                periodFilter === 'all' ? styles.pillActive : ''
              }`}
              onClick={() => setPeriodFilter('all')}
            >
              Personalizado
            </button>
          </div>
        </div>

        {/* Filtro: Categoría */}
        <div className={styles.filterBlock}>
          <h4>Categoría</h4>
          <div className={styles.filterPillsRow}>
            <button
              type="button"
              className={`${styles.pillButton} ${
                categoryFilter === 'TODAS' ? styles.pillActive : ''
              }`}
              onClick={() => setCategoryFilter('TODAS')}
            >
              Todas
            </button>
            <button
              type="button"
              className={`${styles.pillButton} ${
                categoryFilter === 'ASISTENCIA' ? styles.pillActive : ''
              }`}
              onClick={() => setCategoryFilter('ASISTENCIA')}
            >
              Asistencia
            </button>
            <button
              type="button"
              className={`${styles.pillButton} ${
                categoryFilter === 'RRHH' ? styles.pillActive : ''
              }`}
              onClick={() => setCategoryFilter('RRHH')}
            >
              RRHH
            </button>
            <button
              type="button"
              className={`${styles.pillButton} ${
                categoryFilter === 'BITACORA' ? styles.pillActive : ''
              }`}
              onClick={() => setCategoryFilter('BITACORA')}
            >
              Bitácora
            </button>
            <button
              type="button"
              className={`${styles.pillButton} ${
                categoryFilter === 'DOCUMENTOS' ? styles.pillActive : ''
              }`}
              onClick={() => setCategoryFilter('DOCUMENTOS')}
            >
              Documentos
            </button>
            <button
              type="button"
              className={`${styles.pillButton} ${
                categoryFilter === 'SISTEMA' ? styles.pillActive : ''
              }`}
              onClick={() => setCategoryFilter('SISTEMA')}
            >
              Sistema
            </button>
          </div>
        </div>

        {/* Filtro: Realizado por */}
        <div className={styles.filterBlock}>
          <h4>Realizado por</h4>
          <div className={styles.filterPillsRow}>
            <button
              type="button"
              className={`${styles.pillButton} ${
                actorFilter === 'TODOS' ? styles.pillActive : ''
              }`}
              onClick={() => setActorFilter('TODOS')}
            >
              Todos
            </button>
            <button
              type="button"
              className={`${styles.pillButton} ${
                actorFilter === 'ADMINISTRADOR' ? styles.pillActive : ''
              }`}
              onClick={() => setActorFilter('ADMINISTRADOR')}
            >
              Administrador
            </button>
            <button
              type="button"
              className={`${styles.pillButton} ${
                actorFilter === 'SUPERVISOR' ? styles.pillActive : ''
              }`}
              onClick={() => setActorFilter('SUPERVISOR')}
            >
              Supervisor
            </button>
            <button
              type="button"
              className={`${styles.pillButton} ${
                actorFilter === 'SISTEMA' ? styles.pillActive : ''
              }`}
              onClick={() => setActorFilter('SISTEMA')}
            >
              Sistema
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className={styles.filterBlock}>
          <h4>Buscar</h4>
          <div className={styles.searchBar}>
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar acciones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* TIMELINE */}
      <section className={styles.timeline}>
        {loading ? (
          <p className={styles.loadingText}>Cargando historial...</p>
        ) : groupedHistory.length === 0 ? (
          <p className={styles.emptyText}>No hay movimientos registrados.</p>
        ) : (
          groupedHistory.map((group) => (
            <div key={group.label} className={styles.groupBlock}>
              {group.items.map((item, index) => (
                <div key={item.id} className={styles.timelineItem}>
                  {/* Etiqueta de fecha (HOY, AYER, 13 NOV) solo en el primer item del grupo */}
                  {index === 0 && (
                    <div className={styles.dateLabel}>{group.label}</div>
                  )}

                  {/* Tarjeta de evento */}
                  <div className={styles.eventCard}>
                    <div className={styles.iconWrapper}>
                      {getIcon(item.tipo, item.categoria)}
                    </div>

                    <div className={styles.contentWrapper}>
                      <h3 className={styles.eventTitle}>
                        {item.titulo || 'Acción registrada'}
                      </h3>
                      <small className={styles.eventMeta}>
                        Por:{' '}
                        <strong>{item.autor || 'Sistema'}</strong> –{' '}
                        {formatDate(item.fecha)}
                      </small>

                      <p className={styles.eventDescription}>
                        {item.descripcion ||
                          'Movimiento registrado en la plataforma.'}
                      </p>

                      <div className={styles.tags}>
                        <span className={styles.tagTipo}>
                          {(item.categoria || item.tipo || 'OTRO').toString()}
                        </span>
                        {item.estado && (
                          <span className={styles.tagEstado}>
                            {item.estado}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default DatosHistorial;
