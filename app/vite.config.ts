import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The seed JSON lives one level up in ../seed and is the SINGLE SOURCE OF TRUTH for the
// UI — fs.allow lets the dev server read it; the app imports it directly, never duplicating it.
export default defineConfig({
  plugins: [react()],
  server: { fs: { allow: [".."] } },
});
