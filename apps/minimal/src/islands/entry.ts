// The browser entry: SHiFT starts HTMX and hydrates the islands in this folder.
import { start } from "@shift-stack/core/client"

start({ islands: import.meta.glob("./*.svelte", { eager: true }) })
