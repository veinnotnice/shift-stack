// After svelte-package: the declaration files still import each other as `./file.ts`, as the source does. The .js
// files are rewritten by TypeScript (rewriteRelativeImportExtensions); the .d.ts files are rewritten here.
import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"

const dist = path.resolve(import.meta.dirname, "../dist")
const relativeTs = /((?:from|import)\s*\(?\s*["']\.{1,2}\/[^"']+)\.ts(["'])/g

for (const entry of readdirSync(dist, { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith(".d.ts")) continue
  const file = path.join(entry.parentPath, entry.name)
  const source = readFileSync(file, "utf8")
  const rewritten = source.replace(relativeTs, "$1.js$2")
  if (rewritten !== source) writeFileSync(file, rewritten)
}
