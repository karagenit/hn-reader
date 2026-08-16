import { defineConfig } from "vite";

export default defineConfig({
  publicDir: false,
  build: {
    outDir: "assets/dist",
    manifest: true,
    emptyOutDir: true,
    rollupOptions: {
      input: "assets/js/index.js",
    },
  },
});
