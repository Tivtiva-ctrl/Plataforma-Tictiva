import React, { useState, useEffect } from 'react';
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
  type = "text",
  options = [],
}) {
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
          // Aseguramos que el valor sea "true" o "false" para el select
          value={String(normalized)}
          onChange={onChange}
          className={styles.formInput}
        >
          <option value="false">No</option>
          <option value="true">Sí</option>
        </select>
      ) : (
        <input
          type="text"
          value={normalized ? "Sí" : "No"}
          readOnly
          className={styles.formInput}
        />
      )}
    </div>
  );
}

// --- Componente Principal de Datos de Salud ---
function DatosSalud({ healthData, isEditing, onChange }) {
  const [formData, setFormData] = useState(healthData || {});

  // Sincronizamos cuando cambian los datos desde el padre
  useEffect(() => {
    setFormData(healthData || {});
  }, [healthData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Convertimos 'true'/'false' de string a booleano, el resto lo dejamos igual
    const val = value === 'true' ? true : value === 'false' ? false : value;

    setFormData((prev) => {
      const updated = {
        ...prev, 
        [name]: val,
      };

      // Si el padre nos pasa onChange, le mandamos el objeto completo actualizado
      if (typeof onChange === 'function') {
        onChange(updated);
      }

      return updated;
    });
  };

  // --- Opciones para los menús desplegables ---
  const tiposSeguro = ["Fonasa", "Isapre", "Particular", "Otro"];
  const gruposSanguineos = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "No sabe"];

  if (!healthData) {
    return <div className={styles.loading}>Cargando datos de salud...</div>;
  }

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.sectionTitle}>Información de Salud</h3>

      <div className={styles.formGrid}>
        <FormField
          label="Alergias a alimentos"
          name="alergias_alimentos"
          value={formData.alergias_alimentos}
          onChange={handleChange}
          isEditing={isEditing}
        />

        <FormField
          label="Alergias a medicamentos"
          name="alergias_medicamentos"
          value={formData.alergias_medicamentos}
          onChange={handleChange}
          isEditing={isEditing}
        />

        <FormField
          label="Enfermedades crónicas"
          name="enfermedades_cronicas"
          value={formData.enfermedades_cronicas}
          onChange={handleChange}
          isEditing={isEditing}
        />

        <FormField
          label="Medicamentos permanentes"
          name="medicamentos_permanentes"
          value={formData.medicamentos_permanentes}
          onChange={handleChange}
          isEditing={isEditing}
        />

        <BooleanField
          label="¿Tiene seguro de salud?"
          name="tiene_seguro_salud"
          value={formData.tiene_seguro_salud}
          onChange={handleChange}
          isEditing={isEditing}
        />
        
        {/* Mostramos estos campos solo si tiene_seguro_salud es true */}
        {!!formData.tiene_seguro_salud && (
          <>
            <FormField
              label="Tipo de seguro"
              name="tipo_seguro"
              value={formData.tipo_seguro}
              onChange={handleChange}
              isEditing={isEditing}
              type="select"
              options={tiposSeguro}
            />
            <FormField
              label="Nombre del seguro"
              name="nombre_seguro"
              value={formData.nombre_seguro}
              onChange={handleChange}
              isEditing={isEditing}
            />
          </>
        )}
        
        <FormField
          label="Grupo sanguíneo"
          name="grupo_sanguineo"
          value={formData.grupo_sanguineo}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={gruposSanguineos}
        />

        <FormField
          label="Observaciones de salud"
          name="observaciones_salud"
          value={formData.observaciones_salud}
          onChange={handleChange}
          isEditing={isEditing}
        />
      </div>
    </div>
  );
}

export default DatosSalud;
