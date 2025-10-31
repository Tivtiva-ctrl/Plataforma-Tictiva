import { useState } from 'react';
import styles from './DashboardPage.module.css';
// Importamos los íconos que usaremos
import { 
  FiBell, FiHelpCircle, FiSettings, FiSearch, FiChevronDown, FiArrowRight,
  FiUsers, FiClock, FiMessageSquare, FiArchive, FiShield, FiBarChart2 
} from 'react-icons/fi';
import { IoBusiness } from 'react-icons/io5';

// --- Componente Interno para las Tarjetas de Módulo ---
// Esto hace que el código principal sea más limpio
function ModuleCard({ icon, title, description, features, color }) {
  // Usamos 'style' para poder pasar el color de la marca como variable
  const iconStyle = {
    backgroundColor: color,
    color: '#FFFFFF'
  };

  return (
    <div className={styles.moduleCard}>
      <div className={styles.moduleIcon} style={iconStyle}>
        {icon}
      </div>
      <h3 className={styles.moduleTitle}>{title}</h3>
      <p className={styles.moduleDesc}>{description}</p>
      <ul className={styles.moduleFeatures}>
        {features.map((feature, index) => (
          <li key={index}>{feature}</li>
        ))}
      </ul>
      <a href="#" className={styles.moduleLink}>
        Abrir módulo <FiArrowRight size={14} />
      </a>
    </div>
  );
}

// --- Componente Principal de la Página ---
function DashboardPage() {
  const [selectedCompany, setSelectedCompany] = useState('tictiva');

  const handleCompanyChange = (event) => {
    setSelectedCompany(event.target.value);
    console.log("Cambiando a empresa:", event.target.value);
  };

  // Datos de ejemplo para los módulos (basados en tu captura)
  const modules = [
    { 
      icon: <FiUsers size={20} />, 
      title: "RRHH", 
      description: "Gestión humana, clara y cercana", 
      features: ["Listado de fichas", "Permisos y justificaciones", "Gestión de turnos", "Validación DT"],
      color: "var(--azul-tictiva)" // Azul Tictiva
    },
    { 
      icon: <FiClock size={20} />, 
      title: "Asistencia", 
      description: "Control preciso, en tiempo real", 
      features: ["Supervisión integral", "Marcas registradas", "Mapa de cobertura", "Gestión de dispositivos"],
      color: "#4CAF50" // Un verde (puedes cambiarlo)
    },
    { 
      icon: <FiMessageSquare size={20} />, 
      title: "Comunicaciones", 
      description: "Mensajes y encuestas sin fricción", 
      features: ["Envío de mensajes", "Plantillas", "Encuestas de clima", "Dashboard"],
      color: "#2196F3" // Un azul claro (puedes cambiarlo)
    },
    { 
      icon: <FiBarChart2 size={20} />, 
      title: "Reportería", 
      description: "Datos que cuentan historias", 
      features: ["Informes gerenciales", "Dashboards y presentaciones", "Gestión de documentos", "Integraciones"],
      color: "#FF9800" // Un naranja (puedes cambiarlo)
    },
    { 
      icon: <FiShield size={20} />, 
      title: "Tictiva Cuida", 
      description: "Bienestar con ADIA integrado", 
      features: ["ADIA (IA central)", "Test psicológicos", "Dashboard de bienestar", "+ Integrado con RRHH"],
      color: "var(--verde-menta)" // Verde Menta Tictiva
    },
    { 
      icon: <FiArchive size={20} />, 
      title: "Bodega & EPP", 
      description: "Inventario al servicio del equipo", 
      features: ["Inventario", "Colaboradores", "Operaciones", "Alertas"],
      color: "var(--gris-azulado)" // Gris Azulado Tictiva
    },
  ];

  return (
    <div className={styles.dashboardContainer}>
      
      {/* === 1. BARRA DE NAVEGACIÓN SUPERIOR (Inspirada en Lirmi) === */}
      <nav className={styles.topNav}>
        <div className={styles.navLeft}>
          <div className={styles.logo}>Tictiva</div> {/* Puedes poner tu logo aquí */}
          
          {/* El Selector de Empresa Multi-empresa */}
          <div className={styles.companySelector}>
            <IoBusiness />
            <select value={selectedCompany} onChange={handleCompanyChange}>
              <option value="tictiva">Tictiva (Empresa Principal)</option>
              <option value="otra-empresa">Otra Empresa S.A.</option>
              <option value="cliente-demo">Cliente Demo Ltda.</option>
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
          <h1>Buenas noches, Verónica Mateo</h1>
          <p>"Creemos en la fuerza del trabajo bien hecho, incluso cuando nadie lo ve."</p>
        </header>

        {/* Tarjetas de Estadísticas (de tu diseño Tictiva) */}
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

        {/* Grilla de Módulos (Estilo Tictiva) */}
        <section className={styles.moduleGrid}>
          {modules.map((mod) => (
            <ModuleCard 
              key={mod.title}
              icon={mod.icon}
              title={mod.title}
              description={mod.description}
              features={mod.features}
              color={mod.color}
            />
          ))}
        </section>

      </main>
    </div>
  );
}

export default DashboardPage;