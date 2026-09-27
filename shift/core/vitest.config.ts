import { svelte } from "@sveltejs/vite-plugin-svelte"
import { defineConfig } from "vitest/config"

// The views tests render Svelte components on the server.
export default defineConfig({ plugins: [svelte()] })
