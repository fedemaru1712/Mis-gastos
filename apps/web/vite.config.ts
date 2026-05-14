import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "icons/favicon.ico",
        "icons/favicon-16x16.png",
        "icons/favicon-32x32.png",
        "icons/apple-touch-icon.png",
        "icons/logo-n.png",
      ],
      manifest: {
        name: "NORTH",
        short_name: "NORTH",
        description: "NORTH te ayuda a seguir ingresos, gastos, cartera e hitos financieros desde una sola app.",
        lang: "es",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#000000",
        background_color: "#000000",
        icons: [
          {
            src: "/icons/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/apple-touch-icon.png",
            sizes: "180x180",
            type: "image/png",
            purpose: "any",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
