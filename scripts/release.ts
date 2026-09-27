// Publishes every public package whose version isn't on npm yet. pnpm packs it, because only pnpm swaps in
// `publishConfig` (the dist/ exports); npm publishes the tarball, because npm does trusted publishing from GitHub
// Actions, without a token. Run by the release workflow after Changesets bumped the versions.
import { execFileSync } from "node:child_process"
import { mkdtempSync, readFileSync, readdirSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const packages = ["shift/core", "shift/paraglide"]
// `pnpm release --dry-run`: pack and let npm show what it would publish, without publishing.
const dryRun = process.argv.includes("--dry-run")
const run = (command: string, args: string[], cwd = root, errors: "inherit" | "ignore" = "inherit") =>
  execFileSync(command, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", errors], shell: process.platform === "win32" })

const isPublished = (name: string, version: string) => {
  try {
    return run("npm", ["view", `${name}@${version}`, "version"], root, "ignore").trim() === version
  } catch {
    return false
  }
}

for (const directory of packages) {
  const { name, version } = JSON.parse(readFileSync(path.join(root, directory, "package.json"), "utf8"))
  if (isPublished(name, version)) {
    console.log(`${name}@${version} is on npm already`)
    continue
  }
  const out = mkdtempSync(path.join(tmpdir(), "shift-release-"))
  run("pnpm", ["pack", "--pack-destination", out], path.join(root, directory))
  const tarball = path.join(out, readdirSync(out).find((file) => file.endsWith(".tgz"))!)
  if (dryRun) {
    run("npm", ["publish", tarball, "--access", "public", "--dry-run"])
    console.log(`Would publish ${name}@${version}`)
    continue
  }
  // Provenance links the package to the workflow run that built it, so it exists only in CI.
  // npm talks to the terminal itself here: from a machine, it may open the browser to confirm the publish (2FA with a
  // passkey or security key).
  execFileSync("npm", ["publish", tarball, "--access", "public", ...(process.env.CI ? ["--provenance"] : [])], {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32"
  })
  // Changesets' GitHub action reads these lines to tag the release and write its notes.
  console.log(`New tag: ${name}@${version}`)
}
