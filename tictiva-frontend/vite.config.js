// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "src"), // alias sólido para @
    },
    dedupe: ["react", "react-dom"], // previene múltiples copias en monorepos
  },

  server: {
    proxy: {
      // Solo en dev: redirige /api -> json-server local
      "/api": {
        target: "http://127.0.0.1:3001",
        changeOrigin: true,
        secure: false,
        rewrite: (p) => p.replace(/^\/api/, ""),
      },
    },
  },

  // Opcional pero útil si algún paquete usa process.env en runtime cliente
  define: {
    "process.env": {}, // evita fallos de paquetes que miran process.env
  },
});
