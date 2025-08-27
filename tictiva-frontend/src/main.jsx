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
);
