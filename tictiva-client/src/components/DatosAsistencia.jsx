import React, { useMemo, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import styles from "./DatosAsistencia.module.css";
import {
  FiCheckSquare,
  FiAlertTriangle,
  FiClock,
  FiCamera,
  FiMoreHorizontal,
  FiX,
  FiDownload,
  FiEye,
  FiMapPin,
  FiCpu,
  FiHash,
} from "react-icons/fi";
import jsPDF from "jspdf";

function DatosAsistencia({ rut, companyId, employeeName }) {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]); // attendance_marks
  const [viewType, setViewType] = useState("mensual"); // 'mensual' o 'semanal'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [error, setError] = useState(null);

  // UI: menú 3 puntitos + push-up
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selected, setSelected] = useState(null); // marca seleccionada para push-up

  // ✅ Normaliza RUT para que calce entre app y web (sin puntos / espacios)
  // OJO: si en tu tabla rut viene con DV y guion, NO lo quites. Ajusta si es necesario.
  const normalizeRut = (r = "") =>
    String(r).replace(/\./g, "").replace(/\s/g, "").toUpperCase();

  // Helpers de rango de fechas según vista
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
      // semanal: desde lunes de esa semana
      const day = start.getDay(); // 0 domingo
      const diffToMonday = (day + 6) % 7;
      start.setDate(start.getDate() - diffToMonday);
      start.setHours(0, 0, 0, 0);

      end.setTime(start.getTime());
      end.setDate(end.getDate() + 7);
    }

    return { start, end };
  };

  // Texto del selector de fecha
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

  // Navegación de período
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

  const fmtDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleDateString("es-ES");
  };

  const fmtTime = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    // ✅ con segundos (DT)
    return d.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const safe = (v) => (v === null || v === undefined || v === "" ? "—" : String(v));

  const derivedEstado = (rec) => {
    // Estado operacional (porque no tienes columna status)
    if (rec.rejection_reason) return `Rechazada: ${rec.rejection_reason}`;
    if (rec.face_verified === true) return "Identidad verificada";
    if (rec.face_verified === false) return "Identidad no verificada";
    return "Registrada";
  };

  const derivedMetodo = (rec) => {
    // `source` es el método/origen (app, kiosk, manual, etc.)
    // Si además usas PIN, lo mostramos como parte del método
    const base = safe(rec.source);
    const hasPin = rec.pin_marcacion ? " + PIN" : "";
    return `${base}${hasPin}`;
  };

  // ✅ Cargar MARCAS desde Supabase
  useEffect(() => {
    const fetchMarks = async () => {
      if (!rut) {
        setRecords([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { start, end } = getPeriodRange(currentDate, viewType);
        const rutNorm = normalizeRut(rut);

        // ✅ Columnas reales de attendance_marks
        let q = supabase
          .from("attendance_marks")
          .select(
            `
            id,
            rut,
            mark_type,
            marked_at,
            device_id,
            device_label,
            source,
            photo_url,
            created_at,
            face_verified,
            face_match_score,
            face_verification_note,
            pin_marcacion,
            company_id,
            lat,
            lng,
            accuracy_m,
            address_text,
            timezone,
            ip,
            user_agent,
            app_version,
            is_offline,
            synced_at,
            rejection_reason,
            notes,
            mark_hash
          `
          )
          .eq("rut", rutNorm)
          // ✅ para asistencia: filtrar por momento real de marcación
          .gte("marked_at", start.toISOString())
          .lt("marked_at", end.toISOString())
          .order("marked_at", { ascending: false });

        // ✅ Multiempresa: filtrar por company_id si lo tienes en ficha
        // (Recomendado para no mezclar si el mismo rut existe en otra empresa)
        if (companyId) q = q.eq("company_id", companyId);

        const { data, error: dbError } = await q;

        if (dbError) throw dbError;

        setRecords(data || []);
      } catch (err) {
        console.error("Error al cargar marcas:", err?.message || err);
        setError("No se pudieron cargar las marcas de asistencia.");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, [rut, companyId, viewType, currentDate]);

  // ✅ Stats (MVP)
  // Días con al menos 1 marca (unique days por marked_at)
  const uniqueDays = useMemo(() => {
    return new Set(
      records.map((r) => (r.marked_at ? new Date(r.marked_at).toISOString().substring(0, 10) : ""))
    ).size;
  }, [records]);

  // Llegadas tarde: por ahora no hay cálculo real de horario pactado.
  // Si quieres, marcamos "alerta" si hay rejection_reason o face_verified=false.
  const alerts = useMemo(() => {
    return records.filter((r) => r.rejection_reason || r.face_verified === false).length;
  }, [records]);

  const summaryStats = {
    asistencia: uniqueDays === 0 ? "—" : uniqueDays,
    ausencias: 0, // fase 2: con turnos/horarios + permisos/licencias
    atrasos: alerts, // MVP: “alertas” (rechazos/no verificado)
  };

  const toggleMenu = (id) => setOpenMenuId((prev) => (prev === id ? null : id));
  const openSheet = (rec) => {
    setOpenMenuId(null);
    setSelected(rec);
  };
  const closeSheet = () => setSelected(null);

  const downloadComprobantePDF = (rec) => {
    // ✅ PDF on-demand (sin guardar en Storage)
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const x = 48;
    let y = 56;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("Comprobante de Marcación – Tictiva", x, y);

    y += 18;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Generado on-demand (no se almacena en el sistema).", x, y);

    y += 18;
    doc.setDrawColor(220);
    doc.line(x, y, 560, y);
    y += 18;

    const rows = [
      ["Trabajador", employeeName || "—"],
      ["RUT", safe(rec.rut)],
      ["Company ID", safe(rec.company_id)],
      ["ID Marca", safe(rec.id)],
      ["Hash", safe(rec.mark_hash)],
      ["Fecha", fmtDate(rec.marked_at)],
      ["Hora (hh:mm:ss)", fmtTime(rec.marked_at)],
      ["Tipo", safe(rec.mark_type)],
      ["Método/Origen", derivedMetodo(rec)],
      ["Estado", derivedEstado(rec)],
      ["Dispositivo", safe(rec.device_label)],
      ["Device ID", safe(rec.device_id)],
      ["Ubicación", safe(rec.address_text)],
      ["Lat/Lng", `${safe(rec.lat)} / ${safe(rec.lng)}`],
      ["Accuracy (m)", safe(rec.accuracy_m)],
      ["Timezone", safe(rec.timezone)],
      ["IP", safe(rec.ip)],
      ["App version", safe(rec.app_version)],
      ["Offline", rec.is_offline ? "Sí" : "No"],
      ["Synced at", rec.synced_at ? new Date(rec.synced_at).toISOString() : "—"],
      ["Face verified", rec.face_verified === true ? "Sí" : rec.face_verified === false ? "No" : "—"],
      ["Face score", safe(rec.face_match_score)],
      ["Face note", safe(rec.face_verification_note)],
      ["Notas", safe(rec.notes)],
    ];

    doc.setFontSize(10);
    rows.forEach(([k, v]) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${k}:`, x, y);
      doc.setFont("helvetica", "normal");
      doc.text(String(v), x + 140, y);
      y += 14;
      if (y > 760) {
        doc.addPage();
        y = 56;
      }
    });

    const fileName = `comprobante_${safe(rec.rut)}_${safe(rec.mark_type)}_${fmtDate(rec.marked_at).replaceAll("/", "-")}_${fmtTime(rec.marked_at).replaceAll(":", "")}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className={styles.attendanceContainer}>
      {/* === 1. HEADER === */}
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
            <button type="button" onClick={handlePrevPeriod}>&lt;</button>
            <span>{formatDisplayDate()}</span>
            <button type="button" onClick={handleNextPeriod}>&gt;</button>
          </div>
        </div>
      </div>

      {/* === 2. RESUMEN === */}
      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard} style={{ "--color": "var(--verde-claro-tictiva)" }}>
          <div className={styles.cardIcon}><FiCheckSquare /></div>
          <div className={styles.cardInfo}>
            <span className={styles.cardNumber}>{summaryStats.asistencia}</span>
            <span className={styles.cardLabel}>Días con marcas</span>
          </div>
        </div>

        <div className={styles.summaryCard} style={{ "--color": "var(--naranja-tictiva)" }}>
          <div className={styles.cardIcon}><FiAlertTriangle /></div>
          <div className={styles.cardInfo}>
            <span className={styles.cardNumber}>{summaryStats.ausencias}</span>
            <span className={styles.cardLabel}>Días de Ausencia</span>
          </div>
        </div>

        <div className={styles.summaryCard} style={{ "--color": "var(--rojo-tictiva)" }}>
          <div className={styles.cardIcon}><FiClock /></div>
          <div className={styles.cardInfo}>
            <span className={styles.cardNumber}>{summaryStats.atrasos}</span>
            <span className={styles.cardLabel}>Alertas (rechazo/no verif.)</span>
          </div>
        </div>
      </div>

      {error && <p className={styles.errorText}>{error}</p>}

      {/* === 3. TABLA === */}
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
              <th></th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan="8">Cargando marcas...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan="8">No hay marcas para este período.</td></tr>
            ) : (
              records.map((rec) => {
                const tipo = rec.mark_type || "—";
                const estado = derivedEstado(rec);
                const metodo = derivedMetodo(rec);
                const isEntrada = String(tipo).toLowerCase().includes("entrada");

                return (
                  <tr key={rec.id}>
                    <td>{fmtDate(rec.marked_at)}</td>
                    <td>{fmtTime(rec.marked_at)}</td>

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
                        title={estado}
                      >
                        {estado}
                      </span>
                    </td>

                    <td>{metodo}</td>
                    <td>{safe(rec.ip)}</td>

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

                    {/* 3 puntitos */}
                    <td style={{ position: "relative" }}>
                      <button
                        type="button"
                        className={styles.moreButton}
                        onClick={() => toggleMenu(rec.id)}
                        title="Más opciones"
                      >
                        <FiMoreHorizontal />
                      </button>

                      {openMenuId === rec.id && (
                        <div className={styles.moreMenu}>
                          <button type="button" onClick={() => openSheet(rec)}>
                            <FiEye /> Ver más info
                          </button>
                          <button type="button" onClick={() => downloadComprobantePDF(rec)}>
                            <FiDownload /> Descargar comprobante (PDF)
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* === PUSH-UP (BOTTOM SHEET) === */}
      {selected && (
        <>
          <div className={styles.sheetBackdrop} onClick={closeSheet} />
          <div className={styles.sheet}>
            <div className={styles.sheetHeader}>
              <div>
                <h4 className={styles.sheetTitle}>Detalle de Marcación</h4>
                <p className={styles.sheetSubtitle}>
                  {fmtDate(selected.marked_at)} • {fmtTime(selected.marked_at)} • {safe(selected.mark_type)}
                </p>
              </div>

              <button className={styles.sheetClose} onClick={closeSheet} title="Cerrar">
                <FiX />
              </button>
            </div>

            <div className={styles.sheetGrid}>
              <div className={styles.sheetCard}>
                <div className={styles.sheetCardTitle}><FiClock /> Marca</div>
                <div className={styles.sheetRow}><span>Tipo</span><b>{safe(selected.mark_type)}</b></div>
                <div className={styles.sheetRow}><span>Fecha</span><b>{fmtDate(selected.marked_at)}</b></div>
                <div className={styles.sheetRow}><span>Hora</span><b>{fmtTime(selected.marked_at)}</b></div>
                <div className={styles.sheetRow}><span>Método</span><b>{derivedMetodo(selected)}</b></div>
                <div className={styles.sheetRow}><span>Estado</span><b>{derivedEstado(selected)}</b></div>
              </div>

              <div className={styles.sheetCard}>
                <div className={styles.sheetCardTitle}><FiCpu /> Dispositivo</div>
                <div className={styles.sheetRow}><span>Etiqueta</span><b>{safe(selected.device_label)}</b></div>
                <div className={styles.sheetRow}><span>Device ID</span><b>{safe(selected.device_id)}</b></div>
                <div className={styles.sheetRow}><span>Origen (source)</span><b>{safe(selected.source)}</b></div>
                <div className={styles.sheetRow}><span>App version</span><b>{safe(selected.app_version)}</b></div>
              </div>

              <div className={styles.sheetCard}>
                <div className={styles.sheetCardTitle}><FiMapPin /> Ubicación</div>
                <div className={styles.sheetRow}><span>Dirección</span><b>{safe(selected.address_text)}</b></div>
                <div className={styles.sheetRow}><span>Lat/Lng</span><b>{safe(selected.lat)} / {safe(selected.lng)}</b></div>
                <div className={styles.sheetRow}><span>Accuracy (m)</span><b>{safe(selected.accuracy_m)}</b></div>
                <div className={styles.sheetRow}><span>Zona horaria</span><b>{safe(selected.timezone)}</b></div>
              </div>

              <div className={styles.sheetCard}>
                <div className={styles.sheetCardTitle}><FiHash /> Integridad / Auditoría</div>
                <div className={styles.sheetRow}><span>ID</span><b>{safe(selected.id)}</b></div>
                <div className={styles.sheetRow}><span>Hash</span><b className={styles.mono}>{safe(selected.mark_hash)}</b></div>
                <div className={styles.sheetRow}><span>Creado</span><b>{safe(selected.created_at)}</b></div>
                <div className={styles.sheetRow}><span>IP</span><b>{safe(selected.ip)}</b></div>
                <div className={styles.sheetRow}><span>User agent</span><b title={safe(selected.user_agent)}>{safe(selected.user_agent)}</b></div>
              </div>
            </div>

            <div className={styles.sheetActions}>
              {selected.photo_url && (
                <button
                  type="button"
                  className={styles.sheetBtn}
                  onClick={() => window.open(selected.photo_url, "_blank")}
                >
                  <FiCamera /> Ver evidencia
                </button>
              )}
              <button
                type="button"
                className={styles.sheetBtnPrimary}
                onClick={() => downloadComprobantePDF(selected)}
              >
                <FiDownload /> Descargar comprobante (PDF)
              </button>
            </div>

            {(selected.notes || selected.rejection_reason || selected.face_verification_note) && (
              <div className={styles.sheetNotes}>
                <div className={styles.sheetNotesTitle}><FiEye /> Observaciones</div>
                {selected.rejection_reason && (
                  <p><b>Rechazo:</b> {safe(selected.rejection_reason)}</p>
                )}
                {selected.face_verification_note && (
                  <p><b>Nota verificación facial:</b> {safe(selected.face_verification_note)}</p>
                )}
                {selected.notes && (
                  <p><b>Notas:</b> {safe(selected.notes)}</p>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default DatosAsistencia;
