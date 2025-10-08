// Vista de lectura (siempre visible en la pestaña "Personales")
import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Row({ label, value }) {
  return (
    <div className="ef-row">
      <div className="ef-row-label">{label}</div>
      <div className="ef-row-value">{value ?? "—"}</div>
    </div>
  );
}

export default function Personales({ emp }) {
  const [regionNombre, setRegionNombre] = useState("");
  const [comunaNombre, setComunaNombre] = useState("");
  const [estadoCivilNombre, setEstadoCivilNombre] = useState("");
  const [nacionalidadNombre, setNacionalidadNombre] = useState("");

  useEffect(() => {
    let cancel = false;
    (async () => {
      if (emp?.region_id) {
        const { data } = await supabase.from("cl_regiones").select("nombre").eq("id", emp.region_id).single();
        if (!cancel) setRegionNombre(data?.nombre || "");
      } else setRegionNombre("");

      if (emp?.comuna_id) {
        const { data } = await supabase.from("cl_comunas").select("nombre").eq("id", emp.comuna_id).single();
        if (!cancel) setComunaNombre(data?.nombre || "");
      } else setComunaNombre("");

      if (emp?.estado_civil_id) {
        const { data } = await supabase.from("catalog_estado_civil").select("nombre").eq("id", emp.estado_civil_id).single();
        if (!cancel) setEstadoCivilNombre(data?.nombre || "");
      } else setEstadoCivilNombre("");

      if (emp?.nacionalidad_id) {
        const { data } = await supabase.from("catalog_nacionalidades").select("nombre").eq("id", emp.nacionalidad_id).single();
        if (!cancel) setNacionalidadNombre(data?.nombre || "");
      } else setNacionalidadNombre("");
    })();
    return () => { cancel = true; };
  }, [emp?.region_id, emp?.comuna_id, emp?.estado_civil_id, emp?.nacionalidad_id]);

  const nombreCompleto = `${emp?.nombre ?? emp?.nombres ?? ""} ${emp?.apellido ?? emp?.apellidos ?? ""}`.trim();

  return (
    <div className="ef-card p20">
      <h3 className="ef-block-title">Información Personal</h3>
      <Row label="Nombre Completo:" value={nombreCompleto || "—"} />
      <Row label="RUT:" value={emp?.rut} />
      <Row label="Cargo:" value={emp?.cargo} />
      <Row label="Género:" value={emp?.genero} />
      <Row label="Discapacidad:" value={emp?.discapacidad ? "Sí" : "No"} />
      <Row label="Estado:" value={emp?.activo ? "ACTIVO" : "INACTIVO"} />
      <Row label="Región:" value={regionNombre || (emp?.region_id ?? "—")} />
      <Row label="Comuna:" value={comunaNombre || (emp?.comuna_id ?? "—")} />
      <Row label="Estado civil:" value={estadoCivilNombre} />
      <Row label="Nacionalidad:" value={nacionalidadNombre} />
      <Row label="Dirección:" value={emp?.direccion} />
      <Row label="Teléfono móvil:" value={emp?.telefono_movil} />
      <Row label="Email personal:" value={emp?.email_personal} />
      <Row label="Email corporativo:" value={emp?.email_corporativo} />
    </div>
  );
}
