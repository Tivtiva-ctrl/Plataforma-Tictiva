import { useState } from 'react';
import styles from './DashboardPage.module.css';
import { 
  FiBell, FiHelpCircle, FiSettings, FiSearch, FiChevronDown, 
  FiUsers, FiClock, FiMessageSquare, FiArchive, FiShield, FiBarChart2 
} from 'react-icons/fi';
import { IoBusiness } from 'react-icons/io5';

// --- Componente Interno (NUEVO ESTILO CON BOTONES) ---
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
      <div className={styles.moduleActions}>
        {actions.map((action, index) => (
          <button key={index} className={styles.moduleButton}>
            {action}
          </button>
        ))}
      </div>
    </div>
  );
}

// --- Componente Principal ---
function DashboardPage() {
  const [selectedCompany, setSelectedCompany] = useState('tictiva');

  // ... (código de handleCompanyChange) ...

  // === DATOS DE MÓDULOS ACTUALIZADOS (AHORA CON 'actions') ===
  const modules = [
    { 
      icon: <FiUsers size={20} />, 
      title: "RRHH", 
      description: "Gestión humana, clara y cercana", 
      // ===============================================
      // ¡AQUÍ ESTÁ LA CORRECCIÓN!
      // ===============================================
      actions: ["Listado de fichas", "Permisos y justificaciones", "Gestión de turnos", "Validación DT"],
      color: "var(--azul-tictiva)"
    },
    { 
      icon: <FiClock size={20} />, 
      title: "Asistencia", 
      description: "Control preciso, en tiempo real", 
      // (Este lo corregiremos después)
      actions: ["Supervisión integral", "Marcas registradas", "Mapa de cobertura", "Gestión de dispositivos"], 
      color: "#4CAF50"
    },
    { 
      icon: <FiMessageSquare size={20} />, 
      title: "Comunicaciones", 
      description: "Bienestar con IA integrada",
      // (Este lo corregiremos después)
      actions: ["Envío de mensajes", "Plantillas", "Encuestas de clima", "Canal de denuncias", "Dashboard"],
      color: "#2196F3"
    },
    { 
      icon: <FiBarChart2 size={20} />, 
      title: "Reportería", 
      description: "Datos que cuentan historias", 
      // (Este lo corregiremos después)
      actions: ["Informes gerenciales", "Dashboards y presentaciones", "Gestión de documentos", "Integraciones"],
      color: "#FF9800"
    },
    { 
      icon: <FiShield size={20} />, 
      title: "Tictiva Cuida", 
      description: "Bienestar con ADIA integrado", 
      // (Este lo corregiremos después)
      actions: ["Adia (IA central)", "Tests psicológicos", "Dashboard de bienestar", "+ Integrado con RRHH"],
      color: "var(--verde-menta)"
    },
    { 
      icon: <FiArchive size={20} />, 
      title: "Bodega & EPP", 
      description: "Inventario al servicio del equipo", 
      // (Este lo corregiremos después)
      actions: ["Inventario", "Colaboradores", "Operaciones", "Alertas"],
      color: "var(--gris-azulado)"
    },
  ];

  return (
    <div className={styles.dashboardContainer}>
      
      {/* === 1. BARRA DE NAVEGACIÓN SUPERIOR === */}
      <nav className={styles.topNav}>
        {/* ... (código de topNav se mantiene igual) ... */}
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

        {/* === TARJETA ÚNICA DE ESTADÍSTICAS === */}
        <section className={styles.statCardWide}>
          <div className={styles.statItem}>
            <h4>Humanizamos la gestión.</h4>
            <p>Digitalizamos tu tranquilidad</p>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <span>Mensajes</span>
            <span className={styles.statNumber}>3</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <span>Marcas hoy</span>
            <span className={styles.statNumber}>128</span>
          </div>
          <div className={styles.statDivider}></div>
          <div className={styles.statItem}>
            <span>Dispositivos activos</span>
            <span className={styles.statNumber}>5</span>
          </div>
        </section>

        {/* === GRILLA DE MÓDULOS === */}
        <section className={styles.moduleGrid}>
          {modules.map((mod) => (
            <ModuleCard 
              key={mod.title}
              icon={mod.icon}
              title={mod.title}
              description={mod.description}
              actions={mod.actions}
              color={mod.color}
            />
          ))}
        </section>

      </main>
    </div>
  );
}

export default DashboardPage;