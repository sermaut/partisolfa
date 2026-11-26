import { defineConfig } from "vite";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

const buildVersion = new Date().toISOString();

const emitBuildVersion = (): Plugin => ({
  name: "partisolfa-build-version",
  generateBundle() {
    this.emitFile({
      type: "asset",
      fileName: "version.json",
      source: JSON.stringify({ version: buildVersion }),
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // GitHub Pages preview uses the repository subpath; normal hosting remains at root.
  base: process.env.GITHUB_PAGES === "true" ? "/partisolfa/" : "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    emitBuildVersion(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: false,
      includeAssets: ["favicon.ico", "robots.txt"],
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        // Never serve an old precached index.html for a normal online visit.
        navigateFallback: null,
        globPatterns: [
          "**/*.{js,css,html,ico,png,svg,webp,jpg,jpeg,woff,woff2,ttf,webmanifest}",
        ],
        runtimeCaching: [
          {
            // Online page visits must revalidate against the published site.
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: {
              cacheName: "partisolfa-pages",
              networkTimeoutSeconds: 10,
              fetchOptions: { cache: "no-store" } as unknown as RequestInit,
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-cache",
              expiration: { maxEntries: 50, maxAgeSeconds: 300 },
            },
          },
        ],
      },
      manifest: {
        name: "PARTISOLFA",
        short_name: "Partisolfa",
        description: "Plataforma de serviços musicais profissionais",
        theme_color: "#d4940a",
        background_color: "#0f1117",
        display: "standalone",
        orientation: "portrait-primary",
        start_url: process.env.GITHUB_PAGES === "true" ? "/partisolfa/" : "/",
        scope: process.env.GITHUB_PAGES === "true" ? "/partisolfa/" : "/",
        icons: [
          { src: "/pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
