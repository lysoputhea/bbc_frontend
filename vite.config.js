import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // allow access from Docker/network
    port: 8080,
    watch: {
      usePolling: true,
    },
  },
  // server: {
  //   port: 8080, // Dev server port (matches your backend? Proxy if conflict)
  //   proxy: {
  //     "/api": {
  //       // Proxy API calls to backend during dev (avoids CORS)
  //       target: "http://localhost:3000", // Or your backend port
  //       changeOrigin: true,
  //       rewrite: (path) => path.replace(/^\/api/, ""), // Strips /api prefix
  //     },
  //   },
  //   host: true, // Allows access from network (e.g., for mobile testing)
  // },
});
