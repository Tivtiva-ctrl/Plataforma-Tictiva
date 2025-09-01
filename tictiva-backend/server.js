// server.js
console.log("=== BACKEND CON SOPORTE DE PIN Y MARCACIÓN ===");

import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json()); // para leer JSON en body

// Helpers
const normalizarRut = (rut = "") => rut.toString().replace(/\./g, "").replace(/-/g, "").toUpperCase();

// Genera PIN único de 4 dígitos (0000–9999). Si se agota, cae a 6 dígitos.
function generatePin(existing = new Set()) {
  for (let i = 0; i < 20000; i++) {
    const n = Math.floor(Math.random() * 10000);
    const pin = n.toString().padStart(4, "0");
    if (!existing.has(pin)) return pin;
  }
  let code;
  do {
    code = Math.floor(100000 + Math.random() * 900000).toString();
  } while (existing.has(code));
  return code;
}

// --- Datos base de empleados (en memoria para pruebas) ---
let empleados = [
  {
    rut: "12.345.678-9",
    nombre: "Juan Díaz Morales",
    cargo: "Gerente de Operaciones",
    estado: "Activo",
    direccion: "Calle Uno 123",
    region: "Metropolitana",
    comuna: "Santiago",
    estadoCivil: "Casado",
    telefono: "+56912345678",
    fechaNacimiento: "1985-05-10",
    sexo: "Masculino",
    nacionalidad: "Chilena",
    correo: "juan.diaz@empresa.com",
    datosContractuales: {
      cargoActual: "Gerente de Operaciones",
      jornada: "Completa",
      responsable: "Roberto AdminEmpresa",
      ultimaActualizacion: "2022-01-01",
      licencias: "Ninguna",
      tipoContrato: "Indefinido",
      lugarTrabajo: "Av. Siempre Viva 123, Santiago",
      pinMarcacion: "7864", // PIN inicial de ejemplo
      anexosFirmados: "Sí",
      fechaIngreso: "2020-03-15",
      centroCosto: "QA",
      contratoFirmado: "Sí",
      finiquitoFirmado: "N/A",
    },
    // campo redundante para facilitar búsquedas por PIN
    codigoMarcacion: "7864",
    marcas: [
      { fecha: "2025-07-25", hora: "08:00:00", tipo: "Entrada",         estado: "Válida", metodo: "App móvil", ip: "192.168.0.10" },
      { fecha: "2025-07-25", hora: "13:00:00", tipo: "Salida Colación",  estado: "Válida", metodo: "App móvil", ip: "192.168.0.10" },
      { fecha: "2025-07-25", hora: "14:00:00", tipo: "Entrada Colación", estado: "Válida", metodo: "App móvil", ip: "192.168.0.10" },
      { fecha: "2025-07-25", hora: "18:05:00", tipo: "Salida",           estado: "Atraso", metodo: "App móvil", ip: "192.168.0.10" },
      { fecha: "2025-07-26", hora: "08:00:00", tipo: "Entrada",          estado: "Válida", metodo: "App móvil", ip: "192.168.0.10" },
      { fecha: "2025-07-26", hora: "18:00:00", tipo: "Salida",           estado: "Válida", metodo: "App móvil", ip: "192.168.0.10" }
    ]
  }
];

// Utilidad: conjunto de PINs en uso
const pinsEnUso = () => new Set(empleados.map(e => e.codigoMarcacion).filter(Boolean));

// --- HEALTH ---
app.get("/health", (_, res) => res.json({ ok: true }));

// --- LISTADO (útil para probar) ---
app.get("/empleados", (_, res) => res.json(empleados));

// --- GET empleado por RUT ---
app.get("/empleados/:rut", (req, res) => {
  const empleado = empleados.find((e) => normalizarRut(e.rut) === normalizarRut(req.params.rut));
  if (!empleado) return res.status(404).json({ error: "Empleado no encontrado" });
  res.json(empleado);
});

// --- PUT empleado por RUT (guardar cambios generales) ---
app.put("/empleados/:rut", (req, res) => {
  const idx = empleados.findIndex((e) => normalizarRut(e.rut) === normalizarRut(req.params.rut));
  if (idx === -1) return res.status(404).json({ error: "Empleado no encontrado" });

  // fusiona (shallow) manteniendo arrays/objetos que vengan completos
  empleados[idx] = { ...empleados[idx], ...req.body };
  // mantiene sincronizado el campo redundante si vino un pin en datosContractuales
  if (empleados[idx]?.datosContractuales?.pinMarcacion) {
    empleados[idx].codigoMarcacion = String(empleados[idx].datosContractuales.pinMarcacion);
  }

  res.json({ message: "Empleado actualizado correctamente", empleado: empleados[idx] });
});

// --- POST crear empleado (genera PIN de 4 dígitos único) ---
app.post("/admin/empleados", (req, res) => {
  const {
    rut,
    nombre,
    cargo = "",
    estado = "Activo",
    direccion = "",
    region = "",
    comuna = "",
    estadoCivil = "",
    telefono = "",
    fechaNacimiento = "",
    sexo = "",
    nacionalidad = "",
    correo = "",
    datosContractuales = {},
    prevision = {},
    bancarios = {},
  } = req.body || {};

  if (!rut || !nombre) {
    return res.status(422).json({ error: "rut y nombre son obligatorios" });
  }

  // RUT único
  if (empleados.find(e => normalizarRut(e.rut) === normalizarRut(rut))) {
    return res.status(409).json({ error: "El RUT ya existe" });
  }

  // Generar PIN único
  const pin = generatePin(pinsEnUso());

  const nuevo = {
    rut,
    nombre,
    cargo,
    estado,
    direccion,
    region,
    comuna,
    estadoCivil,
    telefono,
    fechaNacimiento,
    sexo,
    nacionalidad,
    correo,
    datosContractuales: {
      cargoActual: datosContractuales.cargoActual || cargo,
      jornada: datosContractuales.jornada || "Completa",
      responsable: datosContractuales.responsable || "",
      ultimaActualizacion: datosContractuales.ultimaActualizacion || "",
      licencias: datosContractuales.licencias || "Ninguna",
      tipoContrato: datosContractuales.tipoContrato || "Indefinido",
      lugarTrabajo: datosContractuales.lugarTrabajo || "",
      pinMarcacion: pin, // ← PIN generado
      anexosFirmados: datosContractuales.anexosFirmados || "N/A",
      fechaIngreso: datosContractuales.fechaIngreso || "",
      centroCosto: datosContractuales.centroCosto || "",
      contratoFirmado: datosContractuales.contratoFirmado || "N/A",
      finiquitoFirmado: datosContractuales.finiquitoFirmado || "N/A",
    },
    prevision: {
      afp: prevision.afp || "",
      cajaCompensacion: prevision.cajaCompensacion || "",
      pensionAlimentos: prevision.pensionAlimentos || "N/A",
      sistemaSalud: prevision.sistemaSalud || "",
      mutual: prevision.mutual || "",
      resolucionPension: prevision.resolucionPension || "N/A",
      nombreIsapre: prevision.nombreIsapre || "",
      asignacionFamiliar: prevision.asignacionFamiliar || "",
      discapacidadDeclarada: prevision.discapacidadDeclarada || "No",
    },
    bancarios: {
      banco: bancarios.banco || "",
      tipoCuenta: bancarios.tipoCuenta || "",
      numeroCuenta: bancarios.numeroCuenta || "",
      titularCuenta: bancarios.titularCuenta || nombre,
    },
    codigoMarcacion: pin, // redundante para búsqueda fácil
    marcas: [],
  };

  empleados.push(nuevo);
  res.status(201).json(nuevo);
});

// --- POST regenerar PIN por RUT ---
app.post("/admin/empleados/:rut/regenerar-pin", (req, res) => {
  const idx = empleados.findIndex(e => normalizarRut(e.rut) === normalizarRut(req.params.rut));
  if (idx === -1) return res.status(404).json({ error: "Empleado no encontrado" });

  const inUse = pinsEnUso();
  inUse.delete(empleados[idx].codigoMarcacion); // permite regenerar al mismo empleado
  const nuevoPin = generatePin(inUse);

  empleados[idx].datosContractuales = empleados[idx].datosContractuales || {};
  empleados[idx].datosContractuales.pinMarcacion = nuevoPin;
  empleados[idx].codigoMarcacion = nuevoPin;

  res.json({ ok: true, pin: nuevoPin, empleado: empleados[idx] });
});

// --- POST ingesta de marca (por PIN o por RUT) ---
// Body: { codigo?:string | pin?:string, rut?:string, tipo:"Entrada"|"Salida"|..., ts?:ISO, fecha?:YYYY-MM-DD, hora?:HH:mm:ss, estado?, metodo?, ip? }
app.post("/ingest/marca", (req, res) => {
  const { codigo, pin, rut, tipo, ts, fecha, hora, estado = "Válida", metodo = "App", ip = "" } = req.body || {};

  if (!tipo) return res.status(422).json({ error: "tipo es obligatorio" });

  // Resolver fecha/hora
  let f = fecha, h = hora;
  if (!f || !h) {
    if (!ts) return res.status(422).json({ error: "provee ts ISO o fecha+hora" });
    const d = new Date(ts);
    if (isNaN(d.getTime())) return res.status(422).json({ error: "ts inválido" });
    f = d.toISOString().slice(0, 10);   // YYYY-MM-DD (UTC)
    h = d.toISOString().slice(11, 19);  // HH:MM:SS (UTC)
  }

  // Buscar empleado por PIN o RUT
  const pinBuscado = (codigo ?? pin)?.toString();
  let emp = null;
  if (pinBuscado) {
    emp = empleados.find(e =>
      e.codigoMarcacion === pinBuscado ||
      e?.datosContractuales?.pinMarcacion === pinBuscado
    );
  }
  if (!emp && rut) {
    emp = empleados.find(e => normalizarRut(e.rut) === normalizarRut(rut));
  }
  if (!emp) return res.status(404).json({ error: "Empleado no encontrado por PIN o RUT" });

  if (!Array.isArray(emp.marcas)) emp.marcas = [];
  emp.marcas.unshift({ fecha: f, hora: h, tipo, estado, metodo, ip });

  res.status(201).json({
    ok: true,
    empleado: { rut: emp.rut, nombre: emp.nombre, pin: emp.codigoMarcacion },
    marca: { fecha: f, hora: h, tipo, estado, metodo, ip }
  });
});// ========================= BODEGA & EPP (ENDPOINTS NUEVOS) =========================

// Datos en memoria (puedes persistir en DB después)
let inventario = [
  { sku: "EPP-001", desc: "Casco Blanco", categoria: "EPP", instalacion: "Planta Norte", stock: 45, min: 20, max: 100, estado: "OK",      ubic: "A-01-15" },
  { sku: "EPP-015", desc: "Zapatos Seguridad T42", categoria: "EPP", instalacion: "Bodega Central", stock: 3,  min: 10, max: 50,  estado: "Crítico", ubic: "B-03-08" },
  { sku: "EPP-008", desc: "Guantes Nitrilo", categoria: "EPP", instalacion: "Planta Sur",   stock: 8,  min: 15, max: 80,  estado: "Bajo",    ubic: "A-02-12" },
  { sku: "EPP-030", desc: "Lentes de Seguridad", categoria: "EPP", instalacion: "Planta Norte", stock: 16, min: 5, max: 60, estado: "OK",  ubic: "A-05-02" },
];

const precios = new Map([
  ["EPP-001", 45000],
  ["EPP-008", 12500],
  ["EPP-015", 85000],
  ["EPP-030", 28000],
]);

// Asignaciones por RUT (mock)
let asignacionesPorRut = {
  [normalizarRut("12.345.678-9")]: [
    { sku: "EPP-001", desc: "Casco Blanco",        talla: "U",  entregado: "2025-03-15", vence: "2026-03-15", vida: 75, estado: "Activo" },
    { sku: "EPP-008", desc: "Guantes Nitrilo",     talla: "L",  entregado: "2025-02-01", vence: "2025-08-01", vida: 20, estado: "Por vencer" },
    { sku: "EPP-015", desc: "Zapatos Seguridad",   talla: "42", entregado: "2024-06-15", vence: "2025-02-15", vida: 0,  estado: "Vencido" },
    { sku: "EPP-030", desc: "Lentes de Seguridad", talla: "U",  entregado: "2025-01-10", vence: "2026-01-10", vida: 90, estado: "Activo" },
  ],
};

function normalizaEstado(s=""){
  return s.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
}

// ---------- INVENTARIO ----------

// GET /bodega/inventario?instalacion=&categoria=&estado=&q=
app.get("/bodega/inventario", (req, res) => {
  const { instalacion, categoria, estado, q } = req.query || {};
  let out = inventario.slice();

  if (q) {
    const x = q.toString().toLowerCase();
    out = out.filter(i => `${i.sku} ${i.desc} ${i.instalacion}`.toLowerCase().includes(x));
  }
  if (instalacion && instalacion !== "Todas las instalaciones") {
    out = out.filter(i => i.instalacion === instalacion);
  }
  if (categoria && categoria !== "Todas las categorías") {
    out = out.filter(i => i.categoria === categoria);
  }
  if (estado && estado !== "Todos los estados") {
    out = out.filter(i => normalizaEstado(i.estado) === normalizaEstado(estado));
  }
  res.json(out);
});

// GET /bodega/items/:sku  (detalle de item)
app.get("/bodega/items/:sku", (req, res) => {
  const sku = req.params.sku;
  const item = inventario.find(i => i.sku === sku);
  if (!item) return res.status(404).json({ error: "Item no encontrado" });
  res.json(item);
});

// PUT /bodega/items/:sku  (editar item)
app.put("/bodega/items/:sku", (req, res) => {
  const sku = req.params.sku;
  const idx = inventario.findIndex(i => i.sku === sku);
  if (idx === -1) return res.status(404).json({ error: "Item no encontrado" });

  // merge superficial, validando numéricos
  const body = req.body || {};
  const parseNum = (v, def=0) => Number.isFinite(Number(v)) ? Number(v) : def;

  inventario[idx] = {
    ...inventario[idx],
    ...(body.desc !== undefined ? { desc: body.desc } : {}),
    ...(body.categoria !== undefined ? { categoria: body.categoria } : {}),
    ...(body.instalacion !== undefined ? { instalacion: body.instalacion } : {}),
    ...(body.ubic !== undefined ? { ubic: body.ubic } : {}),
    ...(body.estado !== undefined ? { estado: body.estado } : {}),
    ...(body.stock !== undefined ? { stock: parseNum(body.stock, inventario[idx].stock) } : {}),
    ...(body.min !== undefined ? { min: parseNum(body.min, inventario[idx].min) } : {}),
    ...(body.max !== undefined ? { max: parseNum(body.max, inventario[idx].max) } : {}),
  };
  res.json(inventario[idx]);
});

// GET /bodega/items/:sku/qr  (simula URL QR)
app.get("/bodega/items/:sku/qr", (req, res) => {
  const sku = req.params.sku;
  const item = inventario.find(i => i.sku === sku);
  if (!item) return res.status(404).json({ error: "Item no encontrado" });
  res.json({ url: `https://tictiva.com/qr/${encodeURIComponent(sku)}` });
});

// ---------- COLABORADORES ----------

// GET /bodega/colaboradores/:rut  → ficha + asignaciones + costo total
app.get("/bodega/colaboradores/:rut", (req, res) => {
  const rutN = normalizarRut(req.params.rut);
  // Busca en tu arreglo empleados (ya existente arriba en tu server)
  const emp = empleados.find(e => normalizarRut(e.rut) === rutN);
  if (!emp) return res.status(404).json({ error: "Colaborador no encontrado" });

  const asign = asignacionesPorRut[rutN] || [];
  const total = asign.reduce((s,a)=> s + (precios.get(a.sku) || 0), 0);

  res.json({
    colaborador: { rut: emp.rut, nombre: emp.nombre, cargo: emp.cargo, id: emp.codigoMarcacion || "" },
    asignaciones: asign,
    costoTotal: total,
  });
});

// POST /bodega/colaboradores/:rut/entregar
// body: { sku, talla? }
app.post("/bodega/colaboradores/:rut/entregar", (req, res) => {
  const rutN = normalizarRut(req.params.rut);
  const emp = empleados.find(e => normalizarRut(e.rut) === rutN);
  if (!emp) return res.status(404).json({ error: "Colaborador no encontrado" });

  const { sku, talla = "U" } = req.body || {};
  if (!sku) return res.status(422).json({ error: "sku es obligatorio" });

  const item = inventario.find(i => i.sku === sku);
  if (!item) return res.status(404).json({ error: "SKU no existe en inventario" });

  // Reglas simples de ejemplo:
  const hoy = new Date();
  const entregado = hoy.toISOString().slice(0,10);
  const vence = new Date(hoy); vence.setFullYear(vence.getFullYear() + 1);
  const vida = 100;

  const nueva = {
    sku,
    desc: item.desc,
    talla,
    entregado,
    vence: vence.toISOString().slice(0,10),
    vida,
    estado: "Activo",
  };

  if (!asignacionesPorRut[rutN]) asignacionesPorRut[rutN] = [];
  asignacionesPorRut[rutN].unshift(nueva);

  // (opcional) descuenta stock si quieres:
  // item.stock = Math.max(0, item.stock - 1);

  const total = asignacionesPorRut[rutN].reduce((s,a)=> s + (precios.get(a.sku) || 0), 0);
  res.status(201).json({
    ok: true,
    colaborador: { rut: emp.rut, nombre: emp.nombre },
    asignaciones: asignacionesPorRut[rutN],
    costoTotal: total
  });
});

// POST /bodega/colaboradores/:rut/baja
// body: { sku, motivo? }
app.post("/bodega/colaboradores/:rut/baja", (req, res) => {
  const rutN = normalizarRut(req.params.rut);
  const emp = empleados.find(e => normalizarRut(e.rut) === rutN);
  if (!emp) return res.status(404).json({ error: "Colaborador no encontrado" });

  const { sku, motivo = "Baja" } = req.body || {};
  if (!sku) return res.status(422).json({ error: "sku es obligatorio" });

  const asign = asignacionesPorRut[rutN] || [];
  const idx = asign.findIndex(a => a.sku === sku && normalizaEstado(a.estado) !== "vencido");
  if (idx === -1) return res.status(404).json({ error: "Asignación no encontrada o ya vencida" });

  asign[idx] = { ...asign[idx], estado: "Vencido", vida: 0, motivoBaja: motivo };

  const total = asign.reduce((s,a)=> s + (precios.get(a.sku) || 0), 0);
  res.json({ ok: true, asignaciones: asign, costoTotal: total });
});


app.listen(3000, '0.0.0.0', () => console.log("API en http://<TU_IP>:3000"));

