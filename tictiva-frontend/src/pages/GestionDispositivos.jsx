// src/pages/GestionDispositivos.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import AsistenciaSubnav from "../components/AsistenciaSubnav";
import "./GestionDispositivos.css";

/* ===================== Config ===================== */
const TTL_SECONDS = 10 * 60; // 10 minutos
const ENROLL_BASE_URL = "https://api.tictiva.com/enroll"; // ← ajusta a tu backend real

/* ===================== Utils ===================== */
const rndToken = (len = 24) => {
  const abc = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += abc[Math.floor(Math.random() * abc.length)];
  return s;
};
const nowMinusMinutes = (m = 0) => {
  const d = new Date();
  d.setTime(d.getTime() - m * 60 * 1000);
  return d.toISOString();
};
const fmtFull = (iso) =>
  iso
    ? new Date(iso).toLocaleString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "—";
const relTime = (iso) => {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "Hace 0 min";
  if (min < 60) return `Hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `Hace ${h} h`;
  return `Hace ${Math.round(h / 24)} d`;
};
const mmss = (s) => {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
};
const buildEnrollURL = (tok) =>
  `${ENROLL_BASE_URL}?token=${encodeURIComponent(tok)}&v=${Date.now()}`;

/* ===================== DEMO data ===================== */
const DEVICES_SEED = [
  {
    id: "DEV-001",
    nombre: "iPad Pro - Recepción",
    tipo: "tablet",
    instalacion: "Oficina Central",
    estado: "Activo",
    checkinISO: nowMinusMinutes(2),
    modelo: 'iPad Pro 12.9" (2022)',
    so: "iPadOS 17.1.2",
    app: "Tictiva v2.3.1",
    hardwareId: "A1B2C3•••••••90XZ",
    empresa: "TechCorp Solutions SpA",
    enroladoPor: "Nicolás Torres (Admin)",
    enroladoISO: nowMinusMinutes(60 * 24 * 7),
    historial: [
      {
        id: "h1",
        fechaISO: nowMinusMinutes(2),
        usuario: "Sistema",
        accion: "CHECK-IN",
        detalle: "Dispositivo reportó estado activo",
      },
      {
        id: "h0",
        fechaISO: nowMinusMinutes(60 * 24 * 7),
        usuario: "Nicolás Torres",
        accion: "ENROLAMIENTO",
        detalle: "Dispositivo enrolado con token JWT",
      },
    ],
  },
  {
    id: "DEV-002",
    nombre: "Samsung Tab - Sala 1",
    tipo: "tablet",
    instalacion: "Sucursal Norte",
    estado: "Bloqueado",
    checkinISO: nowMinusMinutes(60),
    modelo: "Galaxy Tab A",
    so: "Android 13",
    app: "Tictiva v2.2.0",
    hardwareId: "Z9X8C7•••••••11AA",
    empresa: "TechCorp Solutions SpA",
    enroladoPor: "Soporte (Admin)",
    enroladoISO: nowMinusMinutes(60 * 24 * 20),
    historial: [
      {
        id: "h2",
        fechaISO: nowMinusMinutes(60),
        usuario: "Sistema",
        accion: "CHECK-IN",
        detalle: "Dispositivo en estado bloqueado",
      },
      {
        id: "h1",
        fechaISO: nowMinusMinutes(60 * 24 * 20),
        usuario: "Soporte",
        accion: "ENROLAMIENTO",
        detalle: "Dispositivo enrolado con token JWT",
      },
    ],
  },
];

/* ===================== Component ===================== */
export default function GestionDispositivos() {
  const [list, setList] = useState(DEVICES_SEED);

  // filtros
  const [q, setQ] = useState("");
  const instalaciones = useMemo(
    () => ["Todas las instalaciones", ...Array.from(new Set(list.map((d) => d.instalacion)))],
    [list]
  );
  const [instalacion, setInstalacion] = useState("Todas las instalaciones");
  const [estadoFiltro, setEstadoFiltro] = useState("Todos los estados");

  const filtered = useMemo(() => {
    return list.filter((d) => {
      const okQ =
        !q ||
        d.nombre.toLowerCase().includes(q.toLowerCase()) ||
        d.id.toLowerCase().includes(q.toLowerCase());
      const okI = instalacion === "Todas las instalaciones" || d.instalacion === instalacion;
      const okE =
        estadoFiltro === "Todos los estados" ||
        d.estado.toLowerCase() === estadoFiltro.toLowerCase();
      return okQ && okI && okE;
    });
  }, [list, q, instalacion, estadoFiltro]);

  /* --------- Modal QR (Nuevo dispositivo) --------- */
  const [qrOpen, setQrOpen] = useState(false);
  const [qrStep, setQrStep] = useState(1);
  const [qrImg, setQrImg] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [qrSeconds, setQrSeconds] = useState(0);
  const qrTimerRef = useRef(null);

  const startCountdown = (untilMs, setter, ref) => {
    if (ref.current) clearInterval(ref.current);
    const tick = () => {
      const s = Math.max(0, Math.floor((untilMs - Date.now()) / 1000));
      setter(s);
      if (s <= 0) clearInterval(ref.current);
    };
    tick();
    ref.current = setInterval(tick, 1000);
  };

  // Genera imagen QR: usa librería si está, si no fallback externo
  const genQRImage = async (text, setImage) => {
    try {
      const mod = await import(/* @vite-ignore */ "qrcode");
      const QR = mod?.default ?? mod;
      const dataUrl = await QR.toDataURL(text, { width: 280, margin: 1 });
      setImage(dataUrl);
    } catch {
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(
        text
      )}`;
      setImage(url);
    }
  };

  const openQRModal = () => {
    setQrOpen(true);
    setQrStep(1);
    setQrImg("");
    setQrUrl("");
    setQrSeconds(0);
  };
  const closeQRModal = () => {
    setQrOpen(false);
    if (qrTimerRef.current) clearInterval(qrTimerRef.current);
  };
  const generateQR = async () => {
    const tok = rndToken();
    const url = buildEnrollURL(tok);
    setQrUrl(url);
    setQrStep(2);
    const until = Date.now() + TTL_SECONDS * 1000;
    startCountdown(until, setQrSeconds, qrTimerRef);
    await genQRImage(url, setQrImg);
  };
  const regenQR = async () => generateQR();
  const copyQRLink = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      alert("Enlace copiado ✅");
    } catch {
      alert("No se pudo copiar automáticamente");
    }
  };

  // ---------- Descarga robusta del PNG del QR ----------
  // Si hay librería qrcode -> genera PNG local y descarga.
  // Si no, intenta bajar la imagen (dataURL o blob).
  // Si CORS bloquea -> abre en nueva pestaña para guardar manualmente.
  const downloadQR = async ({ imgSrc, text, filename }) => {
    // 1) Intentar generar localmente si tenemos la librería
    if (text) {
      try {
        const mod = await import(/* @vite-ignore */ "qrcode");
        const QR = mod?.default ?? mod;
        const dataUrl = await QR.toDataURL(text, { width: 1024, margin: 2 });
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = filename || "qr.png";
        a.click();
        return;
      } catch {
        // seguimos al plan B
      }
    }
    // 2) Si ya tenemos un dataURL
    if (imgSrc && imgSrc.startsWith("data:image")) {
      const a = document.createElement("a");
      a.href = imgSrc;
      a.download = filename || "qr.png";
      a.click();
      return;
    }
    // 3) Intentar fetch -> blob -> descargar (puede fallar por CORS)
    try {
      if (imgSrc) {
        const res = await fetch(imgSrc, { mode: "cors" });
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename || "qr.png";
        a.click();
        URL.revokeObjectURL(url);
        return;
      }
    } catch {
      // ignoramos y pasamos al plan C
    }
    // 4) Plan C: abrir en pestaña nueva para guardar manualmente
    if (imgSrc) {
      window.open(imgSrc, "_blank", "noopener,noreferrer");
    } else if (text) {
      // si no teníamos imagen pero sí texto, generamos una URL hacia el servicio externo
      const url = `https://api.qrserver.com/v1/create-qr-code/?size=1024x1024&data=${encodeURIComponent(
        text
      )}`;
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      alert("No hay imagen ni texto del QR disponibles.");
    }
  };

  /* --------- Modal Detalle (👁️) --------- */
  const [viewOpen, setViewOpen] = useState(false);
  const [dev, setDev] = useState(null);
  const [viewSeconds, setViewSeconds] = useState(0);
  const [viewUrl, setViewUrl] = useState("");
  const [viewImg, setViewImg] = useState("");
  const viewTimerRef = useRef(null);

  const openView = async (d) => {
    setDev(d);
    setViewOpen(true);
    const url = buildEnrollURL(rndToken());
    setViewUrl(url);
    const until = Date.now() + TTL_SECONDS * 1000;
    startCountdown(until, setViewSeconds, viewTimerRef);
    await genQRImage(url, setViewImg);
  };
  const closeView = () => {
    setViewOpen(false);
    setDev(null);
    setViewImg("");
    setViewUrl("");
    setViewSeconds(0);
    if (viewTimerRef.current) clearInterval(viewTimerRef.current);
  };
  const regenViewToken = async () => openView(dev);

  const updateEstado = (id, nuevo) =>
    setList((prev) => prev.map((x) => (x.id === id ? { ...x, estado: nuevo } : x)));

  useEffect(
    () => () => {
      if (qrTimerRef.current) clearInterval(qrTimerRef.current);
      if (viewTimerRef.current) clearInterval(viewTimerRef.current);
    },
    []
  );

  return (
    <div className="gd-wrap">
      <AsistenciaSubnav />

      {/* Título principal */}
      <div className="gd-top">
        <h1 className="gd-h1">Gestión de Dispositivos</h1>
        <p className="gd-subtitle">
          Administra los equipos personales y kioskos que pueden registrar marcas.
        </p>
      </div>

      {/* Filtros */}
      <section className="gd-filters card">
        <div className="f-item f-grow">
          <label className="lbl">Buscar dispositivo</label>
          <input
            className="inp"
            placeholder="Nombre o ID del dispositivo"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="f-item">
          <label className="lbl">Instalación</label>
          <select
            className="inp"
            value={instalacion}
            onChange={(e) => setInstalacion(e.target.value)}
          >
            {instalaciones.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
        </div>
        <div className="f-item">
          <label className="lbl">Estado</label>
          <select
            className="inp"
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
          >
            <option>Todos los estados</option>
            <option>Activo</option>
            <option>Bloqueado</option>
          </select>
        </div>
        <div className="f-item f-right">
          <button className="gd-cta" onClick={openQRModal}>
            📱 + Nuevo dispositivo
          </button>
        </div>
      </section>

      {/* Tabla principal */}
      <section className="card">
        <div className="gd-table-wrap">
          <table className="gd-table">
            <thead>
              <tr>
                <th>Dispositivo</th>
                <th>Instalación</th>
                <th>Estado</th>
                <th>Último check-in</th>
                <th className="gd-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div className="dev-cell">
                      <span className="dev-ico">📟</span>
                      <div className="dev-txt">
                        <div className="dev-name">{d.nombre}</div>
                        <div className="dev-id">ID: {d.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>{d.instalacion}</td>
                  <td>
                    <span
                      className={`chip ${
                        d.estado === "Activo"
                          ? "chip--ok"
                          : d.estado === "Bloqueado"
                          ? "chip--warn"
                          : "chip--muted"
                      }`}
                    >
                      {d.estado}
                    </span>
                  </td>
                  <td>{relTime(d.checkinISO)}</td>
                  <td className="gd-right">
                    <div className="row-actions">
                      <button
                        className="ibtn"
                        title="Ver detalle"
                        onClick={() => openView(d)}
                      >
                        👁️
                      </button>
                      {d.estado === "Activo" ? (
                        <button
                          className="ibtn"
                          title="Bloquear"
                          onClick={() => updateEstado(d.id, "Bloqueado")}
                        >
                          🔒
                        </button>
                      ) : (
                        <button
                          className="ibtn"
                          title="Activar"
                          onClick={() => updateEstado(d.id, "Activo")}
                        >
                          ✅
                        </button>
                      )}
                      <button
                        className="ibtn"
                        title="Descargar info"
                        onClick={() => alert("Descargar (stub)")}
                      >
                        ⬇️
                      </button>
                      <button
                        className="ibtn"
                        title="Eliminar"
                        onClick={() =>
                          setList((prev) => prev.filter((x) => x.id !== d.id))
                        }
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="gd-empty">
                    Sin resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ===== Modal: Nuevo Dispositivo (QR) ===== */}
      {qrOpen && (
        <div className="overlay" onClick={closeQRModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title">Nuevo Dispositivo</div>
              <button className="x" onClick={closeQRModal}>
                ✖
              </button>
            </div>

            {qrStep === 1 && (
              <div className="modal-body center">
                <p className="muted">
                  Genera un código QR para enrolar un nuevo dispositivo en la
                  plataforma.
                </p>
                <button className="gd-cta" onClick={generateQR}>
                  Generar QR
                </button>
              </div>
            )}

            {qrStep === 2 && (
              <>
                <div className="modal-body center">
                  {qrImg ? (
                    <img className="qr" src={qrImg} alt="QR enrolamiento" />
                  ) : (
                    <div className="qr ph">QR</div>
                  )}

                  <div className="exp">
                    ⏲️ <b>Expira en: {mmss(qrSeconds)}</b>
                    <div className="muted">
                      Este código QR expirará automáticamente por seguridad
                    </div>
                  </div>
                </div>

                <div className="modal-foot col">
                  <button className="btn" onClick={copyQRLink}>
                    📋 Copiar enlace
                  </button>
                  <button
                    className="btn"
                    onClick={() =>
                      downloadQR({
                        imgSrc: qrImg,
                        text: qrUrl,
                        filename: "qr_enrolamiento.png",
                      })
                    }
                  >
                    🖼️ Descargar PNG
                  </button>
                  <button className="gd-cta" onClick={regenQR}>
                    ♻️ Regenerar token
                  </button>
                  <div className="muted">
                    El token de enrolamiento expira en 10 min (JWT firmado)
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===== Modal: Detalle (👁️) ===== */}
      {viewOpen && dev && (
        <div className="overlay" onClick={closeView}>
          <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div className="modal-title">Detalle del Dispositivo</div>
              <button className="x" onClick={closeView}>
                ✖
              </button>
            </div>

            <div className="modal-body">
              {/* Información Principal */}
              <div className="block">
                <div className="block-title">Información Principal</div>
                <div className="grid2">
                  <div className="field full">
                    <label className="lbl">Nombre del dispositivo</label>
                    <input className="inp" value={dev.nombre} readOnly />
                  </div>
                  <div className="field">
                    <label className="lbl">Estado</label>
                    <div>
                      <span
                        className={`chip ${
                          dev.estado === "Activo"
                            ? "chip--ok"
                            : dev.estado === "Bloqueado"
                            ? "chip--warn"
                            : "chip--muted"
                        }`}
                      >
                        {dev.estado}
                      </span>
                    </div>
                  </div>
                  <div className="field">
                    <label className="lbl">Instalación</label>
                    <input className="inp" value={dev.instalacion} readOnly />
                  </div>
                  <div className="field">
                    <label className="lbl">Último check-in</label>
                    <div className="chip chip--muted">⏱️ {fmtFull(dev.checkinISO)}</div>
                  </div>
                  <div className="field full">
                    <label className="lbl">Empresa asociada</label>
                    <div className="chip">🏢 {dev.empresa}</div>
                  </div>
                </div>
              </div>

              {/* Ficha Técnica */}
              <div className="block">
                <div className="block-title">Ficha Técnica</div>
                <div className="grid3">
                  <KV k="Modelo" v={dev.modelo} />
                  <KV k="Sistema Operativo" v={dev.so} />
                  <KV k="Versión App" v={dev.app} />
                </div>
                <KV k="ID de Hardware" v={dev.hardwareId} />
                <div className="muted" style={{ marginTop: 6 }}>
                  🔐 Guardado cifrado en base de datos
                </div>
              </div>

              {/* Enrolamiento */}
              <div className="block">
                <div className="block-title">Enrolamiento</div>
                <div className="grid2">
                  <KV k="Enrolado por" v={dev.enroladoPor} />
                  <KV k="Fecha de enrolamiento" v={fmtFull(dev.enroladoISO)} />
                </div>

                <div className="enroll">
                  <div className="enroll-qr">
                    {viewImg ? (
                      <img className="qr" src={viewImg} alt="QR enrolamiento" />
                    ) : (
                      <div className="qr ph">QR</div>
                    )}
                  </div>
                  <div className="enroll-info">
                    <div className="exp big">
                      ⏲️ <b>Expira en:</b>{" "}
                      <span className={viewSeconds <= 30 ? "warn" : ""}>
                        {mmss(viewSeconds)}
                      </span>
                    </div>
                    <div className="row">
                      <button className="btn" onClick={() => navigator.clipboard.writeText(viewUrl)}>
                        📋 Copiar enlace
                      </button>
                      <button
                        className="btn"
                        onClick={() =>
                          downloadQR({
                            imgSrc: viewImg,
                            text: viewUrl,
                            filename: "qr_dispositivo.png",
                          })
                        }
                      >
                        🖼️ Descargar PNG
                      </button>
                      <button className="gd-cta" onClick={regenViewToken}>
                        ♻️ Regenerar token
                      </button>
                    </div>
                    <div className="muted">
                      El token de enrolamiento expira en 10 min (JWT firmado)
                    </div>
                  </div>
                </div>
              </div>

              {/* Seguridad */}
              <div className="block">
                <div className="block-title">Seguridad</div>
                <div className="row wrap">
                  {dev.estado === "Activo" ? (
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        updateEstado(dev.id, "Bloqueado");
                        setDev((v) => ({ ...v, estado: "Bloqueado" }));
                      }}
                    >
                      🔒 Bloquear dispositivo
                    </button>
                  ) : (
                    <button
                      className="btn"
                      onClick={() => {
                        updateEstado(dev.id, "Activo");
                        setDev((v) => ({ ...v, estado: "Activo" }));
                      }}
                    >
                      ✅ Activar dispositivo
                    </button>
                  )}
                  <button className="btn" onClick={() => alert("Guía (stub)")}>
                    📘 Guía de reinstalación
                  </button>
                  <button className="btn" onClick={() => alert("Auditoría DT (stub)")}>
                    🧾 Ver marcas (auditoría DT)
                  </button>
                </div>
                <div className="muted">
                  Cumplimiento DT: Cada marca debe registrar hora exacta, IP, GPS,
                  dispositivo, tipo, método y hash de integridad.
                </div>
              </div>

              {/* Historial */}
              <div className="block">
                <div className="block-title">Historial de Auditoría</div>
                <div className="gd-table-wrap">
                  <table className="gd-table gd-table--compact">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Usuario</th>
                        <th>Acción</th>
                        <th>Detalle</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dev.historial.map((h) => (
                        <tr key={h.id}>
                          <td>{fmtFull(h.fechaISO)}</td>
                          <td>{h.usuario}</td>
                          <td>
                            <span className="chip chip--muted">{h.accion}</span>
                          </td>
                          <td>{h.detalle}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="row">
                  <button className="btn" onClick={() => alert("CSV (stub)")}>
                    ⬇️ Exportar CSV
                  </button>
                </div>
              </div>

              {/* Cumplimiento */}
              <div className="okbox">
                ✅ <b>Cumplimiento Dirección del Trabajo (DT)</b>
                <div className="muted">
                  Registro obligatorio: quién enrola, qué dispositivo, cuándo, y
                  cambios posteriores. En cada marca: hora/IP/GPS/dispositivo/tipo/
                  método/hash de integridad.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------ mini subcomp ------ */
function KV({ k, v }) {
  return (
    <div className="kv">
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </div>
  );
}
