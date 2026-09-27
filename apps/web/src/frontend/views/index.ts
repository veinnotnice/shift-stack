// The server's only way into the views: SHiFT loads this module's default export (ssrLoadModule in development,
// the server bundle in production). The pages, the pieces HTMX swaps on their own, and the shell around them.
import { createViews, type Named } from "@shift-stack/core/views"
import { paraglideViews } from "@shift-stack/paraglide/views"
import * as runtime from "#shared/paraglide/runtime.js"
import DoneTasks from "./components/DoneTasks.svelte"
import NewListForm from "./components/NewListForm.svelte"
import OpenTasks from "./components/OpenTasks.svelte"
import TaskRow from "./components/TaskRow.svelte"
import ThemeForm from "./components/ThemeForm.svelte"
import CalendarPage from "./pages/CalendarPage.svelte"
import ListPage from "./pages/ListPage.svelte"
import Lists from "./pages/Lists.svelte"
import NotFound from "./pages/NotFound.svelte"
import ServerError from "./pages/ServerError.svelte"
import Smart from "./pages/Smart.svelte"
import Today from "./pages/Today.svelte"
import Bare from "./Bare.svelte"
import Shell from "./Shell.svelte"
import TabBar from "./TabBar.svelte"
import TopBar from "./TopBar.svelte"
import { chromeFor } from "./chrome.ts"
import { themeOf, themeViews } from "./theme.ts"

const pages = { today: Today, calendar: CalendarPage, lists: Lists, list: ListPage, smart: Smart, notFound: NotFound, serverError: ServerError }
const fragments = { taskRow: TaskRow, openTasks: OpenTasks, doneTasks: DoneTasks, newListForm: NewListForm, themeForm: ThemeForm }

/** For the server's `responders<Pages, Fragments>()`. */
export type Pages = typeof pages
export type Fragments = typeof fragments

/** A page and its props together, so chrome can read what it needs (a list's name for the title). */
export type PageOf = Named<Pages>

export default createViews({
  pages,
  fragments,
  islands: import.meta.glob("../islands/*.svelte", { eager: true }),
  layouts: {
    // Both bars change with the page: the top bar's title and language links, the tab bar's active tab.
    app: {
      component: Shell,
      props: (page, context) => ({ chrome: chromeFor(page, context.path, themeOf(context)) }),
      outOfBand: [TopBar, TabBar]
    },
    bare: { component: Bare }
  },
  defaultLayout: "app",
  // The error pages stand alone: when something went wrong, the bars would only offer ways into it again.
  pageLayouts: { notFound: "bare", serverError: "bare" },
  head: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<link rel="icon" href="data:,">`,
  plugins: [paraglideViews(runtime), themeViews]
})
