// Production: the views are bundled in, the browser code comes from dist/client.
import { Layer } from "effect"
import { assetsFromManifest, viewsBundled } from "@shift-stack/core/server"
import { frontend } from "#frontend/config.ts"
import { start } from "./serve.ts"

start(Layer.merge(viewsBundled(() => import("#frontend/views/index.ts")), assetsFromManifest(frontend)))
