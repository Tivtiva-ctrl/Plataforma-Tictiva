import { useState, useRef, useEffect } from 'react';
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
import tictivaHeart from '../assets/tictiva-heart.png';

// ===============================================
// === ¡AQUÍ ESTÁ LA CORRECCIÓN DE LA RUTA! ===
// ===============================================
import EmployeeListPage from './EmployeeListPage'; // <-- RUTA CORREGIDA


// --- Componente Interno (No cambia) ---
function ModuleCard({ icon, title, description, actions, modulePath }) {
  // ... (código de ModuleCard) ...
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
  // ... (código de SubmodulePage) ...
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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchContainerRef = useRef(null); 

  const getGreeting = () => { /* ... (código de saludo) ... */
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 12) return "Buenos días";
    else if (currentHour >= 12 && currentHour < 19) return "Buenas tardes";
    else return "Buenas noches";
  };

  const modules = [ /* ... (código de modules) ... */
    { path: "rrhh", icon: <img src={iconRrhh} alt="RRHH" />, title: "RRHH", description: "Gestión humana, clara y cercana", actions: ["Listado de fichas", "Permisos y justificaciones", "Gestión de turnos", "Validación DT"] },
    { path: "asistencia", icon: <img src={iconAsistencia} alt="Asistencia" />, title: "Asistencia", description: "Control preciso, en tiempo real", actions: ["Supervisión integral", "Marcas registradas", "Mapa de cobertura", "Gestión de dispositivos"] },
    { path: "comunicaciones", icon: <img src={iconComunicaciones} alt="Comunicaciones" />, title: "Comunicaciones", description: "Mensajes y encuestas sin fricción", actions: ["Envío de mensajes", "Plantillas", "Encuestas de clima", "Canal de denuncias", "Dashboard"] },
    { path: "reporteria", icon: <img src={iconReporteria} alt="Reportería" />, title: "Reportería", description: "Datos que cuentan historias", actions: ["Informes gerenciales", "Dashboards y presentaciones", "Gestión de documentos", "Integraciones"] },
    { path: "tictiva-cuida", icon: <img src={iconCuida} alt="Tictiva Cuida" />, title: "Tictiva Cuida", description: "Bienestar con ADIA integrado", actions: ["Adia (IA central)", "Tests psicológicos", "Dashboard de bienestar", "+ Integrado con RRHH"] },
    { path: "bodega-epp", icon: <img src={iconBodega} alt="Bodega & EPP" />, title: "Bodega & EPP", description: "Inventario al servicio del equipo", actions: ["Inventario", "Colaboradores", "Operaciones", "Alertas"] },
  ];

  const allSearchableItems = []; // ... (código de allSearchableItems) ...
  modules.forEach(mod => {
    mod.actions.forEach(action => {
      allSearchableItems.push({
        title: action,
        context: mod.title,
        path: `/dashboard/${mod.path}/${action.toLowerCase().replace(/ /g, '-')}`
      });
    });
  });

  useEffect(() => { // ... (código de useEffect) ...
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

  const handleSearchChange = (e) => { // ... (código de handleSearchChange) ...
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
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
  
  const handleResultClick = () => { // ... (código de handleResultClick) ...
    setSearchQuery('');
    setSearchResults([]);
    setIsSearchDropdownOpen(false);
  };


  return (
    <div className={styles.dashboardContainer}>
      
      <nav className={styles.topNav}>
        {/* ... (código de nav) ... */}
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
          <div className={styles.searchContainer} ref={searchContainerRef}>
            <div className={styles.searchBar}>
              <FiSearch />
              <input type="text" placeholder="Buscar submódulos..." value={searchQuery} onChange={handleSearchChange} onFocus={() => { if (searchQuery.length > 0) setIsSearchDropdownOpen(true); }} />
            </div>
            {isSearchDropdownOpen && (
              <div className={styles.searchDropdown}>
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <Link key={item.path} to={item.path} className={styles.searchResultItem} onClick={handleResultClick}>
                      <div className={styles.resultText}>
                        <strong>{item.title}</strong>
                        <span>en {item.context}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className={styles.searchNoResult}>No hay resultados para "{searchQuery}"</div>
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

      <Routes>
        <Route index element={
          <main className={styles.mainContent}>
            <header className={styles.dashboardHeader}>
              <h1>
                {getGreeting()}, Verónica 
                <img src={tictivaHeart} alt="corazón" className={styles.greetingIcon} />
              </h1>
              <p>"Creemos en la fuerza del trabajo bien hecho, incluso cuando nadie lo ve".</p>
            </header>

            <section className={styles.summaryCard}>
              {/* ... (código de summaryCard) ... */}
              <div className={styles.summaryCardContent}>
                  <h2>Humanizamos la gestión, digitalizamos tu tranquilidad</h2>
                  <p>Accede a tus módulos. Todo es simple, rápido y consistente.</p>
              </div>
              <div className={styles.statCardsInSummary}>
                  <Link to="/dashboard/comunicaciones/envío-de-mensajes" className={styles.statCard}>
                      <h3>Mensajes</h3>
                      <span className={styles.statNumber}>0</span>
                  </Link>
                  <Link to="/dashboard/asistencia/marcas-registradas" className={styles.statCard}>
                      <h3>Marcas hoy</h3>
                      <span className={styles.statNumber}>0</span>
                  </Link>
                  <Link to="/dashboard/asistencia/gestion-de-dispositivos" className={styles.statCard}>
                      <h3>Dispositivos activos</h3>
                      <span className={styles.statNumber}>0</span>
                  </Link>
              </div>
            </section>
            
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
        
        {/* Ruta para "Listado de fichas" */}
        <Route path="rrhh/listado-de-fichas" element={<EmployeeListPage />} />
        
        {/* Ruta genérica para TODOS los demás submódulos */}
        <Route path=":moduleId/:submoduleId" element={<SubmodulePage />} />
      
      </Routes>
    </div>
  );
}

export default DashboardPage;