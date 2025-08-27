// src/pages/components/CrearEmpleadoModal.jsx
import React, { useEffect, useMemo, useState } from "react";
import "./RRHHCrearEmpleado.css";

/* ---- RUT helpers (Chile) ---- */
const cleanRut = (rut) => (rut || "").toString().toUpperCase().replace(/[^0-9K]/g, "");
const calcDv = (rutNumStr) => {
  let suma = 0, mul = 2;
  for (let i = rutNumStr.length - 1; i >= 0; i--) {
    suma += parseInt(rutNumStr[i], 10) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const res = 11 - (suma % 11);
  return res === 11 ? "0" : res === 10 ? "K" : String(res);
};
const normalizeRut = (rutInput) => {
  const r = cleanRut(rutInput);
  if (!r) return "";
  const body = r.slice(0, -1);
  const dv = r.slice(-1);
  return `${parseInt(body || "0", 10)}-${dv}`;
};
const isRutValid = (rutInput) => {
  const r = cleanRut(rutInput);
  if (!r || r.length < 2) return false;
  const body = r.slice(0, -1);
  const dv = r.slice(-1);
  return calcDv(body) === dv;
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const randomPin = () => String(Math.floor(Math.random() * 9000) + 1000);

/** Props:
 * open: boolean
 * onClose: fn
 * onCreate: fn(payload)
 */
export default function CrearEmpleadoModal({ open, onClose, onCreate }) {
  const [form, setForm] = useState({
    nombre: "",
    rut: "",
    cargo: "",
    area: "",
    estado: "Activo",
    genero: "Otro",
    fechaIngreso: todayISO(),
    correo: "",
    telefono: "",
    direccion: "",
    tipoContrato: "Indefinido",
    jornada: "Jornada Completa",
    centro: "",
    sueldo: "",
    usuarioApp: "",
    pin: randomPin(),
  });
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTouched({});
    setSubmitting(false);
  }, [open]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const rutOk = useMemo(() => isRutValid(form.rut), [form.rut]);
  const requiredOk = form.nombre.trim() && rutOk;

  const submit = async () => {
    setTouched({ nombre: true, rut: true });
    if (!requiredOk) return;
    setSubmitting(true);
    const payload = {
      ...form,
      rut: normalizeRut(form.rut),
      sueldo: form.sueldo ? Number(form.sueldo) : null,
    };
    try {
      await Promise.resolve(); // ← aquí harías tu POST real
      onCreate && onCreate(payload);
      onClose && onClose();
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="emp-overlay" onClick={onClose}>
      <div
        className="emp-modal emp-modal--wide"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="emp-head">
          <div className="emp-title">Crear nuevo empleado</div>
          <button className="emp-x" onClick={onClose}>✖</button>
        </div>

        <div className="emp-body">
          {/* Información Principal */}
          <section className="emp-block">
            <div className="emp-block-title">Información Principal</div>
            <div className="emp-grid2">
              <div className="emp-field">
                <label className="emp-label">Nombre completo*</label>
                <input
                  className={`emp-input ${touched.nombre && !form.nombre.trim() ? "emp-err" : ""}`}
                  placeholder="Ej: Juan Díaz Morales"
                  value={form.nombre}
                  onChange={(e) => set("nombre", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, nombre: true }))}
                />
              </div>
              <div className="emp-field">
                <label className="emp-label">RUT*</label>
                <input
                  className={`emp-input ${touched.rut && !rutOk ? "emp-err" : ""}`}
                  placeholder="12.345.678-9"
                  value={form.rut}
                  onChange={(e) => set("rut", e.target.value)}
                  onBlur={() => setTouched((t) => ({ ...t, rut: true }))}
                />
                {touched.rut && !rutOk && (
                  <div className="emp-help-err">RUT inválido</div>
                )}
              </div>

              <div className="emp-field">
                <label className="emp-label">Cargo</label>
                <input
                  className="emp-input"
                  placeholder="Ej: Contador"
                  value={form.cargo}
                  onChange={(e) => set("cargo", e.target.value)}
                />
              </div>
              <div className="emp-field">
                <label className="emp-label">Área</label>
                <input
                  className="emp-input"
                  placeholder="Ej: Finanzas"
                  value={form.area}
                  onChange={(e) => set("area", e.target.value)}
                />
              </div>

              <div className="emp-field">
                <label className="emp-label">Estado</label>
                <select
                  className="emp-input"
                  value={form.estado}
                  onChange={(e) => set("estado", e.target.value)}
                >
                  <option>Activo</option>
                  <option>Inactivo</option>
                </select>
              </div>
              <div className="emp-field">
                <label className="emp-label">Género</label>
                <select
                  className="emp-input"
                  value={form.genero}
                  onChange={(e) => set("genero", e.target.value)}
                >
                  <option>Masculino</option>
                  <option>Femenino</option>
                  <option>Otro</option>
                </select>
              </div>

              <div className="emp-field">
                <label className="emp-label">Fecha de ingreso</label>
                <input
                  type="date"
                  className="emp-input"
                  value={form.fechaIngreso}
                  onChange={(e) => set("fechaIngreso", e.target.value)}
                />
              </div>
              <div></div>
            </div>
          </section>

          {/* Datos Personales */}
          <section className="emp-block">
            <div className="emp-block-title">Datos Personales</div>
            <div className="emp-grid2">
              <div className="emp-field">
                <label className="emp-label">Correo</label>
                <input
                  className="emp-input"
                  placeholder="ejemplo@empresa.cl"
                  value={form.correo}
                  onChange={(e) => set("correo", e.target.value)}
                />
              </div>
              <div className="emp-field">
                <label className="emp-label">Teléfono</label>
                <input
                  className="emp-input"
                  placeholder="+56 9 XXXX XXXX"
                  value={form.telefono}
                  onChange={(e) => set("telefono", e.target.value)}
                />
              </div>
              <div className="emp-field emp-full">
                <label className="emp-label">Dirección</label>
                <input
                  className="emp-input"
                  placeholder="Calle 123, Ciudad"
                  value={form.direccion}
                  onChange={(e) => set("direccion", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Datos Contractuales */}
          <section className="emp-block">
            <div className="emp-block-title">Datos Contractuales (básicos)</div>
            <div className="emp-grid3">
              <div className="emp-field">
                <label className="emp-label">Tipo de contrato</label>
                <select
                  className="emp-input"
                  value={form.tipoContrato}
                  onChange={(e) => set("tipoContrato", e.target.value)}
                >
                  <option>Indefinido</option>
                  <option>Plazo Fijo</option>
                  <option>Honorarios</option>
                </select>
              </div>
              <div className="emp-field">
                <label className="emp-label">Jornada</label>
                <select
                  className="emp-input"
                  value={form.jornada}
                  onChange={(e) => set("jornada", e.target.value)}
                >
                  <option>Jornada Completa</option>
                  <option>Media Jornada</option>
                  <option>Turnos</option>
                </select>
              </div>
              <div className="emp-field">
                <label className="emp-label">Centro / Sucursal</label>
                <input
                  className="emp-input"
                  placeholder="Ej: Casa Matriz"
                  value={form.centro}
                  onChange={(e) => set("centro", e.target.value)}
                />
              </div>
              <div className="emp-field">
                <label className="emp-label">Sueldo base (opcional)</label>
                <input
                  className="emp-input"
                  type="number"
                  min="0"
                  placeholder="Ej: 800000"
                  value={form.sueldo}
                  onChange={(e) => set("sueldo", e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Credenciales App */}
          <section className="emp-block">
            <div className="emp-block-title">Credenciales App</div>
            <div className="emp-grid3">
              <div className="emp-field emp-full">
                <label className="emp-label">Usuario App</label>
                <input
                  className="emp-input"
                  placeholder="usuario.app"
                  value={form.usuarioApp}
                  onChange={(e) => set("usuarioApp", e.target.value)}
                />
              </div>
              <div className="emp-field">
                <label className="emp-label">PIN (automático)</label>
                <div className="emp-pinrow">
                  <input
                    className="emp-input"
                    value={form.pin}
                    onChange={(e) => set("pin", e.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                  <button className="emp-btn" onClick={() => set("pin", randomPin())}>🔄</button>
                </div>
                <div className="emp-help">Se copiará al portapapeles al guardar.</div>
              </div>
            </div>
          </section>
        </div>

        <div className="emp-foot">
          <button className="emp-btn" onClick={onClose} disabled={submitting}>
            Cancelar
          </button>
          <button
            className="emp-btn emp-btn--primary"
            onClick={submit}
            disabled={!requiredOk || submitting}
            title={!requiredOk ? "Completa Nombre y RUT válido" : "Crear empleado"}
          >
            {submitting ? "Creando..." : "Crear Empleado"}
          </button>
        </div>
      </div>
    </div>
  );
}
