// Where SHiFT finds the frontend. The Vite plugin (vite.config.ts) and the server both read it.
import type { FrontendConfig } from "@shift-stack/core/vite"

export const frontend = {
  views: "src/views/index.ts",
  client: "src/islands/entry.ts",
  styles: "src/styles/app.css"
} as const satisfies FrontendConfig
