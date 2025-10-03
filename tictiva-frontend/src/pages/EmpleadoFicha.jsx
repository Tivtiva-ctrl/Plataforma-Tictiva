// src/pages/EmpleadoFicha.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useTenant } from "../context/TenantProvider";
import { ROUTES } from "../router/routes";
import "./EmpleadoFicha.css";

const TABS = [
  { key: "personales", label: "Personales" },
  { key: "contractuales", label: "Contractuales" },
  { key: "documentos", label: "Documentos" },
  { key: "prevision", label: "Previsión" },
  { key: "bancarios", label: "Bancarios" },
  { key: "asistencia", label: "Asistencia" },
  { key: "hoja", label: "Hoja de Vida" },
  { key: "historial", label: "Historial" },
];

const normRut = (r) => String(r || "").replace(/\./g, "").toUpperCase();

export default function EmpleadoFicha() {
  const { id, rut } = useParams();                  // soporta /rrhh/empleado/fichas/:id y .../rut/:rut
  const { state } = useLocation();                  // empleado desde la lista
  const navigate = useNavigate();
  const { tenant } = useTenant();

  // 🔒 Si llegamos sin params (ej: /rrhh/listado-fichas), salimos al listado
  const noParams = id == null && rut == null;
  useEffect(() => {
    if (noParams) navigate(ROUTES.rrhh.listadoFichas, { replace: true });
  }, [noParams, navigate]);

  const idParam = useMemo(() => (id ? String(id) : null), [id]);
  const idNumber = useMemo(
    () => (idParam != null && !Number.isNaN(Number(idParam)) ? Number(idParam) : null),
    [idParam]
  );
  const rutParamRaw = useMemo(() => decodeURIComponent(rut || "").trim(), [rut]);
  const rutParamNorm = useMemo(() => (rutParamRaw ? normRut(rutParamRaw) : null), [rutParamRaw]);

  const [tab, setTab] = useState("personales");
  const [loading, setLoading] = useState(true);
  const [empleado, setEmpleado] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (noParams) return;               // ya redirigimos arriba
      if (!tenant?.id) { setLoading(true); return; }

      // 1) Preferir el empleado pasado por state (desde Listado)
      if (state?.empleado) {
        if (!mounted) return;
        setEmpleado(state.empleado);
        setLoading(false);
        return;
      }

      // 2) Si no tenemos identificador, no podemos resolver
      if (idParam == null && !rutParamRaw) {
        if (!mounted) return;
        setEmpleado(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      let data = null, error = null;

      if (idParam != null && idNumber != null) {
        // Buscar por ID numérico
        ({ data, error } = await supabase
          .from("employees")
          .select("*")
          .eq("tenant_id", tenant.id)
          .eq("id", idNumber)
          .maybeSingle());
      } else if (rutParamRaw) {
        // Buscar por RUT crudo
        ({ data, error } = await supabase
          .from("employees")
          .select("*")
          .eq("tenant_id", tenant.id)
          .eq("rut", rutParamRaw)
          .maybeSingle());

        // Fallback por RUT normalizado (sin puntos, upper)
        if (!data && rutParamNorm) {
          ({ data, error } = await supabase
            .from("employees")
            .select("*")
            .eq("tenant_id", tenant.id)
            .eq("rut", rutParamNorm)
            .maybeSingle());
        }
      }

      if (!mounted) return;
      if (error) {
        console.error(error);
        setEmpleado(null);
      } else {
        setEmpleado(data);
      }
      setLoading(false);
    }

    load();
    return () => { mounted = false; };
  }, [tenant?.id, noParams, state?.empleado, idParam, idNumber, rutParamRaw, rutParamNorm]);

  const nombreCompleto = useMemo(
    () => (empleado ? `${empleado.nombre ?? ""} ${empleado.apellido ?? ""}`.trim() : ""),
    [empleado]
  );

  // mocks panel derecho (como tenías)
  const quickInfo = { cumple: "15 Abril", horario: "08:30 - 18:00", oficina: "Santiago Centro" };
  const performance = { productividad: 92, puntualidad: 96, colaboracion: 88 };

  if (noParams) return null; // evita parpadeo antes del redirect
  if (loading || !tenant?.id) {
    return (
      <div className="ef-page">
        <div className="ef-loading">Cargando ficha…</div>
      </div>
    );
  }

  if (!empleado) {
    return (
      <div className="ef-page">
        <div className="ef-empty">
          <p>
            No encontramos la ficha para{" "}
            <strong>
              {idParam != null ? `ID: ${idParam}` : rutParamRaw ? `RUT: ${rutParamRaw}` : "—"}
            </strong>
          </p>
          <button className="ef-btn" onClick={() => navigate(ROUTES.rrhh.listadoFichas)}>
            Volver al Listado
          </button>
        </div>
      </div>
    );
  }

  const showAside = tab !== "asistencia" && tab !== "historial";

  return (
    <div className="ef-page">
      <button className="ef-backLink" onClick={() => navigate(ROUTES.rrhh.listadoFichas)}>
        ← Volver al Listado
      </button>

      {/* Encabezado */}
      <section className="ef-header card">
        <div className="ef-avatar">
          {(empleado.nombre?.[0] ?? "") + (empleado.apellido?.[0] ?? "")}
        </div>
        <div className="ef-headMain">
          <h1 className="ef-name">
            {nombreCompleto}
            {empleado.activo ? (
              <span className="ef-badge ok">Activo</span>
            ) : (
              <span className="ef-badge off">Inactivo</span>
            )}
          </h1>
          <div className="ef-role">{empleado.cargo || "—"}</div>
          <div className="ef-meta">Miembro desde el 03 de Marzo de 2021 (ejemplo)</div>
        </div>
        <div className="ef-headActions">
          <button className="ef-btnGhost" onClick={() => alert("Editar ficha (pronto)")}>
            Editar Ficha
          </button>
        </div>
      </section>

      {/* Tabs */}
      <nav className="ef-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`ef-tab ${tab === t.key ? "active" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Contenido */}
      <section className="ef-content">
        <main className={`ef-main ${showAside ? "" : "full"}`}>
          {tab === "personales" && (
            <div className="card">
              <h2 className="ef-sectionTitle">Información Personal</h2>
              <ul className="ef-defList">
                <li><span>Nombre Completo:</span><strong>{nombreCompleto}</strong></li>
                <li><span>RUT:</span><strong>{empleado.rut}</strong></li>
                <li><span>Fecha de Nacimiento:</span><strong>15/04/1985</strong></li>
                <li><span>Email:</span><strong>juan.diaz@empresa.com</strong></li>
                <li><span>Teléfono:</span><strong>+56 9 8765 4321</strong></li>
                <li><span>Dirección:</span><strong>Av. Providencia 1234, Santiago, Chile</strong></li>
                <li><span>Estado Civil:</span><strong>Casado</strong></li>
              </ul>
            </div>
          )}

          {tab === "contractuales" && (
            <div className="card">
              <h2 className="ef-sectionTitle">Información Contractual</h2>
              <ul className="ef-defList">
                <li><span>Cargo:</span><strong>{empleado.cargo || "—"}</strong></li>
                <li><span>Departamento:</span><strong>Operaciones</strong></li>
                <li><span>Fecha de Ingreso:</span><strong>03/03/2021</strong></li>
                <li><span>Tipo de Contrato:</span><strong>Indefinido</strong></li>
                <li><span>Salario Base:</span><strong>$2.500.000 CLP</strong></li>
                <li><span>Jornada:</span><strong>45 horas semanales</strong></li>
                <li><span>Supervisor:</span><strong>María González – Dirección General</strong></li>
              </ul>
            </div>
          )}

          {tab === "documentos" && (
            <div className="card">
              <h2 className="ef-sectionTitle">Documentos del Empleado</h2>
              <ul className="ef-docList">
                <li>
                  <div>
                    <div className="ef-docName">Contrato de Trabajo</div>
                    <div className="ef-docMeta">Subido el 03/03/2021</div>
                  </div>
                  <button className="ef-btnGhost" onClick={() => alert("Descargar contrato")}>
                    Descargar
                  </button>
                </li>
                <li>
                  <div>
                    <div className="ef-docName">Certificado de Antecedentes</div>
                    <div className="ef-docMeta">Subido el 01/03/2021</div>
                  </div>
                  <button className="ef-btnGhost">Descargar</button>
                </li>
                <li>
                  <div>
                    <div className="ef-docName">Título Profesional</div>
                    <div className="ef-docMeta">Subido el 28/02/2021</div>
                  </div>
                  <button className="ef-btnGhost">Descargar</button>
                </li>
              </ul>
              <button className="ef-btn" onClick={() => alert("Subir documento (pronto)")}>
                + Subir Documento
              </button>
            </div>
          )}

          {tab === "prevision" && (
            <div className="card">
              <h2 className="ef-sectionTitle">Información Previsional</h2>
              <ul className="ef-defList">
                <li><span>AFP:</span><strong>Model</strong></li>
                <li><span>Salud:</span><strong>Isapre Consalud</strong></li>
                <li><span>Plan de Salud:</span><strong>Preferente</strong></li>
                <li><span>Mutualidad:</span><strong>ACHS</strong></li>
              </ul>
            </div>
          )}

          {tab === "bancarios" && (
            <div className="card">
              <h2 className="ef-sectionTitle">Datos Bancarios</h2>
              <ul className="ef-defList">
                <li><span>Banco:</span><strong>Santander</strong></li>
                <li><span>Tipo de Cuenta:</span><strong>Corriente</strong></li>
                <li><span>N° Cuenta:</span><strong>12-345-6789</strong></li>
                <li><span>Titular:</span><strong>{nombreCompleto}</strong></li>
              </ul>
            </div>
          )}

          {tab === "asistencia" && (
            <div className="card">
              <h2 className="ef-sectionTitle">Registro de Asistencia</h2>
              <div className="ef-asistenciaKpis">
                <div className="ef-kpi green"><div className="kpiVal">96%</div><div className="kpiLbl">Asistencia</div></div>
                <div className="ef-kpi orange"><div className="kpiVal">3</div><div className="kpiLbl">Días de Ausencia</div></div>
                <div className="ef-kpi purple"><div className="kpiVal">2</div><div className="kpiLbl">Llegadas Tarde</div></div>
              </div>
              <ul className="ef-asistenciaList">
                <li><span className="dot ok" /> Lunes 15 Enero <strong>08:30 – 18:00</strong></li>
                <li><span className="dot warn" /> Martes 16 Enero <strong>08:25 – 18:05</strong></li>
                <li><span className="dot late" /> Miércoles 17 Enero <strong>09:15 – 18:00 (Tarde)</strong></li>
              </ul>
            </div>
          )}

          {tab === "hoja" && (
            <div className="card">
              <h2 className="ef-sectionTitle">Hoja de Vida</h2>
              <div className="ef-cvBlock">
                <h3>Experiencia Laboral</h3>
                <ul className="ef-timeline">
                  <li>
                    <div className="tTitle">Gerente de Operaciones</div>
                    <div className="tMeta">Empresa Actual • 2021 – Presente</div>
                    <p className="tDesc">Responsable de supervisar operaciones, optimizar procesos y liderar equipo de 15 personas.</p>
                  </li>
                  <li>
                    <div className="tTitle">Supervisor de Producción</div>
                    <div className="tMeta">Industrias ABC • 2018 – 2021</div>
                    <p className="tDesc">Mejora continua y supervisión de líneas de producción.</p>
                  </li>
                </ul>
              </div>

              <div className="ef-cvBlock">
                <h3>Educación</h3>
                <ul className="ef-timeline">
                  <li>
                    <div className="tTitle">Ingeniería Industrial</div>
                    <div className="tMeta">Universidad de Chile • 2003 – 2008</div>
                  </li>
                </ul>
              </div>

              <div className="ef-cvBlock">
                <h3>Información de Salud</h3>
                <ul className="ef-defList twoCols">
                  <li><span>Grupo Sanguíneo:</span><strong>O+</strong></li>
                  <li><span>Alergias:</span><strong>Penicilina</strong></li>
                  <li><span>Enfermedades crónicas:</span><strong>Ninguna</strong></li>
                  <li><span>Contacto de Emergencia:</span><strong>María Díaz (+56 9 1234 5678)</strong></li>
                </ul>
              </div>
            </div>
          )}

          {tab === "historial" && (
            <div className="card">
              <h2 className="ef-sectionTitle">Historial</h2>
              <ul className="ef-timeline">
                <li>
                  <div className="tTitle">Ajuste de salario</div>
                  <div className="tMeta">05/05/2024 • RRHH</div>
                  <p className="tDesc">Actualización según evaluación anual.</p>
                </li>
                <li>
                  <div className="tTitle">Ingreso a la compañía</div>
                  <div className="tMeta">03/03/2021 • RRHH</div>
                </li>
              </ul>
            </div>
          )}
        </main>

        {showAside && (
          <aside className="ef-aside">
            <div className="card ef-quick">
              <h3 className="ef-cardTitle">Información Rápida</h3>
              <ul className="ef-quickList">
                <li><span>Próximo cumpleaños:</span><strong>{quickInfo.cumple}</strong></li>
                <li><span>Horario:</span><strong>{quickInfo.horario}</strong></li>
                <li><span>Oficina:</span><strong>{quickInfo.oficina}</strong></li>
              </ul>
            </div>

            <div className="card ef-perf">
              <h3 className="ef-cardTitle">Rendimiento</h3>
              <div className="ef-metric">
                <div className="mRow"><span>Productividad</span><strong>{performance.productividad}%</strong></div>
                <div className="bar"><span style={{ width: `${performance.productividad}%` }} /></div>
              </div>
              <div className="ef-metric">
                <div className="mRow"><span>Puntualidad</span><strong>{performance.puntualidad}%</strong></div>
                <div className="bar"><span style={{ width: `${performance.puntualidad}%` }} /></div>
              </div>
              <div className="ef-metric">
                <div className="mRow"><span>Colaboración</span><strong>{performance.colaboracion}%</strong></div>
                <div className="bar"><span style={{ width: `${performance.colaboracion}%` }} /></div>
              </div>
            </div>
          </aside>
        )}
      </section>
    </div>
  );
}
