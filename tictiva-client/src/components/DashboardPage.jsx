import { useState } from 'react';
import styles from './DashboardPage.module.css';
import { 
  FiBell, FiHelpCircle, FiSettings, FiSearch, FiChevronDown, 
} from 'react-icons/fi';
import { IoBusiness } from 'react-icons/io5';

// Importamos tus imágenes
import iconRrhh from '../assets/icon-rrhh.png'; 
import iconAsistencia from '../assets/icon-asistencia.png';
import iconComunicaciones from '../assets/icon-comunicaciones.png';
import iconReporteria from '../assets/icon-reporteria.png';
import iconCuida from '../assets/icon-cuida.png';
import iconBodega from '../assets/icon-bodega.png';


// --- Componente Interno (No cambia) ---
function ModuleCard({ icon, title, description, actions }) {
  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleHeader}>
        <div className={styles.moduleIcon}>
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

  const modules = [
    { 
      icon: <img src={iconRrhh} alt="RRHH" />, 
      title: "RRHH", 
      description: "Gestión humana, clara y cercana", 
      actions: ["Listado de fichas", "Permisos y justificaciones", "Gestión de turnos", "Validación DT"],
    },
    { 
      icon: <img src={iconAsistencia} alt="Asistencia" />, 
      title: "Asistencia", 
      description: "Control preciso, en tiempo real", 
      actions: ["Supervisión integral", "Marcas registradas", "Mapa de cobertura", "Gestión de dispositivos"], 
    },
    { 
      icon: <img src={iconComunicaciones} alt="Comunicaciones" />, 
      title: "Comunicaciones", 
      description: "Mensajes y encuestas sin fricción",
      actions: ["Envío de mensajes", "Plantillas", "Encuestas de clima", "Canal de denuncias", "Dashboard"],
    },
    { 
      icon: <img src={iconReporteria} alt="Reportería" />, 
      title: "Reportería", 
      description: "Datos que cuentan historias", 
      actions: ["Informes gerenciales", "Dashboards y presentaciones", "Gestión de documentos", "Integraciones"],
    },
    { 
      icon: <img src={iconCuida} alt="Tictiva Cuida" />, 
      title: "Tictiva Cuida", 
      description: "Bienestar con ADIA integrado", 
      actions: ["Adia (IA central)", "Tests psicológicos", "Dashboard de bienestar", "+ Integrado con RRHH"],
    },
    { 
      icon: <img src={iconBodega} alt="Bodega & EPP" />, 
      title: "Bodega & EPP", 
      description: "Inventario al servicio del equipo", 
      actions: ["Inventario", "Colaboradores", "Operaciones", "Alertas"],
    },
  ];

  return (
    <div className={styles.dashboardContainer}>
      
      <nav className={styles.topNav}>
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

      <main className={styles.mainContent}>
        
        <header className={styles.dashboardHeader}>
          <h1>Buenas noches, Verónica 💚</h1>
          {/* =============================================== */}
          {/* === 1. CAMBIO DE TEXTO DE DESCRIPCIÓN PRINCIPAL === */}
          {/* =============================================== */}
          <p>"Creemos en la fuerza del trabajo bien hecho, incluso cuando nadie lo ve".</p>
        </header>

        {/* =============================================== */}
        {/* === 2. NUEVA TARJETA GRANDE Y MOVIMIENTO DE STATS === */}
        {/* =============================================== */}
        <section className={styles.summaryCard}>
            <div className={styles.summaryCardContent}>
                <h2>Humanizamos la gestión, digitalizamos tu tranquilidad</h2>
                <p>Accede a tus módulos. Todo es simple, rápido y consistente.</p>
            </div>
            
            {/* Mueve las statCards DENTRO de la nueva tarjeta */}
            <div className={styles.statCardsInSummary}>
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
            </div>
        </section>

        {/* La sección de módulos queda igual */}
        <section className={styles.moduleGrid}>
          {modules.map((mod) => (
            <ModuleCard 
              key={mod.title}
              icon={mod.icon}
              title={mod.title}
              description={mod.description}
              actions={mod.actions}
            />
          ))}
        </section>
      </main>
    </div>
  );
}

export default DashboardPage;