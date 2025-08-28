import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: false,
    },
    // Per default, Vite uses vhost localhost, which is not accessible by the reverse proxy via host.docker.internal.
    host: "127.0.0.1",
    port: 3000,
  },
});
