import type { Page } from "@playwright/test"

/** Loads a page and waits until SHiFT has brought its islands to life (the shell's island is on every main page). */
export const open = async (page: Page, path: string) => {
  await page.goto(path)
  await page.waitForFunction(() => window.probe?.mounts.length)
}

export const counter = (page: Page, id: string) => page.locator(`[data-counter="${id}"]`)

/** The islands alive now, by id: how often each mounted, less how often it unmounted (src/islands/probe.ts). */
export const live = (page: Page) =>
  page.evaluate(() => {
    const { mounts = [], unmounts = [] } = window.probe ?? {}
    const count: Record<string, number> = {}
    for (const id of mounts) count[id] = (count[id] ?? 0) + 1
    for (const id of unmounts) count[id] = (count[id] ?? 0) - 1
    return Object.fromEntries(Object.entries(count).filter(([, n]) => n !== 0))
  })

/** How often an island mounted since the document loaded. */
export const mounts = (page: Page, id: string) => page.evaluate((id) => window.probe?.mounts.filter((m) => m === id).length ?? 0, id)
