// Development only, its own entry point so production never loads Vite: Vite serves the browser code and
// transforms the views on each request.
import { Context, Effect, Layer } from "effect"
import type { FrontendConfig, ViewModule } from "#protocol"
import { Assets, Views } from "./views.ts"

/** A Vite dev server on its own port serves the browser code; the views are loaded through it on every request. */
export const frontendDev = (config: FrontendConfig) =>
  Layer.scopedContext(
    Effect.gen(function* () {
      const vite = yield* Effect.acquireRelease(
        Effect.promise(async () => {
          const { createServer } = await import("vite")
          const server = await createServer({ appType: "custom" })
          await server.listen()
          return server
        }),
        (server) => Effect.promise(() => server.close())
      )
      const origin = vite.config.server.origin ?? `http://localhost:${vite.config.server.port}`
      yield* Effect.log(`Vite serving browser code on ${origin}`)
      const head = [
        `<script type="module" src="${origin}/@vite/client"></script>`,
        `<link rel="stylesheet" href="${origin}/${config.styles}">`,
        `<script type="module" src="${origin}/${config.client}"></script>`
      ].join("\n")
      const load = Effect.promise(() => vite.ssrLoadModule(`/${config.views}`)).pipe(
        Effect.map((module) => module.default as ViewModule<any, any>)
      )
      return Context.make(Views, { load }).pipe(Context.add(Assets, { head }))
    })
  )
