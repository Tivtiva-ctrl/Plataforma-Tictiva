// src/components/EmployeeProfilePage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Link, NavLink, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styles from './EmployeeProfilePage.module.css';
import { FiEdit, FiDownload } from 'react-icons/fi';

import DatosPersonales from './DatosPersonales';
import DatosContractuales from './DatosContractuales';
import DatosPrevisionales from './DatosPrevisionales';
import DatosBancarios from './DatosBancarios';
import DatosSalud from './DatosSalud';
import DatosDocumentos from './DatosDocumentos';
import DatosAsistencia from './DatosAsistencia';

// ✅ NUEVO IMPORT: Bitácora Laboral
import DatosBitacora from './DatosBitacora';

// =======================================================
// === COMPONENTE "TICTIVA 360" (LA GRILLA DE TARJETAS) ===
// =======================================================
function Overview360({ employee, isEditing }) {
  if (!employee) {
    return <div className={styles.sectionContent}>Cargando datos del empleado…</div>;
  }

  return (
    <div className={styles.cardGrid}>
      {/* --- Tarjeta: Datos personales --- */}
      <div className={styles.infoCard}>
        <h3>Datos personales</h3>
        <p>Email: {employee.email_personal || '[campo sin definir]'}</p>
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
        <p className={styles.evaluationSubtitle}>
          Último test aplicado por Nadia (psicóloga interna)
        </p>
        {/* 🔁 Antes iba a "hoja-de-vida". Ahora apuntamos a Bitácora Laboral */}
        <Link to="bitacora" className={styles.detailButton}>Ver detalle</Link>
      </div>

      {/* --- Tarjeta: Contacto de emergencia --- */}
      <div className={styles.infoCard}>
        <h3>Contacto de emergencia</h3>
        {isEditing ? (
          <>
            <label className={styles.inlineLabel}>Nombre:</label>
            <input
              type="text"
              defaultValue={employee.contacto_emergencia_nombre || ''}
              className={styles.inlineInput}
            />
            <label className={styles.inlineLabel}>Teléfono:</label>
            <input
              type="text"
              defaultValue={employee.contacto_emergencia_telefono || ''}
              className={styles.inlineInput}
            />
          </>
        ) : (
          <>
            <p>Nombre: {employee.contacto_emergencia_nombre || '[campo sin definir]'}</p>
            <p>Teléfono: {employee.contacto_emergencia_telefono || '[campo sin definir]'}</p>
          </>
        )}
        <Link to="personal" className={styles.detailButton}>Ver detalle</Link>
      </div>

      {/* --- Tarjeta: Registros y anotaciones --- */}
      <div className={styles.infoCard}>
        <h3>Registros y anotaciones</h3>
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBarLabel}>Observaciones</div>
          <div className={styles.progressBar}>
            <div className={styles.progressBarFillBlue} style={{ width: '60%' }} />
          </div>
          <div className={styles.progressBarValue}>1</div>
        </div>
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBarLabel}>Positivas</div>
          <div className={styles.progressBar}>
            <div className={styles.progressBarFillGreen} style={{ width: '80%' }} />
          </div>
          <div className={styles.progressBarValue}>1</div>
        </div>
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBarLabel}>Negativas</div>
          <div className={styles.progressBar}>
            <div className={styles.progressBarFillRed} style={{ width: '30%' }} />
          </div>
          <div className={styles.progressBarValue}>1</div>
        </div>
        <div className={styles.progressBarContainer}>
          <div className={styles.progressBarLabel}>Entrevistas</div>
          <div className={styles.progressBar}>
            <div className={styles.progressBarFillPurple} style={{ width: '40%' }} />
          </div>
          <div className={styles.progressBarValue}>0</div>
        </div>
        {/* 🔁 Antes iba a "historial". Esta tarjeta tiene TODO el sentido con Bitácora */}
        <Link to="bitacora" className={styles.detailButton}>Ver detalle</Link>
      </div>

      {/* --- Tarjeta: Asistencia --- */}
      <div className={styles.infoCard}>
        <h3>Asistencia</h3>
        <div className={styles.attendanceCircle}>100%</div>
        <p className={styles.attendanceStatus}>Asistencia destacada</p>
        <div className={styles.attendanceAlert}>
          ⚠️ Atrasos: 1 atraso – 4h: 51m acumulado
        </div>
        <Link to="asistencia" className={styles.detailButton}>Ver detalle</Link>
      </div>
      
      {/* --- Tarjeta: Alerta (Hola Verito) --- */}
      <div className={`${styles.infoCard} ${styles.alertCard}`}>
        <h3>Hola, Verónica 💚</h3>
        <p>Detecté que {employee.nombre_completo} tiene 2 documentos vencidos.</p>
        <p className={styles.alertQuestion}>¿Quieres enviarle un recordatorio?</p>
        <div className={styles.alertActions}>
          <button className={styles.alertButtonSend}>Sí, enviar</button>
          <button className={styles.alertButtonCancel}>No, gracias</button>
        </div>
      </div>

      {/* --- Tarjeta: Datos de salud --- */}
      <div className={styles.infoCard}>
        <h3>Datos de salud</h3>
        <p>Alergias: {employee.tipo_discapacidad || '[campo sin definir]'}</p>
        <p>Enf. crónicas: {'[campo sin definir]'}</p>
        <p>Seguro de salud: {'[Sin definir]'}</p>
        <Link to="salud" className={styles.detailButton}>Ver detalle</Link>
      </div>

      {/* --- Tarjeta: Comunicación interna --- */}
      <div className={styles.infoCard}>
        <h3>Comunicación interna</h3>
        <p>18 mensajes registrados</p>
        <p className={styles.lastCommunication}>
          Hola Verito 👋 tu solicitud fue respondida.
        </p>
        <Link
          to="/dashboard/comunicaciones/envío-de-mensajes"
          className={styles.detailButton}
        >
          Ver detalle
        </Link>
      </div>
    </div>
  );
}

// --- Placeholder para otras secciones mientras se construyen ---
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
  const { rut } = useParams(); // /dashboard/rrhh/empleado/:rut/*
  const [personalData, setPersonalData] = useState(null);
  const [contractData, setContractData] = useState(null);
  const [previsionalData, setPrevisionalData] = useState(null);
  const [bankData, setBankData] = useState({});
  const [healthData, setHealthData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Cargamos datos desde Supabase
  useEffect(() => {
    if (!rut) {
      setLoading(false);
      console.error('No se proporcionó RUT');
      return;
    }

    const fetchEmployeeData = async () => {
      setLoading(true);

      // 1) Datos personales
      const { data: personal, error: perError } = await supabase
        .from('employee_personal')
        .select('*')
        .eq('rut', rut)
        .single();

      if (perError) {
        console.error('Error al cargar datos personales:', perError);
        setLoading(false);
        return;
      }
      setPersonalData(personal);

      // 2) Datos contractuales
      const { data: contract, error: conError } = await supabase
        .from('employee_contracts')
        .select('*')
        .eq('rut', rut)
        .maybeSingle();

      if (conError) {
        console.warn('Error al cargar datos de contrato:', conError.message);
      }
      setContractData(contract || {});

      // 3) Datos previsionales
      const { data: previsional, error: prevError } = await supabase
        .from('employee_prevision')
        .select('*')
        .eq('rut', rut)
        .maybeSingle();

      if (prevError) {
        console.warn('Error al cargar datos previsionales:', prevError.message);
      }
      setPrevisionalData(previsional || {});

      setLoading(false);
    };

    fetchEmployeeData();
  }, [rut]);

  // Antigüedad
  const yearsAndMonths = useMemo(() => {
    const fecha = contractData?.fecha_ingreso || personalData?.fecha_ingreso;
    if (!fecha) return '[Sin fecha de ingreso]';

    const ingressDate = new Date(fecha);
    if (Number.isNaN(ingressDate.getTime())) return '[Sin fecha de ingreso válida]';

    const today = new Date();
    let years = today.getFullYear() - ingressDate.getFullYear();
    let months = today.getMonth() - ingressDate.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < ingressDate.getDate())) {
      years--;
      months = (months + 12) % 12;
    }

    if (years === 0) return `${months} ${months === 1 ? 'mes' : 'meses'}`;
    if (months === 0) return `${years} ${years === 1 ? 'año' : 'años'}`;
    return `${years} ${years === 1 ? 'año' : 'años'} y ${months} ${
      months === 1 ? 'mes' : 'meses'
    }`;
  }, [contractData?.fecha_ingreso, personalData?.fecha_ingreso]);

  // ✅ Actualizamos el menú para usar "Bitácora laboral"
  const menuItems = [
    { title: 'Tictiva 360', path: '.' },
    { title: 'Datos personales', path: 'personal' },
    { title: 'Datos contractuales', path: 'contractual' },
    { title: 'Datos previsionales', path: 'previsional' },
    { title: 'Datos bancarios', path: 'bancario' },
    { title: 'Datos de salud', path: 'salud' },
    { title: 'Documentos', path: 'documentos' },
    { title: 'Asistencia', path: 'asistencia' },
    // 🔁 Antes: 'Hoja de vida' / 'hoja-de-vida'
    { title: 'Bitácora laboral', path: 'bitacora' },
    // Dejamos Historial como sección aparte por si la usas distinto más adelante
    { title: 'Historial', path: 'historial' },
  ];

  const getInitials = (fullName) => {
    if (!fullName) return '??';
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

  if (!personalData) {
    return (
      <div className={styles.errorContainer}>
        <h2>Empleado no encontrado</h2>
        <p>No se pudieron cargar los datos del empleado (RUT: {rut}).</p>
        <Link to="/dashboard/rrhh/listado-de-fichas" className={styles.backLink}>
          ← Volver a Lista de Empleados
        </Link>
      </div>
    );
  }

  const handleEditToggle = () => {
    if (isEditing) {
      console.log('Guardando cambios...');
      console.log('Datos bancarios actuales:', bankData);
      console.log('Datos de salud actuales:', healthData);
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className={styles.profilePage}>
      {/* HEADER PRINCIPAL */}
      <div className={styles.profileHeader}>
        <Link to="/dashboard/rrhh/listado-de-fichas" className={styles.backButton}>
          ←
        </Link>

        <div className={styles.profileInfo}>
          <div className={styles.profileAvatar}>
            {personalData.avatar &&
            typeof personalData.avatar === 'string' &&
            personalData.avatar.startsWith('http') ? (
              <img src={personalData.avatar} alt={personalData.nombre_completo} />
            ) : (
              <span>{getInitials(personalData.nombre_completo)}</span>
            )}
          </div>
          <div className={styles.profileDetails}>
            <h1 className={styles.employeeName}>{personalData.nombre_completo}</h1>
            <p className={styles.employeeTitle}>{personalData.cargo}</p>
            <p className={styles.employeeStatus}>
              <span
                className={`${styles.statusBadge} ${
                  personalData.estado === 'Activo'
                    ? styles.statusActive
                    : styles.statusInactive
                }`}
              >
                {personalData.estado}
              </span>
              <span className={styles.employeeDates}>
                Empleado desde {yearsAndMonths}
              </span>
            </p>
          </div>
        </div>

        <div className={styles.profileActions}>
          <button className={styles.actionButton} onClick={handleEditToggle}>
            {isEditing ? 'Guardar Ficha' : 'Editar Ficha'} <FiEdit />
          </button>
          {!isEditing && (
            <button className={styles.actionButton}>
              Descargar Ficha <FiDownload />
            </button>
          )}
        </div>

        {/* NAV DE SECCIONES */}
        <nav className={styles.profileNav}>
          {menuItems.map((item) => {
            const targetPath =
              item.path === '.'
                ? `/dashboard/rrhh/empleado/${rut}`
                : `/dashboard/rrhh/empleado/${rut}/${item.path}`;

            return (
              <NavLink
                key={item.path}
                to={targetPath}
                className={({ isActive }) =>
                  isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
                }
                end={item.path === '.'}
              >
                {item.title}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* CONTENIDO DE CADA SECCIÓN */}
      <main className={styles.profileContent}>
        <Routes>
          {/* Tictiva 360 */}
          <Route
            index
            element={<Overview360 employee={personalData} isEditing={isEditing} />}
          />
          <Route
            path="tictiva-360"
            element={<Overview360 employee={personalData} isEditing={isEditing} />}
          />

          {/* Datos personales */}
          <Route
            path="personal"
            element={<DatosPersonales personalData={personalData} isEditing={isEditing} />}
          />

          {/* Datos contractuales */}
          <Route
            path="contractual"
            element={<DatosContractuales contractData={contractData} isEditing={isEditing} />}
          />

          {/* Datos previsionales */}
          <Route
            path="previsional"
            element={
              <DatosPrevisionales previsionalData={previsionalData} isEditing={isEditing} />
            }
          />

          {/* Datos bancarios */}
          <Route
            path="bancario"
            element={
              <DatosBancarios
                bankData={bankData}
                isEditing={isEditing}
                onChange={setBankData}
              />
            }
          />

          {/* Datos de salud */}
          <Route
            path="salud"
            element={
              <DatosSalud
                healthData={healthData}
                isEditing={isEditing}
                onChange={setHealthData}
              />
            }
          />

          {/* Documentos */}
          <Route path="documentos" element={<DatosDocumentos />} />

          {/* Asistencia */}
          <Route path="asistencia" element={<DatosAsistencia rut={rut} />} />

          {/* ✅ Bitácora Laboral – nueva pestaña real */}
          <Route path="bitacora" element={<DatosBitacora rut={rut} />} />

          {/* Historial (por ahora placeholder) */}
          <Route path="historial" element={<SectionPlaceholder title="Historial" />} />
        </Routes>
      </main>
    </div>
  );
}

export default EmployeeProfilePage;
