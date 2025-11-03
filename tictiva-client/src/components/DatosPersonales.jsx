import React, { useState, useEffect } from 'react';
import styles from './DatosPersonales.module.css';

// Componente reutilizable para un campo del formulario
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

  // Normalizamos el value para evitar cosas raras (null, undefined, Date, etc.)
  let normalizedValue = value ?? '';
  if (type === 'date' && normalizedValue) {
    const d = new Date(normalizedValue);
    if (!Number.isNaN(d.getTime())) {
      normalizedValue = d.toISOString().slice(0, 10); // YYYY-MM-DD
    }
  }

  const EditableInput = () => (
    <InputComponent
      name={name}
      value={normalizedValue}
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
      value={normalizedValue || '—'}
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

function DatosPersonales({ personalData, isEditing }) {
  // Si llegara null, evitamos romper nada
  const [formData, setFormData] = useState(personalData || {});

  useEffect(() => {
    setFormData(personalData || {});
  }, [personalData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // OJO: los <select> no son type="checkbox",
    // así que tratamos el caso especial de tiene_discapacidad
    if (name === 'tiene_discapacidad') {
      setFormData((prev) => ({
        ...prev,
        // convertimos el string "true"/"false" a boolean
        [name]: value === 'true',
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Opciones para selects
  const generos = ['Masculino', 'Femenino', 'Otro', 'Prefiero no decirlo'];
  const estadosCiviles = ['Soltero', 'Casado', 'Divorciado', 'Viudo', 'Conviviente'];
  const nacionalidades = ['Chilena', 'Peruana', 'Venezolana', 'Argentina', 'Colombiana', 'Otra'];
  const regiones = ['Región Metropolitana', 'Valparaíso', 'Biobío', 'Otra'];
  const comunas = ['Santiago Centro', 'Providencia', 'Las Condes', 'Otra'];

  if (!personalData) {
    return (
      <div className={styles.loading}>
        Cargando datos personales...
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      {/* === Sección 1: Datos Básicos === */}
      <div className={styles.formGrid}>
        <FormField
          label="RUT"
          name="rut"
          value={formData.rut}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <FormField
          label="Nombre Completo"
          name="nombre_completo"
          value={formData.nombre_completo}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <FormField
          label="Fecha de Nacimiento"
          name="fecha_nacimiento"
          value={formData.fecha_nacimiento}
          onChange={handleChange}
          isEditing={isEditing}
          type="date"
        />
        <FormField
          label="Género"
          name="genero"
          value={formData.genero}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={generos}
        />
        <FormField
          label="Estado Civil"
          name="estado_civil"
          value={formData.estado_civil}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={estadosCiviles}
        />
        <FormField
          label="Nacionalidad"
          name="nacionalidad"
          value={formData.nacionalidad}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={nacionalidades}
        />
      </div>

      {/* === Sección 2: Ubicación y Contacto === */}
      <h3 className={styles.sectionTitle}>Ubicación y Contacto</h3>
      <div className={styles.formGrid}>
        <FormField
          label="Dirección"
          name="direccion"
          value={formData.direccion}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <FormField
          label="Región"
          name="region"
          value={formData.region}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={regiones}
        />
        <FormField
          label="Comuna"
          name="comuna"
          value={formData.comuna}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={comunas}
        />
        <FormField
          label="Teléfono"
          name="telefono"
          value={formData.telefono}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <FormField
          label="Email Personal"
          name="email_personal"
          value={formData.email_personal}
          onChange={handleChange}
          isEditing={isEditing}
          type="email"
        />
      </div>
      
      {/* === Sección 3: Contacto de Emergencia === */}
      <h3 className={styles.sectionTitle}>Contacto de Emergencia</h3>
      <div className={styles.formGrid}>
        <FormField
          label="Nombre Contacto Emergencia"
          name="contacto_emergencia_nombre"
          value={formData.contacto_emergencia_nombre}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <FormField
          label="Teléfono Contacto Emergencia"
          name="contacto_emergencia_telefono"
          value={formData.contacto_emergencia_telefono}
          onChange={handleChange}
          isEditing={isEditing}
        />
      </div>

      {/* === Sección 4: Discapacidad === */}
      <h3 className={styles.sectionTitle}>Información Adicional</h3>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>¿Tiene Discapacidad?</label>
          {isEditing ? (
            <select
              name="tiene_discapacidad"
              value={formData.tiene_discapacidad ? 'true' : 'false'}
              onChange={handleChange}
              className={styles.formInput}
            >
              <option value="false">No</option>
              <option value="true">Sí</option>
            </select>
          ) : (
            <input
              type="text"
              value={formData.tiene_discapacidad ? 'Sí' : 'No'}
              readOnly
              className={styles.formInput}
            />
          )}
        </div>
        <FormField
          label="Tipo de Discapacidad"
          name="tipo_discapacidad"
          value={formData.tipo_discapacidad}
          onChange={handleChange}
          isEditing={isEditing && !!formData.tiene_discapacidad}
        />
      </div>
    </div>
  );
}

export default DatosPersonales;
