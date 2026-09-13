import { defineConfig } from "vite";

export default defineConfig({
  server: {
    allowedHosts: ["debug.gauas.com"],
  },
  build: {
    // The lazy WebGL world deliberately owns the Three.js runtime in one cacheable chunk.
    chunkSizeWarningLimit: 640,
  },
});
