/// <reference types="vitest/config" />
import { paraglideVitePlugin } from "@inlang/paraglide-js"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import tailwindcss from "@tailwindcss/vite"
import { shift } from "@shift-stack/core/vite"
import { readFileSync } from "node:fs"
import { defineConfig } from "vite"
import { paraglide } from "./paraglide.config.ts"
import { frontend } from "./src/frontend/config.ts"

// The server bundle leaves out only what this app installs at runtime; the workspace packages and what they
// depend on are bundled in, since dist/server cannot resolve a package that only a workspace package lists.
const { dependencies } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"))

export default defineConfig({
  plugins: [tailwindcss(), svelte(), paraglideVitePlugin(paraglide), shift(frontend)],
  server: {
    port: 5173,
    strictPort: true,
    origin: "http://localhost:5173"
  },
  ssr: {
    noExternal: true,
    external: Object.keys(dependencies)
  },
  test: {
    include: ["tests/**/*.test.ts"]
  }
})
