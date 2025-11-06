import React, { useState, useEffect } from 'react';
// Reutilizamos el mismo CSS de DatosPersonales para mantener el estilo
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
      value={value ?? ''}          // aseguramos string controlado
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
// Campo booleano (Sí / No) reutilizable
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
          value={String(normalized)}       // "true" o "false"
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

// ========================================
// Componente principal: Datos Bancarios
// ========================================
// onChange es opcional, pero muy útil para que el padre reciba los cambios.
function DatosBancarios({ bankData, isEditing, onChange }) {
  const [formData, setFormData] = useState(bankData || {});

  // Si cambian los datos desde el padre, sincronizamos el estado interno
  useEffect(() => {
    setFormData(bankData || {});
  }, [bankData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Para campos booleanos (select de Sí/No), convertimos string a boolean
    const parsedValue =
      value === 'true' ? true : value === 'false' ? false : value;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: parsedValue,
      };

      // Si el padre nos pasa onChange, le notificamos el objeto completo actualizado
      if (typeof onChange === 'function') {
        onChange(updated);
      }

      return updated;
    });
  };

  // Opciones para selects
  const bancos = [
    'Banco de Chile',
    'Banco Santander',
    'Banco BCI',
    'BancoEstado',
    'Scotiabank',
    'Itaú',
    'Otro',
  ];

  const tiposCuenta = [
    'Cuenta Corriente',
    'Cuenta Vista / RUT',
    'Cuenta de Ahorro',
  ];

  const monedas = ['CLP', 'USD', 'EUR'];

  const estadosCuenta = ['Activa', 'Inactiva'];

  // Mientras no tengamos bankData (por ejemplo, cargando desde Supabase)
  if (!bankData) {
    return <div className={styles.loading}>Cargando datos bancarios...</div>;
  }

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.sectionTitle}>Datos Bancarios</h3>

      <div className={styles.formGrid}>
        <FormField
          label="Banco"
          name="banco"
          value={formData.banco}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={bancos}
        />

        <FormField
          label="Tipo de cuenta"
          name="tipo_cuenta"
          value={formData.tipo_cuenta}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={tiposCuenta}
        />

        <FormField
          label="Número de cuenta"
          name="numero_cuenta"
          value={formData.numero_cuenta}
          onChange={handleChange}
          isEditing={isEditing}
          // Mejor text que number para no perder ceros a la izquierda
          type="text"
        />

        <FormField
          label="Moneda"
          name="moneda"
          value={formData.moneda}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={monedas}
        />

        <FormField
          label="Titular de la cuenta"
          name="titular"
          value={formData.titular}
          onChange={handleChange}
          isEditing={isEditing}
        />

        <FormField
          label="RUT del titular"
          name="rut_titular"
          value={formData.rut_titular}
          onChange={handleChange}
          isEditing={isEditing}
        />

        <BooleanField
          label="Cuenta principal"
          name="cuenta_principal"
          value={formData.cuenta_principal}
          onChange={handleChange}
          isEditing={isEditing}
        />

        <FormField
          label="Estado de la cuenta"
          name="estado"
          value={formData.estado}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={estadosCuenta}
        />
      </div>
    </div>
  );
}

export default DatosBancarios;
