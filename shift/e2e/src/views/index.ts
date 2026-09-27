// The fixture app's views: just enough pages to put every part of SHiFT to work in a browser.
import { createViews } from "@shift-stack/core/views"
import Bar from "./Bar.svelte"
import Bare from "./Bare.svelte"
import Block from "./Block.svelte"
import Main from "./Main.svelte"
import NameForm from "./NameForm.svelte"
import Home from "./pages/Home.svelte"
import Missing from "./pages/Missing.svelte"
import Reload from "./pages/Reload.svelte"
import Second from "./pages/Second.svelte"
import Slots from "./pages/Slots.svelte"
import Slow from "./pages/Slow.svelte"
import Swap from "./pages/Swap.svelte"

const pages = { home: Home, second: Second, slots: Slots, slow: Slow, swap: Swap, reload: Reload, missing: Missing }
const fragments = { nameForm: NameForm, block: Block }

export type Pages = typeof pages
export type Fragments = typeof fragments

export default createViews({
  pages,
  fragments,
  islands: import.meta.glob("../islands/*.svelte", { eager: true }),
  layouts: {
    // The bar follows the page out of band, with an island in it.
    main: { component: Main, props: (page) => ({ title: page.name }), outOfBand: [Bar] },
    bare: { component: Bare }
  },
  defaultLayout: "main",
  pageLayouts: { missing: "bare" },
  head: `<meta name="viewport" content="width=device-width, initial-scale=1">
<link rel="icon" href="data:,">`
})
