// tictiva-backend/server.js  (Puente de ingestión DEV - ESM)
import fs from "fs";
import path from "path";
import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";

// --- rutas y config ---
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const DB_PATH    = path.join(__dirname, "db.json"); // db.json junto al server.js
const API_KEY    = process.env.API_KEY || "dev-secret-key"; // cámbialo en prod

// --- helpers ---
const normRut = (r = "") =>
  r.toString().replace(/\./g, "").replace(/-/g, "").toUpperCase();

function ensureDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({ empleados: [] }, null, 2));
  }
}
function loadDB() {
  try {
    ensureDB();
    const raw = fs.readFileSync(DB_PATH, "utf8");
    const parsed = JSON.parse(raw || "{}");
    if (!parsed || typeof parsed !== "object") return { empleados: [] };
    if (!Array.isArray(parsed.empleados)) parsed.empleados = [];
    return parsed;
  } catch {
    return { empleados: [] };
  }
}
function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}
function nextId(arr) {
  return (arr?.reduce((m, x) => Math.max(m, Number(x.id) || 0), 0) || 0) + 1;
}
function generatePunchCode(existing = new Set()) {
  let code;
  do { code = Math.floor(100000 + Math.random() * 900000).toString(); }
  while (existing.has(code));
  return code;
}

// --- app ---
const app = express();
app.use(cors());
app.use(express.json());

// auth simple (excepto /health)
app.use((req, res, next) => {
  if (req.path === "/health") return next();
  const key = req.header("x-api-key");
  if (key !== API_KEY) return res.status(401).json({ error: "unauthorized" });
  next();
});

app.get("/health", (_req, res) => res.json({ ok: true }));

// Crear empleado con código de marcación
app.post("/admin/empleados", (req, res) => {
  const {
    rut,
    nombre,
    cargo = "",
    estado = "Activo",
    fechaIngreso = "",
    area = ""
  } = req.body || {};

  if (!rut || !nombre) {
    return res.status(422).json({ error: "rut y nombre son obligatorios" });
  }

  const db = loadDB();
  db.empleados = db.empleados || [];

  // unicidad por RUT
  if (db.empleados.find((e) => normRut(e.rut) === normRut(rut))) {
    return res.status(409).json({ error: "RUT ya existe" });
  }

  // generar código único
  const existingCodes = new Set(db.empleados.map((e) => e.codigoMarcacion).filter(Boolean));
  const codigoMarcacion = generatePunchCode(existingCodes);

  // Listar empleados (solo lectura)
app.get("/admin/empleados", (req, res) => {
  const db = loadDB();
  const empleados = Array.isArray(db.empleados) ? db.empleados : [];
  // Devuelve solo campos seguros para listado (ajusta a gusto)
  const safe = empleados.map(e => ({
    id: e.id,
    rut: e.rut,
    nombre: e.nombre,
    cargo: e.cargo ?? "",
    estado: e.estado ?? "Activo",
    fechaIngreso: e.fechaIngreso ?? "",
    area: e.area ?? "",
    codigoMarcacion: e.codigoMarcacion ?? null,
    marcasCount: Array.isArray(e.marcas) ? e.marcas.length : 0,
  }));
  res.json(safe);
});


  db.empleados.push(nuevo);
  saveDB(db);
  return res.status(201).json(nuevo);
});

// Regenerar código de marcación
app.post("/admin/empleados/:id/regenerar-codigo", (req, res) => {
  const db = loadDB();
  const emp = (db.empleados || []).find((e) => String(e.id) === String(req.params.id));
  if (!emp) return res.status(404).json({ error: "empleado no encontrado" });

  const existingCodes = new Set(db.empleados.map((e) => e.codigoMarcacion).filter(Boolean));
  emp.codigoMarcacion = generatePunchCode(existingCodes);
  saveDB(db);
  res.json({ ok: true, codigoMarcacion: emp.codigoMarcacion });
});

// Ingesta de marca por código O por RUT
// Body: { codigo?:string, rut?:string, tipo:"Entrada"|"Salida", ts:ISO, estado?, metodo?, ip? }
app.post("/ingest/marca", (req, res) => {
  const { codigo, rut, tipo, ts, estado = "Válida", metodo = "App", ip = "" } = req.body || {};
  if ((!codigo && !rut) || !tipo || !ts) {
    return res.status(422).json({ error: "codigo o rut, tipo y ts son obligatorios" });
  }

  const d = new Date(ts);
  if (isNaN(d.getTime())) {
    return res.status(422).json({ error: "ts inválido (use ISO 8601)" });
  }

  // Normalizamos a UTC
  const fecha = d.toISOString().slice(0, 10);  // YYYY-MM-DD
  const hora  = d.toISOString().slice(11, 19); // HH:MM:SS

  const db = loadDB();
  const empleados = db.empleados || [];

  let emp = null;
  if (codigo) emp = empleados.find((e) => e.codigoMarcacion === String(codigo));
  if (!emp && rut) emp = empleados.find((e) => normRut(e.rut) === normRut(rut));
  if (!emp) return res.status(404).json({ error: "empleado no encontrado" });

  if (!Array.isArray(emp.marcas)) emp.marcas = [];
  emp.marcas.unshift({ fecha, hora, tipo, estado, metodo, ip });

  saveDB(db);
  return res.status(201).json({
    ok: true,
    empleado: { id: emp.id, rut: emp.rut, nombre: emp.nombre, codigoMarcacion: emp.codigoMarcacion },
    marca: { fecha, hora, tipo, estado, metodo, ip }
  });
});

// start
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Puente de ingestión (ESM) en http://127.0.0.1:${PORT}`);
  console.log(`Usando db.json en: ${DB_PATH}`);
});
