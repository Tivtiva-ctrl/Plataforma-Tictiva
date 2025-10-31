import { useState } from 'react';
import styles from './DashboardPage.module.css';
import { 
  FiBell, FiHelpCircle, FiSettings, FiSearch, FiChevronDown, 
  FiUsers, FiClock, FiMessageSquare, FiArchive, FiShield, FiBarChart2 
} from 'react-icons/fi';
import { IoBusiness } from 'react-icons/io5';

// =======================================================
// === ¡AQUÍ ESTÁ EL CAMBIO! El Card con BOTONES ===
// =======================================================
function ModuleCard({ icon, title, description, actions, color }) {
  const iconStyle = {
    backgroundColor: color,
    color: '#FFFFFF'
  };

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleHeader}>
        <div className={styles.moduleIcon} style={iconStyle}>
          {icon}
        </div>
        <div>
          <h3 className={styles.moduleTitle}>{title}</h3>
          <p className={styles.moduleDesc}>{description}</p>
        </div>
      </div>
      {/* Usamos los botones (Lirmi-style) */}
      <div className={styles.moduleActions}>
        {actions.map((action, index) => (
          <button key={index} className={styles.moduleButton}>
            {action}
          </button>
        ))}
      </div>
      {/* ¡NO hay enlace "Abrir módulo"! */}
    </div>
  );
}

// --- Componente Principal ---
function DashboardPage() {
  const [selectedCompany, setSelectedCompany] = useState('tictiva');

  // ... (código de handleCompanyChange) ...

  // Tus datos de módulos (perfectos)
  const modules = [
    { 
      icon: <FiUsers size={20} />, 
      title: "RRHH", 
      description: "Gestión humana, clara y cercana", 
      actions: ["Listado de fichas", "Permisos y justificaciones", "Gestión de turnos", "Validación DT"],
      color: "var(--azul-tictiva)"
    },
    { 
      icon: <FiClock size={20} />, 
      title: "Asistencia", 
      description: "Control preciso, en tiempo real", 
      actions: ["Supervisión integral", "Marcas registradas", "Mapa de cobertura", "Gestión de dispositivos"], 
      color: "#4CAF50"
    },
    { 
      icon: <FiMessageSquare size={20} />, 
      title: "Comunicaciones", 
      description: "Mensajes y encuestas sin fricción", // (Texto original)
      actions: ["Envío de mensajes", "Plantillas", "Encuestas de clima", "Canal de denuncias", "Dashboard"],
      color: "#2196F3"
    },
    { 
      icon: <FiBarChart2 size={20} />, 
      title: "Reportería", 
      description: "Datos que cuentan historias", 
      actions: ["Informes gerenciales", "Dashboards y presentaciones", "Gestión de documentos", "Integraciones"],
      color: "#FF9800"
    },
    { 
      icon: <FiShield size={20} />, 
      title: "Tictiva Cuida", 
      description: "Bienestar con ADIA integrado", 
      actions: ["Adia (IA central)", "Tests psicológicos", "Dashboard de bienestar", "+ Integrado con RRHH"],
      color: "var(--verde-menta)"
    },
    { 
      icon: <FiArchive size={20} />, 
      title: "Bodega & EPP", 
      description: "Inventario al servicio del equipo", 
      actions: ["Inventario", "Colaboradores", "Operaciones", "Alertas"],
      color: "var(--gris-azulado)"
    },
  ];

  return (
    <div className={styles.dashboardContainer}>
      
      {/* === 1. BARRA DE NAVEGACIÓN SUPERIOR (Se mantiene igual) === */}
      <nav className={styles.topNav}>
        {/* ... (tu código de nav) ... */}
        <div className={styles.navLeft}>
          <div className={styles.logo}>Tictiva</div>
          <div className={styles.companySelector}>
            <IoBusiness />
            <select value={selectedCompany} onChange={() => {}}>
              <option value="tictiva">Tictiva (Empresa Principal)</option>
              <option value="otra-empresa">Otra Empresa S.A.</option>
            </select>
            <FiChevronDown className={styles.selectArrow} />
          </div>
        </div>
        <div className={styles.navRight}>
          <div className={styles.searchBar}>
            <FiSearch />
            <input type="text" placeholder="Buscar módulos o reportes..." />
          </div>
          <button className={styles.iconButton}><FiHelpCircle size={22} /></button>
          <button className={styles.iconButton}><FiSettings size={22} /></button>
          <button className={styles.iconButton}>
            <FiBell size={22} />
            <span className={styles.notificationDot}></span>
          </button>
          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>VM</div>
            <span>Verónica Mateo</span>
          </div>
        </div>
      </nav>

      {/* === 2. CONTENIDO PRINCIPAL === */}
      <main className={styles.mainContent}>
        
        {/* Saludo */}
        <header className={styles.dashboardHeader}>
          <h1>Buenas noches, Verónica 💚</h1>
          <p>Humanizamos la gestión. Digitalizamos tu tranquilidad.</p>
        </header>

        {/* =============================================== */}
        {/* === ¡AQUÍ ESTÁ EL CAMBIO! Volvemos a las 3 stats === */}
        {/* =============================================== */}
        <section className={styles.statCards}>
          <div className={styles.statCard}>
            <h3>Mensajes</h3>
            <span className={styles.statNumber}>3</span>
          </div>
          <div className={styles.statCard}>
            <h3>Marcas hoy</h3>
            <span className={styles.statNumber}>128</span>
          </div>
          <div className={styles.statCard}>
            <h3>Dispositivos activos</h3>
            <span className={styles.statNumber}>5</span>
          </div>
        </section>

        {/* === GRILLA DE MÓDULOS (Orden 3x2) === */}
        <section className={styles.moduleGrid}>
          {modules.map((mod) => (
            <ModuleCard 
              key={mod.title}
              icon={mod.icon}
              title={mod.title}
              description={mod.description}
              actions={mod.actions} // Pasamos 'actions'
              color={mod.color}
            />
          ))}
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;