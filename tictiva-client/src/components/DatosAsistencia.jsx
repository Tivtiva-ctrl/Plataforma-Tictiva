import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabaseClient";
import styles from "./DatosAsistencia.module.css";
import {
  FiCheckSquare,
  FiAlertTriangle,
  FiClock,
  FiCamera,
} from "react-icons/fi";

const DEBUG = true; // 👈 ponlo en false cuando ya esté OK
const TZ_CL = "America/Santiago";

function DatosAsistencia({ rut, employeeId, companyId }) {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [viewType, setViewType] = useState("mensual"); // 'mensual' o 'semanal'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [error, setError] = useState(null);

  // ✅ Normaliza RUT base
  const normalizeRut = (r = "") =>
    String(r).replace(/\./g, "").replace(/\s/g, "").toUpperCase();

  /**
   * ✅ Variantes de RUT PARA TU BD:
   * attendance_marks.rut = "cuerpo + DV pegado" => 189012345
   * Si ficha viene 18.901.234-5 => lo convertimos a 189012345
   * También probamos sin DV (por si alguna fila antigua quedó distinta)
   */
  const rutVariants = useMemo(() => {
    if (!rut) return [];
    const digits = normalizeRut(rut)
      .replace(/-/g, "")
      .replace(/[^0-9K]/g, ""); // deja números y K

    const body = digits.length >= 9 ? digits.slice(0, -1) : digits;
    return Array.from(new Set([digits, body])).filter(Boolean);
  }, [rut]);

  // Helpers rango fechas según vista
  const getPeriodRange = (baseDate, type) => {
    const start = new Date(baseDate);
    const end = new Date(baseDate);

    if (type === "mensual") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      end.setMonth(end.getMonth() + 1);
      end.setDate(1);
      end.setHours(0, 0, 0, 0);
    } else {
      // semanal desde lunes
      const day = start.getDay(); // 0=domingo
      const diffToMonday = (day + 6) % 7;
      start.setDate(start.getDate() - diffToMonday);
      start.setHours(0, 0, 0, 0);

      end.setTime(start.getTime());
      end.setDate(end.getDate() + 7);
    }

    return { start, end };
  };

  const formatDisplayDate = () => {
    if (viewType === "mensual") {
      return currentDate.toLocaleDateString("es-ES", {
        month: "long",
        year: "numeric",
      });
    }
    const { start, end } = getPeriodRange(currentDate, "semanal");
    const startStr = start.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
    });
    const endStr = new Date(end.getTime() - 1).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
    });
    return `Semana ${startStr} – ${endStr}`;
  };

  const handlePrevPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewType === "mensual") newDate.setMonth(newDate.getMonth() - 1);
    else newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewType === "mensual") newDate.setMonth(newDate.getMonth() + 1);
    else newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  // ✅ timestamp “real” para mostrar (preferimos marked_at, si no existe usamos created_at)
  const markTs = (r) => r?.marked_at || r?.created_at || null;

  // ✅ Formato Chile (evita desfases por UTC)
  const fmtDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString("es-ES", { timeZone: TZ_CL }) : "—";

  const fmtTime = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit", // ✅ DT
      timeZone: TZ_CL,
    });
  };

  const estadoDeMarca = (r) => {
    if (r.rejection_reason) return "Rechazada";
    if (r.face_verified === true) return "Verificada";
    if (r.face_verified === false) return "No verificada";
    return "Registrada";
  };

  // ✅ Cargar marcas
  useEffect(() => {
    let isActive = true; // evita pisadas por doble render

    const fetchMarks = async () => {
      setLoading(true);
      setError(null);

      const { start, end } = getPeriodRange(currentDate, viewType);

      if (DEBUG) {
        console.log("🟦 DatosAsistencia PROPS:", { rut, employeeId, companyId });
        console.log("🟦 rutVariants:", rutVariants);
        console.log("🟦 rango:", {
          start: start.toISOString(),
          end: end.toISOString(),
        });
      }

      try {
        // ✅ Query base: traemos lo necesario
        let q = supabase
          .from("attendance_marks")
          .select(
            `
            id,
            employee_id,
            company_id,
            rut,
            mark_type,
            marked_at,
            created_at,
            source,
            ip,
            photo_url,
            face_verified,
            face_match_score,
            face_verification_note,
            pin_marcacion,
            rejection_reason,
            notes,
            device_label,
            address_text,
            lat,
            lng,
            accuracy_m,
            mark_hash
          `
          )
          // ✅ Importante: usamos OR para cubrir:
          // - registros nuevos por marked_at
          // - registros antiguos que solo tienen created_at (marked_at null)
          .or(
            `and(marked_at.gte.${start.toISOString()},marked_at.lt.${end.toISOString()}),and(marked_at.is.null,created_at.gte.${start.toISOString()},created_at.lt.${end.toISOString()})`
          )
          .order("marked_at", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false });

        // ✅ multiempresa (si viene)
        if (companyId) q = q.eq("company_id", companyId);

        // ✅ preferimos employeeId (lo ideal)
        if (employeeId) {
          q = q.eq("employee_id", employeeId);
        } else if (rut) {
          q = q.in("rut", rutVariants);
        } else {
          if (isActive) {
            setRecords([]);
            setLoading(false);
          }
          return;
        }

        const { data, error: dbError } = await q;

        if (DEBUG) {
          console.log("🟩 Supabase respuesta:", {
            rows: data?.length ?? 0,
            first: data?.[0] ?? null,
            error: dbError ?? null,
          });
        }

        if (dbError) throw dbError;

        if (isActive) setRecords(data || []);
      } catch (err) {
        console.error("🟥 Error al cargar marcas:", err);
        if (isActive) {
          setError(
            err?.message
              ? `No se pudieron cargar marcas: ${err.message}`
              : "No se pudieron cargar las marcas de asistencia."
          );
          setRecords([]);
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchMarks();
    return () => {
      isActive = false;
    };
  }, [rut, employeeId, companyId, viewType, currentDate, rutVariants]);

  // ✅ Stats MVP (Días con marcas) — correctamente por Chile, no UTC
  const uniqueDays = useMemo(() => {
    const key = (iso) =>
      new Date(iso).toLocaleDateString("sv-SE", { timeZone: TZ_CL }); // YYYY-MM-DD

    return new Set(
      records
        .map((r) => markTs(r))
        .filter(Boolean)
        .map(key)
    ).size;
  }, [records]);

  const alerts = useMemo(() => {
    return records.filter((r) => r.rejection_reason || r.face_verified === false)
      .length;
  }, [records]);

  const summaryStats = {
    asistencia: uniqueDays === 0 ? "—" : uniqueDays,
    ausencias: 0,
    atrasos: alerts,
  };

  return (
    <div className={styles.attendanceContainer}>
      {/* === HEADER === */}
      <div className={styles.header}>
        <h2>Asistencia del Empleado</h2>
        <div className={styles.controls}>
          <select
            value={viewType}
            onChange={(e) => setViewType(e.target.value)}
            className={styles.viewSelect}
          >
            <option value="mensual">Vista Mensual</option>
            <option value="semanal">Vista Semanal</option>
          </select>

          <div className={styles.datePicker}>
            <button type="button" onClick={handlePrevPeriod}>
              &lt;
            </button>
            <span>{formatDisplayDate()}</span>
            <button type="button" onClick={handleNextPeriod}>
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && <p className={styles.errorText}>{error}</p>}

      {/* === RESUMEN === */}
      <div className={styles.summaryGrid}>
        <div
          className={styles.summaryCard}
          style={{ "--color": "var(--verde-claro-tictiva)" }}
        >
          <div className={styles.cardIcon}>
            <FiCheckSquare />
          </div>
          <div className={styles.cardInfo}>
            <span className={styles.cardNumber}>{summaryStats.asistencia}</span>
            <span className={styles.cardLabel}>Días con marcas</span>
          </div>
        </div>

        <div
          className={styles.summaryCard}
          style={{ "--color": "var(--naranja-tictiva)" }}
        >
          <div className={styles.cardIcon}>
            <FiAlertTriangle />
          </div>
          <div className={styles.cardInfo}>
            <span className={styles.cardNumber}>{summaryStats.ausencias}</span>
            <span className={styles.cardLabel}>Días de Ausencia</span>
          </div>
        </div>

        <div
          className={styles.summaryCard}
          style={{ "--color": "var(--rojo-tictiva)" }}
        >
          <div className={styles.cardIcon}>
            <FiClock />
          </div>
          <div className={styles.cardInfo}>
            <span className={styles.cardNumber}>{summaryStats.atrasos}</span>
            <span className={styles.cardLabel}>Alertas (rechazo/no verif.)</span>
          </div>
        </div>
      </div>

      {/* === TABLA === */}
      <div className={styles.tableContainer}>
        <h3>Detalle de Marcas Registradas</h3>

        <table className={styles.detailsTable}>
          <thead>
            <tr>
              <th>FECHA</th>
              <th>HORA</th>
              <th>TIPO</th>
              <th>ESTADO</th>
              <th>MÉTODO</th>
              <th>IP</th>
              <th>FOTO</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7">Cargando marcas...</td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan="7">No hay marcas para este período.</td>
              </tr>
            ) : (
              records.map((rec) => {
                const tipo = rec.mark_type || "—";
                const estado = estadoDeMarca(rec);
                const isEntrada = String(tipo).toLowerCase().includes("entrada");
                const ts = markTs(rec);

                return (
                  <tr key={rec.id}>
                    <td>{fmtDate(ts)}</td>
                    <td>{fmtTime(ts)}</td>
                    <td>
                      <span
                        className={`${styles.tag} ${
                          isEntrada ? styles.tagEntrada : styles.tagSalida
                        }`}
                      >
                        {tipo}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.tag} ${
                          estado.toLowerCase().includes("rechazada")
                            ? styles.tagAtraso
                            : estado.toLowerCase().includes("verificada")
                            ? styles.tagValida
                            : styles.tagNeutra
                        }`}
                      >
                        {estado}
                      </span>
                    </td>
                    <td>{rec.source || "—"}</td>
                    <td>{rec.ip || "—"}</td>
                    <td>
                      {rec.photo_url ? (
                        <button
                          type="button"
                          className={styles.photoButton}
                          onClick={() => window.open(rec.photo_url, "_blank")}
                          title="Ver evidencia"
                        >
                          <FiCamera />
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DatosAsistencia;
