// src/components/PersonalesForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

const asInt = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
};

function toYMD(d) {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(dt.getTime())) return "";
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const da = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

export default function PersonalesForm({ employee, onCancel, onSaved }) {
  // catálogos
  const [regiones, setRegiones] = useState([]);
  const [comunas, setComunas] = useState([]);
  const [estadosCivil, setEstadosCivil] = useState([]);
  const [nacionalidades, setNacionalidades] = useState([]);

  // columnas detectadas de import_cl_comunas
  const [regionCol, setRegionCol] = useState("region_id");
  const [comunaValCol, setComunaValCol] = useState("codigo");
  const [comunaLabelCol, setComunaLabelCol] = useState("nombre");

  // estado del form
  const [form, setForm] = useState(() => ({
    nombre: employee?.nombre ?? employee?.nombres ?? "",
    apellido: employee?.apellido ?? employee?.apellidos ?? "",
    rut: employee?.rut ?? "",
    cargo: employee?.cargo ?? "",
    genero: employee?.genero ?? "O",
    discapacidad: !!employee?.discapacidad,
    activo: employee?.activo ?? true,

    fecha_nacimiento: toYMD(employee?.fecha_nacimiento) || "",
    direccion: employee?.direccion ?? "",

    region_id: asInt(employee?.region_id),
    // comuna_id puede ser string si usamos "codigo"
    comuna_id: employee?.comuna_id ?? null,

    telefono_movil: employee?.telefono_movil ?? "",
    telefono_fijo: employee?.telefono_fijo ?? "",
    email_personal: employee?.email_personal ?? "",
    email_corporativo: employee?.email_corporativo ?? "",

    estado_civil_id: asInt(employee?.estado_civil_id),
    nacionalidad_id: asInt(employee?.nacionalidad_id),

    pais_residencia: employee?.pais_residencia ?? "",
    idioma_preferido: employee?.idioma_preferido ?? "",
    pronombres: employee?.pronombres ?? "",
  }));

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Carga regiones / estados / nacionalidades primero
  useEffect(() => {
    let canceled = false;
    (async () => {
      try {
        const [rRes, ecRes, nRes] = await Promise.all([
          supabase.from("cl_regiones").select("id,nombre").order("id", { ascending: true }),
          supabase.from("catalog_estado_civil").select("id,nombre").order("id", { ascending: true }),
          supabase.from("catalog_nacionalidades").select("id,nombre").order("nombre", { ascending: true }),
        ]);
        if (canceled) return;
        setRegiones(rRes.data || []);
        setEstadosCivil(ecRes.data || []);
        setNacionalidades(nRes.data || []);
        // Si employee tenía region_id, lanzamos la carga de comunas aquí (después de regiones cargadas)
        if (asInt(employee?.region_id)) {
          await loadComunas(asInt(employee.region_id));
        }
      } catch (err) {
        console.error("Error cargando catálogos:", err);
      }
    })();
    return () => { canceled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Detecta columnas reales de import_cl_comunas leyendo 1 fila
  const detectColumns = async () => {
    const { data: sample, error } = await supabase
      .from("import_cl_comunas")
      .select("*")
      .limit(1);

    if (error) {
      console.error("No se pudo leer esquema de import_cl_comunas:", error);
      return { rCol: regionCol, vCol: comunaValCol, lCol: comunaLabelCol };
    }
    const row = sample?.[0] ?? {};
    const keys = Object.keys(row);
    if (!keys.length) {
      // si no hay filas, mantenemos defaults
      return { rCol: regionCol, vCol: comunaValCol, lCol: comunaLabelCol };
    }

    // util: busca primera coincidencia por candidatos (case-insensitive)
    const pick = (candidates, fallbackRegex) => {
      for (const cand of candidates) {
        const hit = keys.find((k) => k.toLowerCase() === cand.toLowerCase());
        if (hit) return hit;
      }
      if (fallbackRegex) {
        const hit = keys.find((k) => fallbackRegex.test(k));
        if (hit) return hit;
      }
      return null;
    };

    const rCol =
      pick(["region_id", "id_region", "region", "regionid", "idregion"], /region/i) ||
      regionCol;

    const lCol =
      pick(["nombre", "comuna", "name", "glosa", "descripcion", "desc"], /(nombre|comuna|name|desc)/i) ||
      comunaLabelCol;

    const vCol =
      pick(["codigo", "id", "gid", "comuna_id", "id_comuna", "code"], /(codigo|code|id|gid)/i) ||
      lCol || comunaValCol;

    if (rCol !== regionCol) setRegionCol(rCol);
    if (lCol !== comunaLabelCol) setComunaLabelCol(lCol);
    if (vCol !== comunaValCol) setComunaValCol(vCol);

    console.log("[PersonalesForm] columnas detectadas:", { rCol, vCol, lCol });
    return { rCol, vCol, lCol };
  };

  // función para cargar comunas de una región concreta
  const loadComunas = async (regionId) => {
    if (!regionId) {
      setComunas([]);
      return [];
    }
    try {
      console.log("[PersonalesForm] cargando comunas para region_id =", regionId);
      const { rCol, vCol, lCol } = await detectColumns();

      // armamos el select dinámico asegurando incluir las columnas usadas por order/filtro
      let sel = `${vCol},${lCol},${rCol}`;

      let q = supabase
        .from("import_cl_comunas")
        .select(sel)
        // comparar como string evita 400 por tipos distintos
        .eq(rCol, String(regionId));

      // si existe columna de etiqueta, ordenamos por ella
      if (lCol) q = q.order(lCol, { ascending: true });

      const { data, error } = await q;

      if (error) {
        console.error("Error fetch comunas:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          rCol, vCol, lCol,
        });
        setComunas([]);
        return [];
      }

      setComunas(data || []);
      return data || [];
    } catch (e) {
      console.error("Excepción loadComunas:", e);
      setComunas([]);
      return [];
    }
  };

  // Cuando cambia form.region_id, carga comunas (esto maneja el cambio por UI)
  useEffect(() => {
    let canceled = false;
    (async () => {
      const regionId = asInt(form.region_id);
      if (!regionId) {
        setComunas([]);
        // limpiamos comuna si no hay región
        setForm((s) => ({ ...s, comuna_id: null }));
        return;
      }
      const data = await loadComunas(regionId);
      if (canceled) return;
      // si la comuna actual no está en la lista (p. ej. fue de otra región), la limpiamos
      if (
        form.comuna_id &&
        Array.isArray(data) &&
        data.length > 0 &&
        !data.some((c) => c[comunaValCol] === form.comuna_id)
      ) {
        setForm((s) => ({ ...s, comuna_id: null }));
      }
    })();
    return () => { canceled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.region_id]);

  const setField = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  // validación mínima
  const validate = () => {
    const e = {};
    if (!form.nombre?.trim()) e.nombre = "Obligatorio";
    if (!form.apellido?.trim()) e.apellido = "Obligatorio";
    if (!form.rut?.trim()) e.rut = "Obligatorio";
    // si hay comuna, debe haber region
    if (form.comuna_id && !form.region_id) e.region_id = "Selecciona región para esa comuna";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const payload = useMemo(() => {
    const base = {
      nombre: form.nombre?.trim() || null,
      apellido: form.apellido?.trim() || null,
      rut: form.rut?.trim() || null,
      cargo: form.cargo?.trim() || null,
      genero: form.genero || "O",
      discapacidad: !!form.discapacidad,
      activo: !!form.activo,

      fecha_nacimiento: form.fecha_nacimiento || null,
      direccion: form.direccion?.trim() || null,

      region_id: asInt(form.region_id),
      // comuna_id puede ser string (p.ej. "codigo"). Lo dejamos tal cual.
      comuna_id: form.comuna_id ?? null,

      telefono_movil: form.telefono_movil?.trim() || null,
      telefono_fijo: form.telefono_fijo?.trim() || null,
      email_personal: form.email_personal?.trim() || null,
      email_corporativo: form.email_corporativo?.trim() || null,

      estado_civil_id: asInt(form.estado_civil_id),
      nacionalidad_id: asInt(form.nacionalidad_id),

      pais_residencia: form.pais_residencia?.trim() || null,
      idioma_preferido: form.idioma_preferido?.trim() || null,
      pronombres: form.pronombres?.trim() || null,
    };
    return {
      ...base,
      nombres: base.nombre,
      apellidos: base.apellido,
    };
  }, [form]);

  const save = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("employees")
        .update(payload)
        .eq("id", employee.id)
        .select("*")
        .single();
      if (error) {
        console.error("Save error:", error);
        alert(error.message || "No se pudo guardar.");
      } else {
        onSaved?.(data);
      }
    } catch (err) {
      console.error("Excepción guardar:", err);
      alert("Error inesperado guardando.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="ef-card p20" style={{ marginTop: 12 }}>
      <h3 className="ef-block-title">Editar Información Personal</h3>

      <div className="form-grid">
        {/* Nombre / Apellido */}
        <div className="form-field">
          <label>Nombres *</label>
          <input value={form.nombre} onChange={(e) => setField("nombre", e.target.value)} />
          {errors.nombre && <div className="form-error">{errors.nombre}</div>}
        </div>
        <div className="form-field">
          <label>Apellidos *</label>
          <input value={form.apellido} onChange={(e) => setField("apellido", e.target.value)} />
          {errors.apellido && <div className="form-error">{errors.apellido}</div>}
        </div>

        {/* RUT / Cargo */}
        <div className="form-field">
          <label>RUT *</label>
          <input value={form.rut} onChange={(e) => setField("rut", e.target.value)} />
          {errors.rut && <div className="form-error">{errors.rut}</div>}
        </div>
        <div className="form-field">
          <label>Cargo</label>
          <input value={form.cargo} onChange={(e) => setField("cargo", e.target.value)} />
        </div>

        {/* Región / Comuna */}
        <div className="form-field">
          <label>Región</label>
          <select
            value={form.region_id ?? ""}
            onChange={(e) => {
              const val = asInt(e.target.value);
              setField("region_id", val);
              // reset comuna_id al cambiar de región
              setField("comuna_id", null);
            }}
          >
            <option value="">— Selecciona región —</option>
            {regiones.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombre}
              </option>
            ))}
          </select>
          {errors.region_id && <div className="form-error">{errors.region_id}</div>}
        </div>

        <div className="form-field">
          <label>Comuna</label>
          <select
            value={form.comuna_id ?? ""}
            onChange={(e) => setField("comuna_id", e.target.value)}
            disabled={!form.region_id || comunas.length === 0}
          >
            <option value="">{form.region_id ? "— Selecciona comuna —" : "Selecciona región primero"}</option>
            {comunas.map((c) => (
              <option key={c[comunaValCol]} value={c[comunaValCol]}>
                {c[comunaLabelCol] ?? String(c[comunaValCol])}
              </option>
            ))}
          </select>
        </div>

        {/* resto de campos resumidos */}
        <div className="form-field">
          <label>Teléfono móvil</label>
          <input value={form.telefono_movil} onChange={(e) => setField("telefono_movil", e.target.value)} />
        </div>
        <div className="form-field">
          <label>Teléfono fijo</label>
          <input value={form.telefono_fijo} onChange={(e) => setField("telefono_fijo", e.target.value)} />
        </div>

        <div className="form-field">
          <label>Email personal</label>
          <input type="email" value={form.email_personal} onChange={(e) => setField("email_personal", e.target.value)} />
        </div>
        <div className="form-field">
          <label>Email corporativo</label>
          <input type="email" value={form.email_corporativo} onChange={(e) => setField("email_corporativo", e.target.value)} />
        </div>

        <div className="form-field">
          <label>Nacionalidad</label>
          <select value={form.nacionalidad_id ?? ""} onChange={(e) => setField("nacionalidad_id", asInt(e.target.value))}>
            <option value="">— Selecciona nacionalidad —</option>
            {nacionalidades.map((n) => (
              <option key={n.id} value={n.id}>
                {n.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label>Estado civil</label>
          <select value={form.estado_civil_id ?? ""} onChange={(e) => setField("estado_civil_id", asInt(e.target.value))}>
            <option value="">— Selecciona estado civil —</option>
            {estadosCivil.map((ec) => (
              <option key={ec.id} value={ec.id}>
                {ec.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* fill grid */}
        <div className="form-col-2" />
      </div>

      <div className="form-actions">
        <button type="button" className="lf-btn lf-btn-ghost" onClick={onCancel} disabled={saving}>
          Cancelar
        </button>
        <button type="submit" className="lf-btn lf-btn-primary" disabled={saving}>
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </div>
    </form>
  );
}
