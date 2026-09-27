// Development: Vite serves the browser code and transforms the views on each request.
import { frontendDev } from "@shift-stack/core/server/dev"
import { serve } from "@shift-stack/core/server"
import { frontend } from "#app/config.ts"
import { app } from "./app.ts"

// Next to the Todos app (3000), not on it. PORT still wins.
process.env.PORT ??= "3001"

serve(app, frontendDev(frontend))
