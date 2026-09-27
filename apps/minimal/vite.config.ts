import { svelte } from "@sveltejs/vite-plugin-svelte"
import tailwindcss from "@tailwindcss/vite"
import { shift } from "@shift-stack/core/vite"
import { readFileSync } from "node:fs"
import { defineConfig } from "vite"
import { frontend } from "./src/config.ts"

// The server bundle leaves out only what is installed at runtime (`dependencies`); SHiFT itself is bundled in.
const { dependencies } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"))

export default defineConfig({
  plugins: [tailwindcss(), svelte(), shift(frontend)],
  // Next to the Todos app's dev server (5173), not on it.
  server: { port: 5174, strictPort: true, origin: "http://localhost:5174" },
  ssr: { noExternal: true, external: Object.keys(dependencies) }
})
