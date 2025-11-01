import { useState, useRef, useEffect } from 'react'; // <-- ¡NUEVOS IMPORTS!
import { Routes, Route, Link } from 'react-router-dom'; 
import styles from './DashboardPage.module.css';
import { 
  FiBell, FiHelpCircle, FiSettings, FiSearch, FiChevronDown, FiPower 
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
function ModuleCard({ icon, title, description, actions, modulePath }) {
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
          <Link 
            key={index} 
            to={`${modulePath}/${action.toLowerCase().replace(/ /g, '-')}`}
            className={styles.moduleButton}
          >
            {action}
          </Link>
        ))}
      </div>
    </div>
  );
}

// --- Componente de Página de Submódulo (Placeholder) ---
function SubmodulePage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Página del Submódulo</h2>
      <p>¡Aquí se mostrará el contenido!</p>
      <Link to="/dashboard">← Volver al Dashboard</Link>
    </div>
  );
}

// --- Componente Principal ---
function DashboardPage({ onLogout }) {
  const [selectedCompany, setSelectedCompany] = useState('tictiva');
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  // ===============================================
  // === ¡NUEVOS ESTADOS Y LÓGICA PARA EL BUSCADOR! ===
  // ===============================================
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchContainerRef = useRef(null); // Ref para el "click outside"

  const getGreeting = () => { /* ... (código de saludo) ... */
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) return "Buenos días";
    else if (currentHour >= 12 && currentHour < 19) return "Buenas tardes";
    else return "Buenas noches";
  };

  const modules = [
    { path: "rrhh", icon: <img src={iconRrhh} alt="RRHH" />, title: "RRHH", description: "Gestión humana, clara y cercana", actions: ["Listado de fichas", "Permisos y justificaciones", "Gestión de turnos", "Validación DT"] },
    { path: "asistencia", icon: <img src={iconAsistencia} alt="Asistencia" />, title: "Asistencia", description: "Control preciso, en tiempo real", actions: ["Supervisión integral", "Marcas registradas", "Mapa de cobertura", "Gestión de dispositivos"] },
    { path: "comunicaciones", icon: <img src={iconComunicaciones} alt="Comunicaciones" />, title: "Comunicaciones", description: "Mensajes y encuestas sin fricción", actions: ["Envío de mensajes", "Plantillas", "Encuestas de clima", "Canal de denuncias", "Dashboard"] },
    { path: "reporteria", icon: <img src={iconReporteria} alt="Reportería" />, title: "Reportería", description: "Datos que cuentan historias", actions: ["Informes gerenciales", "Dashboards y presentaciones", "Gestión de documentos", "Integraciones"] },
    { path: "tictiva-cuida", icon: <img src={iconCuida} alt="Tictiva Cuida" />, title: "Tictiva Cuida", description: "Bienestar con ADIA integrado", actions: ["Adia (IA central)", "Tests psicológicos", "Dashboard de bienestar", "+ Integrado con RRHH"] },
    { path: "bodega-epp", icon: <img src={iconBodega} alt="Bodega & EPP" />, title: "Bodega & EPP", description: "Inventario al servicio del equipo", actions: ["Inventario", "Colaboradores", "Operaciones", "Alertas"] },
  ];

  // 1. Creamos la "lista maestra" de búsqueda
  const allSearchableItems = [];
  modules.forEach(mod => {
    // Añadimos cada submódulo (acción)
    mod.actions.forEach(action => {
      allSearchableItems.push({
        title: action, // "Listado de fichas"
        context: mod.title, // "en RRHH"
        path: `/dashboard/${mod.path}/${action.toLowerCase().replace(/ /g, '-')}`
      });
    });
  });

  // 2. Lógica para el "click outside" del buscador
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 3. Función que se ejecuta al escribir en el buscador
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) { // Buscamos después de 1 caracter
      const results = allSearchableItems.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(results);
      setIsSearchDropdownOpen(true);
    } else {
      setSearchResults([]);
      setIsSearchDropdownOpen(false);
    }
  };
  
  // 4. Limpiamos el buscador y cerramos el dropdown al hacer clic
  const handleResultClick = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchDropdownOpen(false);
  };


  return (
    <div className={styles.dashboardContainer}>
      
      <nav className={styles.topNav}>
        <div className={styles.navLeft}>
          {/* ... (código de logo y selector de empresa) ... */}
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
          
          {/* =============================================== */}
          {/* === ¡NUEVO CONTENEDOR DE BÚSQUEDA! === */}
          {/* =============================================== */}
          <div className={styles.searchContainer} ref={searchContainerRef}>
            <div className={styles.searchBar}>
              <FiSearch />
              <input 
                type="text" 
                placeholder="Buscar submódulos..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => { if (searchQuery.length > 0) setIsSearchDropdownOpen(true); }}
              />
            </div>
            
            {/* 5. El Menú Desplegable de Resultados */}
            {isSearchDropdownOpen && (
              <div className={styles.searchDropdown}>
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <Link 
                      key={item.path} 
                      to={item.path} 
                      className={styles.searchResultItem}
                      onClick={handleResultClick}
                    >
                      <div className={styles.resultText}>
                        <strong>{item.title}</strong>
                        <span>en {item.context}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className={styles.searchNoResult}>
                    No hay resultados para "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
          
          <button className={styles.iconButton}><FiHelpCircle size={22} /></button>
          <button className={styles.iconButton}><FiSettings size={22} /></button>
          <button className={styles.iconButton}>
            <FiBell size={22} />
            <span className={styles.notificationDot}></span>
          </button>

          {/* ... (código del menú de perfil) ... */}
          <div className={styles.profileMenuContainer}>
            <div className={styles.userProfile} onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}>
              <div className={styles.userAvatar}>VM</div>
              <span>Verónica Mateo</span>
            </div>
            {isProfileMenuOpen && (
              <div className={styles.profileDropdown}>
                <button><FiSettings /> Configuración</button>
                <button className={styles.logoutButton} onClick={onLogout}><FiPower /> Cerrar Sesión</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* =============================================== */}
      {/* === ¡EL DASHBOARD AHORA USA RUTAS! === */}
      {/* =============================================== */}
      <Routes>
        {/* Ruta 1: /dashboard (La página principal con los módulos) */}
        <Route index element={
          <main className={styles.mainContent}>
            <header className={styles.dashboardHeader}>
              <h1>{getGreeting()}, Verónica 💚</h1>
              <p>"Creemos en la fuerza del trabajo bien hecho, incluso cuando nadie lo ve".</p>
            </header>

            <section className={styles.summaryCard}>
              <div className={styles.summaryCardContent}>
                  <h2>Humanizamos la gestión, digitalizamos tu tranquilidad</h2>
                  <p>Accede a tus módulos. Todo es simple, rápido y consistente.</p>
              </div>
              <div className={styles.statCardsInSummary}>
                  <div className={styles.statCard}><h3>Mensajes</h3><span className={styles.statNumber}>3</span></div>
                  <div className={styles.statCard}><h3>Marcas hoy</h3><span className={styles.statNumber}>128</span></div>
                  <div className={styles.statCard}><h3>Dispositivos activos</h3><span className={styles.statNumber}>5</span></div>
              </div>
            </section>
            
            {/* Ya no filtramos los módulos aquí, mostramos todos */}
            <section className={styles.moduleGrid}>
              {modules.map((mod) => (
                <ModuleCard 
                  key={mod.title}
                  icon={mod.icon}
                  title={mod.title}
                  description={mod.description}
                  actions={mod.actions}
                  modulePath={mod.path}
                />
              ))}
            </section>
          </main>
        } />
        
        {/* Ruta 2: /dashboard/:moduleId/:submoduleId (Las páginas de submódulo) */}
        <Route path=":moduleId/:submoduleId" element={<SubmodulePage />} />
      
      </Routes>
    </div>
  );
}

export default DashboardPage;