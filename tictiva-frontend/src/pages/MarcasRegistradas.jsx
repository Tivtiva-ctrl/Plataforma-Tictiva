// src/pages/MarcasRegistradas.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AsistenciaSubnav from "../components/AsistenciaSubnav";
import "./MarcasRegistradas.css";

// Empleados (los nuestros)
const EMP = [
  { id: "emp1", nombre: "Juan Díaz Morales",     rut: "12.345.678-9" },
  { id: "emp2", nombre: "María Pérez Lagos",     rut: "14.567.890-1" },
  { id: "emp3", nombre: "Carlos Rodríguez Vega", rut: "16.789.012-3" },
  { id: "emp4", nombre: "Ana González Muñoz",    rut: "18.901.234-5" },
  { id: "emp5", nombre: "Luis Soto Parra",       rut: "15.432.109-7" },
  { id: "emp6", nombre: "Raúl Aravena",          rut: "17.555.221-1" },
  { id: "emp7", nombre: "Nicole Castro",         rut: "18.456.789-1" },
  { id: "emp8", nombre: "Gabriel Reyes",         rut: "16.001.234-5" },
  { id: "emp9", nombre: "Victoria Pizarro",      rut: "17.999.111-2" },
  { id: "emp10", nombre: "Francisco Ríos",       rut: "13.222.333-4" },
];

// Puestos (para geocerca / mapa de cobertura)
const PUESTOS = [
  {
    id: "p1",
    nombre: "Kiosko Mall Arauco (Tictiva)",
    gps: { lat: -33.4925, lng: -70.7706 },
    radioM: 50,
    direccion: "Mall Arauco Maipú, Local K-10",
    region: "Región Metropolitana",
    comuna: "Maipú",
  },
  {
    id: "p2",
    nombre: "Sede Viña del Mar (Tictiva)",
    gps: { lat: -33.0246, lng: -71.5520 },
    radioM: 150,
    direccion: "Av. Marina 567",
    region: "Región de Valparaíso",
    comuna: "Viña del Mar",
  },
];

// Helpers
const fmt = (d) =>
  new Date(d).toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
const weekday = (d) =>
  new Date(d).toLocaleDateString("es-CL", { weekday: "long" });
const pad = (n) => String(n).padStart(2, "0");

// Distancia Haversine (metros)
const haversineM = (lat1, lon1, lat2, lon2) => {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

// MOCK con datos geográficos por día
function mockDailyRows(employeeId, fromISO, toISO) {
  if (!employeeId || !fromISO || !toISO) return [];
  const from = new Date(fromISO);
  const to = new Date(toISO);
  const rows = [];
  const totalDays = Math.min(
    7,
    Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1
  );

  for (let i = 0; i < totalDays; i++) {
    const d = new Date(from);
    d.setDate(from.getDate() + i);

    // simulación de estado
    const isAbsent = i % 6 === 4;
    const isPartial = !isAbsent && i % 3 === 2;
    const entrada = isAbsent
      ? "-"
      : `${pad(8)}:${pad(15 + (isPartial ? 45 : 0))}`;
    const salida = isAbsent ? "-" : isPartial ? "-" : "17:30";
    const horas = isAbsent ? "-" : isPartial ? "4h 00m" : "8h 15m";
    const comp = isAbsent ? "Ausente" : isPartial ? "Incompleta" : "Completa";
    const justif = isAbsent ? "N/A" : "-";
    const incid =
      isAbsent ? "Sin marcar" : isPartial ? "Sin marca de salida" : "Ninguna";

    // geocerca base (alternamos puestos para el ejemplo)
    const puesto = PUESTOS[i % PUESTOS.length];
    // “marca” alrededor del centro de geocerca (leve jitter determinista)
    const jitter = (i % 5 - 2) * 0.0003;
    const lat = isAbsent ? null : puesto.gps.lat + jitter;
    const lng = isAbsent ? null : puesto.gps.lng + jitter * 1.1;
    const accuracyM = isAbsent ? null : 10 + (i % 5) * 5;
    const address = puesto.direccion;
    const region = puesto.region;
    const comuna = puesto.comuna;

    rows.push({
      id: `${employeeId}_${d.toISOString().slice(0, 10)}`,
      fechaISO: d.toISOString().slice(0, 10),
      fecha: `${fmt(d)} - ${weekday(d)}`,
      turno: isAbsent ? "-" : isPartial ? "Parcial" : "Completa",
      entrada,
      salida,
      horas,
      cumplimiento: comp,
      justificacion: justif,
      incidencias: incid,

      // —— datos para el modal 📍 ——
      lat,
      lng,
      accuracyM,
      address,
      region,
      comuna,
      // info geocerca del puesto de la jornada
      puesto: {
        id: puesto.id,
        nombre: puesto.nombre,
        gps: { ...puesto.gps },
        radioM: puesto.radioM,
      },
      // técnico
      ip: `192.168.0.${10 + i}`,
      device: i % 2 ? "Android" : "iPhone",
      platform: i % 2 ? "Tictiva App Android" : "Tictiva App iOS",
      // tipo/hora de marca principal (entrada)
      tipo: "Entrada",
      hora: entrada !== "-" ? entrada : "",
    });
  }
  return rows;
}

const todayISO = () => new Date().toISOString().slice(0, 10);
const monthStartISO = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
};

export default function MarcasRegistradas() {
  const location = useLocation();
  const navigate = useNavigate();

  const [employeeId, setEmployeeId] = useState("");
  const [from, setFrom] = useState(monthStartISO());
  const [to, setTo] = useState(todayISO());
  const [forceEstado, setForceEstado] = useState(""); // Ausente/Incompleta/Retrasado

  // ----- estado modal GEO -----
  const [geoOpen, setGeoOpen] = useState(false);
  const [geoData, setGeoData] = useState(null);

  const employee = useMemo(
    () => EMP.find((e) => e.id === employeeId) || null,
    [employeeId]
  );

  // Filas base
  const baseRows = useMemo(
    () => mockDailyRows(employeeId, from, to),
    [employeeId, from, to]
  );

  // Si viene ?estado=... y el rango es un solo día, ajusta la fila para esa incidencia
  const rows = useMemo(() => {
    const singleDay = from && to && from === to;
    if (!singleDay || !forceEstado || baseRows.length === 0) return baseRows;

    const out = [...baseRows];
    const r = { ...out[0] };

    if (forceEstado.toLowerCase() === "ausente") {
      r.turno = "-";
      r.entrada = "-";
      r.salida = "-";
      r.horas = "-";
      r.cumplimiento = "Ausente";
      r.justificacion = "N/A";
      r.incidencias = "Sin marcar";
      r.lat = r.lng = r.accuracyM = null;
    } else if (forceEstado.toLowerCase() === "incompleta") {
      r.turno = "Parcial";
      r.entrada = "09:00";
      r.salida = "-";
      r.horas = "4h 00m";
      r.cumplimiento = "Incompleta";
      r.justificacion = "-";
      r.incidencias = "Sin marca de salida";
    } else if (forceEstado.toLowerCase() === "retrasado") {
      r.turno = r.turno === "-" ? "Completa" : r.turno || "Completa";
      r.entrada = "09:20";
      r.cumplimiento = "Completa";
      r.incidencias = "Retraso";
    }
    out[0] = r;
    return out;
  }, [baseRows, from, to, forceEstado]);

  // Mapear rut/nombre -> id
  const findIdByRutOrName = (rutOrName) => {
    if (!rutOrName) return "";
    const byRut = EMP.find((e) => e.rut === rutOrName);
    if (byRut) return byRut.id;
    const low = rutOrName.toLowerCase();
    const byName = EMP.find((e) => e.nombre.toLowerCase().includes(low));
    return byName ? byName.id : "";
  };

  // Leer query inicial
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const qRut = (q.get("empleado_rut") || "").trim();
    const qNom = (q.get("empleado_nombre") || "").trim();
    const qFrom = (q.get("from") || "").trim();
    const qTo = (q.get("to") || "").trim();
    const qEstado = (q.get("estado") || q.get("incidencia") || "").trim();

    if (qFrom) setFrom(qFrom);
    if (qTo) setTo(qTo);
    if (qEstado) setForceEstado(qEstado);

    if (qRut || qNom) {
      const id = findIdByRutOrName(qRut || qNom);
      if (id) setEmployeeId(id);
    }

    if (q.get("auto") === "1") {
      setTimeout(() => {
        const el = document.getElementById("detalle-diario");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Resumen
  const resumen = useMemo(() => {
    const dias = rows.length;
    const completas = rows.filter((r) => r.cumplimiento === "Completa").length;
    const parciales = rows.filter((r) => r.cumplimiento === "Incompleta").length;
    const ausencias = rows.filter((r) => r.cumplimiento === "Ausente").length;
    return { dias, completas, parciales, ausencias };
  }, [rows]);

  const disabledExport = !employee || rows.length === 0;

  // Sincronizar URL al cambiar filtros manualmente
  const syncURL = (patch) => {
    const q = new URLSearchParams(location.search);
    const base = {
      empleado_rut: employee?.rut || "",
      empleado_nombre: employee?.nombre || "",
      from,
      to,
      estado: forceEstado || "",
    };
    const next = { ...base, ...patch, auto: "" };
    Object.entries(next).forEach(([k, v]) => {
      if (!v) q.delete(k);
      else q.set(k, v);
    });
    navigate({ search: `?${q.toString()}` }, { replace: true });
  };

  const onChangeEmployee = (id) => {
    setEmployeeId(id);
    const picked = EMP.find((e) => e.id === id) || null;
    syncURL({
      empleado_rut: picked?.rut || "",
      empleado_nombre: picked?.nombre || "",
    });
  };

  const onChangeFrom = (v) => {
    setFrom(v);
    syncURL({ from: v });
  };
  const onChangeTo = (v) => {
    setTo(v);
    syncURL({ to: v });
  };

  // --- abrir modal geográfico desde fila
  const openGeo = (row) => {
    if (!row) return;
    const lat = row.lat ?? row.gps?.lat ?? row.coordLat ?? null;
    const lng = row.lng ?? row.gps?.lng ?? row.coordLng ?? null;

    const centroLat = row.puesto?.gps?.lat ?? row.centroLat ?? null;
    const centroLng = row.puesto?.gps?.lng ?? row.centroLng ?? null;
    const radioM = row.puesto?.radioM ?? row.radioM ?? null;

    let distanciaM = null,
      dentro = null;
    if ([lat, lng, centroLat, centroLng].every((v) => typeof v === "number")) {
      distanciaM = Math.round(haversineM(lat, lng, centroLat, centroLng));
      dentro = typeof radioM === "number" ? distanciaM <= radioM : null;
    }

    setGeoData({
      fecha: row.fechaISO || row.fecha?.slice(0, 10) || "",
      hora: row.hora || row.entrada || "",
      tipo: row.tipo || "Entrada",
      lat,
      lng,
      accuracyM: row.accuracyM ?? null,
      address: row.address ?? row.direccion ?? "",
      region: row.region ?? "",
      comuna: row.comuna ?? "",
      centroLat,
      centroLng,
      radioM,
      distanciaM,
      dentro,
      ip: row.ip || "",
      device: row.device || "",
      plataforma: row.platform || row.plataforma || "",
      puestoNombre: row.puesto?.nombre || "",
    });
    setGeoOpen(true);
  };
  const closeGeo = () => {
    setGeoOpen(false);
    setGeoData(null);
  };

  return (
    <div className="mr-wrap">
      <AsistenciaSubnav />

      <header className="mr-header">
        <h1 className="mr-title">Historial Detallado de Marcas</h1>
        <p className="mr-sub">
          Selecciona un colaborador y un rango de fechas para ver su historial
          de asistencia.
        </p>
      </header>

      {/* Filtros */}
      <section className="mr-card mr-filters">
        <div className="mr-field">
          <label className="mr-label">Colaborador</label>
          <select
            className="mr-input"
            value={employeeId}
            onChange={(e) => onChangeEmployee(e.target.value)}
          >
            <option value="">Seleccionar colaborador...</option>
            {EMP.map((e) => (
              <option key={e.id} value={e.id}>
                {e.nombre} ({e.rut})
              </option>
            ))}
          </select>
        </div>
        <div className="mr-field">
          <label className="mr-label">Fecha Desde</label>
          <input
            type="date"
            className="mr-input"
            value={from}
            onChange={(e) => onChangeFrom(e.target.value)}
          />
        </div>
        <div className="mr-field">
          <label className="mr-label">Fecha Hasta</label>
          <input
            type="date"
            className="mr-input"
            value={to}
            onChange={(e) => onChangeTo(e.target.value)}
          />
        </div>
      </section>

      {/* Estado inicial */}
      {!employee && (
        <section className="mr-card mr-emptybox">
          <div className="mr-empty-icon">👤</div>
          <div className="mr-empty-title">Selecciona un Colaborador</div>
          <div className="mr-empty-sub">
            Por favor, elige un colaborador de la lista para ver su historial
            de asistencia.
          </div>
        </section>
      )}

      {/* Estado sin datos */}
      {employee && rows.length === 0 && (
        <section className="mr-card mr-emptybox">
          <div className="mr-empty-icon">📂</div>
          <div className="mr-empty-title">
            No se encontraron registros en el rango seleccionado
          </div>
          <div className="mr-empty-sub">
            Cambia las fechas o selecciona otro colaborador.
          </div>
        </section>
      )}

      {/* Estado con datos */}
      {employee && rows.length > 0 && (
        <>
          {/* Resumen */}
          <section className="mr-cards">
            <SummaryCard color="blue" value={resumen.dias} label="Días con Marcas" />
            <SummaryCard color="green" value={resumen.completas} label="Asistencias Completas" />
            <SummaryCard color="amber" value={resumen.parciales} label="Asistencias Parciales" />
            <SummaryCard color="red" value={resumen.ausencias} label="Ausencias" />
          </section>

          {/* Detalle Diario */}
          <section id="detalle-diario" className="mr-card">
            <div className="mr-table-head">
              <div className="mr-table-title">Detalle Diario</div>
              <button
                className="mr-btn mr-btn--primary"
                disabled={disabledExport}
                onClick={() => alert("Export (stub)")}
              >
                ⬇ Exportar (PDF/Excel)
              </button>
            </div>

            <div className="mr-table-wrap">
              <table className="mr-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Turno</th>
                    <th>Entrada</th>
                    <th>Salida</th>
                    <th>Hrs. Trabajadas</th>
                    <th>Cumplimiento</th>
                    <th>Justificación</th>
                    <th>Incidencias</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.fecha}</td>
                      <td>{r.turno}</td>
                      <td>{r.entrada}</td>
                      <td>{r.salida}</td>
                      <td>{r.horas}</td>
                      <td>
                        <span
                          className={
                            r.cumplimiento === "Completa"
                              ? "mr-badge mr-badge--ok"
                              : r.cumplimiento === "Incompleta"
                              ? "mr-badge mr-badge--warn"
                              : "mr-badge mr-badge--danger"
                          }
                        >
                          {r.cumplimiento}
                        </span>
                      </td>
                      <td>{r.justificacion}</td>
                      <td>{r.incidencias}</td>
                      <td className="mr-actions">
                        <button
                          className="mr-iconbtn"
                          title="Ubicación"
                          onClick={() => openGeo(r)}
                        >
                          📍
                        </button>
                        <button className="mr-iconbtn" title="Fotos/Soportes">
                          📷
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* Modal GEO (push-up) */}
      {geoOpen && geoData && (
        <div className="pushup-overlay" onClick={closeGeo}>
          <div
            className="pushup-modal mr-geo-modal"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <h2 style={{ margin: 0 }}>Detalle de Ubicación de la Marca</h2>
              <button
                className="mr-btn mr-btn--ghost mr-btn--sm"
                onClick={closeGeo}
              >
                Cerrar
              </button>
            </div>

            {/* Básico */}
            <div className="grid" style={{ marginTop: 8 }}>
              <div className="grid-col">
                <div className="mr-label">Fecha</div>
                <div>{geoData.fecha || "—"}</div>
              </div>
              <div className="grid-col">
                <div className="mr-label">Hora</div>
                <div>{geoData.hora || "—"}</div>
              </div>
              <div className="grid-col">
                <div className="mr-label">Tipo</div>
                <div>{geoData.tipo || "—"}</div>
              </div>
            </div>

            {/* Ubicación */}
            <div className="mr-card" style={{ marginTop: 10 }}>
              <div className="mr-table-head">
                <div className="mr-table-title">📍 Ubicación Capturada</div>
                {typeof geoData.lat === "number" &&
                  typeof geoData.lng === "number" && (
                    <a
                      className="mr-btn mr-btn--primary mr-btn--sm"
                      target="_blank"
                      rel="noreferrer"
                      href={`https://maps.google.com/?q=${geoData.lat},${geoData.lng}`}
                    >
                      Abrir en Google Maps
                    </a>
                  )}
              </div>
              <div className="grid">
                <div className="grid-col">
                  <div className="mr-label">Coordenadas</div>
                  <div>
                    {typeof geoData.lat === "number" &&
                    typeof geoData.lng === "number"
                      ? `${geoData.lat.toFixed(6)}, ${geoData.lng.toFixed(6)}`
                      : "—"}
                    {typeof geoData.lat === "number" &&
                      typeof geoData.lng === "number" && (
                        <button
                          className="mr-btn mr-btn--primary mr-btn--sm"
                          style={{ marginLeft: 8 }}
                          onClick={() =>
                            navigator.clipboard?.writeText(
                              `${geoData.lat}, ${geoData.lng}`
                            )
                          }
                        >
                          Copiar
                        </button>
                      )}
                  </div>
                </div>
                <div className="grid-col">
                  <div className="mr-label">Precisión GPS</div>
                  <div>{geoData.accuracyM ? `${geoData.accuracyM} m` : "—"}</div>
                </div>
                <div className="grid-col">
                  <div className="mr-label">Dirección</div>
                  <div>
                    {geoData.address || "—"}
                    {geoData.address && (
                      <button
                        className="mr-btn mr-btn--primary mr-btn--sm"
                        style={{ marginLeft: 8 }}
                        onClick={() =>
                          navigator.clipboard?.writeText(geoData.address)
                        }
                      >
                        Copiar
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid">
                <div className="grid-col">
                  <div className="mr-label">Región</div>
                  <div>{geoData.region || "—"}</div>
                </div>
                <div className="grid-col">
                  <div className="mr-label">Comuna</div>
                  <div>{geoData.comuna || "—"}</div>
                </div>
                <div className="grid-col">
                  <div className="mr-label">Puesto</div>
                  <div>{geoData.puestoNombre || "—"}</div>
                </div>
              </div>
            </div>

            {/* Geocerca */}
            <div className="mr-card" style={{ marginTop: 10 }}>
              <div className="mr-table-title">🛡️ Geocerca de Puesto</div>
              <div className="grid">
                <div className="grid-col">
                  <div className="mr-label">Centro</div>
                  <div>
                    {typeof geoData.centroLat === "number" &&
                    typeof geoData.centroLng === "number"
                      ? `${geoData.centroLat.toFixed(
                          6
                        )}, ${geoData.centroLng.toFixed(6)}`
                      : "—"}
                  </div>
                </div>
                <div className="grid-col">
                  <div className="mr-label">Radio</div>
                  <div>{geoData.radioM ? `${geoData.radioM} m` : "—"}</div>
                </div>
                <div className="grid-col">
                  <div className="mr-label">Distancia</div>
                  <div>
                    {typeof geoData.distanciaM === "number"
                      ? `${geoData.distanciaM} m`
                      : "—"}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 6 }}>
                <span
                  className={`mr-badge ${
                    geoData.dentro === null
                      ? ""
                      : geoData.dentro
                      ? "mr-badge--ok"
                      : "mr-badge--danger"
                  }`}
                >
                  {geoData.dentro === null
                    ? "Sin cálculo"
                    : geoData.dentro
                    ? "Dentro de geocerca"
                    : "Fuera de geocerca"}
                </span>
              </div>
            </div>

            {/* Técnico / DT */}
            <div className="mr-card" style={{ marginTop: 10 }}>
              <div className="mr-table-title">🧾 Datos Técnicos (DT)</div>
              <div className="grid">
                <div className="grid-col">
                  <div className="mr-label">IP</div>
                  <div>{geoData.ip || "—"}</div>
                </div>
                <div className="grid-col">
                  <div className="mr-label">Dispositivo</div>
                  <div>{geoData.device || "—"}</div>
                </div>
                <div className="grid-col">
                  <div className="mr-label">Plataforma</div>
                  <div>{geoData.plataforma || "—"}</div>
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <button
                  className="mr-btn mr-btn--primary mr-btn--sm"
                  onClick={() => {
                    const txt = `Fecha: ${geoData.fecha}
Hora: ${geoData.hora}
Tipo: ${geoData.tipo}
Coords: ${geoData.lat}, ${geoData.lng}
Dirección: ${geoData.address}
Región: ${geoData.region}
Comuna: ${geoData.comuna}
Precisión: ${geoData.accuracyM ?? "—"} m
Centro geocerca: ${geoData.centroLat}, ${geoData.centroLng}
Radio: ${geoData.radioM ?? "—"} m
Distancia: ${geoData.distanciaM ?? "—"} m
Estado geocerca: ${
                      geoData.dentro === null
                        ? "N/A"
                        : geoData.dentro
                        ? "Dentro"
                        : "Fuera"
                    }
IP: ${geoData.ip}
Dispositivo: ${geoData.device}
Plataforma: ${geoData.plataforma}`;
                    navigator.clipboard?.writeText(txt);
                  }}
                >
                  Copiar resumen DT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ color, value, label }) {
  return (
    <div className={`mr-sumcard mr-sumcard--${color}`}>
      <div className="mr-sum-value">{value}</div>
      <div className="mr-sum-label">{label}</div>
    </div>
  );
}
