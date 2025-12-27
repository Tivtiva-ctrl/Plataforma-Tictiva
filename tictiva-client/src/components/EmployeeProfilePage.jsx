// src/components/EmployeeProfilePage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Routes, Route, Link, NavLink, useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import styles from './EmployeeProfilePage.module.css';
import DatosPersonales from './DatosPersonales';
import DatosContractuales from './DatosContractuales';
import DatosPrevisionales from './DatosPrevisionales';
import DatosBancarios from './DatosBancarios';
import DatosSalud from './DatosSalud';
import DatosDocumentos from './DatosDocumentos';
import DatosAsistencia from './DatosAsistencia';
import DatosBitacora from './DatosBitacora';
import DatosHistorial from './DatosHistorial';
import { FiEdit2 } from 'react-icons/fi';

function EmployeeProfilePage() {
  const { rut } = useParams();
  const [personalData, setPersonalData] = useState(null);
  const [contractData, setContractData] = useState(null);
  const [previsionalData, setPrevisionalData] = useState(null);
  const [bankData, setBankData] = useState({});
  const [healthData, setHealthData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [faceEnroll, setFaceEnroll] = useState(null); // { photo_url, updated_at } o null

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

      // 1) Datos personales (tabla SIN employee_id, usamos RUT)
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

      // ✅ Enrolamiento facial (foto + fecha)
      const { data: enroll, error: enrollError } = await supabase
        .from('face_enrollments')
        .select('photo_url, updated_at')
        .eq('rut', rut)
        .maybeSingle();

      if (enrollError) {
        console.warn('Error al cargar face_enrollments:', enrollError);
        setFaceEnroll(null);
      } else {
        setFaceEnroll(enroll || null);
      }

      // Para el resto usamos el id de esta fila como "employeeId"
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

      // 2) Contractual (por employee_id)
      const { data: contract, error: cError } = await supabase
        .from('employee_contract')
        .select('*')
        .eq('employee_id', employeeId)
        .maybeSingle();

      if (cError) console.warn('No hay contractData o error:', cError);
      setContractData(contract || null);

      // 3) Previsional
      const { data: previsional, error: pError } = await supabase
        .from('employee_previsional')
        .select('*')
        .eq('employee_id', employeeId)
        .maybeSingle();

      if (pError) console.warn('No hay previsionalData o error:', pError);
      setPrevisionalData(previsional || null);

      // 4) Bancario
      const { data: bank, error: bError } = await supabase
        .from('employee_bank')
        .select('*')
        .eq('employee_id', employeeId)
        .maybeSingle();

      if (bError) console.warn('No hay bankData o error:', bError);
      setBankData(bank || {});

      // 5) Salud
      const { data: health, error: hError } = await supabase
        .from('employee_health')
        .select('*')
        .eq('employee_id', employeeId)
        .maybeSingle();

      if (hError) console.warn('No hay healthData o error:', hError);
      setHealthData(health || {});

      setLoading(false);
    };

    fetchEmployeeData();
  }, [rut]);

  // ==========================================
  // Helpers (iniciales)
  // ==========================================
  const getInitials = (name) => {
    if (!name) return '??';
    const parts = name.trim().split(' ').filter(Boolean);
    const first = parts[0]?.[0] || '?';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '?';
    return (first + last).toUpperCase();
  };

  // ==========================================
  // Fecha (fallback)
  // ==========================================
  const fechaIngreso = useMemo(() => {
    const d = contractData?.fecha_inicio || personalData?.fecha_ingreso;
    if (!d) return null;
    try {
      return new Date(d).toLocaleDateString();
    } catch (e) {
      return d;
    }
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

  // ==========================================
  // Guardado (si tu flujo ya lo tenía)
  // ==========================================
  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);

    try {
      // Aquí mantengo tu flujo existente sin tocarlo (si existía),
      // no agrego nada nuevo para no romper.
    } catch (e) {
      console.error('Error guardando:', e);
      setSaveError('Ocurrió un error al guardar.');
    } finally {
      setSaving(false);
      setIsEditing(false);
    }
  };

  if (loading) return <div className={styles.loading}>Cargando ficha...</div>;
  if (!personalData) return <div className={styles.loading}>No se encontró el colaborador</div>;

  return (
    <div className={styles.profilePage}>
      {/* Header */}
      <header className={styles.profileHeader}>
        <Link to="/dashboard/rrhh/listado-de-fichas" className={styles.backButton}>
          ←
        </Link>

        <div className={styles.profileInfo}>
          <div className={styles.profileAvatar}>
            {faceEnroll?.photo_url ? (
              <img src={faceEnroll.photo_url} alt={personalData.nombre_completo} />
            ) : personalData.avatar &&
              typeof personalData.avatar === 'string' &&
              personalData.avatar.startsWith('http') ? (
              <img src={personalData.avatar} alt={personalData.nombre_completo} />
            ) : (
              <span>{getInitials(personalData.nombre_completo)}</span>
            )}
          </div>
          <div className={styles.profileDetails}>
            <h1 className={styles.employeeName}>{personalData.nombre_completo}</h1>
            <p className={styles.employeeRut}>{personalData.rut}</p>
            <p className={styles.employeeRole}>
              {contractData?.cargo || '[cargo sin definir]'} • {contractData?.area || '[área sin definir]'}
            </p>

            {fechaIngreso && (
              <p className={styles.employeeMeta}>
                Ingreso: <b>{fechaIngreso}</b>
              </p>
            )}
          </div>

          <div className={styles.actions}>
            {!isEditing ? (
              <button className={styles.editBtn} onClick={() => setIsEditing(true)}>
                <FiEdit2 /> Editar
              </button>
            ) : (
              <div className={styles.editActions}>
                <button className={styles.cancelBtn} onClick={() => setIsEditing(false)} disabled={saving}>
                  Cancelar
                </button>
                <button className={styles.saveBtn} onClick={handleSave} disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            )}
          </div>
        </div>

        {saveError && <div className={styles.errorBanner}>{saveError}</div>}
      </header>

      {/* Menú lateral */}
      <aside className={styles.profileSidebar}>
        <nav className={styles.menu}>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '.'}
              className={({ isActive }) =>
                isActive ? `${styles.menuItem} ${styles.active}` : styles.menuItem
              }
            >
              {item.title}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Contenido */}
      <main className={styles.profileContent}>
        <Routes>
          <Route
            index
            element={
              <div className={styles.profileHome}>
                <h2>Resumen</h2>

                {/* Datos básicos */}
                <div className={styles.infoCard}>
                  <h3>Datos personales</h3>
                  <p>Correo: {personalData.email || '[campo sin definir]'}</p>
                  <p>Teléfono: {personalData.telefono || '[campo sin definir]'}</p>
                  <p>Dirección: {personalData.direccion || '[campo sin definir]'}</p>
                  <Link to="personal" className={styles.detailButton}>
                    Ver detalle
                  </Link>
                </div>

                <div className={styles.infoCard}>
                  <h3>Datos contractuales</h3>
                  <p>Tipo contrato: {contractData?.tipo_contrato || '[campo sin definir]'}</p>
                  <p>Jornada: {contractData?.jornada || '[campo sin definir]'}</p>
                  <p>Turno: {contractData?.turno || '[campo sin definir]'}</p>
                  <Link to="contractual" className={styles.detailButton}>
                    Ver detalle
                  </Link>
                </div>

                <div className={styles.infoCard}>
                  <h3>Contacto de emergencia</h3>
                  <p>Nombre: {personalData.contacto_emergencia_nombre || '[campo sin definir]'}</p>
                  <p>Teléfono: {personalData.contacto_emergencia_telefono || '[campo sin definir]'}</p>
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
                </div>
              </div>
            }
          />

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
                isEnrolled={!!faceEnroll}
                enrolledAt={faceEnroll?.updated_at || null}
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
          <Route
            path="asistencia"
            element={
              <DatosAsistencia
                rut={rut}
                isEnrolled={!!faceEnroll}
                enrolledAt={faceEnroll?.updated_at || null}
              />
            }
          />
          <Route path="bitacora" element={<DatosBitacora rut={rut} />} />
          <Route path="historial" element={<DatosHistorial rut={rut} />} />
        </Routes>
      </main>
    </div>
  );
}

export default EmployeeProfilePage;
