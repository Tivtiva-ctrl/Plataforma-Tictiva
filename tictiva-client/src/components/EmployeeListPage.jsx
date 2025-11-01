import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Importamos Supabase
import styles from './EmployeeListPage.module.css';
import { 
  FiSearch, FiPlus, FiUpload, FiUsers, FiCheckCircle, FiXCircle, 
  FiUser
} from 'react-icons/fi'; 
import { GoTable } from 'react-icons/go';

function EmployeeListPage() {
  // Datos de stats (aún de ejemplo)
  const stats = {
    total: 125,
    active: 98,
    inactive: 27,
    male: 68,
    female: 54,
    other: 3,
    disabled: 8,
  };

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('employees')
        .select('*'); // Selecciona todo

      if (error) {
        console.error("Error al cargar empleados:", error);
      } else {
        setEmployees(data);
      }
      
      setLoading(false);
    };

    fetchEmployees();
  }, []); 

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
      {/* HEADER DE LA PÁGINA */}
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

      {/* STATS CARDS */}
      <div className={styles.statsGrid}>
        {/* ... (tu código de stats cards) ... */}
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FiUsers /></div>
          <div><h3>Total</h3><p>{stats.total}</p></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconGreen}><FiCheckCircle /></div>
          <div><h3>Activos</h3><p>{stats.active}</p></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconRed}><FiXCircle /></div>
          <div><h3>Inactivos</h3><p>{stats.inactive}</p></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FiUser /></div>
          <div><h3>Hombres</h3><p>{stats.male}</p></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FiUser /></div>
          <div><h3>Mujeres</h3><p>{stats.female}</p></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FiUsers /></div>
          <div><h3>Otros</h3><p>{stats.other}</p></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FiUser /></div>
          <div><h3>Con Discapacidad</h3><p>{stats.disabled}</p></div>
        </div>
      </div>

      {/* TABLA DE EMPLEADOS */}
      <div className={styles.tableContainer}>
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
            {/* =============================================== */}
            {/* === ¡AQUÍ ESTÁN LAS CORRECCIONES! === */}
            {/* =============================================== */}
            {employees.map(employee => (
              // 1. Añadimos la "key" para solucionar el error de consola
              <tr key={employee.id}> 
                <td>
                  <div className={styles.avatar}>
                    {/* 2. Usamos 'employee.avatar' (el nombre de tu columna) */}
                    {employee.avatar ? employee.avatar : '??'}
                  </div>
                </td>
                {/* 3. Usamos 'employee.nombre' */}
                <td><a href="#" className={styles.employeeNameLink}>{employee.nombre}</a></td>
                <td>{employee.rut}</td>
                {/* 4. Usamos 'employee.cargo' */}
                <td>{employee.cargo}</td>
                <td>
                  {/* 5. Usamos 'employee.estado' */}
                  <span className={`${styles.statusBadge} ${employee.estado === 'Activo' ? styles.statusActive : styles.statusInactive}`}>
                    {employee.estado}
                  </span>
                </td>
                <td>
                  {/* ... (tu código de acciones) ... */}
                  <div className={styles.actionsCell}>
                    <button 
                      className={styles.actionsButton} 
                      onClick={() => setOpenDropdownId(openDropdownId === employee.id ? null : employee.id)}
                    >
                      Ver Detalles
                    </button>
                    {openDropdownId === employee.id && (
                      <div className={styles.actionsDropdown}>
                        <a href="#">Perfil 360</a>
                        <a href="#">Datos personales</a>
                        <a href="#">Datos contractuales</a>
                        <a href="#">Documentos</a>
                        <a href="#">Previsión</a>
                        <a href="#">Bancarios</a>
                        <a href="#">Asistencia</a>
                        <a href="#">Hoja de vida</a>
                        <a href="#">Historial</a>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINACIÓN */}
      <div className={styles.pagination}>
        <span>Mostrando 1 a {employees.length} de {employees.length} resultados</span>
        <div className={styles.paginationControls}>
          <button>&lt;</button>
          <button className={styles.activePage}>1</button>
          <button>&gt;</button>
        </div>
      </div>

    </div>
  );
}

export default EmployeeListPage;