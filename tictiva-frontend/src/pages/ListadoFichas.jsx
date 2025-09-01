// src/pages/ListadoFichas.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HRSubnav from "../components/HRSubnav";
import "./ListadoFichas.css";
import CrearEmpleadoModal from "../components/CrearEmpleadoModal"; // (no se usa, se deja para no tocar importaciones)
import { EmpleadosAPI } from "../api"; // ✅ usar capa API centralizada

const initials = (name = "") =>
  name.toString().split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

// ---- helpers credenciales ----
const genPin = () => String(Math.floor(1000 + Math.random() * 9000)); // 4 dígitos automático
const rutDigits = (rut = "") => rut.replace(/\D/g, "");
const guessUsuario = (nombre = "", rut = "") => {
  const parts = nombre.trim().split(/\s+/);
  if (parts.length >= 2) {
    const first = parts[0].toLowerCase();
    const last = parts[parts.length - 1].toLowerCase();
    return `${first}.${last}`;
  }
  const num = rutDigits(rut);
  return num ? `usr${num.slice(-6)}` : "usuario.app";
};

// ✅ Generar URL ABSOLUTA al detalle (prefiere ID; si no, RUT)
const pathDetalleEmpleado = (emp) => {
  const id = emp?.id;
  const rut = emp?.rut;
  if (id != null && id !== "") return `/rrhh/empleado/${encodeURIComponent(String(id))}`;
  if (rut) return `/rrhh/empleado/rut/${encodeURIComponent(String(rut))}`;
  return "/rrhh/fichas"; // fallback seguro
};

/* ───────────── Normalización de género (robusta + fallback por nombre) ───────────── */
const _rmAccents = (s = "") => s.normalize("NFD").replace(/\p{Diacritic}/gu, "");
const _getByKeysCI = (obj = {}, keys = []) => {
  const map = Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [_rmAccents(String(k).toLowerCase()), v])
  );
  for (const k of keys) {
    const v = map[_rmAccents(String(k).toLowerCase())];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return null;
};
const getGeneroRaw = (e) => {
  if (!e) return "";
  let v = _getByKeysCI(e, ["genero","género","sexo","gender","genero_text","sexo_text","generodescripcion","genderlabel"]);
  const code = _getByKeysCI(e, ["genero_id","sexo_id","gender_id","gendercode"]);
  if ((v == null || String(v).trim() === "") && code != null) v = String(code);
  if (v == null || String(v).trim() === "") return "";
  return _rmAccents(String(v).trim().toLowerCase());
};
const FEMALE_NAMES = new Set([
  "maria","maria jose","maría","ana","nicole","victoria","camila","valentina",
  "constanza","paula","sofia","sofía","fernanda","carolina","daniela","isabella",
  "martina","josefina","romina","catalina","pamela","veronica","verónica","antonia","francisca"
]);
const MALE_NAMES = new Set([
  "juan","carlos","luis","raul","raúl","gabriel","francisco","jose","josé","pedro",
  "diego","felipe","rodrigo","nicolas","nicolás","cristian","andres","andrés","pablo","matias","matías","raul","raúl"
]);
const firstName = (s="") => _rmAccents(s).trim().split(/\s+/)[0]?.toLowerCase() || "";
const guessGeneroPorNombre = (nombre="") => {
  const n = firstName(nombre);
  if (!n) return null;
  if (FEMALE_NAMES.has(n)) return "femenino";
  if (MALE_NAMES.has(n))   return "masculino";
  if (n.endsWith("a"))     return "femenino";
  return "masculino";
};
const esHombre = (e) => {
  const g = getGeneroRaw(e);
  if (g) {
    if (/^(1|masculino|hombre|male|varon|masc)$/.test(g)) return true;
    if (/^m$/.test(g)) return true;
    if (/^(2|femenino|mujer|female|fem|f)$/.test(g)) return false;
  }
  return guessGeneroPorNombre(e?.nombre || "") === "masculino";
};
const esMujer = (e) => {
  const g = getGeneroRaw(e);
  if (g) {
    if (/^(2|femenino|mujer|female|fem)$/.test(g)) return true;
    if (/^f$/.test(g)) return true;
    if (/^(1|masculino|hombre|male|m|varon|masc)$/.test(g)) return false;
  }
  return guessGeneroPorNombre(e?.nombre || "") === "femenino";
};
const tieneDiscapacidad = (e) => {
  const v = _getByKeysCI(e, ["discapacidad", "es_discapacitado", "disability", "hasdisability"]);
  return !!v;
};

export default function ListadoFichas() {
  const navigate = useNavigate();

  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  // Filtro por KPI activo: 'todos' | 'activos' | 'inactivos' | 'hombres' | 'mujeres' | 'discapacidad'
  const [kpiFilter, setKpiFilter] = useState("todos");

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const data = await EmpleadosAPI.list(); // ✅ usa capa API (API → /data/db.json)
        if (!cancel) setEmpleados(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("No se pudo cargar empleados", e);
        if (!cancel) setEmpleados([]);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => { cancel = true; };
  }, []);

  const listBySearch = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return empleados;
    return empleados.filter((e) =>
      `${e?.nombre || ""} ${e?.rut || ""}`.toLowerCase().includes(t)
    );
  }, [empleados, q]);

  const listFiltered = useMemo(() => {
    switch (kpiFilter) {
      case "activos":
        return listBySearch.filter((e) => (e?.estado || "").toLowerCase() === "activo");
      case "inactivos":
        return listBySearch.filter((e) => (e?.estado || "").toLowerCase() !== "activo");
      case "hombres":
        return listBySearch.filter((e) => esHombre(e));
      case "mujeres":
        return listBySearch.filter((e) => esMujer(e));
      case "discapacidad":
        return listBySearch.filter((e) => tieneDiscapacidad(e));
      default:
        return listBySearch;
    }
  }, [listBySearch, kpiFilter]);

  // KPIs (con inferencia de género)
  const total = empleados.length;
  const activos = empleados.filter((e) => (e?.estado || "").toLowerCase() === "activo").length;
  const inactivos = total - activos;
  const hombres = empleados.filter((e) => esHombre(e)).length;
  const mujeres = empleados.filter((e) => esMujer(e)).length;
  const conDiscapacidad = empleados.filter((e) => tieneDiscapacidad(e)).length;

  // ===== Modal Crear Empleado =====
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [usuarioTouched, setUsuarioTouched] = useState(false);

  const [form, setForm] = useState({
    nombre: "",
    rut: "",
    cargo: "",
    area: "",
    estado: "Activo",
    genero: "Otro",
    fechaIngreso: new Date().toISOString().slice(0, 10),

    // Datos personales
    correo: "",
    telefono: "",
    direccion: "",
    centro: "",

    // Credenciales
    usuarioApp: "",
    pin: genPin(),

    // Contractuales básicos
    tipoContrato: "Indefinido",
    jornada: "Jornada Completa",
    sueldoBase: "",
  });

  const openModal = () => {
    setUsuarioTouched(false);
    setForm({
      nombre: "",
      rut: "",
      cargo: "",
      area: "",
      estado: "Activo",
      genero: "Otro",
      fechaIngreso: new Date().toISOString().slice(0, 10),
      correo: "",
      telefono: "",
      direccion: "",
      centro: "",
      usuarioApp: "",
      pin: genPin(),
      tipoContrato: "Indefinido",
      jornada: "Jornada Completa",
      sueldoBase: "",
    });
    setOpen(true);
  };

  // autocompletar usuario mientras no lo edite manualmente
  const handleNombre = (v) => {
    setForm((f) => ({
      ...f,
      nombre: v,
      usuarioApp: usuarioTouched ? f.usuarioApp : guessUsuario(v, f.rut),
    }));
  };
  const handleRut = (v) => {
    setForm((f) => ({
      ...f,
      rut: v,
      usuarioApp: usuarioTouched ? f.usuarioApp : guessUsuario(f.nombre, v),
    }));
  };

  const crearEmpleado = async () => {
    if (!form.nombre.trim() || !form.rut.trim()) {
      alert("Nombre y RUT son obligatorios.");
      return;
    }
    setSaving(true);

    const nuevo = {
      id: Date.now(),
      rut: form.rut.trim(),
      nombre: form.nombre.trim(),
      cargo: form.cargo.trim() || "—",
      estado: form.estado,
      fechaIngreso: form.fechaIngreso,
      area: form.area || "—",
      genero: form.genero,

      correo: form.correo || "",
      telefono: form.telefono || "",
      direccion: form.direccion || "",
      centro: form.centro || "",

      marcas: [],
      salud: { condiciones: "", accidentes: "", religion: "", indicaciones: "" },
      contacto: { nombre: "", relacion: "", telefono: "", direccion: "" },
      evaluacion: { comentarios: "" },

      datosContractuales: {
        tipoContrato: form.tipoContrato || "Indefinido",
        jornada: form.jornada || "Jornada Completa",
        sueldoBase: form.sueldoBase ? Number(form.sueldoBase) : undefined,
      },

      credencialesApp: {
        usuario: form.usuarioApp || guessUsuario(form.nombre, form.rut),
        pin: form.pin,
      },

      hojaDeVida: {
        experiencias: [],
        educacion: [],
        certificaciones: [],
        habilidades: [],
        idiomas: [],
        observaciones: "",
      },
    };

    try {
      // Mantengo tu flujo original (POST a API local si estás en dev)
      const API_ENV = (import.meta.env.VITE_API_URL || "").trim();
      const isLocal = typeof window !== "undefined" && ["localhost","127.0.0.1"].includes(window.location.hostname);
      const API = API_ENV || (isLocal ? "http://127.0.0.1:3001" : "");

      if (API) {
        const r = await fetch(`${API.replace(/\/$/, "")}/empleados`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevo),
        });
        if (!r.ok) throw new Error("HTTP " + r.status);
      }

      setEmpleados((p) => [nuevo, ...p]);
      setOpen(false);
      try { await navigator.clipboard?.writeText(String(nuevo.credencialesApp.pin || "")); } catch {}
      navigate(pathDetalleEmpleado(nuevo));
    } catch (e) {
      alert("No se pudo crear el empleado. Revisa json-server.");
    } finally {
      setSaving(false);
    }
  };

  // Toggle filtro KPI
  const toggleKpi = (key) => {
    setKpiFilter(prev => (prev === key ? "todos" : key));
  };

  return (
    <div className="dashboard-bg" style={{ padding: 16 }}>
      <HRSubnav />

      {/* Encabezado + acciones */}
      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800 }}>
            Lista de Empleados - Tictiva 1
          </h1>
          <p style={{ margin: "6px 0 0", color: "#6B7280" }}>
            Información de empleados para Tictiva 1. Haga clic en el nombre para ver detalles.
          </p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o RUT"
            style={{
              border: "1px solid #E5E7EB",
              borderRadius: 10,
              padding: "10px 12px",
              outline: "none",
              width: 260,
            }}
          />
          <button
            className="btn"
            onClick={() => alert("Carga masiva (demo)")}
            style={{
              border: "1px solid #E5E7EB",
              background: "#fff",
              padding: "10px 12px",
              borderRadius: 10,
              cursor: "pointer",
            }}
            type="button"
          >
            Carga Masiva
          </button>
          <button
            className="btn primary"
            onClick={openModal}
            style={{
              background: "#1A56DB",
              color: "#fff",
              padding: "10px 14px",
              borderRadius: 10,
              border: 0,
              cursor: "pointer",
              fontWeight: 600,
            }}
            type="button"
          >
            Crear Empleado
          </button>
        </div>
      </div>

      {/* KPIs (clicables) */}
      <div className="lf-kpis">
        {[
          { id: "todos",          key: "Total",           value: total,             icon: "👥", color: "indigo" },
          { id: "activos",        key: "Activos",         value: activos,           icon: "✅", color: "green"  },
          { id: "inactivos",      key: "Inactivos",       value: inactivos,         icon: "⛔️", color: "amber"  },
          { id: "hombres",        key: "Hombres",         value: hombres,           icon: "👨", color: "blue"   },
          { id: "mujeres",        key: "Mujeres",         value: mujeres,           icon: "👩", color: "pink"   },
          { id: "discapacidad",   key: "Discapacitados",  value: conDiscapacidad,   icon: "♿️", color: "violet" },
        ].map((k) => (
          <button
            key={k.id}
            onClick={() => toggleKpi(k.id)}
            className="lf-kpi-card"
            style={{
              cursor: "pointer",
              outline: kpiFilter === k.id ? "2px solid #1A56DB" : "none",
              outlineOffset: "2px",
              background: "#fff",
              textAlign: "left"
            }}
            type="button"
          >
            <div className={`lf-kpi-ico lf-${k.color}`}>{k.icon}</div>
            <div className="lf-kpi-meta">
              <div className="lf-kpi-label">{k.key}</div>
              <div className="lf-kpi-val">{k.value}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* Header tabla */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "100px 1.6fr 1fr 1.4fr 0.8fr 1fr",
            gap: 8,
            padding: "12px 16px",
            fontWeight: 700,
            color: "#374151",
            background: "#F9FAFB",
            borderBottom: "1px solid #E5E7EB",
          }}
        >
          <div>FOTO</div>
          <div>NOMBRE COMPLETO</div>
          <div>RUT</div>
          <div>CARGO</div>
          <div>ESTADO</div>
          <div>ACCIONES</div>
        </div>

        {/* Filas */}
        {loading ? (
          <div style={{ padding: 16, color: "#6B7280" }}>Cargando…</div>
        ) : listFiltered.length === 0 ? (
          <div style={{ padding: 16, color: "#6B7280" }}>Sin resultados</div>
        ) : (
          listFiltered.map((e) => {
            const key = e?.id ?? e?.rut;
            const activo = (e?.estado || "").toLowerCase() === "activo";
            const hrefDetalle = pathDetalleEmpleado(e);

            return (
              <div
                key={key}
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1.6fr 1fr 1.4fr 0.8fr 1fr",
                  gap: 8,
                  padding: "14px 16px",
                  borderTop: "1px solid #E5E7EB",
                  alignItems: "center",
                }}
              >
                <div>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 999,
                      background: "#E5EDFF",
                      color: "#1E3A8A",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                    }}
                  >
                    {initials(e?.nombre)}
                  </div>
                </div>

                <div>
                  <Link
                    to={hrefDetalle}
                    style={{ color: "#1A56DB", textDecoration: "none", fontWeight: 700 }}
                  >
                    {e?.nombre || "—"}
                  </Link>
                </div>

                <div style={{ color: "#6B7280" }}>{e?.rut || "—"}</div>
                <div>{e?.cargo || "—"}</div>

                <div>
                  <span
                    style={{
                      padding: "6px 10px",
                      borderRadius: 999,
                      fontWeight: 700,
                      fontSize: 12,
                      color: activo ? "#065F46" : "#92400E",
                      background: activo ? "#D1FAE5" : "#FEF3C7",
                      border: `1px solid ${activo ? "#A7F3D0" : "#FDE68A"}`,
                    }}
                  >
                    {e?.estado || "—"}
                  </span>
                </div>

                <div>
                  <Link to={hrefDetalle} style={{ color: "#1A56DB", textDecoration: "none" }}>
                    👁️ Ver Detalles
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ===== Modal Crear Empleado (push-pop) ===== */}
      {open && (
        <>
          <div
            onClick={() => !saving && setOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 60 }}
          />
          <div
            style={{
              position: "fixed",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: 760,
              maxWidth: "92vw",
              maxHeight: "86vh",
              overflow: "auto",
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: 12,
              boxShadow: "0 12px 32px rgba(0,0,0,.18)",
              zIndex: 80,
            }}
          >
            {/* Header modal */}
            <div
              style={{
                position: "sticky",
                top: 0,
                background: "#fff",
                padding: 12,
                borderBottom: "1px solid #E5E7EB",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                zIndex: 1,
              }}
            >
              <h3 style={{ margin: 0 }}>Crear Empleado</h3>
              <button
                type="button"
                className="vdt-btn"
                onClick={() => setOpen(false)}
                disabled={saving}
              >
                ✖
              </button>
            </div>

            {/* Body modal */}
            <div style={{ padding: 12, display: "grid", gap: 12 }}>
              {/* Título Datos Personales (arriba de nombre) */}
              <h4 style={{ margin: "0 0 4px" }}>Datos Personales</h4>

              {/* Identificación */}
              <div className="vdt-grid-2">
                <div>
                  <label className="vdt-label">Nombre completo*</label>
                  <input
                    className="vdt-input"
                    value={form.nombre}
                    onChange={(e) => handleNombre(e.target.value)}
                    placeholder="Ej: Juan Díaz Morales"
                  />
                </div>
                <div>
                  <label className="vdt-label">RUT*</label>
                  <input
                    className="vdt-input"
                    value={form.rut}
                    onChange={(e) => handleRut(e.target.value)}
                    placeholder="12.345.678-9"
                  />
                </div>
              </div>

              {/* Puesto */}
              <div className="vdt-grid-2">
                <div>
                  <label className="vdt-label">Cargo</label>
                  <input
                    className="vdt-input"
                    value={form.cargo}
                    onChange={(e) => setForm({ ...form, cargo: e.target.value })}
                    placeholder="Ej: Contador"
                  />
                </div>
                <div>
                  <label className="vdt-label">Área</label>
                  <input
                    className="vdt-input"
                    value={form.area}
                    onChange={(e) => setForm({ ...form, area: e.target.value })}
                    placeholder="Ej: Finanzas"
                  />
                </div>
              </div>

              <div className="vdt-grid-2">
                <div>
                  <label className="vdt-label">Estado</label>
                  <select
                    className="vdt-input"
                    value={form.estado}
                    onChange={(e) => setForm({ ...form, estado: e.target.value })}
                  >
                    <option>Activo</option>
                    <option>Inactivo</option>
                  </select>
                </div>
                <div>
                  <label className="vdt-label">Género</label>
                  <select
                    className="vdt-input"
                    value={form.genero}
                    onChange={(e) => setForm({ ...form, genero: e.target.value })}
                  >
                    <option>Hombre</option>
                    <option>Mujer</option>
                    <option>Otro</option>
                  </select>
                </div>
              </div>

              <label className="vdt-label">Fecha de ingreso</label>
              <input
                type="date"
                className="vdt-input"
                value={form.fechaIngreso}
                onChange={(e) => setForm({ ...form, fechaIngreso: e.target.value })}
              />

              {/* Contacto */}
              <div className="vdt-grid-2">
                <div>
                  <label className="vdt-label">Correo</label>
                  <input
                    className="vdt-input"
                    value={form.correo}
                    onChange={(e) => setForm({ ...form, correo: e.target.value })}
                    placeholder="ejemplo@empresa.cl"
                  />
                </div>
                <div>
                  <label className="vdt-label">Teléfono</label>
                  <input
                    className="vdt-input"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                    placeholder="+56 9 XXXX XXXX"
                  />
                </div>
              </div>
              <div>
                <label className="vdt-label">Dirección</label>
                <input
                  className="vdt-input"
                  value={form.direccion}
                  onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  placeholder="Calle 123, Ciudad"
                />
              </div>

              {/* Contractuales básicos */}
              <h4 style={{ margin: "8px 0 0" }}>Datos Contractuales (básicos)</h4>
              <div className="vdt-grid-2">
                <div>
                  <label className="vdt-label">Tipo de contrato</label>
                  <select
                    className="vdt-input"
                    value={form.tipoContrato}
                    onChange={(e) => setForm({ ...form, tipoContrato: e.target.value })}
                  >
                    <option>Indefinido</option>
                    <option>Plazo Fijo</option>
                    <option>Honorarios</option>
                  </select>
                </div>
                <div>
                  <label className="vdt-label">Jornada</label>
                  <select
                    className="vdt-input"
                    value={form.jornada}
                    onChange={(e) => setForm({ ...form, jornada: e.target.value })}
                  >
                    <option>Jornada Completa</option>
                    <option>Jornada Parcial</option>
                    <option>Por Turnos</option>
                  </select>
                </div>
              </div>
              <div className="vdt-grid-2">
                <div>
                  <label className="vdt-label">Sueldo base (opcional)</label>
                  <input
                    className="vdt-input"
                    type="number"
                    min="0"
                    step="1000"
                    value={form.sueldoBase}
                    onChange={(e) => setForm({ ...form, sueldoBase: e.target.value })}
                    placeholder="Ej: 800000"
                  />
                </div>
                <div>
                  <label className="vdt-label">Centro / Sucursal</label>
                  <input
                    className="vdt-input"
                    value={form.centro}
                    onChange={(e) => setForm({ ...form, centro: e.target.value })}
                    placeholder="Ej: Casa Matriz"
                  />
                </div>
              </div>

              {/* Credenciales App */}
              <h4 style={{ margin: "8px 0 0" }}>Credenciales App</h4>
              <div className="vdt-grid-2">
                <div>
                  <label className="vdt-label">Usuario App</label>
                  <input
                    className="vdt-input"
                    value={form.usuarioApp || guessUsuario(form.nombre, form.rut)}
                    onChange={(e) => {
                      setUsuarioTouched(true);
                      setForm({ ...form, usuarioApp: e.target.value });
                    }}
                    placeholder="juan.perez"
                  />
                </div>
                <div>
                  <label className="vdt-label">PIN (automático)</label>
                  <input className="vdt-input" value={form.pin} readOnly />
                  <div style={{ color: "#6B7280", fontSize: 12, marginTop: 4 }}>
                    Se copiará al portapapeles al guardar.
                  </div>
                </div>
              </div>
            </div>

            {/* Footer modal */}
            <div
              style={{
                position: "sticky",
                bottom: 0,
                background: "#fff",
                padding: 12,
                borderTop: "1px solid #E5E7EB",
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <button
                type="button"
                className="vdt-btn"
                onClick={() => setOpen(false)}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="vdt-btn primary"
                onClick={crearEmpleado}
                disabled={saving}
              >
                {saving ? "Creando..." : "Crear Empleado"}
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        .vdt-input{ background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:10px 12px;outline:none;}
        .vdt-input:focus{border-color:#C7D2FE;box-shadow:0 0 0 4px rgba(26,86,219,.10);}
        .vdt-label{font-size:12px;color:#6B7280}
        .vdt-grid-2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        .vdt-btn{background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:8px 12px;cursor:pointer}
        .vdt-btn:hover{background:#F9FAFB}
        .vdt-btn.primary{background:#1A56DB;color:#fff;border-color:#1A56DB}
      `}</style>
    </div>
  );
}
