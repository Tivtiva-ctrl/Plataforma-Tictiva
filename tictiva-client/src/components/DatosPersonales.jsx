import React from 'react';
import styles from './DatosPersonales.module.css';

function FormField({ label, value, name, onChange, isEditing, type = 'text', options = [] }) {
  const InputComponent = type === 'select' ? 'select' : 'input';

  let normalizedValue = value ?? '';
  if (type === 'date' && normalizedValue) {
    const d = new Date(normalizedValue);
    if (!Number.isNaN(d.getTime())) {
      normalizedValue = d.toISOString().slice(0, 10);
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

function DatosPersonales({ personalData, isEditing, onChange }) {
  if (!personalData) {
    return <div className={styles.loading}>Cargando datos personales...</div>;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Caso especial: discapacidad booleana
    if (name === 'tiene_discapacidad') {
      const updated = {
        ...personalData,
        [name]: value === 'true',
      };
      onChange && onChange(updated);
      return;
    }

    const newValue = type === 'checkbox' ? checked : value;

    const updated = {
      ...personalData,
      [name]: newValue,
    };

    onChange && onChange(updated);
  };

  const generos = ['Masculino', 'Femenino', 'Otro', 'Prefiero no decirlo'];
  const estadosCiviles = ['Soltero', 'Casado', 'Divorciado', 'Viudo', 'Conviviente'];
  const nacionalidades = ['Chilena', 'Peruana', 'Venezolana', 'Argentina', 'Colombiana', 'Otra'];
  const regiones = ['Región Metropolitana', 'Valparaíso', 'Biobío', 'Otra'];
  const comunas = ['Santiago Centro', 'Providencia', 'Las Condes', 'Otra'];

  return (
    <div className={styles.formContainer}>
      {/* Sección 1: Datos básicos */}
      <div className={styles.formGrid}>
        <FormField
          label="RUT"
          name="rut"
          value={personalData.rut}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <FormField
          label="Nombre Completo"
          name="nombre_completo"
          value={personalData.nombre_completo}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <FormField
          label="Fecha de Nacimiento"
          name="fecha_nacimiento"
          value={personalData.fecha_nacimiento}
          onChange={handleChange}
          isEditing={isEditing}
          type="date"
        />
        <FormField
          label="Género"
          name="genero"
          value={personalData.genero}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={generos}
        />
        <FormField
          label="Estado Civil"
          name="estado_civil"
          value={personalData.estado_civil}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={estadosCiviles}
        />
        <FormField
          label="Nacionalidad"
          name="nacionalidad"
          value={personalData.nacionalidad}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={nacionalidades}
        />
      </div>

      {/* Sección 2: Ubicación y Contacto */}
      <h3 className={styles.sectionTitle}>Ubicación y Contacto</h3>
      <div className={styles.formGrid}>
        <FormField
          label="Dirección"
          name="direccion"
          value={personalData.direccion}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <FormField
          label="Región"
          name="region"
          value={personalData.region}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={regiones}
        />
        <FormField
          label="Comuna"
          name="comuna"
          value={personalData.comuna}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={comunas}
        />
        <FormField
          label="Teléfono"
          name="telefono"
          value={personalData.telefono}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <FormField
          label="Email Personal"
          name="email_personal"
          value={personalData.email_personal}
          onChange={handleChange}
          isEditing={isEditing}
          type="email"
        />
      </div>

      {/* Sección 3: Contacto de Emergencia */}
      <h3 className={styles.sectionTitle}>Contacto de Emergencia</h3>
      <div className={styles.formGrid}>
        <FormField
          label="Nombre Contacto Emergencia"
          name="contacto_emergencia_nombre"
          value={personalData.contacto_emergencia_nombre}
          onChange={handleChange}
          isEditing={isEditing}
        />
        <FormField
          label="Teléfono Contacto Emergencia"
          name="contacto_emergencia_telefono"
          value={personalData.contacto_emergencia_telefono}
          onChange={handleChange}
          isEditing={isEditing}
        />
      </div>

      {/* Sección 4: Discapacidad */}
      <h3 className={styles.sectionTitle}>Información Adicional</h3>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>¿Tiene Discapacidad?</label>
          {isEditing ? (
            <select
              name="tiene_discapacidad"
              value={personalData.tiene_discapacidad ? 'true' : 'false'}
              onChange={handleChange}
              className={styles.formInput}
            >
              <option value="false">No</option>
              <option value="true">Sí</option>
            </select>
          ) : (
            <input
              type="text"
              value={personalData.tiene_discapacidad ? 'Sí' : 'No'}
              readOnly
              className={styles.formInput}
            />
          )}
        </div>
        <FormField
          label="Tipo de Discapacidad"
          name="tipo_discapacidad"
          value={personalData.tipo_discapacidad}
          onChange={handleChange}
          isEditing={isEditing && !!personalData.tiene_discapacidad}
        />
      </div>
    </div>
  );
}

export default DatosPersonales;
