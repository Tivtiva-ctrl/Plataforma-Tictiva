// 1. IMPORTAMOS Link
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styles from './EmployeeListPage.module.css';
import { 
  FiSearch, FiPlus, FiUpload, FiUsers, FiCheckCircle, FiXCircle, FiUser
} from 'react-icons/fi'; 
import { GoTable } from 'react-icons/go';

function EmployeeListPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);

      // ✅ Columnas reales: "nombre completo" (con espacio), rut, cargo, estado, avatar
      const { data, error } = await supabase
        .from('employees')
        .select('"nombre completo", rut, cargo, estado, avatar')
        .order('"nombre completo"', { ascending: true });

      if (error) {
        console.error("Error al cargar empleados:", {
          message: error.message, details: error.details, hint: error.hint, code: error.code
        });
        setEmployees([]);
      } else {
        setEmployees(Array.isArray(data) ? data : []);
      }
      setLoading(false);
    };

    fetchEmployees();
  }, []);

  // Normaliza a un shape estable para la UI (usa RUT como id)
  const safeEmployees = useMemo(() => {
    return (employees ?? []).map((emp) => ({
      // Usamos el RUT como clave estable (no hay 'id' en tu tabla)
      id: emp?.rut ?? Math.random().toString(36).slice(2),
      nombre: emp?.['nombre completo'] ?? 'Sin nombre',
      rut: emp?.rut ?? '—',
      cargo: emp?.cargo ?? '—',
      estado: emp?.estado ?? '—',
      // Defaults para tarjetas que aún no están en tu schema
      genero: 'Otro',
      discapacidad: false,
      // Solo URL string válida; si no, null para mostrar iniciales
      avatar: typeof emp?.avatar === 'string' ? emp.avatar : null,
    }));
  }, [employees]);

  // Buscador (sobre la lista normalizada)
  const filteredEmployees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return safeEmployees;
    return safeEmployees.filter(e =>
      (e.nombre || '').toLowerCase().includes(q) ||
      (e.rut || '').toLowerCase().includes(q)
    );
  }, [safeEmployees, searchQuery]);

  // Estadísticas (usa los datos seguros)
  const totalEmployees = safeEmployees.length;
  const activeEmployees = safeEmployees.filter(e => (e.estado || '').toLowerCase() === 'activo').length;
  const inactiveEmployees = safeEmployees.filter(e => (e.estado || '').toLowerCase() === 'inactivo').length;
  const maleEmployees = safeEmployees.filter(e => (e.genero || '').toLowerCase() === 'hombre').length;
  const femaleEmployees = safeEmployees.filter(e => (e.genero || '').toLowerCase() === 'mujer').length;
  const otherEmployees = totalEmployees - maleEmployees - femaleEmployees;
  const disabledEmployees = safeEmployees.filter(e => e.discapacidad === true).length;

  const getInitials = (fullName) => {
    if (!fullName || fullName === 'Sin nombre') return '??';
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts[parts.length - 1]?.[0] || '';
    return (first + last).toUpperCase() || '??';
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <h2>Cargando empleados...</h2>
        <p>Por favor, espera un momento.</p>
      </div>
    );
  }

  return (
    <div className={styles.employeeListPage}>
      {/* HEADER */}
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>
          <GoTable size={28} style={{ marginRight: '0.75rem' }} /> Lista de Empleados
        </h1>
        <p className={styles.pageSubtitle}>
          Gestiona la información de todos los colaboradores de la empresa.
        </p>
        <div className={styles.headerActions}>
          <div className={styles.searchBar}>
            <FiSearch />
            <input
              type="text"
              placeholder="Buscar por nombre o RUT"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className={styles.btnSecondary}>
            <FiUpload /> Carga Masiva
          </button>
          <button className={styles.btnPrimary}>
            <FiPlus /> Crear Empleado
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FiUsers /></div>
          <div><h3>Total</h3><p>{totalEmployees}</p></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconGreen}><FiCheckCircle /></div>
          <div><h3>Activos</h3><p>{activeEmployees}</p></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconRed}><FiXCircle /></div>
          <div><h3>Inactivos</h3><p>{inactiveEmployees}</p></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FiUser /></div>
          <div><h3>Hombres</h3><p>{maleEmployees}</p></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FiUser /></div>
          <div><h3>Mujeres</h3><p>{femaleEmployees}</p></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FiUsers /></div>
          <div><h3>Otros</h3><p>{otherEmployees}</p></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FiUser /></div>
          <div><h3>Con Discapacidad</h3><p>{disabledEmployees}</p></div>
        </div>
      </div>

      {/* TABLA */}
      <div className={styles.tableWrapper}>
        <table className={styles.employeeTable}>
          <thead>
            <tr>
              <th>FOTO</th>
              <th>NOMBRE COMPLETO</th>
              <th>RUT</th>
              <th>CARGO</th>
              <th>ESTADO</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map(employee => {
              const rowKey = employee.id; // Usamos el RUT como clave estable
              return (
                <tr key={rowKey}>
                  <td>
                    <div className={styles.avatar}>
                      {employee.avatar ? (
                        <img
                          src={employee.avatar}
                          alt={employee.nombre}
                          className={styles.avatarImg}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ) : (
                        <span className={styles.avatarInitials}>
                          {getInitials(employee.nombre)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {/* Nombre como Link a la ficha */}
                    <Link to={`/dashboard/rrhh/empleado/${rowKey}/tictiva-360`} className={styles.employeeNameLink}>
                      {employee.nombre}
                    </Link>
                  </td>
                  <td>{employee.rut}</td>
                  <td>{employee.cargo}</td>
                  <td>
                    <span
                      className={`${styles.statusBadge} ${
                        (employee.estado || '').toLowerCase() === 'activo'
                          ? styles.statusActive
                          : styles.statusInactive
                      }`}
                    >
                      {employee.estado}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actionsCell}>
                      <button 
                        className={styles.actionsButton} 
                        onClick={() =>
                          setOpenDropdownId(openDropdownId === rowKey ? null : rowKey)
                        }
                      >
                        Ver Detalles
                      </button>

                      {openDropdownId === rowKey && (
                        <div className={styles.actionsDropdown}>
                          <Link to={`/dashboard/rrhh/empleado/${rowKey}/tictiva-360`}>Tictiva 360</Link>
                          <Link to={`/dashboard/rrhh/empleado/${rowKey}/personal`}>Datos personales</Link>
                          <Link to={`/dashboard/rrhh/empleado/${rowKey}/contractual`}>Datos contractuales</Link>
                          <Link to={`/dashboard/rrhh/empleado/${rowKey}/previsional`}>Datos previsionales</Link>
                          <Link to={`/dashboard/rrhh/empleado/${rowKey}/bancario`}>Datos bancarios</Link>
                          <Link to={`/dashboard/rrhh/empleado/${rowKey}/salud`}>Datos de salud</Link>
                          <Link to={`/dashboard/rrhh/empleado/${rowKey}/documentos`}>Documentos</Link>
                          <Link to={`/dashboard/rrhh/empleado/${rowKey}/asistencia`}>Asistencia</Link>
                          <Link to={`/dashboard/rrhh/empleado/${rowKey}/hoja-de-vida`}>Hoja de vida</Link>
                          <Link to={`/dashboard/rrhh/empleado/${rowKey}/historial`}>Historial</Link>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      <div className={styles.pagination}>
        <span>
          Mostrando 1 a {filteredEmployees.length} de {filteredEmployees.length} resultados
        </span>
        <div className={styles.paginationControls}>
          <button disabled>&lt;</button>
          <button className={styles.activePage}>1</button>
          <button disabled>&gt;</button>
        </div>
      </div>
    </div>
  );
}

export default EmployeeListPage;
