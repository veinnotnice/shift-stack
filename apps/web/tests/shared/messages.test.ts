import { readFileSync } from "node:fs"
import { expect, it } from "vitest"

const keys = (locale: string) =>
  Object.keys(JSON.parse(readFileSync(`messages/${locale}.json`, "utf8")))
    .filter((key) => key !== "$schema")
    .sort()

it("every English message has a German translation, and no extras", () => {
  expect(keys("de")).toEqual(keys("en"))
})
