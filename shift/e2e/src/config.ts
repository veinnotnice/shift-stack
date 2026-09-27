// Where SHiFT finds the fixture app's frontend: read by the Vite plugin and the server.
import type { FrontendConfig } from "@shift-stack/core/vite"

export const frontend = {
  views: "src/views/index.ts",
  client: "src/islands/entry.ts",
  styles: "src/styles/app.css"
} as const satisfies FrontendConfig
