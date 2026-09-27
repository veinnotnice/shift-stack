// What the bars need to know about the current page. Built on the server, inside the request's locale.
import type { Destination } from "#lib/nav-icons.ts"
import { m } from "#shared/paraglide/messages.js"
import { getLocale, locales, localizeHref, type Locale } from "#shared/paraglide/runtime.js"
import type { Theme } from "#shared/theme.ts"
import type { PageOf } from "./index.ts"

export interface NavItem {
  readonly id: Destination
  readonly href: string
  readonly label: string
}

export interface Language {
  readonly locale: Locale
  /** The language in its own words: "Deutsch". */
  readonly name: string
  /** The language in the current one: "German". */
  readonly localName: string
  /** The current page in that language. */
  readonly href: string
  readonly current: boolean
}

export interface Chrome {
  readonly title: string
  /** The destination this page belongs to, if any: the tab bar and the sidebar mark it. */
  readonly active: Destination | undefined
  readonly nav: ReadonlyArray<NavItem>
  readonly languages: ReadonlyArray<Language>
  readonly theme: Theme
}

const smartTitles = { scheduled: m.smart_scheduled, all: m.smart_all, flagged: m.smart_flagged, completed: m.smart_completed }

/** The bar title and tab of each page. */
const describe = (page: PageOf): { title: string; active: Destination | undefined } => {
  switch (page.name) {
    case "today":
      return { title: m.smart_today(), active: "today" }
    case "calendar":
      return { title: m.tab_calendar(), active: "calendar" }
    case "lists":
      return { title: m.tab_lists(), active: "lists" }
    case "list":
      return { title: page.props.list.name, active: "lists" }
    case "smart":
      return { title: smartTitles[page.props.kind](), active: "lists" }
    case "notFound":
      return { title: m.not_found_title(), active: undefined }
    case "serverError":
      return { title: m.error_title(), active: undefined }
  }
}

const destinations: ReadonlyArray<{ id: Destination; path: string; label: () => string }> = [
  { id: "today", path: "/", label: m.tab_today },
  { id: "calendar", path: "/calendar", label: m.tab_calendar },
  { id: "lists", path: "/lists", label: m.tab_lists }
]

const languageName = (locale: Locale, inLocale: Locale): string => {
  const name = new Intl.DisplayNames([inLocale], { type: "language" }).of(locale) ?? locale
  return name.charAt(0).toLocaleUpperCase(inLocale) + name.slice(1)
}

export const chromeFor = (page: PageOf, path: string, theme: Theme): Chrome => {
  const current = getLocale()
  return {
    ...describe(page),
    nav: destinations.map(({ id, path, label }) => ({ id, href: localizeHref(path), label: label() })),
    languages: locales.map((locale) => ({
      locale,
      name: languageName(locale, locale),
      localName: languageName(locale, current),
      href: localizeHref(path, { locale }),
      current: locale === current
    })),
    theme
  }
}
