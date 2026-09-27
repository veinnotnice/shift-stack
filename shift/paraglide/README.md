# @shift-stack/paraglide

Localization for [SHiFT](../core) with [Paraglide JS](https://inlang.com/m/gerre34r/library-inlang-paraglideJs).
Every page lives under its locale's prefix (`/en/…`, `/de/…`). A request without one is redirected to the locale
your Paraglide strategies pick (cookie, `Accept-Language`, base locale). Routes are written once, without the prefix.

```
npm install @shift-stack/paraglide @inlang/paraglide-js
```

It doesn't depend on Paraglide itself. You pass your compiled runtime, since Paraglide generates one per project.
Configure Paraglide with the `url` strategy and `/:locale/…` URL patterns.

**Server:** pipe the plugin in after the error pages, so they are translated too.

```ts
import { paraglide } from "@shift-stack/paraglide/server"
import * as runtime from "./paraglide/runtime.js"

export const i18n = paraglide(runtime)

export const app = routes.pipe(errorPages({ … }), i18n.plugin, clientAssets(frontend))
```

Inside, the routes see the path without its prefix, `href(path)` and `navigateTo(path)` add it back, and the locale
is remembered in Paraglide's cookie. `i18n.locale` is the request's locale, for messages built on the server:
`m.saved({}, { locale: yield* i18n.locale })`.

**Views:** every render runs in the request's locale, so `m.…()` and `getLocale()` in components answer for it, and
`<html>` gets `lang` and `dir`.

```ts
import { paraglideViews } from "@shift-stack/paraglide/views"
import * as runtime from "../paraglide/runtime.js"

export default createViews({ …, plugins: [paraglideViews(runtime)] })
```

Pass the runtime as the views import it. In development Vite loads the views apart from the server, with a runtime
instance of its own.
