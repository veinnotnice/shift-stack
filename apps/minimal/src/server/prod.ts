// Production: the views are bundled in, the browser code comes from dist/client.
import { Layer } from "effect"
import { assetsFromManifest, serve, viewsBundled } from "@shift-stack/core/server"
import { frontend } from "#app/config.ts"
import { app } from "./app.ts"

serve(app, Layer.merge(viewsBundled(() => import("#app/views/index.ts")), assetsFromManifest(frontend)))
