import React, { useState, useEffect } from 'react';
// ===============================================
// === REUTILIZAMOS EL CSS DE DATOS PERSONALES ===
// ===============================================
import styles from './DatosPersonales.module.css'; 

// Componente reutilizable para un campo del formulario
function FormField({ label, value, name, onChange, isEditing, type = "text", options = [] }) {
  const InputComponent = type === "select" ? "select" : "input";
  
  const EditableInput = () => (
    <InputComponent
      name={name}
      value={value ?? ''}           
      onChange={onChange}
      className={styles.formInput}
      {...(type === "select" ? {} : { type })}
    >
      {type === "select" && (
        <>
          <option value="">Seleccionar...</option>
          {options.map(opt => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </>
      )}
    </InputComponent>
  );

  const ReadOnlyInput = () => (
    <input
      type="text"
      value={value ?? '—'}          
      readOnly
      className={styles.formInput}
    />
  );

  return (
    <div className={styles.formGroup}>
      <label className={styles.formLabel}>{label}</label>
      {isEditing ? <EditableInput /> : <ReadOnlyInput />}
    </div>
  );
}

// --- Componente Principal de Datos Contractuales ---
function DatosContractuales({ contractData, isEditing }) {
  // Estado local para edición
  const [formData, setFormData] = useState(contractData || {});

  useEffect(() => {
    setFormData(contractData || {});
  }, [contractData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // --- Opciones para los menús desplegables ---
  const tiposContrato = ["Indefinido", "Plazo Fijo", "Por Obra o Faena"];
  const estadosContrato = ["Vigente", "Terminado", "Suspendido"];
  const tiposJornada = ["Completa (40h)", "Parcial (30h)", "Part-Time (20h)"];
  const afps = ["Capital", "Cuprum", "Habitat", "Modelo", "Planvital", "Provida", "Uno"];
  const sistemasSalud = [
    "Fonasa",
    "Isapre Banmédica",
    "Isapre Colmena",
    "Isapre CruzBlanca",
    "Isapre Consalud",
    "Isapre Vida Tres",
    "Otro"
  ];

  // Si todavía no llega nada y no tienes fila de contrato, mostramos mensaje
  if (!contractData) {
    return <div className={styles.loading}>Cargando datos contractuales...</div>;
  }

  return (
    <div className={styles.formContainer}>
      
      {/* === Sección 1: Información del contrato === */}
      <h3 className={styles.sectionTitle}>1. Información del contrato</h3>
      <div className={styles.formGrid}>
        <FormField
          label="Tipo de contrato"
          name="tipo_contrato"
          value={formData.tipo_contrato}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={tiposContrato}
        />
        <FormField
          label="Fecha de ingreso"
          name="fecha_ingreso"
          value={formData.fecha_ingreso}
          onChange={handleChange}
          isEditing={isEditing}
          type="date"
        />
        <FormField
          label="Fecha de término"
          name="fecha_termino"
          value={formData.fecha_termino}
          onChange={handleChange}
          isEditing={isEditing}
          type="date"
        />
        <FormField
          label="Estado del contrato"
          name="estado_contrato"
          value={formData.estado_contrato}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={estadosContrato}
        />
        <FormField
          label="Motivo de término"
          name="motivo_termino"
          value={formData.motivo_termino}
          onChange={handleChange}
          isEditing={isEditing}
        />
      </div>

      {/* === Sección 2: Cargo y organización === */}
      <h3 className={styles.sectionTitle}>2. Cargo y organización</h3>
      <div className={styles.formGrid}>
        <FormField
          label="Cargo"
          name="cargo"
          value={formData.cargo}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <FormField
          label="Área / Departamento"
          name="area"
          value={formData.area}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <FormField
          label="Centro de costo / Sucursal"
          name="centro_costo"
          value={formData.centro_costo}
          onChange={handleChange}
          isEditing={isEditing}
        />
      </div>
      
      {/* === Sección 3: Jornada laboral === */}
      <h3 className={styles.sectionTitle}>3. Jornada laboral</h3>
      <div className={styles.formGrid}>
        <FormField
          label="Tipo de jornada"
          name="tipo_jornada"
          value={formData.tipo_jornada}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={tiposJornada}
        />
        <FormField
          label="Horas semanales"
          name="horas_semanales"
          value={formData.horas_semanales}
          onChange={handleChange}
          isEditing={isEditing}
          type="number"
        />
        <FormField
          label="Día de descanso"
          name="dia_descanso"
          value={formData.dia_descanso}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <FormField
          label="Turno asignado"
          name="turno_asignado"
          value={formData.turno_asignado}
          onChange={handleChange}
          isEditing={isEditing}
        />
      </div>

      {/* === Sección 4: Remuneraciones base === */}
      <h3 className={styles.sectionTitle}>4. Remuneraciones base</h3>
      <div className={styles.formGrid}>
        <FormField
          label="Sueldo base"
          name="sueldo_base"
          value={formData.sueldo_base}
          onChange={handleChange}
          isEditing={isEditing}
          type="number"
        />
        <FormField
          label="Moneda"
          name="moneda"
          value={formData.moneda}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <FormField
          label="Gratificación"
          name="gratificacion"
          value={formData.gratificacion}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <FormField
          label="Asignación de colación"
          name="asignacion_colacion"
          value={formData.asignacion_colacion}
          onChange={handleChange}
          isEditing={isEditing}
          type="number"
        />
        <FormField
          label="Asignación de locomoción"
          name="asignacion_locomocion"
          value={formData.asignacion_locomocion}
          onChange={handleChange}
          isEditing={isEditing}
          type="number"
        />
        <FormField
          label="Otros haberes"
          name="otros_haberes"
          value={formData.otros_haberes}
          onChange={handleChange}
          isEditing={isEditing}
          type="number"
        />
      </div>

      {/* === Sección 5: Previsión asociada al contrato === */}
      <h3 className={styles.sectionTitle}>5. Previsión</h3>
      <div className={styles.formGrid}>
        <FormField
          label="AFP"
          name="afp"
          value={formData.afp}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={afps}
        />
        <FormField
          label="Sistema de salud"
          name="sistema_salud"
          value={formData.sistema_salud}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={sistemasSalud}
        />
        <FormField
          label="Plan de salud / Detalle plan"
          name="plan_salud"
          value={formData.plan_salud}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <FormField
          label="Caja de compensación"
          name="caja_compensacion"
          value={formData.caja_compensacion}
          onChange={handleChange}
          isEditing={isEditing}
        />
      </div>

      {/* === Sección 6: Control de asistencia === */}
      <h3 className={styles.sectionTitle}>6. Control de asistencia</h3>
      <div className={styles.formGrid}>
        <FormField
          label="PIN de marcación"
          name="pin_marcacion"
          value={formData.pin_marcacion}
          onChange={handleChange}
          isEditing={isEditing}
        />
      </div>
    </div>
  );
}

export default DatosContractuales;
