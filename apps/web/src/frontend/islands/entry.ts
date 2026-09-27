// The browser entry: SHiFT starts HTMX and hydrates the server-rendered islands in this folder.
import { start } from "@shift-stack/core/client"
import { toTheme } from "#shared/theme.ts"
import { applyTheme } from "./theme.ts"

start({ islands: import.meta.glob("./*.svelte", { eager: true }) })

// The server works out "today" in the user's time zone; tell it which one that is.
const zone = Intl.DateTimeFormat().resolvedOptions().timeZone
if (!document.cookie.split("; ").includes(`tz=${zone}`)) {
  document.cookie = `tz=${zone}; path=/; max-age=31536000; samesite=lax`
}

// The theme: shown the moment it is picked in settings (the page follows the control at once), and applied again
// when the server has kept it and says so (the `theme` event of routes/settings.ts).
document.addEventListener("change", (event) => {
  const input = event.target as HTMLInputElement
  if (input.name === "theme" && input.type === "radio") applyTheme(toTheme(input.value))
})
document.body.addEventListener("theme", (event) => applyTheme(toTheme((event as CustomEvent<{ theme: string }>).detail.theme)))
