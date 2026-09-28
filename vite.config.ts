import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(dirname, "./src"),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    // Keeps Vitest out of tool folders like .agents/ and .claude/, which
    // ship their own unrelated test files.
    include: ["src/**/*.test.{ts,tsx}"],
    // Node 25 has its own global localStorage, which hides jsdom's and
    // doesn't work without a storage file. Switching it off lets jsdom's
    // version through.
    execArgv: ["--no-experimental-webstorage"],
  },
});
