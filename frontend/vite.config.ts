import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuracao do Vite - Dimensionador FullEnergy (frontend)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
