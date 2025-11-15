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
      
      // Leemos de "employee_personal"
      const { data, error } = await supabase
        .from('employee_personal')
        .select('id, nombre_completo, rut, cargo, estado, avatar, genero, discapacidad, fecha_nacimiento');

      if (error) {
        console.error("Error al cargar empleados:", error);
        setEmployees([]);
      } else {
        setEmployees(Array.isArray(data) ? data : []);
      }
      setLoading(false);
    };

    fetchEmployees();
  }, []);

  // Normaliza datos
  const safeEmployees = useMemo(() => {
    return (employees ?? []).map((emp) => ({
      id: emp.id ?? emp.rut ?? Math.random().toString(36).slice(2),
      nombre: emp.nombre_completo ?? 'Sin nombre',
      rut: emp.rut ?? '—',
      cargo: emp.cargo ?? '—',
      estado: emp.estado ?? '—',
      genero: emp.genero ?? 'Otro',
      discapacidad: emp.discapacidad ?? false,
      avatar: emp.avatar ?? '??',
      fechaIngreso: emp.fecha_nacimiento,
    }));
  }, [employees]);

  // Buscador
  const filteredEmployees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return safeEmployees;
    return safeEmployees.filter(e =>
      (e.nombre || '').toLowerCase().includes(q) ||
      (e.rut || '').toLowerCase().includes(q)
    );
  }, [safeEmployees, searchQuery]);

  // Stats
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
              const employeeRut = employee.rut; // lo usamos en la URL
              return (
                <tr key={employee.id}>
                  <td>
                    <div className={styles.avatar}>
                      {employee.avatar && typeof employee.avatar === 'string' && employee.avatar.startsWith('http') ? (
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
                    {/* ✅ RUTA ABSOLUTA CORRECTA */}
                    <Link
                      to={`/dashboard/rrhh/empleado/${employeeRut}/tictiva-360`}
                      className={styles.employeeNameLink}
                    >
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
                          setOpenDropdownId(openDropdownId === employee.id ? null : employee.id)
                        }
                      >
                        Ver Detalles
                      </button>

                      {openDropdownId === employee.id && (
                        <div className={styles.actionsDropdown}>
                          {/* ✅ TODAS LAS RUTAS ABSOLUTAS BAJO /dashboard/rrhh/empleado/:rut */}
                          <Link to={`/dashboard/rrhh/empleado/${employeeRut}/tictiva-360`}>Tictiva 360</Link>
                          <Link to={`/dashboard/rrhh/empleado/${employeeRut}/personal`}>Datos personales</Link>
                          <Link to={`/dashboard/rrhh/empleado/${employeeRut}/contractual`}>Datos contractuales</Link>
                          <Link to={`/dashboard/rrhh/empleado/${employeeRut}/previsional`}>Datos previsionales</Link>
                          <Link to={`/dashboard/rrhh/empleado/${employeeRut}/bancario`}>Datos bancarios</Link>
                          <Link to={`/dashboard/rrhh/empleado/${employeeRut}/salud`}>Datos de salud</Link>
                          <Link to={`/dashboard/rrhh/empleado/${employeeRut}/documentos`}>Documentos</Link>
                          <Link to={`/dashboard/rrhh/empleado/${employeeRut}/asistencia`}>Asistencia</Link>
                          {/* 🔁 AQUÍ EL CAMBIO: antes era /hoja-de-vida */}
                          <Link to={`/dashboard/rrhh/empleado/${employeeRut}/bitacora`}>Bitácora laboral 360</Link>
                          <Link to={`/dashboard/rrhh/empleado/${employeeRut}/historial`}>Historial</Link>
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
