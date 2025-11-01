import React, { useState } from 'react';
import styles from './EmployeeListPage.module.css';
// ===============================================
// === ¡AQUÍ ESTÁ LA CORRECCIÓN DEL IMPORT! ===
// ===============================================
import { 
  FiSearch, FiPlus, FiUpload, FiUsers, FiCheckCircle, FiXCircle, 
  FiUser, // El ícono que sí existe
  FiUsers as FiUsersOther // Mantenemos el alias para "Otros"
} from 'react-icons/fi'; 
import { GoTable } from 'react-icons/go';

function EmployeeListPage() {
  // Datos de ejemplo para las stats cards
  const stats = {
    total: 125,
    active: 98,
    inactive: 27,
    male: 68,
    female: 54,
    other: 3,
    disabled: 8,
  };

  // Datos de ejemplo para la tabla (lo iremos construyendo)
  const employees = [
    { id: 1, avatar: "JD", name: "Juan Díaz Morales", rut: "12.345.678-9", position: "Gerente de Operaciones", status: "Activo" },
    { id: 2, avatar: "MP", name: "María Pérez Lagos", rut: "14.567.890-1", position: "Analista de Recursos Humanos", status: "Activo" },
    { id: 3, avatar: "CR", name: "Carlos Rodríguez Vega", rut: "16.789.012-3", position: "Desarrollador Senior", status: "Activo" },
    { id: 4, avatar: "AG", name: "Ana González Muñoz", rut: "18.901.234-5", position: "Diseñadora UX/UI", status: "Inactivo" },
    { id: 5, avatar: "LS", name: "Luis Soto Parra", rut: "15.432.109-7", position: "Contador", status: "Activo" },
  ];

  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);

  return (
    <div className={styles.employeeListPage}>
      {/* HEADER DE LA PÁGINA */}
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>
          <GoTable size={28} style={{ marginRight: '0.75rem' }} /> Lista de Empleados - Test 1
        </h1>
        <p className={styles.pageSubtitle}>
          Información de empleados para Test One SpA. Haga clic en el nombre para ver detalles.
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
        {/* =============================================== */}
        {/* === ¡AQUÍ ESTÁ LA CORRECCIÓN DE LOS ÍCONOS! === */}
        {/* =============================================== */}
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FiUser /></div> {/* Reemplazamos FiMale */}
          <div><h3>Hombres</h3><p>{stats.male}</p></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FiUser /></div> {/* Reemplazamos FiFemale */}
          <div><h3>Mujeres</h3><p>{stats.female}</p></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FiUsersOther /></div>
          <div><h3>Otros</h3><p>{stats.other}</p></div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}><FiUser /></div>
          <div><h3>Con Discapacidad</h3><p>{stats.disabled}</p></div>
        </div>
      </div>

      {/* TABLA DE EMPLEADOS (ESTRUCTURA BÁSICA POR AHORA) */}
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
            {employees.map(employee => (
              <tr key={employee.id}>
                <td><div className={styles.avatar}>{employee.avatar}</div></td>
                <td><a href="#" className={styles.employeeNameLink}>{employee.name}</a></td>
                <td>{employee.rut}</td>
                <td>{employee.position}</td>
                <td>
                  <span className={`${styles.statusBadge} ${employee.status === 'Activo' ? styles.statusActive : styles.statusInactive}`}>
                    {employee.status}
                  </span>
                </td>
                <td>
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
        <span>Mostrando 1 a 5 de 125 resultados</span>
        <div className={styles.paginationControls}>
          <button>&lt;</button>
          <button className={styles.activePage}>1</button>
          <button>2</button>
          <button>3</button>
          <span>...</span>
          <button>25</button>
          <button>&gt;</button>
        </div>
      </div>

    </div>
  );
}

export default EmployeeListPage;