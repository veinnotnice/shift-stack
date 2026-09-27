// How the server reaches the views and the browser assets. Production and tests use this file; development adds dev.ts.
import { Context, Effect, Layer } from "effect"
import { readFileSync } from "node:fs"
import path from "node:path"
import { clientOutDir, type FrontendConfig, type ViewModule } from "#protocol"

export class Views extends Context.Tag("@shift-stack/core/Views")<Views, { readonly load: Effect.Effect<ViewModule<any, any>> }>() {}

/** The tags the document <head> needs to load the client, HTMX and the stylesheet. */
export class Assets extends Context.Tag("@shift-stack/core/Assets")<Assets, { readonly head: string }>() {}

/**
 * Views compiled into the same bundle as the server (production), or transformed on import (tests). The import has
 * to be written in the app, so the bundler sees it: `viewsBundled(() => import("./views/index.ts"))`.
 */
export const viewsBundled = (load: () => Promise<{ readonly default: ViewModule<any, any> }>) =>
  Layer.succeed(Views, { load: Effect.promise(() => load().then((module) => module.default)) })

export const assetsNone = Layer.succeed(Assets, { head: "" })

export interface ManifestChunk {
  readonly file: string
  readonly css?: ReadonlyArray<string>
  readonly assets?: ReadonlyArray<string>
}

/** Head tags from Vite's build manifest: the stylesheet, font preloads, the client entry. */
export const headFromManifest = (manifest: Record<string, ManifestChunk>, config: FrontendConfig): string => {
  const entry = manifest[config.client]
  const styles = manifest[config.styles]
  if (!entry || !styles) throw new Error(`The manifest has no ${config.client} or ${config.styles}`)
  const css = [styles.file, ...(entry.css ?? [])]
  const fonts = [...(styles.assets ?? [])].filter((file) => file.endsWith(".woff2"))
  return [
    ...fonts.map((file) => `<link rel="preload" href="/${file}" as="font" type="font/woff2" crossorigin>`),
    ...css.map((file) => `<link rel="stylesheet" href="/${file}">`),
    `<script type="module" src="/${entry.file}"></script>`
  ].join("\n")
}

/** The head tags of a production build, from `<outDir>/.vite/manifest.json`. */
export const assetsFromManifest = (config: FrontendConfig) =>
  Layer.effect(
    Assets,
    Effect.try(() => ({
      head: headFromManifest(JSON.parse(readFileSync(path.join(clientOutDir(config), ".vite/manifest.json"), "utf8")), config)
    }))
  )
