// Swaps that are not navigations: a piece of the page replacing itself, and the server's `refresh`.
import { expect, test } from "./fixtures.ts"
import { counter, live, open } from "./helpers.ts"

test("an island replaced by a swap is unmounted, and the one that replaces it comes to life", async ({ page }) => {
  await open(page, "/swap")
  expect(await live(page)).toMatchObject({ "block-1": 1 })

  await page.getByRole("button", { name: "Next" }).click()
  await expect(counter(page, "block-2")).toBeVisible()
  await expect.poll(() => live(page)).toEqual({ bar: 1, "block-2": 1, shell: 1 })
  await counter(page, "block-2").click()
  await expect(counter(page, "block-2")).toHaveText("1")
})

test("refresh renders the page again in place", async ({ page }) => {
  await open(page, "/reload")
  const loads = page.locator("[data-loads]")
  const before = Number(await loads.textContent())

  await page.getByRole("button", { name: "Reload" }).click()
  await expect(loads).toHaveText(String(before + 1))
  await expect(page).toHaveURL("/reload")
  await expect.poll(() => live(page)).toEqual({ bar: 1, reload: 1, shell: 1 })
})
