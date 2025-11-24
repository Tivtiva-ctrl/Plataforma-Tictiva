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
  const normalizedValue = value ?? '';
  const displayValue = normalizedValue || '—';

  return (
    <div className={styles.formGroup}>
      <label className={styles.formLabel}>{label}</label>

      {isEditing ? (
        type === 'select' ? (
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
        ) : (
          <input
            name={name}
            value={normalizedValue}
            onChange={onChange}
            className={styles.formInput}
            type={type}
          />
        )
      ) : (
        <input
          type="text"
          value={displayValue}
          readOnly
          className={styles.formInput}
        />
      )}
    </div>
  );
}

// Componente para campos Booleanos (Sí/No)
function BooleanField({ label, value, name, onChange, isEditing }) {
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

// --- Componente Principal de Datos Previsionales ---
function DatosPrevisionales({ previsionalData, isEditing, onChange }) {
  if (!previsionalData) {
    return <div className={styles.loading}>Cargando datos previsionales...</div>;
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    let finalValue;

    if (type === 'checkbox') {
      finalValue = checked;
    } else if (type === 'select-one') {
      if (value === 'true') finalValue = true;
      else if (value === 'false') finalValue = false;
      else finalValue = value;
    } else {
      finalValue = value;
    }

    const updated = {
      ...previsionalData,
      [name]: finalValue,
    };

    onChange && onChange(updated);
  };

  // --- Opciones para los menús desplegables ---
  const afps = ['Capital', 'Cuprum', 'Habitat', 'Modelo', 'Planvital', 'Provida', 'Uno'];
  const sistemasSalud = ['Fonasa', 'Isapre'];
  const fonasaTramos = ['A', 'B', 'C', 'D'];
  const isapreNombres = ['Banmédica', 'Colmena', 'CruzBlanca', 'Consalud', 'Vida Tres', 'Otra'];
  const montoTipos = ['CLP', 'UF', '%'];
  const apvTipos = ['A', 'B'];

  return (
    <div className={styles.formContainer}>
      {/* === Sección 1: Base Imponible === */}
      <h3 className={styles.sectionTitle}>1. Base Imponible</h3>
      <div className={styles.formGrid}>
        <FormField
          label="BP General"
          name="bp_previsional"
          value={previsionalData.bp_previsional}
          onChange={handleChange}
          isEditing={isEditing}
          type="number"
        />
        <FormField
          label="BP Salud"
          name="bp_salud"
          value={previsionalData.bp_salud}
          onChange={handleChange}
          isEditing={isEditing}
          type="number"
        />
        <FormField
          label="BP AFP"
          name="bp_afp"
          value={previsionalData.bp_afp}
          onChange={handleChange}
          isEditing={isEditing}
          type="number"
        />
      </div>

      {/* === Sección 2: AFP / Jubilación === */}
      <h3 className={styles.sectionTitle}>2. AFP / Jubilación</h3>
      <div className={styles.formGrid}>
        <FormField
          label="AFP"
          name="afp"
          value={previsionalData.afp}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={afps}
        />
        <FormField
          label="Fecha de Afiliación"
          name="afp_fecha_afiliacion"
          value={previsionalData.afp_fecha_afiliacion}
          onChange={handleChange}
          isEditing={isEditing}
          type="date"
        />
        <FormField
          label="N° Cuenta / Afiliación"
          name="afp_numero_cuenta"
          value={previsionalData.afp_numero_cuenta}
          onChange={handleChange}
          isEditing={isEditing}
        />
      </div>
      
      {/* === Sección 3: Salud (FONASA / ISAPRE) === */}
      <h3 className={styles.sectionTitle}>3. Salud</h3>
      <div className={styles.formGrid}>
        <FormField
          label="Sistema de Salud"
          name="sistema_salud"
          value={previsionalData.sistema_salud}
          onChange={handleChange}
          isEditing={isEditing}
          type="select"
          options={sistemasSalud}
        />
      </div>

      {/* Mostramos esto SÓLO SI es Fonasa */}
      {previsionalData.sistema_salud === 'Fonasa' && (
        <div className={styles.formGrid}>
          <FormField
            label="Fonasa Tramo"
            name="fonasa_tramo"
            value={previsionalData.fonasa_tramo}
            onChange={handleChange}
            isEditing={isEditing}
            type="select"
            options={fonasaTramos}
          />
          <FormField
            label="N° Cargas Fonasa"
            name="fonasa_numero_cargas"
            value={previsionalData.fonasa_numero_cargas}
            onChange={handleChange}
            isEditing={isEditing}
            type="number"
          />
          <FormField
            label="Detalle Cargas Fonasa"
            name="fonasa_detalle_cargas"
            value={previsionalData.fonasa_detalle_cargas}
            onChange={handleChange}
            isEditing={isEditing}
          />
        </div>
      )}

      {/* Mostramos esto SÓLO SI es Isapre */}
      {previsionalData.sistema_salud === 'Isapre' && (
        <div className={styles.formGrid}>
          <FormField
            label="Nombre Isapre"
            name="isapre_nombre"
            value={previsionalData.isapre_nombre}
            onChange={handleChange}
            isEditing={isEditing}
            type="select"
            options={isapreNombres}
          />
          <FormField
            label="Nombre del Plan"
            name="isapre_plan"
            value={previsionalData.isapre_plan}
            onChange={handleChange}
            isEditing={isEditing}
          />
          <FormField
            label="Monto Plan"
            name="isapre_monto_plan"
            value={previsionalData.isapre_monto_plan}
            onChange={handleChange}
            isEditing={isEditing}
            type="number"
          />
          <FormField
            label="Tipo Monto (CLP/UF/%)"
            name="isapre_monto_plan_tipo"
            value={previsionalData.isapre_monto_plan_tipo}
            onChange={handleChange}
            isEditing={isEditing}
            type="select"
            options={montoTipos}
          />
          <FormField
            label="N° Cargas Isapre"
            name="isapre_numero_cargas"
            value={previsionalData.isapre_numero_cargas}
            onChange={handleChange}
            isEditing={isEditing}
            type="number"
          />
          <FormField
            label="Detalle Cargas Isapre"
            name="isapre_detalle_cargas"
            value={previsionalData.isapre_detalle_cargas}
            onChange={handleChange}
            isEditing={isEditing}
          />
        </div>
      )}

      {/* === Sección 4: APV / APB === */}
      <h3 className={styles.sectionTitle}>4. Ahorro Previsional Voluntario (APV)</h3>
      <div className={styles.formGrid}>
        <BooleanField
          label="¿Tiene APV?"
          name="apv_tiene"
          value={previsionalData.apv_tiene}
          onChange={handleChange}
          isEditing={isEditing}
        />
        {previsionalData.apv_tiene && (
          <>
            <FormField
              label="Entidad APV"
              name="apv_entidad"
              value={previsionalData.apv_entidad}
              onChange={handleChange}
              isEditing={isEditing}
            />
            <FormField
              label="Tipo APV"
              name="apv_tipo"
              value={previsionalData.apv_tipo}
              onChange={handleChange}
              isEditing={isEditing}
              type="select"
              options={apvTipos}
            />
            <FormField
              label="Monto APV"
              name="apv_monto"
              value={previsionalData.apv_monto}
              onChange={handleChange}
              isEditing={isEditing}
              type="number"
            />
            <FormField
              label="Tipo Monto (CLP/UF/%)"
              name="apv_monto_tipo"
              value={previsionalData.apv_monto_tipo}
              onChange={handleChange}
              isEditing={isEditing}
              type="select"
              options={montoTipos}
            />
          </>
        )}
      </div>

      {/* === Sección 5: Seguros y Beneficios === */}
      <h3 className={styles.sectionTitle}>5. Seguros y Beneficios</h3>
      <div className={styles.formGrid}>
        <BooleanField
          label="¿Seguro Complementario?"
          name="seguro_complementario_tiene"
          value={previsionalData.seguro_complementario_tiene}
          onChange={handleChange}
          isEditing={isEditing}
        />
        {previsionalData.seguro_complementario_tiene && (
          <FormField
            label="Detalle Seguro Comp."
            name="seguro_complementario_detalle"
            value={previsionalData.seguro_complementario_detalle}
            onChange={handleChange}
            isEditing={isEditing}
          />
        )}
      </div>

      <div className={styles.formGrid}>
        <BooleanField
          label="¿Seguro de Vida?"
          name="seguro_vida_tiene"
          value={previsionalData.seguro_vida_tiene}
          onChange={handleChange}
          isEditing={isEditing}
        />
        {previsionalData.seguro_vida_tiene && (
          <>
            <FormField
              label="Monto Seguro Vida"
              name="seguro_vida_monto"
              value={previsionalData.seguro_vida_monto}
              onChange={handleChange}
              isEditing={isEditing}
              type="number"
            />
            <FormField
              label="Detalle Seguro Vida"
              name="seguro_vida_detalle"
              value={previsionalData.seguro_vida_detalle}
              onChange={handleChange}
              isEditing={isEditing}
            />
          </>
        )}
      </div>

      <div className={styles.formGrid}>
        <BooleanField
          label="¿Seguro SANTIA?"
          name="seguro_santia_tiene"
          value={previsionalData.seguro_santia_tiene}
          onChange={handleChange}
          isEditing={isEditing}
        />
        {previsionalData.seguro_santia_tiene && (
          <FormField
            label="Detalle SANTIA"
            name="seguro_santia_detalle"
            value={previsionalData.seguro_santia_detalle}
            onChange={handleChange}
            isEditing={isEditing}
          />
        )}
      </div>

      {/* === Sección 6: Cargas Familiares === */}
      <h3 className={styles.sectionTitle}>6. Cargas Familiares</h3>
      <div className={styles.formGrid}>
        <FormField
          label="Cargas Simples"
          name="cargas_simples"
          value={previsionalData.cargas_simples}
          onChange={handleChange}
          isEditing={isEditing}
          type="number"
        />
        <FormField
          label="Cargas Maternales"
          name="cargas_maternales"
          value={previsionalData.cargas_maternales}
          onChange={handleChange}
          isEditing={isEditing}
          type="number"
        />
        <FormField
          label="Cargas Inválidas"
          name="cargas_invalidas"
          value={previsionalData.cargas_invalidas}
          onChange={handleChange}
          isEditing={isEditing}
          type="number"
        />
        <FormField
          label="Otras Cargas"
          name="cargas_otras"
          value={previsionalData.cargas_otras}
          onChange={handleChange}
          isEditing={isEditing}
          type="number"
        />
        <FormField
          label="Observaciones Cargas"
          name="cargas_observaciones"
          value={previsionalData.cargas_observaciones}
          onChange={handleChange}
          isEditing={isEditing}
        />
      </div>

      {/* === Sección 7: Créditos y Observaciones === */}
      <h3 className={styles.sectionTitle}>7. Créditos Sociales y Observaciones</h3>
      <div className={styles.formGrid}>
        <BooleanField
          label="¿Tiene Crédito Social?"
          name="tiene_credito_social"
          value={previsionalData.tiene_credito_social}
          onChange={handleChange}
          isEditing={isEditing}
        />
        {previsionalData.tiene_credito_social && (
          <FormField
            label="Detalle Crédito Social"
            name="credito_social_detalle"
            value={previsionalData.credito_social_detalle}
            onChange={handleChange}
            isEditing={isEditing}
          />
        )}
        <FormField
          label="Observaciones Previsionales"
          name="observaciones_previsionales"
          value={previsionalData.observaciones_previsionales}
          onChange={handleChange}
          isEditing={isEditing}
        />
      </div>
    </div>
  );
}

export default DatosPrevisionales;
