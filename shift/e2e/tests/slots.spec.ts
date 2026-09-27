// Slots: server HTML an island shows and hides, with HTMX and nested islands working inside.
import { expect, test } from "./fixtures.ts"
import { counter, live, open } from "./helpers.ts"

test("a slot's form works once the island shows it, and answers in place", async ({ page }) => {
  await open(page, "/slots")
  await page.locator("[data-toggle=disclosure]").click()
  const panel = page.locator("[data-panel=disclosure]")

  await panel.getByRole("button", { name: "Save" }).click()
  await expect(panel.locator("[data-error]")).toHaveText("Required")

  await panel.locator("input[name=name]").fill("Ada")
  await panel.getByRole("button", { name: "Save" }).click()
  await expect(panel.locator("[data-saved]")).toHaveText("Saved Ada")
  await expect(panel.locator("[data-error]")).toHaveCount(0)
})

test("what the server swapped into a slot is still there when the island shows it again", async ({ page }) => {
  await open(page, "/slots")
  const toggle = page.locator("[data-toggle=disclosure]")
  const panel = page.locator("[data-panel=disclosure]")

  await toggle.click()
  await panel.locator("input[name=name]").fill("Ada")
  await panel.getByRole("button", { name: "Save" }).click()
  await expect(panel.locator("[data-saved]")).toHaveText("Saved Ada")

  await toggle.click()
  await expect(panel).toHaveCount(0)
  await toggle.click()
  await expect(panel.locator("[data-saved]")).toHaveText("Saved Ada")
  // And it still answers.
  await panel.locator("input[name=name]").fill("")
  await panel.getByRole("button", { name: "Save" }).click()
  await expect(panel.locator("[data-error]")).toHaveText("Required")
})

test("an island in a slot lives exactly while its slot is shown", async ({ page }) => {
  await open(page, "/slots")
  const toggle = page.locator("[data-toggle=disclosure]")
  expect(await live(page)).toEqual({ bar: 1, disclosure: 1, shell: 1 })

  await toggle.click()
  await expect.poll(() => live(page)).toEqual({ bar: 1, disclosure: 1, nested: 1, shell: 1 })
  await counter(page, "nested").click()
  await expect(counter(page, "nested")).toHaveText("1")

  await toggle.click()
  await expect.poll(() => live(page)).toEqual({ bar: 1, disclosure: 1, shell: 1 })

  await toggle.click()
  await expect.poll(() => live(page)).toEqual({ bar: 1, disclosure: 1, nested: 1, shell: 1 })
})

test("leaving the page unmounts the island and the islands in its slots", async ({ page }) => {
  await open(page, "/slots")
  await page.locator("[data-toggle=disclosure]").click()
  await expect.poll(() => live(page)).toMatchObject({ nested: 1 })

  await page.getByRole("link", { name: "Home" }).click()
  await expect(page.locator("[data-page=home]")).toBeVisible()
  await expect.poll(() => live(page)).toEqual({ bar: 1, home: 1, shell: 1 })
})
