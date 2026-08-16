import { defineConfig } from "vite";

export default defineConfig({
  publicDir: false,
  build: {
    outDir: "assets/dist",
    manifest: true,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: "assets/js/index.js",
        settings: "assets/js/settings.js",
      },
    },
  },
});
