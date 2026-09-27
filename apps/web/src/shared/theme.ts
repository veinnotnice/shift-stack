// Light, dark, or whatever the phone uses. Chosen in the settings sheet, kept in a cookie, rendered by the server
// as <html data-theme>, so the first paint is already right.
export const themes = ["system", "light", "dark"] as const
export type Theme = (typeof themes)[number]

export const themeCookie = "theme"

export const toTheme = (value: string | undefined): Theme =>
  themes.includes(value as Theme) ? (value as Theme) : "system"

/** The page background per scheme, for the browser's <meta name="theme-color">. */
export const themeColors = { light: "#f2f2f7", dark: "#000000" } as const
