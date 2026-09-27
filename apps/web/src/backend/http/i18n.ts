// Localization: SHiFT's Paraglide plugin on this app's compiled runtime. Pages live under /en/… and /de/….
import { paraglide } from "@shift-stack/paraglide/server"
import * as runtime from "#shared/paraglide/runtime.js"

export const i18n = paraglide(runtime)

/** The current request's locale, for messages rendered outside the views: `m.undo({}, { locale })`. */
export const locale = i18n.locale
