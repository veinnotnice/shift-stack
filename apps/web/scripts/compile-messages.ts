import { compile } from "@inlang/paraglide-js"
import { paraglide } from "../paraglide.config.ts"

// Run via tsx before Vite starts: src/backend imports from src/shared/paraglide, which
// must already exist and be up to date at that point, not only once Vite's plugin compiles it.
await compile(paraglide)
