import React from 'react';
import styles from './DatosPersonales.module.css';
// 👇 nuevo import con todas las regiones y comunas
import {
  REGIONES,
  REGIONES_COMUNAS,
} from '../constants/regionesComunasChile';

function FormField({
  label,
  value,
  name,
  onChange,
  isEditing,
  type = 'text',
  options = [],
}) {
  let normalizedValue = value ?? '';
  let displayValue = normalizedValue || '—';

  // Manejo especial para fechas
  if (type === 'date') {
    if (!normalizedValue) {
      // Sin valor: input vacío, modo lectura muestra "—"
      normalizedValue = '';
      displayValue = '—';
    } else {
      // Si ya viene en formato correcto yyyy-MM-dd
      if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedValue)) {
        const [yyyy, mm, dd] = normalizedValue.split('-');
        displayValue = `${dd}-${mm}-${yyyy}`;
      } else {
        // Intentamos parsear cualquier otra cosa (ISO con hora, etc.)
        const d = new Date(normalizedValue);
        if (!Number.isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const dd = String(d.getDate()).padStart(2, '0');

          // formato para el input date (obligatorio yyyy-MM-dd)
          normalizedValue = `${yyyy}-${mm}-${dd}`;
          // formato lindo para lectura (dd-MM-yyyy)
          displayValue = `${dd}-${mm}-${yyyy}`;
        } else {
          // Valor basura tipo "1-06-04": limpiamos para que no rompa el input
          normalizedValue = '';
          displayValue = '—';
        }
      }
    }
  }

  if (isEditing) {
    if (type === 'select') {
      return (
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>{label}</label>
          <select
            name={name}
            value={normalizedValue}
            onChange={onChange}
            className={styles.formInput}
          >
            <option value="">Seleccionar...</option>
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div className={styles.formGroup}>
        <label className={styles.formLabel}>{label}</label>
        <input
          name={name}
          value={normalizedValue}
          onChange={onChange}
          className={styles.formInput}
          type={type}
        />
      </div>
    );
  }

  // MODO SOLO LECTURA
  return (
    <div className={styles.formGroup}>
      <label className={styles.formLabel}>{label}</label>
      <input
        type="text"
        value={displayValue}
        readOnly
        className={styles.formInput}
      />
    </div>
  );
}

function DatosPersonales({ personalData, isEditing, onChange }) {
  if (!personalData) {
    return <div className={styles.loading}>Cargando datos personales...</div>;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'tiene_discapacidad') {
      const updated = {
        ...personalData,
        [name]: value === 'true',
      };
      onChange && onChange(updated);
      return;
    }

    // 👇 si cambia la región, también reseteamos la comuna
    if (name === 'region') {
      const updated = {
        ...personalData,
        region: value,
        comuna: '', // para que el usuario vuelva a elegir según la región nueva
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
  const estadosCiviles = [
    'Soltero',
    'Casado',
    'Divorciado',
    'Viudo',
    'Conviviente',
  ];
  const nacionalidades = [
    'Chilena',
    'Peruana',
    'Venezolana',
    'Argentina',
    'Colombiana',
    'Otra',
  ];

  // 👇 ahora usamos la constante con TODAS las regiones
  const regiones = REGIONES;

  // 👇 comunas dependen de la región seleccionada
  const comunas =
    personalData.region && REGIONES_COMUNAS[personalData.region]
      ? REGIONES_COMUNAS[personalData.region]
      : [];

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
