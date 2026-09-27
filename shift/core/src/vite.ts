// The Vite half of SHiFT: builds the client and stylesheet with a manifest the server reads, and reloads the
// browser when a view changes (views render on the server only, so the browser never learns they changed).
import path from "node:path"
import type { Plugin } from "vite"
import { clientOutDir, type FrontendConfig } from "#protocol"

export type { FrontendConfig } from "#protocol"

export const shift = (config: FrontendConfig): Plugin => {
  const viewsFolder = `/${path.posix.dirname(config.views)}/`
  return {
    name: "@shift-stack/core",
    // Only the client build: the server build (vite build --ssr) keeps its own entry and output folder.
    config: (_, env) =>
      env.isSsrBuild
        ? {}
        : { build: { manifest: true, outDir: clientOutDir(config), rolldownOptions: { input: [config.client, config.styles] } } },
    hotUpdate({ file }) {
      if (this.environment.name === "ssr" && file.replaceAll("\\", "/").includes(viewsFolder)) {
        this.environment.hot.send({ type: "full-reload" })
      }
    }
  }
}
