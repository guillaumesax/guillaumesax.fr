import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // IMPORTANT pour GitHub Pages (repo pages) : chemins relatifs
  base: "./",
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        musiques: "musiques/index.html",
        technicalSheet: "technique/index.html",
      },
    },
  },
});
