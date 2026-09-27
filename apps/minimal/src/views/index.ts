// The server's way into the views: SHiFT loads this module's default export. Pages, the pieces HTMX swaps on their
// own (fragments), the layout around the pages, and the islands.
import { createViews } from "@shift-stack/core/views"
import Clicks from "./Clicks.svelte"
import GreetForm from "./GreetForm.svelte"
import Layout from "./Layout.svelte"
import About from "./pages/About.svelte"
import Home from "./pages/Home.svelte"
import NotFound from "./pages/NotFound.svelte"

const pages = { home: Home, about: About, notFound: NotFound }
const fragments = { clicks: Clicks, greetForm: GreetForm }

/** For the server's `responders<Pages, Fragments>()`. */
export type Pages = typeof pages
export type Fragments = typeof fragments

export default createViews({
  pages,
  fragments,
  islands: import.meta.glob("../islands/*.svelte", { eager: true }),
  layouts: { main: { component: Layout } },
  defaultLayout: "main",
  head: `<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="data:,">`
})
