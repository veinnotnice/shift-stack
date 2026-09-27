import { svelte } from "@sveltejs/vite-plugin-svelte"
import { shift } from "@shift-stack/core/vite"
import { readFileSync } from "node:fs"
import { defineConfig } from "vite"
import { frontend } from "./src/config.ts"

// As in an app: the server bundle leaves out only what is installed at runtime, SHiFT itself is bundled in.
const { dependencies } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"))

export default defineConfig({
  plugins: [svelte(), shift(frontend)],
  ssr: {
    noExternal: true,
    external: Object.keys(dependencies)
  }
})
