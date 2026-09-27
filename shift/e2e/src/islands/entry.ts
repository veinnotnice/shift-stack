import { start } from "@shift-stack/core/client"

start({ islands: import.meta.glob("./*.svelte", { eager: true }) })
