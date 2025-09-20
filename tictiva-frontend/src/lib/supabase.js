import { createClient } from "@supabase/supabase-js";

const URL = import.meta.env.VITE_SUPABASE_URL;
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Exporta null si faltan credenciales (evita crasheos en build)
export const supabase = (URL && KEY) ? createClient(URL, KEY) : null;
