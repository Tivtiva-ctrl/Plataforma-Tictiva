import React from 'react';
// ¡Reutilizamos el mismo CSS!
import styles from './DatosPersonales.module.css'; 

// ================================
// Componente reutilizable de campo
// ================================
function FormField({
  label,
  value,
  name,
  onChange,
  isEditing,
  type = 'text',
  options = [],
}) {
  const InputComponent = type === 'select' ? 'select' : 'input';

  const EditableInput = () => (
    <InputComponent
      name={name}
      value={value ?? ''}
      onChange={onChange}
      className={styles.formInput}
      {...(type === 'select' ? {} : { type })}
    >
      {type === 'select' && (
        <>
          <option value="">Seleccionar...</option>
          {options.map((opt) => (
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

// ========================================
// Componente para campos Booleanos (Sí/No)
// ========================================
function BooleanField({ label, value, name, onChange, isEditing }) {
  // Normalizamos el valor: si viene undefined/null, lo tratamos como false
  const normalized = value === undefined || value === null ? false : !!value;

  return (
    <div className={styles.formGroup}>
      <label className={styles.formLabel}>{label}</label>
      {isEditing ? (
        <select
          name={name}
          value={String(normalized)} // "true" o "false"
          onChange={onChange}
          className={styles.formInput}
        >
          <option value="false">No</option>
          <option value="true">Sí</option>
        </select>
      ) : (
        <input
          type="text"
          value={normalized ? 'Sí' : 'No'}
          readOnly
          className={styles.formInput}
        />
      )}
    </div>
  );
}

// --- Componente Principal de Datos de Salud ---
function DatosSalud({ healthData, isEditing, onChange }) {
  if (!healthData) {
    return <div className={styles.loading}>Cargando datos de salud...</div>;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let finalValue;

    if (type === 'checkbox') {
      finalValue = checked;
    } else if (type === 'select-one') {
      // Para selects (incluidos Sí/No)
      if (value === 'true') finalValue = true;
      else if (value === 'false') finalValue = false;
      else finalValue = value;
    } else {
      finalValue = value;
    }

    const updated = {
      ...healthData,
      [name]: finalValue,
    };

    if (typeof onChange === 'function') {
      onChange(updated);
    }
  };

  // --- Opciones para los menús desplegables ---
  const tiposSeguro = ['Fonasa', 'Isapre', 'Particular', 'Otro'];
  const gruposSanguineos = [
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-',
    'No sabe',
  ];

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.sectionTitle}>Información de Salud</h3>

      <div className={styles.formGrid}>
        <FormField
          label="Alergias a alimentos"
          name="alergias_alimentos"
          value={healthData.alergias_alimentos}
          onChange={handleChange}
          isEditing={isEditing}
        />

        <FormField
          label="Alergias a medicamentos"
          name="alergias_medicamentos"
          value={healthData.alergias_medicamentos}
          onChange={handleChange}
          isEditing={isEditing}
        />

        <FormField
          label="Enfermedades crónicas"
          name="enfermedades_cronicas"
          value={healthData.enfermedades_cronicas}
          onChange={handleChange}
          isEditing={isEditing}
        />

        <FormField
          label="Medicamentos permanentes"
          name="medicamentos_permanentes"
          value={healthData.medicamentos_permanentes}
          onChange={handleChange}
          isEditing={isEditing}
        />

        <BooleanField
          label="¿Tiene seguro de salud?"
          name="tiene_seguro_salud"
          value={healthData.tiene_seguro_salud}
          onChange={handleChange}
          isEditing={isEditing}
        />

        {/* Mostramos estos campos solo si tiene_seguro_salud es true */}
        {!!healthData.tiene_seguro_salud && (
          <>
            <FormField
              label="Tipo de seguro"
              name="tipo_seguro"
              value={healthData.tipo_seguro}
              onChange={handleChange}
              isEditing={isEditing}
              type="select"
              options={tiposSeguro}
            />
            <FormField
              label="Nombre del seguro"
              name="nombre_seguro"
              value={healthData.nombre_seguro}
              onChange={handleChange}
              isEditing={isEditing}
            />
          </>
        )}

        <FormField
          label="Grupo sanguíneo"
          name="grupo_sanguineo"
          value={healthData.grupo_sanguineo}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={gruposSanguineos}
        />

        <FormField
          label="Observaciones de salud"
          name="observaciones_salud"
          value={healthData.observaciones_salud}
          onChange={handleChange}
          isEditing={isEditing}
        />
      </div>
    </div>
  );
}

export default DatosSalud;
