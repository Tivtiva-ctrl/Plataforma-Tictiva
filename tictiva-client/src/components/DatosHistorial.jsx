// src/components/DatosHistorial.jsx
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

  // Filtros
  const [periodFilter, setPeriodFilter] = useState('hoy');
  const [categoryFilter, setCategoryFilter] = useState('TODAS');
  const [actorFilter, setActorFilter] = useState('TODOS');
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
        // usamos created_at para ordenar; si no existe, revisa nombre de tu columna de fecha
        .order('created_at', { ascending: false });

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
  const getDateFromItem = (item) => item.fecha || item.created_at || null;

  const getIcon = (tipo, categoria) => {
    const tipoUpper = (tipo || '').toUpperCase();
    const catUpper = (categoria || '').toUpperCase();

    if (tipoUpper === 'ASISTENCIA' || catUpper === 'ASISTENCIA') return <FiClock />;
    if (tipoUpper === 'DOCUMENTOS' || catUpper === 'DOCUMENTOS') return <FiFileText />;
    if (tipoUpper === 'SISTEMA' || catUpper === 'SISTEMA') return <FiSettings />;
    return <FiCheckCircle />;
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) return '';
    return `${date.toLocaleDateString('es-CL')} ${date.toLocaleTimeString('es-CL', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  };

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
      const src = getDateFromItem(item);
      if (!src) return false;
      const d = new Date(src);
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
      const cat = (
        item.categoria ||
        item.category ||
        item.origen ||
        item.tipo ||
        ''
      ).toUpperCase();
      return cat === categoryFilter;
    };

    const matchesActor = (item) => {
      if (actorFilter === 'TODOS') return true;
      const rol = (
        item.autor_rol ||
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
      const label = getGroupLabel(getDateFromItem(item));
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

      {/* FILTROS */}
      <section className={styles.filtersSection}>
        {/* Periodo */}
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

        {/* Categoría */}
        <div className={styles.filterBlock}>
          <h4>Categoría</h4>
          <div className={styles.filterPillsRow}>
            {[
              ['TODAS', 'Todas'],
              ['ASISTENCIA', 'Asistencia'],
              ['RRHH', 'RRHH'],
              ['BITACORA', 'Bitácora'],
              ['DOCUMENTOS', 'Documentos'],
              ['SISTEMA', 'Sistema'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`${styles.pillButton} ${
                  categoryFilter === value ? styles.pillActive : ''
                }`}
                onClick={() => setCategoryFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Realizado por */}
        <div className={styles.filterBlock}>
          <h4>Realizado por</h4>
          <div className={styles.filterPillsRow}>
            {[
              ['TODOS', 'Todos'],
              ['ADMINISTRADOR', 'Administrador'],
              ['SUPERVISOR', 'Supervisor'],
              ['SISTEMA', 'Sistema'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={`${styles.pillButton} ${
                  actorFilter === value ? styles.pillActive : ''
                }`}
                onClick={() => setActorFilter(value)}
              >
                {label}
              </button>
            ))}
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
              {group.items.map((item, index) => {
                const dateValue = getDateFromItem(item);
                return (
                  <div key={item.id} className={styles.timelineItem}>
                    {index === 0 && (
                      <div className={styles.dateLabel}>{group.label}</div>
                    )}

                    <div className={styles.eventCard}>
                      <div className={styles.iconWrapper}>
                        {getIcon(item.tipo, item.categoria)}
                      </div>

                      <div className={styles.contentWrapper}>
                        <h3 className={styles.eventTitle}>
                          {item.titulo || 'Acción registrada'}
                        </h3>
                        <small className={styles.eventMeta}>
                          Por: <strong>{item.autor || 'Sistema'}</strong> –{' '}
                          {formatDate(dateValue)}
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
                );
              })}
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default DatosHistorial;
