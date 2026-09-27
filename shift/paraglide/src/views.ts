// The views half of Paraglide for SHiFT: every render runs in the request's locale, so messages (m.…) and
// getLocale() in components answer for it, and <html> gets its lang and dir.
import { AsyncLocalStorage } from "node:async_hooks"
import type { ViewPlugin } from "@shift-stack/core/views"

/**
 * The part of a compiled Paraglide runtime (runtime.js) the views use. Pass the module as the views import it
 * (`import * as runtime`): in development Vite loads the views apart from the server, with a runtime of their own.
 */
export interface ViewsRuntime<L extends string> {
  // Paraglide types its store more narrowly than it needs; any AsyncLocalStorage holding { locale } will do.
  overwriteServerAsyncLocalStorage(storage: AsyncLocalStorage<any>): void
  getTextDirection(locale?: L): "ltr" | "rtl"
}

export const paraglideViews = <L extends string>(runtime: ViewsRuntime<L>): ViewPlugin => {
  const storage = new AsyncLocalStorage<{ locale?: L }>()
  runtime.overwriteServerAsyncLocalStorage(storage)
  const localeOf = (data: Readonly<Record<string, unknown>>) => data.locale as L | undefined
  return {
    around: (context, render) => storage.run({ locale: localeOf(context.data) }, render),
    htmlAttributes: (context): Record<string, string> => {
      const locale = localeOf(context.data)
      return locale ? { lang: locale, dir: runtime.getTextDirection(locale) } : {}
    }
  }
}
