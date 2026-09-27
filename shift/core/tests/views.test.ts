import { describe, expect, it } from "vitest"
import { createViews } from "@shift-stack/core/views"
import Layout from "./fixtures/Layout.svelte"
import Page from "./fixtures/Page.svelte"

const views = createViews({
  pages: { page: Page },
  islands: import.meta.glob("./fixtures/islands/*.svelte", { eager: true }),
  layouts: { main: { component: Layout } },
  defaultLayout: "main"
})

const context = { path: "/", data: {} }
// Svelte's hydration comments, which don't matter to what the page shows.
const withoutComments = (html: string) => html.replace(/<!--.*?-->/g, "")
const render = (open: boolean) => withoutComments(views.renderPageContent(context, "page", { open }))

describe("islands", () => {
  it("renders an island without slots into its placeholder, and leaves no markers", () => {
    const html = render(false)
    expect(html).toContain(`<div data-island="Leaf" data-props="{&quot;text&quot;:&quot;alone&quot;}"><em>alone</em></div>`)
    expect(html).not.toMatch(/shift-(slot|island)-(open|close)|data-island-key/)
  })

  it("gives each slot to the island as server HTML, and to the client as a template", () => {
    const html = render(false)
    expect(html).toContain(`<div data-island="Box" data-props="{&quot;open&quot;:false}" class="box">`)
    expect(html).toContain(`<template data-island-slot="label"><span>Open</span></template>`)
    expect(html).toContain(`<button type="button"><shift-slot style="display:contents"><span>Open</span></shift-slot></button>`)
    // The children are not shown while closed, but travel along for when the island shows them.
    expect(html).toMatch(/<template data-island-slot="children">\s*<form action="\/lists"><input name="name"\/?><\/form>/)
    expect(html).not.toContain("<section>")
  })

  it("renders the slot where the island puts it", () => {
    expect(render(true)).toMatch(/<section><shift-slot style="display:contents">\s*<form action="\/lists">/)
  })

  it("renders islands nested in a slot, in the template too", () => {
    const html = render(true)
    const nested = `<div data-island="Leaf" data-props="{&quot;text&quot;:&quot;nested&quot;}"><em>nested</em></div>`
    // Once in the template, once where the open island shows its children.
    expect(html.split(nested)).toHaveLength(3)
  })
})
