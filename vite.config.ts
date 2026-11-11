
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// --------------------------------------------------
// VITE CONFIGURATION
// --------------------------------------------------

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    // --------------------------------------------------
    // PROGRESSIVE WEB APP
    // --------------------------------------------------

    VitePWA({
      registerType: "autoUpdate",

      // Static assets included in the PWA.
      includeAssets: [
        "icons/icon-192.png",
        "icons/icon-512.png",
      ],

      // --------------------------------------------------
      // WEB APP MANIFEST
      // --------------------------------------------------

      manifest: {
        name: "BenchFlow — Experimental Workflow Companion",
        short_name: "BenchFlow",

        description:
          "Offline-first experimental workflow companion",

        theme_color: "#123b77",
        background_color: "#ffffff",

        display: "standalone",
        start_url: "/",

        icons: [
          {
            src: "/icons/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icons/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },

      // --------------------------------------------------
      // OFFLINE CACHING
      // --------------------------------------------------

      workbox: {
        globPatterns: [
          // "mjs" is needed for the pdf.js worker, otherwise the
          // PDF import would not work offline.
          "**/*.{js,mjs,css,html,svg,png,woff2,json}",
        ],

        // Allow React Router navigation offline.
        navigateFallback: "/index.html",
      },
    }),
  ],
});
