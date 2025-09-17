// ==========================================================
//  SERVIDOR COMPLETO CONECTADO A SUPABASE
//  (Sistema de Empleados, PINs y Marcaciones)
// ==========================================================
console.log("=== BACKEND CONECTADO A SUPABASE ===");

const express = require("express");
const cors = require("cors");
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- Helpers (Funciones de Ayuda) ---
const normalizarRut = (rut = "") => rut.toString().replace(/\./g, "").replace(/-/g, "").toUpperCase();

async function generatePin() {
  // 1. Obtener todos los PINs que ya existen en la base de datos
  const { data: empleados, error } = await supabase.from('empleados').select('codigoMarcacion');
  if (error) throw new Error("No se pudieron obtener los PINs existentes.");
  
  const existingPins = new Set(empleados.map(e => e.codigoMarcacion).filter(Boolean));

  // 2. Generar un PIN nuevo que no exista
  let pin;
  let attempts = 0;
  do {
    const n = Math.floor(Math.random() * 10000);
    pin = n.toString().padStart(4, "0");
    attempts++;
  } while (existingPins.has(pin) && attempts < 10000); // Evita un bucle infinito

  if (existingPins.has(pin)) {
    throw new Error("No se pudo generar un PIN único de 4 dígitos.");
  }
  return pin;
}


// ==========================================================
//  RUTAS DE LA API (TRADUCIDAS A SUPABASE)
// ==========================================================

// --- HEALTH CHECK ---
app.get("/health", (_, res) => res.json({ ok: true, message: "Servidor online y conectado" }));

// --- OBTENER TODOS LOS EMPLEADOS ---
app.get("/api/empleados", async (req, res) => {
  const { data, error } = await supabase.from('empleados').select('*');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// --- OBTENER UN EMPLEADO POR SU RUT ---
app.get("/api/empleados/:rut", async (req, res) => {
  const rutNormalizado = normalizarRut(req.params.rut);
  const { data, error } = await supabase.from('empleados').select('*').eq('rut', rutNormalizado).single();
  if (error || !data) return res.status(404).json({ error: "Empleado no encontrado" });
  res.json(data);
});

// --- ACTUALIZAR (GUARDAR) UN EMPLEADO POR SU RUT ---
app.put("/api/empleados/:rut", async (req, res) => {
  const rutNormalizado = normalizarRut(req.params.rut);
  const datosActualizados = req.body;
  
  // No se debe intentar actualizar el ID, RUT, o la fecha de creación
  delete datosActualizados.id;
  delete datosActualizados.rut;
  delete datosActualizados.created_at;

  const { data, error } = await supabase.from('empleados').update(datosActualizados).eq('rut', rutNormalizado).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Empleado actualizado correctamente", empleado: data });
});

// --- CREAR UN NUEVO EMPLEADO ---
app.post("/api/empleados", async (req, res) => {
  const nuevoEmpleado = req.body;
  if (!nuevoEmpleado.rut || !nuevoEmpleado.nombre) {
    return res.status(422).json({ error: "RUT y nombre son obligatorios" });
  }
  
  try {
    const pin = await generatePin();
    nuevoEmpleado.rut = normalizarRut(nuevoEmpleado.rut);
    nuevoEmpleado.codigoMarcacion = pin; // Asignamos el PIN único

    const { data, error } = await supabase.from('empleados').insert(nuevoEmpleado).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    if (error.code === '23505') { // Error de 'unique constraint' (RUT o PIN duplicado)
        return res.status(409).json({ error: "El RUT o el PIN ya existe" });
    }
    return res.status(400).json({ error: error.message });
  }
});

// --- REGENERAR PIN POR RUT ---
app.post("/api/empleados/:rut/regenerar-pin", async (req, res) => {
  const rutNormalizado = normalizarRut(req.params.rut);
  try {
    const nuevoPin = await generatePin();
    const { data, error } = await supabase.from('empleados').update({ codigoMarcacion: nuevoPin }).eq('rut', rutNormalizado).select().single();
    if (error || !data) throw new Error("Empleado no encontrado para regenerar PIN.");
    res.json({ ok: true, pin: nuevoPin, empleado: data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// --- REGISTRAR UNA MARCACIÓN (POR PIN O RUT) ---
app.post("/api/ingest/marca", async (req, res) => {
  const { codigo, rut, tipo } = req.body || {};
  if (!tipo) return res.status(422).json({ error: "El 'tipo' de marca es obligatorio" });

  let empleado;
  // 1. Buscar al empleado en la base de datos
  if (codigo) {
    const { data } = await supabase.from('empleados').select('*').eq('codigoMarcacion', codigo).single();
    empleado = data;
  } else if (rut) {
    const { data } = await supabase.from('empleados').select('*').eq('rut', normalizarRut(rut)).single();
    empleado = data;
  }
  if (!empleado) return res.status(404).json({ error: "Empleado no encontrado por PIN o RUT" });

  // 2. Crear la nueva marca
  const nuevaMarca = {
    fecha: new Date().toISOString().slice(0, 10),
    hora: new Date().toISOString().slice(11, 19),
    tipo: tipo,
    estado: req.body.estado || "Válida",
    metodo: req.body.metodo || "App",
    ip: req.body.ip || "",
  };

  // 3. Actualizar el array de marcas del empleado
  const marcasActuales = empleado.marcas || []; // Si no tiene marcas, empezamos con un array vacío
  const nuevasMarcas = [nuevaMarca, ...marcasActuales]; // Agregamos la nueva marca al principio

  const { data: updatedData, error } = await supabase
    .from('empleados')
    .update({ marcas: nuevasMarcas })
    .eq('id', empleado.id);

  if (error) return res.status(500).json({ error: "No se pudo guardar la marca." });

  res.status(201).json({ ok: true, empleado: { rut: empleado.rut, nombre: empleado.nombre }, marca: nuevaMarca });
});

// --- Iniciar el servidor ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});