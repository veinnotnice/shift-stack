// Pages: the first load, boosted links, the back button, and crossing into another layout.
import { expect, test } from "./fixtures.ts"
import { counter, live, mounts, open } from "./helpers.ts"

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false })

  test("islands are on the page as the server rendered them", async ({ page }) => {
    await page.goto("/")
    await expect(counter(page, "home")).toHaveText("0")
    await expect(counter(page, "shell")).toHaveText("0")
  })
})

test("a first load brings the server-rendered islands to life", async ({ page }) => {
  await open(page, "/")
  await counter(page, "home").click()
  await expect(counter(page, "home")).toHaveText("1")
  expect(await live(page)).toEqual({ bar: 1, home: 1, shell: 1 })
})

test("a link swaps the page and its bar, and leaves the rest of the layout alone", async ({ page }) => {
  await open(page, "/")
  await counter(page, "shell").click()
  await page.getByRole("link", { name: "Second" }).click()

  await expect(page.locator("[data-page=second]")).toBeVisible()
  await expect(page).toHaveURL("/second")
  await expect(page).toHaveTitle("Second")
  await expect(page.locator("[data-bar-title]")).toHaveText("second")
  // The island outside the content target kept its state: it was never replaced.
  await expect(counter(page, "shell")).toHaveText("1")
  expect(await mounts(page, "shell")).toBe(1)
  // The old page's island and the old bar's are gone, the new ones alive.
  await expect.poll(() => live(page)).toEqual({ bar: 1, second: 1, shell: 1 })
  await counter(page, "second").click()
  await expect(counter(page, "second")).toHaveText("1")
})

test("back fetches the page again and brings its islands to life", async ({ page }) => {
  await open(page, "/")
  await page.getByRole("link", { name: "Second" }).click()
  await expect(page.locator("[data-page=second]")).toBeVisible()

  await page.goBack()
  await expect(page.locator("[data-page=home]")).toBeVisible()
  await expect(page).toHaveTitle("Home")
  await expect.poll(() => live(page)).toEqual({ bar: 1, home: 1, shell: 1 })
  await counter(page, "home").click()
  await expect(counter(page, "home")).toHaveText("1")

  await page.goForward()
  await expect(page.locator("[data-page=second]")).toBeVisible()
  await expect.poll(() => live(page)).toEqual({ bar: 1, second: 1, shell: 1 })
})

test("a page of another layout replaces the whole body, and the way back restores it", async ({ page }) => {
  await open(page, "/")
  await page.getByRole("link", { name: "Missing" }).click()

  await expect(page.locator("[data-page=missing]")).toBeVisible()
  await expect(page.locator("body")).toHaveAttribute("data-layout", "bare")
  await expect(page.locator("#bar")).toHaveCount(0)
  await expect.poll(() => live(page)).toEqual({})

  await page.locator("[data-home]").click()
  await expect(page.locator("[data-page=home]")).toBeVisible()
  await expect(page.locator("body")).toHaveAttribute("data-layout", "main")
  await expect.poll(() => live(page)).toEqual({ bar: 1, home: 1, shell: 1 })
  await counter(page, "home").click()
  await expect(counter(page, "home")).toHaveText("1")
})
