import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    // Bind to all interfaces so tunnels (cloudflared, ngrok, localhost.run)
    // and other devices on your Wi-Fi can reach the dev server.
    host: true,
    // Accept any Host header; required for *.trycloudflare.com, *.ngrok-free.app,
    // and friends. Narrow this list once you have a known tunnel URL.
    allowedHosts: true,
  },
});
