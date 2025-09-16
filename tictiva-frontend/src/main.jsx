import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (url && key) {
  window.supabase = createClient(url, key);
} else {
  console.warn('Supabase no configurado: revisa VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY');
}

import React from "react";
import ReactDOM from "react-dom/client";  // <-- IMPORTANTE, estaba faltando
import App from "./App";
import { EmpresaProvider } from "./context/EmpresaContext"; // <-- nuevo para multiempresa

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <EmpresaProvider>
      <App />
    </EmpresaProvider>
  </React.StrictMode>
);import { createClient } from '@supabase/supabase-js';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
window.supabase = supabase; // <- importante para DocumentosTab

