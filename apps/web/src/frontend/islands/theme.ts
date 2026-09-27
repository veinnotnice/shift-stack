// Applying a theme in the browser: the <html> attribute the CSS keys on, the browser chrome colour, and an event for
// islands that theme themselves (the toaster). The server keeps the choice (routes/settings.ts sets the cookie).
import { themeColors, type Theme } from "#shared/theme.ts"

export const applyTheme = (theme: Theme) => {
  document.documentElement.dataset.theme = theme
  for (const meta of document.querySelectorAll('meta[name="theme-color"]')) meta.remove()
  const schemes = theme === "system" ? (["light", "dark"] as const) : [theme]
  for (const scheme of schemes) {
    const meta = document.createElement("meta")
    meta.name = "theme-color"
    meta.content = themeColors[scheme]
    if (theme === "system") meta.media = `(prefers-color-scheme: ${scheme})`
    document.head.append(meta)
  }
  document.dispatchEvent(new CustomEvent("themechange", { detail: theme }))
}
