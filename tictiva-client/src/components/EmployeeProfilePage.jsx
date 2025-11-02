import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Link, NavLink, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 
import styles from './EmployeeProfilePage.module.css';
import { FiEdit, FiDownload } from 'react-icons/fi';

// =======================================================
// === COMPONENTE "TICTIVA 360" (LA GRILLA DE TARJETAS) ===
// =======================================================
function Overview360({ employee, isEditing }) {
  return (
    <div className={styles.cardGrid}>
      
      {/* --- Tarjeta: Datos personales --- */}
      <div className={styles.infoCard}>
        <h3>Datos personales</h3>
        <p>Email: {employee.email || '[campo sin definir]'}</p>
        <p>Dirección: {employee.direccion || '[campo sin definir]'}</p>
        <p>Comuna: {employee.comuna || '[campo sin definir]'}</p>
        <Link to="personal" className={styles.detailButton}>Ver detalle</Link>
      </div>

      {/* --- Tarjeta: Horario --- */}
      <div className={styles.infoCard}>
        <h3>Horario</h3>
        <p>El empleado no tiene asignaciones activas en este momento.</p>
        <Link to="asistencia" className={styles.detailButton}>Ver detalle</Link>
      </div>

      {/* --- Tarjeta: Evaluaciones --- */}
      <div className={styles.infoCard}>
        <h3>Evaluaciones</h3>
        <div className={styles.evaluationScore}>7.8</div>
        <p className={styles.evaluationStatus}>Estado óptimo</p>
        <p className={styles.evaluationSubtitle}>Último test aplicado por Nadia (psicóloga interna)</p>
        <Link to="hoja-de-vida" className={styles.detailButton}>Ver detalle</Link>
      </div>

      {/* --- Tarjeta: Contacto de emergencia --- */}
      <div className={styles.infoCard}>
        <h3>Contacto de emergencia</h3>
        {isEditing ? (
          <>
            <label className={styles.inlineLabel}>Nombre:</label>
            <input type="text" defaultValue="[Nombre Emergencia]" className={styles.inlineInput} />
            <label className={styles.inlineLabel}>Teléfono:</label>
            <input type="text" defaultValue="[+56 9...]" className={styles.inlineInput} />
          </>
        ) : (
          <>
            <p>Nombre: [campo sin definir]</p>
            <p>Teléfono: [campo sin definir]</p>
          </>
        )}
        <Link to="personal" className={styles.detailButton}>Ver detalle</Link>
      </div>

      {/* --- Tarjeta: Registros y anotaciones --- */}
      <div className={styles.infoCard}>
        <h3>Registros y anotaciones</h3>
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBarLabel}>Observaciones</div>
          <div className={styles.progressBar}><div className={styles.progressBarFillBlue} style={{width: '60%'}}></div></div>
          <div className={styles.progressBarValue}>1</div>
        </div>
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBarLabel}>Positivas</div>
          <div className={styles.progressBar}><div className={styles.progressBarFillGreen} style={{width: '80%'}}></div></div>
          <div className={styles.progressBarValue}>1</div>
        </div>
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBarLabel}>Negativas</div>
          <div className={styles.progressBar}><div className={styles.progressBarFillRed} style={{width: '30%'}}></div></div>
          <div className={styles.progressBarValue}>1</div>
        </div>
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBarLabel}>Entrevistas</div>
          <div className={styles.progressBar}><div className={styles.progressBarFillPurple} style={{width: '40%'}}></div></div>
          <div className={styles.progressBarValue}>0</div>
        </div>
        <Link to="historial" className={styles.detailButton}>Ver detalle</Link>
      </div>

      {/* --- Tarjeta: Asistencia --- */}
      <div className={styles.infoCard}>
        <h3>Asistencia</h3>
        <div className={styles.attendanceCircle}>100%</div>
        <p className={styles.attendanceStatus}>Asistencia destacada</p>
        <div className={styles.attendanceAlert}>⚠️ Atrasos: 1 atraso – 4h: 51m acumulado</div>
        {/* =============================================== */}
        {/* === ¡CORRECCIÓN 1! (</K> -> </Link>) === */}
        {/* =============================================== */}
        <Link to="asistencia" className={styles.detailButton}>Ver detalle</Link>
      </div>
      
      {/* --- Tarjeta: Alerta (Hola Verito) --- */}
      <div className={`${styles.infoCard} ${styles.alertCard}`}>
        <h3>Hola, Verónica 💚</h3>
        <p>Detecté que {employee['nombre completo']} tiene 2 documentos vencidos.</p>
        <p className={styles.alertQuestion}>¿Quieres enviarle un recordatorio?</p>
        <div className={styles.alertActions}>
          <button className={styles.alertButtonSend}>Sí, enviar</button>
          <button className={styles.alertButtonCancel}>No, gracias</button>
        </div>
      </div>

      {/* --- Tarjeta: Datos de salud --- */}
      <div className={styles.infoCard}>
        <h3>Datos de salud</h3>
        <p>Alergias: {employee?.alergias || '[campo sin definir]'}</p>
        <p>Enf. crónicas: {employee?.cronicas || '[campo sin definir]'}</p>
        <p>Seguro de salud: <strong>{employee?.seguro || '[Sin definir]'}</strong></p>
        <Link to="salud" className={styles.detailButton}>Ver detalle</Link>
      </div>

      {/* --- Tarjeta: Comunicación interna --- */}
      <div className={styles.infoCard}>
        <h3>Comunicación interna</h3>
        <p>18 mensajes registrados</p>
        <p className={styles.lastCommunication}>Hola Verito 👋 tu solicitud fue respondida.</p>
        {/* =============================================== */}
        {/* === ¡CORRECCIÓN 2! (</K> -> </Link>) === */}
        {/* =============================================== */}
        <Link to="/dashboard/comunicaciones/envío-de-mensajes" className={styles.detailButton}>Ver detalle</Link>
      </div>

    </div>
  );
}

// --- Placeholder para las OTRAS secciones (Datos Personales, etc.) ---
function SectionPlaceholder({ title }) {
  return (
    <div className={styles.sectionContent}>
      <h2>{title}</h2>
      <p>Aquí irá el contenido detallado de la sección: {title}.</p>
      <p>Pronto construiremos los formularios de edición y las tablas de datos.</p>
    </div>
  );
}

// =======================================================
// === PÁGINA DE PERFIL PRINCIPAL ===
// =======================================================
function EmployeeProfilePage() {
  const { employeeId } = useParams(); // Lee el RUT de la URL
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Carga los datos del empleado desde Supabase usando el RUT
  useEffect(() => {
    if (!employeeId) {
      setLoading(false);
      console.error("No se proporcionó ID de empleado (RUT)");
      return;
    }

    const fetchEmployeeData = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('employees')
        .select('*') // Trae toda la info
        .eq('rut', employeeId) // Busca por RUT
        .single(); // Esperamos solo UN resultado

      if (error) {
        console.error("Error al cargar perfil de empleado:", error);
      } else {
        setEmployeeData(data);
      }
      setLoading(false);
    };

    fetchEmployeeData();
  }, [employeeId]); // Se ejecuta si el RUT de la URL cambia

  // Calcula la antigüedad
  const yearsAndMonths = useMemo(() => {
    if (!employeeData?.fechaIngreso) return '[Sin fecha de ingreso]';

    const ingressDate = new Date(employeeData.fechaIngreso);
    const today = new Date();
    let years = today.getFullYear() - ingressDate.getFullYear();
    let months = today.getMonth() - ingressDate.getMonth();
    
    if (months < 0 || (months === 0 && today.getDate() < ingressDate.getDate())) {
      years--;
      months = (months + 12) % 12;
    }
    
    if (years === 0) return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    if (months === 0) return `${years} ${years === 1 ? 'año' : 'años'}`;
    return `${years} ${years === 1 ? 'año' : 'años'} y ${months} ${months === 1 ? 'mes' : 'meses'}`;
  }, [employeeData?.fechaIngreso]);

  // Lista de ítems del menú de navegación (estilo Lirmi)
  const menuItems = [
    { title: 'Tictiva 360', path: '.' },
    { title: 'Datos personales', path: 'personal' },
    { title: 'Datos contractuales', path: 'contractual' },
    { title: 'Datos previsionales', path: 'previsional' },
    { title: 'Datos bancarios', path: 'bancario' },
    { title: 'Datos de salud', path: 'salud' },
    { title: 'Documentos', path: 'documentos' },
    // ===============================================
    // === ¡CORRECCIÓN 3! (Faltaba ' y ,) ===
    // ===============================================
    { title: 'Asistencia', path: 'asistencia' },
    { title: 'Hoja de vida', path: 'hoja-de-vida' },
    { title: 'Historial', path: 'historial' },
  ];

  // Función para obtener iniciales
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
        <h2>Cargando perfil del empleado...</h2>
      </div>
    );
  }

  if (!employeeData) {
    return (
      <div className={styles.errorContainer}>
        <h2>Empleado no encontrado</h2>
        {/* =============================================== */}
        {/* === ¡CORRECCIÓN 4! (</o> -> </p>) === */}
        {/* =============================================== */}
        <p>No se pudieron cargar los datos del empleado (RUT: {employeeId}).</p>
        <Link to="/dashboard/rrhh/listado-de-fichas" className={styles.backLink}>
          ← Volver a Lista de Empleados
        </Link>
      </div>
    );
  }

  // Lógica para el botón de Editar/Guardar
  const handleEditToggle = () => {
    if (isEditing) {
      console.log("Guardando cambios...");
    }
    setIsEditing(!isEditing); 
  };

  return (
    <div className={styles.profilePage}>
      {/* HEADER PRINCIPAL FIJO DEL PERFIL (como en Lirmi) */}
      <div 
        className={styles.profileHeader}
        // Forzamos el fondo blanco y el z-index
        style={{ background: 'var(--blanco)', zIndex: 100 }}
      >
        <Link to="/dashboard/rrhh/listado-de-fichas" className={styles.backButton}>
          ←
        </Link>
        
        {/* Info del Empleado */}
        <div className={styles.profileInfo}>
          <div className={styles.profileAvatar}>
            {employeeData.avatar && typeof employeeData.avatar === 'string' && employeeData.avatar.startsWith('http') ? (
              <img src={employeeData.avatar} alt={employeeData['nombre completo']} />
            ) : (
              <span>{getInitials(employeeData['nombre completo'])}</span>
            )}
          </div>
          <div className={styles.profileDetails}>
            <h1 className={styles.employeeName}>{employeeData['nombre completo']}</h1>
            <p className={styles.employeeTitle}>{employeeData.cargo}</p>
            <p className={styles.employeeStatus}>
              <span className={`${styles.statusBadge} ${employeeData.estado === 'Activo' ? styles.statusActive : styles.statusInactive}`}>
                {employeeData.estado}
              </span>
              <span className={styles.employeeDates}>
                Empleado desde {yearsAndMonths}
              </span>
            </p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className={styles.profileActions}>
          <button className={styles.actionButton} onClick={handleEditToggle}>
            {isEditing ? "Guardar Ficha" : "Editar Ficha"} <FiEdit />
          </button>
          {!isEditing && (
            <button className={styles.actionButton}>
              Descargar Ficha <FiDownload />
            </button>
          )}
        </div>

        {/* NAVEGACIÓN DE SECCIONES (Estilo Lirmi) */}
        <nav className={styles.profileNav}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path} 
              className={({ isActive }) => 
                isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
              }
              end={item.path === '.'}
            >
              {item.title}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* ÁREA DE CONTENIDO (scrollable) */}
      <main className={styles.profileContent}>
        <Routes>
          <Route index element={<Overview360 employee={employeeData} />} />
          <Route path="tictiva-360" element={<Overview360 employee={employeeData} />} />
          
          <Route path="personal" element={<SectionPlaceholder title="Datos Personales" />} />
          <Route path="contractual" element={<SectionPlaceholder title="Datos Contractuales" />} />
          <Route path="previsional" element={<SectionPlaceholder title="Datos Previsionales" />} />
          <Route path="bancario" element={<SectionPlaceholder title="Datos Bancarios" />} />
          <Route path="salud" element={<SectionPlaceholder title="Datos de Salud" />} />
          <Route path="documentos" element={<SectionPlaceholder title="Documentos" />} />
          <Route path="asistencia" element={<SectionPlaceholder title="Asistencia" />} />
          <Route path="hoja-de-vida" element={<SectionPlaceholder title="Hoja de Vida" />} />
          <Route path="historial" element={<SectionPlaceholder title="Historial" />} />
        </Routes>
      </main>
    </div>
  );
}

export default EmployeeProfilePage;