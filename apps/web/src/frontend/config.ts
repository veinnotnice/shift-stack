// Where SHiFT finds this app's frontend. The Vite plugin (vite.config.ts) and the server (backend/main) both read it.
import type { FrontendConfig } from "@shift-stack/core/vite"

export const frontend = {
  views: "src/frontend/views/index.ts",
  client: "src/frontend/islands/entry.ts",
  styles: "src/frontend/styles/app.css"
} as const satisfies FrontendConfig
