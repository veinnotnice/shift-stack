// Requests that overlap: what the user asked for last is what they see.
import { expect, test } from "./fixtures.ts"
import { open } from "./helpers.ts"

test("the last navigation wins, even when an earlier one answers later", async ({ page }) => {
  await open(page, "/")
  // The slow page answers after 800 ms, the fast one at once.
  await page.getByRole("link", { name: "Slow" }).click()
  await page.getByRole("link", { name: "Fast" }).click()

  await expect(page.locator("[data-page=slow]")).toHaveText("fast")
  await page.waitForTimeout(1200)
  await expect(page.locator("[data-page=slow]")).toHaveText("fast")
  await expect(page).toHaveURL("/slow?ms=0&label=fast")
  await expect(page).toHaveTitle("fast")
})
