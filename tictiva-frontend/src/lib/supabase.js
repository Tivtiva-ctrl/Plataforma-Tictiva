import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 👇 Log solo en dev, para comprobar que NO están vacías en build local
if (import.meta.env.DEV) {
  console.log("[SUPABASE ENV]", { url, hasAnonKey: !!anon });
}

export const supabase = createClient(url, anon, {
  auth: { persistSession: true, autoRefreshToken: true },
});
