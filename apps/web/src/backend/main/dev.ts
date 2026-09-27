// Development: Vite serves the browser code and transforms the views on each request.
import { frontendDev } from "@shift-stack/core/server/dev"
import { frontend } from "#frontend/config.ts"
import { start } from "./serve.ts"

start(frontendDev(frontend))
