import { defineConfig } from "vite";

export default defineConfig({
  build: {
    // The lazy WebGL world deliberately owns the Three.js runtime in one cacheable chunk.
    chunkSizeWarningLimit: 640,
  },
});
