// src/components/ModalCrearEmpleado.jsx
import React, { useState, useEffect } from "react";
import "./ModalCrearEmpleado.css";

const regionesComunas = { /* ... igual que antes ... */ };
const nacionalidades = [ /* ... igual que antes ... */ ];
const afpList = ["Capital", "Cuprum", "Habitat", "Modelo", "Plan Vital", "ProVida", "UNO"];
const cajaList = ["Los Andes", "La Araucanía", "Los Héroes", "18 de Septiembre"];
const isapres = ["Banmédica", "Colmena", "CruzBlanca", "Consalud", "NuevaMasvida", "VidaTres"];
const mutuales = ["Asoc.Chilena Seg.", "Inst.Seg.Trab.", "Mutual Seg.", "Inst.Seg.Laboral"];
const fonasaTipos = ["A", "B", "C", "D"];

function generarPinTictiva() {
  const pin = Math.floor(1000 + Math.random() * 9000).toString();
  return `PIN Tictiva ${pin}`;
}

export default function ModalCrearEmpleado({ abierto, onClose, onGuardar }) {
  const [form, setForm] = useState({
    rut: "",
    direccion: "",
    sexo: "",
    telefono: "",
    fechaNacimiento: "",
    comuna: "",
    estadoCivil: "",
    nacionalidad: "",
    region: "",
    correo: "",
    cargo: "",
    jornada: "",
    responsable: "",
    fechaIngreso: "",
    pin: generarPinTictiva(),
    afp: "",
    caja: "",
    sistemaSalud: "",
    sistemaSaludTipo: "",
    mutual: "",
    banco: "",
    titularCuenta: "",
    tipoCuenta: "",
    numeroCuenta: "",
  });

  useEffect(() => {
    if (abierto) setForm((prev) => ({ ...prev, pin: generarPinTictiva() }));
  }, [abierto]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleRegionChange = (e) => setForm({ ...form, region: e.target.value, comuna: "" });
  const handleComunaChange = (e) => setForm({ ...form, comuna: e.target.value });
  const handleSistemaSaludChange = (e) => setForm({ ...form, sistemaSalud: e.target.value, sistemaSaludTipo: "" });
  const handleSistemaSaludTipoChange = (e) => setForm({ ...form, sistemaSaludTipo: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); onGuardar(form); };

  if (!abierto) return null;

  return (
    <div className="modal-bg">
      <div className="modal-contenido">
        <h2>Crear Nuevo Empleado</h2>
        <form onSubmit={handleSubmit} className="form-empleado">
          <h4>Datos Personales</h4>
          <div className="form-row">
            <input name="rut" placeholder="RUT*" value={form.rut} onChange={handleChange} required />
            <input name="correo" placeholder="Correo electrónico*" value={form.correo} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <input name="direccion" placeholder="Dirección" value={form.direccion} onChange={handleChange} />
            <input name="telefono" placeholder="Teléfono" value={form.telefono} onChange={handleChange} />
          </div>
          <div className="form-row">
            <input type="date" name="fechaNacimiento" value={form.fechaNacimiento} onChange={handleChange} />
            <select name="sexo" value={form.sexo} onChange={handleChange} required style={{ color: form.sexo ? "#181e23" : "#858585" }}>
              <option value="" disabled>Selecciona sexo</option>
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
              <option value="No binario">No binario</option>
              <option value="Prefiero no decirlo">Prefiero no decirlo</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div className="form-row">
            <select name="region" value={form.region} onChange={handleRegionChange} required style={{ color: form.region ? "#181e23" : "#858585" }}>
              <option value="" disabled>Selecciona región</option>
              {Object.keys(regionesComunas).map((region) => <option key={region} value={region}>{region}</option>)}
            </select>
            <select name="comuna" value={form.comuna} onChange={handleComunaChange} required disabled={!form.region} style={{ color: form.comuna ? "#181e23" : "#858585" }}>
              <option value="" disabled>{form.region ? "Selecciona comuna" : "Primero selecciona región"}</option>
              {form.region && regionesComunas[form.region].map((comuna) => <option key={comuna} value={comuna}>{comuna}</option>)}
            </select>
          </div>
          <div className="form-row">
            <select name="estadoCivil" value={form.estadoCivil} onChange={handleChange} required style={{ color: form.estadoCivil ? "#181e23" : "#858585" }}>
              <option value="" disabled>Selecciona estado civil</option>
              <option value="Soltero/a">Soltero/a</option>
              <option value="Casado/a">Casado/a</option>
              <option value="Divorciado/a">Divorciado/a</option>
              <option value="Viudo/a">Viudo/a</option>
              <option value="Conviviente Civil">Conviviente Civil</option>
              <option value="Separado/a">Separado/a</option>
              <option value="Otro">Otro</option>
            </select>
            <select name="nacionalidad" value={form.nacionalidad} onChange={handleChange} required style={{ color: form.nacionalidad ? "#181e23" : "#858585" }}>
              <option value="" disabled>Selecciona nacionalidad</option>
              {nacionalidades.map((nac) => <option key={nac} value={nac}>{nac}</option>)}
            </select>
          </div>

          <h4>Datos Contractuales</h4>
          <div className="form-row">
            <input name="cargo" placeholder="Cargo*" value={form.cargo} onChange={handleChange} required />
            <input name="jornada" placeholder="Jornada*" value={form.jornada} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <input name="responsable" placeholder="Responsable Directo" value={form.responsable} onChange={handleChange} />
            <input type="date" name="fechaIngreso" value={form.fechaIngreso} onChange={handleChange} required />
          </div>

          {/* PIN Tictiva */}
          <div className="form-row">
            <div className="pin-card">
              <label className="pin-label">PIN Tictiva</label>
              <div className="pin-value">
                {form.pin.replace("PIN Tictiva ", "")}
              </div>
            </div>
          </div>

          <h4>Datos Previsionales</h4>
          <div className="form-row">
            <select name="afp" value={form.afp} onChange={handleChange} required style={{ color: form.afp ? "#181e23" : "#858585" }}>
              <option value="" disabled>Selecciona AFP</option>
              {afpList.map((afp) => <option key={afp} value={afp}>{afp}</option>)}
            </select>
            <select name="caja" value={form.caja} onChange={handleChange} required style={{ color: form.caja ? "#181e23" : "#858585" }}>
              <option value="" disabled>Selecciona caja de compensación</option>
              {cajaList.map((caja) => <option key={caja} value={caja}>{caja}</option>)}
            </select>
          </div>
          <div className="form-row">
            <select name="sistemaSalud" value={form.sistemaSalud} onChange={handleSistemaSaludChange} required style={{ color: form.sistemaSalud ? "#181e23" : "#858585" }}>
              <option value="" disabled>Selecciona sistema de salud</option>
              <option value="Fonasa">Fonasa</option>
              <option value="Isapre">Isapre</option>
              <option value="Capredena">Capredena</option>
              <option value="Dipreca">Dipreca</option>
            </select>
            {form.sistemaSalud === "Fonasa" && (
              <select name="sistemaSaludTipo" value={form.sistemaSaludTipo} onChange={handleSistemaSaludTipoChange} required style={{ color: form.sistemaSaludTipo ? "#181e23" : "#858585" }}>
                <option value="" disabled>Tipo Fonasa</option>
                {fonasaTipos.map((tipo) => <option key={tipo} value={tipo}>{tipo}</option>)}
              </select>
            )}
            {form.sistemaSalud === "Isapre" && (
              <select name="sistemaSaludTipo" value={form.sistemaSaludTipo} onChange={handleSistemaSaludTipoChange} required style={{ color: form.sistemaSaludTipo ? "#181e23" : "#858585" }}>
                <option value="" disabled>Isapre</option>
                {isapres.map((isa) => <option key={isa} value={isa}>{isa}</option>)}
              </select>
            )}
          </div>
          <div className="form-row">
            <select name="mutual" value={form.mutual} onChange={handleChange} required style={{ color: form.mutual ? "#181e23" : "#858585" }}>
              <option value="" disabled>Selecciona mutual</option>
              {mutuales.map((mut) => <option key={mut} value={mut}>{mut}</option>)}
            </select>
          </div>

          <h4>Datos Bancarios</h4>
          <div className="form-row">
            <input name="banco" placeholder="Banco" value={form.banco} onChange={handleChange} />
            <input name="titularCuenta" placeholder="Titular de la Cuenta" value={form.titularCuenta} onChange={handleChange} />
          </div>
          <div className="form-row">
            <input name="tipoCuenta" placeholder="Tipo de Cuenta" value={form.tipoCuenta} onChange={handleChange} />
            <input name="numeroCuenta" placeholder="Número de Cuenta" value={form.numeroCuenta} onChange={handleChange} />
          </div>

          <div className="modal-btns">
            <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-guardar">Guardar Empleado</button>
          </div>
        </form>
      </div>
    </div>
  );
}
