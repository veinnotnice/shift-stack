// Every test fails on an error in the page, even when what it checks looks right: a script that threw halfway leaves
// the page working by luck.
import { expect, test as base } from "@playwright/test"

export const test = base.extend<{ pageErrors: void }>({
  pageErrors: [
    async ({ page }, use) => {
      const errors: string[] = []
      page.on("pageerror", (error) => errors.push(error.message))
      await use()
      expect(errors).toEqual([])
    },
    { auto: true }
  ]
})

export { expect }
