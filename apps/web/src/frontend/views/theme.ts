// The theme in the views: <html data-theme> for the CSS, and the browser chrome colour. The server puts the
// cookie's theme into the view data (backend/http/theme.ts).
import type { ViewContext, ViewPlugin } from "@shift-stack/core/views"
import { themeColors, toTheme, type Theme } from "#shared/theme.ts"

export const themeOf = (context: ViewContext): Theme => toTheme(context.data.theme as string | undefined)

const themeColorMeta = (theme: Theme): string =>
  theme === "system"
    ? `<meta name="theme-color" content="${themeColors.light}" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="${themeColors.dark}" media="(prefers-color-scheme: dark)">`
    : `<meta name="theme-color" content="${themeColors[theme]}">`

export const themeViews: ViewPlugin = {
  htmlAttributes: (context) => ({ "data-theme": themeOf(context) }),
  head: (context) => themeColorMeta(themeOf(context))
}
