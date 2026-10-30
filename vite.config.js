import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Production: no source maps so the minified bundle stays opaque; and
  // esbuild `drop` strips every console.* call and `debugger` statement at
  // compile time, so no stray log from a future contributor can leak a
  // user id, token or request body into the browser console in prod.
  // Dev build keeps them intact so you can still debug on localhost.
  build: {
    sourcemap: false,
    minify: "esbuild",
    cssMinify: true,
  },
  esbuild: {
    drop: command === "build" ? ["console", "debugger"] : [],
    legalComments: command === "build" ? "none" : "inline",
  },
  server: {
    port: 5174,
    // Bind to all interfaces so tunnels (cloudflared, ngrok, localhost.run)
    // and other devices on your Wi-Fi can reach the dev server.
    host: true,
    // Accept any Host header; required for *.trycloudflare.com, *.ngrok-free.app,
    // and friends. Narrow this list once you have a known tunnel URL.
    allowedHosts: true,
  },
}));
