import type { CompilerOptions } from "@inlang/paraglide-js"

// One set of Paraglide options for the Vite plugin and for compiling before the server starts.
export const paraglide = {
  project: "./project.inlang",
  outdir: "./src/shared/paraglide",
  strategy: ["url", "cookie", "preferredLanguage", "baseLocale"],
  urlPatterns: [
    {
      pattern: "/:path(.*)?",
      localized: [
        ["en", "/en/:path(.*)?"],
        ["de", "/de/:path(.*)?"]
      ]
    }
  ]
} satisfies CompilerOptions
