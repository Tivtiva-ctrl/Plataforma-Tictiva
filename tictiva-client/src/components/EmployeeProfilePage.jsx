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
import DatosBitacora from './DatosBitacora';
import DatosHistorial from './DatosHistorial';

// =======================================================
// Helper: limpiar payload para Supabase
// - Omite llaves técnicas (id, employee_id, created_at, updated_at)
// - Convierte "" en null
// =======================================================
function sanitizeRow(row, omitKeys = []) {
  if (!row || typeof row !== 'object') return row;
  const cleaned = {};
  for (const [key, value] of Object.entries(row)) {
    if (omitKeys.includes(key)) continue;
    cleaned[key] = value === '' ? null : value;
    }
  return cleaned;
}

// =======================================================
// Helper: registrar evento en employee_history
// usando la estructura REAL de la tabla
// =======================================================
async function registerHistoryEntry({ rut, employeeId, autor }) {
  if (!rut || !employeeId) return;

  const actorName = autor || 'Admin Tictiva';

  const payload = {
    employee_id: employeeId,
    rut,

    // Contexto del módulo
    modulo: 'RRHH',
    submodulo: 'FICHA',

    // Qué pasó
    tipo: 'CAMBIO',
    titulo: 'Actualización de ficha del colaborador',
    categoria: 'RRHH',
    descripcion:
      'Se actualizó la información de la ficha del colaborador desde el módulo RRHH.',
    estado: 'REGISTRADO', // o "OK", como prefieras que aparezca

    // Detalle de la acción
    tipo_accion: 'ACTUALIZACION',
    gravedad: 'BAJA', // BAJA / MEDIA / ALTA
    etiqueta_accion: 'FICHA_ACTUALIZADA',
    valor_anterior: null,
    nuevo_valor: null,

    // Quién hizo la acción
    autor: actorName,
    autor_role: 'ADMINISTRADOR',
    realizado_por_id: null,
    realizado_por_nombre: actorName,
    realizado_por_role: 'ADMINISTRADOR',

    // De dónde vino
    origen: 'WEB_RRHH',
    direccion_ip: null,
    agente_usuario: null,
    dt_relevante: false,
  };

  const { error } = await supabase.from('employee_history').insert([payload]);

  if (error) {
    console.error('Error registrando historial (employee_history):', error);
  }
}

// =======================================================
// === COMPONENTE "TICTIVA 360" (SOLO LECTURA) ===
// =======================================================
function Overview360({ employee }) {
  if (!employee) {
    return <div className={styles.sectionContent}>Cargando datos del empleado…</div>;
  }

  return (
    <div className={styles.cardGrid}>
      {/* Datos personales */}
      <div className={styles.infoCard}>
        <h3>Datos personales</h3>
        <p>Email: {employee.email_personal || '[campo sin definir]'}</p>
        <p>Dirección: {employee.direccion || '[campo sin definir]'}</p>
        <p>Comuna: {employee.comuna || '[campo sin definir]'}</p>
        <Link to="personal" className={styles.detailButton}>
          Ver detalle
        </Link>
      </div>

      {/* Horario */}
      <div className={styles.infoCard}>
        <h3>Horario</h3>
        <p>El empleado no tiene asignaciones activas en este momento.</p>
        <Link to="asistencia" className={styles.detailButton}>
          Ver detalle
        </Link>
      </div>

      {/* Evaluaciones */}
      <div className={styles.infoCard}>
        <h3>Evaluaciones</h3>
        <div className={styles.evaluationScore}>7.8</div>
        <p className={styles.evaluationStatus}>Estado óptimo</p>
        <p className={styles.evaluationSubtitle}>
          Último test aplicado por Nadia (psicóloga interna)
        </p>
        <Link to="bitacora" className={styles.detailButton}>
          Ver detalle
        </Link>
      </div>

      {/* Contacto de emergencia */}
      <div className={styles.infoCard}>
        <h3>Contacto de emergencia</h3>
        <p>Nombre: {employee.contacto_emergencia_nombre || '[campo sin definir]'}</p>
        <p>Teléfono: {employee.contacto_emergencia_telefono || '[campo sin definir]'}</p>
        <Link to="personal" className={styles.detailButton}>
          Ver detalle
        </Link>
      </div>

      {/* Registros y anotaciones */}
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
        <Link to="bitacora" className={styles.detailButton}>
          Ver detalle
        </Link>
      </div>

      {/* Asistencia */}
      <div className={styles.infoCard}>
        <h3>Asistencia</h3>
        <div className={styles.attendanceCircle}>100%</div>
        <p className={styles.attendanceStatus}>Asistencia destacada</p>
        <div className={styles.attendanceAlert}>
          ⚠️ Atrasos: 1 atraso – 4h: 51m acumulado
        </div>
        <Link to="asistencia" className={styles.detailButton}>
          Ver detalle
        </Link>
      </div>

      {/* Alerta Verito */}
      <div className={`${styles.infoCard} ${styles.alertCard}`}>
        <h3>Hola, Verónica 💚</h3>
        <p>Detecté que {employee.nombre_completo} tiene 2 documentos vencidos.</p>
        <p className={styles.alertQuestion}>¿Quieres enviarle un recordatorio?</p>
        <div className={styles.alertActions}>
          <button className={styles.alertButtonSend}>Sí, enviar</button>
          <button className={styles.alertButtonCancel}>No, gracias</button>
        </div>
      </div>

      {/* Salud */}
      <div className={styles.infoCard}>
        <h3>Datos de salud</h3>
        <p>Alergias: {employee.tipo_discapacidad || '[campo sin definir]'}</p>
        <p>Enf. crónicas: {'[campo sin definir]'}</p>
        <p>Seguro de salud: {'[Sin definir]'}</p>
        <Link to="salud" className={styles.detailButton}>
          Ver detalle
        </Link>
      </div>

      {/* Comunicaciones */}
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

// =======================================================
// === PÁGINA DE PERFIL PRINCIPAL ===
// =======================================================
function EmployeeProfilePage() {
  const { rut } = useParams();
  const [personalData, setPersonalData] = useState(null);
  const [contractData, setContractData] = useState(null);
  const [previsionalData, setPrevisionalData] = useState(null);
  const [bankData, setBankData] = useState({});
  const [healthData, setHealthData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // ==========================================
  // Carga de datos desde Supabase
  // ==========================================
  useEffect(() => {
    if (!rut) {
      setLoading(false);
      console.error('No se proporcionó RUT');
      return;
    }

    const fetchEmployeeData = async () => {
      setLoading(true);
      setSaveError(null);

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

      const employeeId = personal.employee_id || personal.id;
      if (!employeeId) {
        console.warn(
          'No se encontró employee_id; no se cargarán contrato, previsión, bancos ni salud.'
        );
        setContractData(null);
        setPrevisionalData(null);
        setBankData({});
        setHealthData({});
        setLoading(false);
        return;
      }

      // 2) Contrato
      const { data: contract, error: conError } = await supabase
        .from('employee_contracts')
        .select('*')
        .eq('employee_id', employeeId)
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (conError) {
        console.warn('Error al cargar datos de contrato:', conError.message);
      }
      setContractData(contract || { employee_id: employeeId });

      // 3) Previsión
      const { data: previsional, error: prevError } = await supabase
        .from('employee_prevision')
        .select('*')
        .eq('employee_id', employeeId)
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (prevError) {
        console.warn('Error al cargar datos previsionales:', prevError.message);
      }
      setPrevisionalData(previsional || { employee_id: employeeId });

      // 4) Bancarios
      const { data: bank, error: bankError } = await supabase
        .from('employee_bank_accounts')
        .select('*')
        .eq('employee_id', employeeId)
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (bankError) {
        console.warn('Error al cargar datos bancarios:', bankError.message);
      }
      setBankData(bank || { employee_id: employeeId });

      // 5) Salud
      const { data: health, error: healthError } = await supabase
        .from('employee_health')
        .select('*')
        .eq('employee_id', employeeId)
        .order('id', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (healthError) {
        console.warn('Error al cargar datos de salud:', healthError.message);
      }
      setHealthData(health || { employee_id: employeeId });

      setLoading(false);
    };

    fetchEmployeeData();
  }, [rut]);

  // Antigüedad
  const yearsAndMonths = useMemo(() => {
    const fecha = contractData?.fecha_inicio || personalData?.fecha_ingreso;
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
  }, [contractData?.fecha_inicio, personalData?.fecha_ingreso]);

  const menuItems = [
    { title: 'Tictiva 360', path: '.' },
    { title: 'Datos personales', path: 'personal' },
    { title: 'Datos contractuales', path: 'contractual' },
    { title: 'Datos previsionales', path: 'previsional' },
    { title: 'Datos bancarios', path: 'bancario' },
    { title: 'Datos de salud', path: 'salud' },
    { title: 'Documentos', path: 'documentos' },
    { title: 'Asistencia', path: 'asistencia' },
    { title: 'Bitácora laboral', path: 'bitacora' },
    { title: 'Historial', path: 'historial' },
  ];

  const getInitials = (fullName) => {
    if (!fullName) return '??';
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts[parts.length - 1]?.[0] || '';
    return (first + last).toUpperCase() || '??';
  };

  // ==========================================
  // Guardar TODAS las secciones editables
  // ==========================================
  const saveAllSections = async () => {
    if (!personalData) return;

    setSaving(true);
    setSaveError(null);

    try {
      const employeeId = personalData.employee_id || personalData.id;

      // 1) Datos personales
      if (personalData.id) {
        const personalPayload = sanitizeRow(personalData, [
          'id',
          'employee_id',
          'created_at',
          'updated_at',
        ]);

        console.log('Payload employee_personal:', personalPayload);

        const { error: perUpdateError } = await supabase
          .from('employee_personal')
          .update(personalPayload)
          .eq('id', personalData.id);

        if (perUpdateError) {
          console.error('Error al actualizar employee_personal:', perUpdateError);
          throw perUpdateError;
        }
      }

      // 2) Contractuales
      if (contractData && (contractData.id || employeeId)) {
        const contractPayload = sanitizeRow(contractData, [
          'id',
          'employee_id',
          'created_at',
          'updated_at',
        ]);

        if (contractData.id) {
          const { error: conUpdateError } = await supabase
            .from('employee_contracts')
            .update(contractPayload)
            .eq('id', contractData.id);

          if (conUpdateError) {
            console.error('Error al actualizar employee_contracts:', conUpdateError);
            throw conUpdateError;
          }
        } else {
          const { error: conInsertError } = await supabase
            .from('employee_contracts')
            .insert([{ ...contractPayload, employee_id: employeeId }]);

          if (conInsertError) {
            console.error('Error al insertar employee_contracts:', conInsertError);
            throw conInsertError;
          }
        }
      }

      // 3) Previsionales
      if (previsionalData && (previsionalData.id || employeeId)) {
        const prevPayload = sanitizeRow(previsionalData, [
          'id',
          'employee_id',
          'created_at',
          'updated_at',
        ]);

        if (previsionalData.id) {
          const { error: prevUpdateError } = await supabase
            .from('employee_prevision')
            .update(prevPayload)
            .eq('id', previsionalData.id);

          if (prevUpdateError) {
            console.error('Error al actualizar employee_prevision:', prevUpdateError);
            throw prevUpdateError;
          }
        } else {
          const { error: prevInsertError } = await supabase
            .from('employee_prevision')
            .insert([{ ...prevPayload, employee_id: employeeId }]);

          if (prevInsertError) {
            console.error('Error al insertar employee_prevision:', prevInsertError);
            throw prevInsertError;
          }
        }
      }

      // 4) Bancarios
      if (bankData && (bankData.id || employeeId)) {
        const bankPayload = sanitizeRow(bankData, [
          'id',
          'employee_id',
          'created_at',
          'updated_at',
        ]);

        if (bankData.id) {
          const { error: bankUpdateError } = await supabase
            .from('employee_bank_accounts')
            .update(bankPayload)
            .eq('id', bankData.id);

          if (bankUpdateError) {
            console.error('Error al actualizar employee_bank_accounts:', bankUpdateError);
            throw bankUpdateError;
          }
        } else {
          const { error: bankInsertError } = await supabase
            .from('employee_bank_accounts')
            .insert([{ ...bankPayload, employee_id: employeeId }]);

          if (bankInsertError) {
            console.error('Error al insertar employee_bank_accounts:', bankInsertError);
            throw bankInsertError;
          }
        }
      }

      // 5) Salud
      if (healthData && (healthData.id || employeeId)) {
        const healthPayload = sanitizeRow(healthData, [
          'id',
          'employee_id',
          'created_at',
          'updated_at',
        ]);

        if (healthData.id) {
          const { error: healthUpdateError } = await supabase
            .from('employee_health')
            .update(healthPayload)
            .eq('id', healthData.id);

          if (healthUpdateError) {
            console.error('Error al actualizar employee_health:', healthUpdateError);
            throw healthUpdateError;
          }
        } else {
          const { error: healthInsertError } = await supabase
            .from('employee_health')
            .insert([{ ...healthPayload, employee_id: employeeId }]);

          if (healthInsertError) {
            console.error('Error al insertar employee_health:', healthInsertError);
            throw healthInsertError;
          }
        }
      }

      // 6) Registrar en historial
      await registerHistoryEntry({
        rut: personalData.rut,
        employeeId,
        autor: 'Admin Tictiva',
      });

      setIsEditing(false);
    } catch (err) {
      console.error('Error al guardar la ficha completa:', err);
      setSaveError(
        'Ocurrió un error al guardar la ficha. Revisa la consola para más detalles.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditToggle = async () => {
    if (!isEditing) {
      setSaveError(null);
      setIsEditing(true);
      return;
    }
    await saveAllSections();
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

  return (
    <div className={styles.profilePage}>
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
          <button
            className={styles.actionButton}
            onClick={handleEditToggle}
            disabled={saving}
          >
            {isEditing ? (saving ? 'Guardando...' : 'Guardar Ficha') : 'Editar Ficha'}{' '}
            <FiEdit />
          </button>

          {!isEditing && (
            <button className={styles.actionButton}>
              Descargar Ficha <FiDownload />
            </button>
          )}
        </div>

        {saveError && (
          <div className={styles.saveStatusBar}>
            <span className={styles.saveError}>{saveError}</span>
          </div>
        )}

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

      <main className={styles.profileContent}>
        <Routes>
          <Route index element={<Overview360 employee={personalData} />} />
          <Route path="tictiva-360" element={<Overview360 employee={personalData} />} />

          <Route
            path="personal"
            element={
              <DatosPersonales
                personalData={personalData}
                isEditing={isEditing}
                onChange={setPersonalData}
              />
            }
          />
          <Route
            path="contractual"
            element={
              <DatosContractuales
                contractData={contractData}
                isEditing={isEditing}
                onChange={setContractData}
              />
            }
          />
          <Route
            path="previsional"
            element={
              <DatosPrevisionales
                previsionalData={previsionalData}
                isEditing={isEditing}
                onChange={setPrevisionalData}
              />
            }
          />
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
          <Route path="documentos" element={<DatosDocumentos />} />
          <Route path="asistencia" element={<DatosAsistencia rut={rut} />} />
          <Route path="bitacora" element={<DatosBitacora rut={rut} />} />
          <Route path="historial" element={<DatosHistorial rut={rut} />} />
        </Routes>
      </main>
    </div>
  );
}

export default EmployeeProfilePage;
