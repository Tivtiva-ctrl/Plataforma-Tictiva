// src/api/index.js

// Lógica para determinar la URL base (tu código original)
const host = typeof window !== "undefined" ? window.location.hostname : "localhost";
const isLocalHost = ["localhost", "127.0.0.1"].includes(host);
const VITE_API = (import.meta.env.VITE_API_URL || "").trim();
const isViteApiLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(VITE_API);
const BASE = isLocalHost ? (VITE_API || "http://127.0.0.1:3001") : (isViteApiLocal ? "" : VITE_API);

// === Overlay localStorage (tu código original) ===
const LS_KEY = "tictiva_overlay_v1";
const readOverlay = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const obj = raw ? JSON.parse(raw) : {};
    return {
      empleados: Array.isArray(obj.empleados) ? obj.empleados : [],
      permisos: Array.isArray(obj.permisos) ? obj.permisos : [],
      permisos_historial: Array.isArray(obj.permisos_historial) ? obj.permisos_historial : [],
    };
  } catch {
    return { empleados: [], permisos: [], permisos_historial: [] };
  }
};
const writeOverlay = (next) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(next));
  } catch {}
};
const pushOverlay = (col, item) => {
  const ov = readOverlay();
  ov[col] = [item, ...ov[col]];
  writeOverlay(ov);
};

// ... (El resto de tus funciones helper originales como apiGet, fetchDb, normalizadores, etc. van aquí)

// --- API DE EMPLEADOS (Versión Simplificada para Depuración) ---
export const EmpleadosAPI = {
  async list() {
    // Mensaje para saber que la función se está ejecutando
    console.log("Intentando obtener datos de http://127.0.0.1:3001/empleados");
    
    try {
      // Llamada directa y simple a tu servidor local
      const res = await fetch("http://127.0.0.1:3001/empleados");
      
      // Si la respuesta NO es exitosa (ej. 404)
      if (!res.ok) {
        console.error("¡Falló la llamada a la API!", res.status, res.statusText);
        alert(`Error: No se pudo conectar con el servidor. ¿Está corriendo 'npm run dev:db'? (Código: ${res.status})`);
        return []; // Devuelve un array vacío para que la app no se rompa.
      }
      
      // Si la respuesta es exitosa
      const data = await res.json();
      console.log("Datos recibidos de la API:", data);
      return data; // Devuelve los datos directamente.

    } catch (error) {
      console.error("Error de red o conexión:", error);
      alert("Error de conexión. Asegúrate de que tu servidor backend (npm run dev:db) esté corriendo.");
      return [];
    }
  },

  async create(nuevo) {
    try {
        const res = await fetch(`http://127.0.0.1:3001/empleados`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevo),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        return await res.json();
    } catch(err) {
        console.error("Error al crear empleado:", err);
        // Fallback a localStorage si la API falla
        pushOverlay("empleados", nuevo);
        return nuevo;
    }
  },
};


// --- API DE PERMISOS (Tu código original, sin cambios) ---
export const PermisosAPI = {
    // ... (Aquí va todo tu objeto PermisosAPI original)
};


// --- EXPORTACIÓN FINAL ---
export default { PermisosAPI, EmpleadosAPI };